'use strict'

function main() {
    let rooms = Game.rooms;
    let creeps = Game.creeps;

    let bases = getBases(rooms, creeps);

    strategy();
    command(bases);

    function getBases(rooms, creeps) {
        let bases = [];
        for (let roomName in rooms) {
            let room = rooms[roomName];
            if (room.controller && room.controller.my) {
                base.push(room)
                room.creeps = [];
            }
        }
        for (let creepName in creeps) {
            let creep = creeps[creepName];
            let roomName = creep.name.split('_')[0];
            let base = rooms[roomName];
            if (base) base.creeps.concat(creep);
        }
        return bases;
    }
}

function strategy() {

}

function command(bases) {
    let baseOps = require('baseOps');
    for (let base of bases) baseOps(base);
}

module.exports = function () {main()};