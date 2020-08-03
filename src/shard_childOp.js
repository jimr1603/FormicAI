const U = require('./util');
const c = require('./constants');
const ChildOp = require('./meta_childOp');
const CreepOp = require('./shard_creepOp');
const { TACTICS_INTERVAL } = require('./constants');

module.exports = class ShardChildOp extends ChildOp {
    /**
     * @param {ShardOp}  shardOp
     * @param {Operation}  parent
     * @param {BaseOp} [baseOp] 
     * @param {RoomOp} [roomOp]
     * @param {Number} [instance]*/
    constructor(parent, shardOp, baseOp, roomOp, instance) {
        super(parent);
        this._shardOp = shardOp;
        this._map = shardOp._map;
        this._baseOp = baseOp;
        this._roomOp = roomOp;
        this._instance = instance || 0
        /**@type {{[creepName:string]:CreepOp}} */
        this._creepOps = {}
        this._lastIdle = 0;
        let roomName = '';
        if (roomOp) roomName = roomOp.roomName
        else if (baseOp) roomName = baseOp.name;
        else roomName = shardOp.name;
        if (roomOp || baseOp) this._ownerRoomName = roomName;
        else if (parent == shardOp) this._ownerRoomName = shardOp.name;
        else this._ownerRoomName = '';
        shardOp.addOperation(this, roomName)
    }

    get instance() {return this._instance}

    get baseOp() {return this._baseOp}
    get roomOp() {return this._roomOp}

    get shardOp() {return this._shardOp};

    get ownerRoomName() {return this._ownerRoomName}

    /** Returns the number of creeps in the operation
     * Corrects for creeps that have TTL smaller than their spawn time
     */
    getCreepCountForSpawning(){
        let res = 0;
        for (let name in this._creepOps) {
            let creepOp = this._creepOps[name];
            let creep = creepOp.creep;
            //only count a creep if ticks to live is larger then spawn time 
            if (creep.spawning || creep.ticksToLive && creep.ticksToLive > creep.body.length * 3 ) res++;
        }
        return res;
    }

    get creepCount(){
        return _.size(this._creepOps)||0;
    }

    get idleCount() {
        let res = 0;
        let creepOps = /**@type {CreepOp[]}*/ (this.childOps[c.OPERATION_CREEP]);
        if (!creepOps) return 0;
        for (let creepOp of creepOps) {
            if (creepOp.instruction == c.COMMAND_NONE) res++;
        }
        return res;
    }

    /**@param {Number} time */
    set lastIdle(time) {
        this._lastIdle = time;
    }

    get lastIdle() { return this._lastIdle};
    

    initTick() {
        super.initTick();
        //remove dead creeps from runtime
        for (let creepName in this._creepOps) {
            if (Game.creeps[creepName] == undefined) {
                this.removeChildOp(this._creepOps[creepName])
            }
        }
    }

    /**@param {ChildOp} childOp */
    addChildOp(childOp) {
        super.addChildOp(childOp);
        if (childOp.type == c.OPERATION_CREEP) {
            let creepOp = /**@type {CreepOp} */ (childOp);
            this._creepOps[creepOp.name] = creepOp; 
            let creep = creepOp.creep;
            //if (this._baseOp) creep.memory.baseName = this._baseOp.name;
            //else delete creep.memory.baseName;
            creep.memory.operationType = this.type;
            creep.memory.operationInstance = this.instance;
        }

    }

    /**@param {ChildOp} childOp */
    removeChildOp(childOp) {
        super.removeChildOp(childOp);
        if (childOp.type == c.OPERATION_CREEP) delete this._creepOps[childOp.name];
        if (childOp instanceof ShardChildOp) {
            this._shardOp.removeOpId(childOp)
        }
    }

    

    /**@param {Creep} creep */
    initCreep(creep) {
        if (this._creepOps[creep.name] == undefined) {
            this.addChildOp(new CreepOp(this, this._shardOp, this._baseOp, this._map, creep))
            this._runTactics = true;
        }
        this._creepOps[creep.name].initTickCreep(creep);
    }

}

