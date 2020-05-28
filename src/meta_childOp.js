let U = require('./util')
const c = require('./constants');
const Operation = require('./meta_operation');

module.exports = class ChildOp extends Operation{
    /**@param {Operation} parent */
    constructor(parent) {
        super()
        this._parent = parent;
    }

    /**@param {Operation} newParent */
    newParent(newParent) {
        this._parent.removeChildOp(this);
        this._parent = newParent;
        this._parent.addChildOp(this);
    }
}
