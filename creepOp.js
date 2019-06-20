let U = require('./util');
const c = require('./constants');
let Operation = require('./operation');

const STATE_NONE = 0;
const STATE_RETRIEVING = 1;
const STATE_DELIVERING = 2;

module.exports = class CreepOp extends Operation {
    /**@param {Creep} creep */
    constructor(creep) {
        super();
        this._creep = creep;
        this._state = STATE_NONE;
        this._instruct = c.COMMAND_NONE;
        this._sourceId = '';
        this._destId = '';
    }

    /**@param {Creep} creep */
    initTick(creep) {
        this._creep = creep;
    }

    /**@param {Source} source */
    /**@param {Structure | ConstructionSite} dest */
    instructTransfer(source, dest) {
        this._sourceId = source.id;
        this._destId = dest.id;
        this._instruct = c.COMMAND_TRANSFER
    }
    
    _command() {
        let source = U.getObj(this._sourceId);
        let dest = U.getObj(this._destId);
        let creep = this._creep;

        switch (this._instruct) {
            case c.COMMAND_TRANSFER:
                if (creep.carry.energy == 0) this._state = STATE_RETRIEVING;
                if (creep.carry.energy == creep.carryCapacity) this._state = STATE_DELIVERING;
                break;
        }

        switch (this._state) {
            case STATE_RETRIEVING:
                creep.moveTo(source, {range:1});
                if      (source instanceof Source)    creep.harvest(source);
                else if (source instanceof Structure) creep.withdraw(source, RESOURCE_ENERGY);
                else throw 'Cannot retrieve from object ' + source;
                break;
            case STATE_DELIVERING:
                creep.moveTo(dest, {range:1});
                if      (dest instanceof Structure) creep.transfer(dest, RESOURCE_ENERGY);
                else if (dest instanceof ConstructionSite) creep.build(dest);
                else throw 'Cannot retrieve to object ' + dest;
                break;
        }    
    }

    getName() {
        return this._creep.name;
    }

    getPos() {
        return this._creep.pos;
    }

    getDest() {
        return U.getObj(this._destId);
    }

    getInstr() {
        return this._instruct;
    }
}


