const U = require('./util');
const c = require('./constants');
const BaseChildOp = require('./baseChildOp');

module.exports = class FillingOp extends BaseChildOp {
    get type() {return c.OPERATION_FILLING}

    _strategy() {
        let template = {body:[MOVE,CARRY,WORK]}
        if (this.baseOp.phase >= c.BASE_PHASE_STORED_ENERGY) template = {body:[MOVE,CARRY]}
        this._baseOp.spawningOp.ltRequestSpawn(this, template, 2)
        for (let creepName in this._creepOps) {
            let creepOp = this._creepOps[creepName];
            let dest = creepOp.getDest();
            if (!(dest instanceof StructureSpawn || dest instanceof StructureExtension)
            || (creepOp.getInstr() != c.COMMAND_TRANSFER)
            || (dest.energy && dest.energy == dest.energyCapacity) ) 
            {
                let dest = creepOp.getPos().findClosestByPath(FIND_MY_STRUCTURES, {filter: (/**@type {any}*/ o) => {
                    return  (o.energy < o.energyCapacity)
                            && (o.structureType == STRUCTURE_SPAWN || o.structureType == STRUCTURE_EXTENSION || o.structureType == STRUCTURE_TOWER);
                    }})
                if (dest) creepOp.instructFill(dest);
            }
        }
    }
}

