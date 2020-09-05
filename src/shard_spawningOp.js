const U = require('./util');
const c = require('./constants');
const ShardChildOp = require('./shard_childOp');

//this operation handles spawning at the shard level.
// current implementation picks the top base to do all the spawning

module.exports = class ShardSpawningOp extends ShardChildOp {
    /** @param {ShardOp} shardOp */
    constructor(shardOp) {
        super(shardOp, shardOp);
        this._spawnBase = '';
        /**@type {{[index:string] : {operationId:number, count:number, template:CreepTemplate}}} */
        this._spawnRequests = {};
    }

    get type() {return c.OPERATION_SHARDSPAWNING}

    _firstRun() {
        this._support();
    }

    _support() {
        //determin new base for shard spawning
        let baseOps = this._shardOp.baseOps;
        let baseOp = this._shardOp.getBaseOp(this._spawnBase);
        if (!baseOp) throw Error();
        let oldSpawningOp = baseOp.spawningOp;
        this._spawnBase = baseOps.keys().next().value;
        baseOp = this._shardOp.getBaseOp(this._spawnBase);
        if (!baseOp) throw Error();
        let newSpawningOp = baseOp.spawningOp;

        // if new spawning op is not equal, move the requests to the new spawning base
        if (oldSpawningOp != newSpawningOp) {
            for (let spawnRequestId in this._spawnRequests) {
                let spawnRequest = this._spawnRequests[spawnRequestId];
                oldSpawningOp.ltRequestSpawn(this._shardOp.getOp(spawnRequest.operationId), spawnRequest.template, 0)
                newSpawningOp.ltRequestSpawn(this._shardOp.getOp(spawnRequest.operationId), spawnRequest.template, spawnRequest.count)
            }
        }
    }

    /**
     * @param {ShardChildOp} operation
     * @param {CreepTemplate} template
     * @param {number} count */
    ltRequestSpawn(operation, template, count) {
        let baseOp = this._shardOp.getBaseOp(this._spawnBase);
        if (!baseOp) throw Error();
        let spawningOp = baseOp.spawningOp;
        //if spawningOp is not valid, try running support to find a new spawning base, otherwise cancel
        if (!spawningOp) {
            this._support();
            baseOp = this._shardOp.getBaseOp(this._spawnBase)
            if (!baseOp) throw Error();
            spawningOp = baseOp.spawningOp;
            if (!spawningOp) return;
        }
        this._spawnRequests[operation.id] = {operationId:operation.id, count:count, template: template};
        spawningOp.ltRequestSpawn(operation, template, count);
        U.l({spawnbase:this._spawnBase})
    }
    
}

