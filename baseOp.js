'use strict'
let creepFillerOps = require('./creepFillerOps');
let creepUpgraderOps = require('./creepUpgraderOps');
let creepBuilderOps = require('./creepBuilderOps');
let spawnOps = require ('./structSpawnOps');

function main(base) {
    base.spawns = []
    base.extensions = []
    for (let structure of base.find(FIND_MY_STRUCTURES)) {
        switch (structure.structureType) {
            case STRUCTURE_SPAWN:
                base.spawns.push(structure);
                break;
            case STRUCTURE_EXTENSION:
                base.extensions.push(structure);
                break;
        }
    }

    if (Math.floor(Math.random() * 10) == 0) strategy(base);
    
    command(base);
}

function strategy(base) {
    let nConstructionSites = base.find(FIND_MY_CONSTRUCTION_SITES).length;
    planBase(nConstructionSites);
    planCreeps(nConstructionSites);
    return;

    function planBase(nConstructionSites) {
        if (nConstructionSites == 0 && base.extensions.length < CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][base.controller.level]) {
            findBuildingSpot(base).createConstructionSite(STRUCTURE_EXTENSION);
        }

        function findBuildingSpot(base) {
            var spawn = base.spawns[0];
            var x = spawn.pos.x;
            var y = spawn.pos.y;
        
            var i=1;
            var x;
            var y;
            loop:
            while (i<50) {
                for(x = -1 * i;x<=1*i;x++ ) {
                    for (y = -1 * i; y<= 1*i; y++) {
                        if ( (x+y) % 2 == 0 && validBuildingSpot(base, spawn.pos.x+x, spawn.pos.y+y))
                            break loop;
                    }
                }
                i++;
            }
        
            if (i<50) return new RoomPosition (spawn.pos.x+x,spawn.pos.y+y, base.name);
            return undefined;
        }
        
        function validBuildingSpot(base, x, y) {
            if (x<2 || x > 47 || y < 2 || y > 47) return false;
            var pos = new RoomPosition(x, y, base.name)
            var structures = pos.lookFor(LOOK_STRUCTURES);
            var buildingsites = pos.lookFor(LOOK_CONSTRUCTION_SITES);
            var sources = pos.findInRange(FIND_SOURCES,2);
            var minerals = pos.findInRange(FIND_MINERALS,2);
            var countStructures = 0;
            for (var i=0;i<structures.length;i++) if (structures[i].structureType != STRUCTURE_ROAD) countStructures++;
            if (countStructures > 0) return false;
            if (buildingsites.length > 0 ) return false;
            if (sources.length > 0) return false;
            if (minerals.length > 0 ) return false;
            if (pos.inRangeTo(base.controller.pos,2)) return false;
            for (let nx=-1;nx<=1;nx++) {
                for (let ny=-1;ny<=1;ny++) {
                    if (Math.abs(nx) + Math.abs(ny) == 2) continue; // hoek mag wel grenzen met muur.
                    var terrain =base.lookForAt(LOOK_TERRAIN, x+nx, y+ny);
                    if (terrain[0] == 'wall' ) return false;
                }
            }
            return true;
        }
    }

    // building commands
    function planCreeps(nConstructionSites) {
        let nCreeps = {filler: 0, upgrader:0, builder:0};
        for (let creep of base.creeps) {
            if (nCreeps [creep.memory.role] == undefined) nCreeps [creep.memory.role] = 0;
            else nCreeps [creep.memory.role]++;
        }
        let spawnCommand = '';
        if (nCreeps['filler'] < 1 ) spawnCommand = 'spawnFirstFiller';
        else if (nCreeps['filler'] < 2 ) spawnCommand = 'spawnFiller';
        else if (nCreeps['upgrader'] < 1) spawnCommand = 'spawnUpgrader';
        else if (nConstructionSites > 0 && nCreeps['builder'] < 4) spawnCommand = 'spawnBuilder';
        else if (nCreeps['upgrader'] < 15) spawnCommand = 'spawnUpgrader';
        for (let spawn of base.spawns) spawn.command = spawnCommand;
    }
}

function command(base) {
    creepOps();
    buildingOps();
    return;

    function creepOps() {
        let creeps = base.creeps;
        for (let creep of creeps) {
            switch (creep.memory.role) {
                case 'filler':
                    creepFillerOps(creep);
                    break;
                case 'upgrader':
                    creepUpgraderOps(creep);
                    break;
                case 'builder':
                    creepBuilderOps(creep);
                    break;
            }
        }
    }
    
    function buildingOps() {
        let spawns = base.find(FIND_MY_STRUCTURES, {filter: { structureType: STRUCTURE_SPAWN}});
        for (let spawn of spawns) spawnOps(spawn);
    }
}

module.exports = main