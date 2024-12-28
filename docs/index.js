
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};//dont jugde me

var abort = false;//used to end all workers on a single failure
var formattedMonsters = [];//clean pasted json
var formattedBans = [];//clean user input
var typeCounter = [];//used to weight types, just to see, now it's useless
var statsCounter = [0, 0];//used to do the same for stats, useless. [smartStats*(tiers+1),tiers + 1 (for average)]
var desiredTier = 0;//PVP tier

let damageMultCache = {};//memoisation for dmg efficiency eg. water/flight vs fire/combat
let typeEdgeByNormalizedStatDiffCache = {};//memoisation for how one monster would perform agaionst any other monster of the pool. Type edge and normalized (smart)stats are taken into account.

/**
     * Calculates the damage multiplier for an attack based on the best type of the attacker against the defender.
     * 
     * @param {Array} attackerTypes - An array containing the types of the attacker.
     * @param {Array} defenderTypes - An array containing the types of the defender.
     * @param {boolean} weightedBool - A boolean indicating whether to apply type weightings. (changes with meta) (now useless)
     * 
     * @returns {number} - The highest damage multiplier of the attack type(s) against the defender.
     */

const damageMult = (attackerTypes, defenderTypes, weightedBool) => {

    let key = attackerTypes[0] + '+' + attackerTypes[1]
        + '-' + defenderTypes[0] + '+' + defenderTypes[1];

    if (damageMultCache.hasOwnProperty(key)) {
        return damageMultCache[key];
    }
    let damageMult2 = (attacker, defender, weightedBool) => {
        if (defender[0] == defender[1]) {
            switch (attacker) {
                case "NORMAL":
                    switch (defender[0]) {
                        case "NORMAL":
                            return 1;// *defender 0 ? <1 then / typecounter else * typecounter
                        case "FIRE":
                            return 1;
                        case "WATER":
                            return 1;
                        case "GRASS":
                            return 1;
                        case "ELECTRIC":
                            return 1;
                        case "ICE":
                            return 1;
                        case "FIGHTING":
                            return 1;
                        case "POISON":
                            return 1;
                        case "GROUND":
                            return 1;
                        case "FLYING":
                            return 1;
                        case "PSYCHIC":
                            return 1;
                        case "BUG":
                            return 1;
                        case "ROCK":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "GHOST":
                            return 0.001;
                        case "DRAGON":
                            return 1;
                        case "DARK":
                            return 1;
                        case "STEEL":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "FAIRY":
                            return 1;
                        default:
                            return 1;
                    }
                case "FIRE":
                    switch (defender[0]) {
                        case "NORMAL":
                            return 1;
                        case "FIRE":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "WATER":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "GRASS":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "ELECTRIC":
                            return 1;
                        case "ICE":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "FIGHTING":
                            return 1;
                        case "POISON":
                            return 1;
                        case "GROUND":
                            return 1;
                        case "FLYING":
                            return 1;
                        case "PSYCHIC":
                            return 1;
                        case "BUG":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "ROCK":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "GHOST":
                            return 1;
                        case "DRAGON":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "DARK":
                            return 1;
                        case "STEEL":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "FAIRY":
                            return 1;
                        default:
                            return 1;
                    }
                case "WATER":
                    switch (defender[0]) {
                        case "NORMAL":
                            return 1;
                        case "FIRE":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "WATER":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "GRASS":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "ELECTRIC":
                            return 1;
                        case "ICE":
                            return 1;
                        case "FIGHTING":
                            return 1;
                        case "POISON":
                            return 1;
                        case "GROUND":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "FLYING":
                            return 1;
                        case "PSYCHIC":
                            return 1;
                        case "BUG":
                            return 1;
                        case "ROCK":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "GHOST":
                            return 1;
                        case "DRAGON":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "DARK":
                            return 1;
                        case "STEEL":
                            return 1;
                        case "FAIRY":
                            return 1;
                        default:
                            return 1;
                    }
                case "GRASS":
                    switch (defender[0]) {
                        case "NORMAL":
                            return 1;
                        case "FIRE":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "WATER":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "GRASS":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "ELECTRIC":
                            return 1;
                        case "ICE":
                            return 1;
                        case "FIGHTING":
                            return 1;
                        case "POISON":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "GROUND":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "FLYING":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "PSYCHIC":
                            return 1;
                        case "BUG":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "ROCK":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "GHOST":
                            return 1;
                        case "DRAGON":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "DARK":
                            return 1;
                        case "STEEL":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "FAIRY":
                            return 1;
                        default:
                            return 1;
                    }
                case "ELECTRIC":
                    switch (defender[0]) {
                        case "NORMAL":
                            return 1;
                        case "FIRE":
                            return 1;
                        case "WATER":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "GRASS":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "ELECTRIC":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "ICE":
                            return 1;
                        case "FIGHTING":
                            return 1;
                        case "POISON":
                            return 1;
                        case "GROUND":
                            return 0.001;
                        case "FLYING":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "PSYCHIC":
                            return 1;
                        case "BUG":
                            return 1;
                        case "ROCK":
                            return 1;
                        case "GHOST":
                            return 1;
                        case "DRAGON":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "DARK":
                            return 1;
                        case "STEEL":
                            return 1;
                        case "FAIRY":
                            return 1;
                        default:
                            return 1;
                    }
                case "ICE":
                    switch (defender[0]) {
                        case "NORMAL":
                            return 1;
                        case "FIRE":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "WATER":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "GRASS":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "ELECTRIC":
                            return 1;
                        case "ICE":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "FIGHTING":
                            return 1;
                        case "POISON":
                            return 1;
                        case "GROUND":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "FLYING":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "PSYCHIC":
                            return 1;
                        case "BUG":
                            return 1;
                        case "ROCK":
                            return 1;
                        case "GHOST":
                            return 1;
                        case "DRAGON":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "DARK":
                            return 1;
                        case "STEEL":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "FAIRY":
                            return 1;
                        default:
                            return 1;
                    }
                case "FIGHTING":
                    switch (defender[0]) {
                        case "NORMAL":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "FIRE":
                            return 1;
                        case "WATER":
                            return 1;
                        case "GRASS":
                            return 1;
                        case "ELECTRIC":
                            return 1;
                        case "ICE":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "FIGHTING":
                            return 1;
                        case "POISON":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "GROUND":
                            return 1;
                        case "FLYING":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "PSYCHIC":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "BUG":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "ROCK":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "GHOST":
                            return 0.001;
                        case "DRAGON":
                            return 1;
                        case "DARK":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "STEEL":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "FAIRY":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        default:
                            return 1;
                    }
                case "POISON":
                    switch (defender[0]) {
                        case "NORMAL":
                            return 1;
                        case "FIRE":
                            return 1;
                        case "WATER":
                            return 1;
                        case "GRASS":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "ELECTRIC":
                            return 1;
                        case "ICE":
                            return 1;
                        case "FIGHTING":
                            return 1;
                        case "POISON":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "GROUND":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "FLYING":
                            return 1;
                        case "PSYCHIC":
                            return 1;
                        case "BUG":
                            return 1;
                        case "ROCK":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "GHOST":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "DRAGON":
                            return 1;
                        case "DARK":
                            return 1;
                        case "STEEL":
                            return 0.001;
                        case "FAIRY":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        default:
                            return 1;
                    }
                case "GROUND":
                    switch (defender[0]) {
                        case "NORMAL":
                            return 1;
                        case "FIRE":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "WATER":
                            return 1;
                        case "GRASS":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "ELECTRIC":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "ICE":
                            return 1;
                        case "FIGHTING":
                            return 1;
                        case "POISON":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "GROUND":
                            return 1;
                        case "FLYING":
                            return 0.001;
                        case "PSYCHIC":
                            return 1;
                        case "BUG":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "ROCK":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "GHOST":
                            return 1;
                        case "DRAGON":
                            return 1;
                        case "DARK":
                            return 1;
                        case "STEEL":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "FAIRY":
                            return 1;
                        default:
                            return 1;
                    }
                case "FLYING":
                    switch (defender[0]) {
                        case "NORMAL":
                            return 1;
                        case "FIRE":
                            return 1;
                        case "WATER":
                            return 1;
                        case "GRASS":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "ELECTRIC":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "ICE":
                            return 1;
                        case "FIGHTING":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "POISON":
                            return 1;
                        case "GROUND":
                            return 1;
                        case "FLYING":
                            return 1;
                        case "PSYCHIC":
                            return 1;
                        case "BUG":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "ROCK":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "GHOST":
                            return 1;
                        case "DRAGON":
                            return 1;
                        case "DARK":
                            return 1;
                        case "STEEL":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "FAIRY":
                            return 1;
                        default:
                            return 1;
                    }
                case "PSYCHIC":
                    switch (defender[0]) {
                        case "NORMAL":
                            return 1;
                        case "FIRE":
                            return 1;
                        case "WATER":
                            return 1;
                        case "GRASS":
                            return 1;
                        case "ELECTRIC":
                            return 1;
                        case "ICE":
                            return 1;
                        case "FIGHTING":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "POISON":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "GROUND":
                            return 1;
                        case "FLYING":
                            return 1;
                        case "PSYCHIC":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "BUG":
                            return 1;
                        case "ROCK":
                            return 1;
                        case "GHOST":
                            return 1;
                        case "DRAGON":
                            return 1;
                        case "DARK":
                            return 0.001;
                        case "STEEL":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "FAIRY":
                            return 1;
                        default:
                            return 1;
                    }
                case "BUG":
                    switch (defender[0]) {
                        case "NORMAL":
                            return 1;
                        case "FIRE":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "WATER":
                            return 1;
                        case "GRASS":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "ELECTRIC":
                            return 1;
                        case "ICE":
                            return 1;
                        case "FIGHTING":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "POISON":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "GROUND":
                            return 1;
                        case "FLYING":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "PSYCHIC":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "BUG":
                            return 1;
                        case "ROCK":
                            return 1;
                        case "GHOST":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "DRAGON":
                            return 1;
                        case "DARK":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "STEEL":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "FAIRY":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        default:
                            return 1;
                    }
                case "ROCK":
                    switch (defender[0]) {
                        case "NORMAL":
                            return 1;
                        case "FIRE":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "WATER":
                            return 1;
                        case "GRASS":
                            return 1;
                        case "ELECTRIC":
                            return 1;
                        case "ICE":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "FIGHTING":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "POISON":
                            return 1;
                        case "GROUND":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "FLYING":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "PSYCHIC":
                            return 1;
                        case "BUG":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "ROCK":
                            return 1;
                        case "GHOST":
                            return 1;
                        case "DRAGON":
                            return 1;
                        case "DARK":
                            return 1;
                        case "STEEL":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "FAIRY":
                            return 1;
                        default:
                            return 1;
                    }
                case "GHOST":
                    switch (defender[0]) {
                        case "NORMAL":
                            return 0.001;
                        case "FIRE":
                            return 1;
                        case "WATER":
                            return 1;
                        case "GRASS":
                            return 1;
                        case "ELECTRIC":
                            return 1;
                        case "ICE":
                            return 1;
                        case "FIGHTING":
                            return 1;
                        case "POISON":
                            return 1;
                        case "GROUND":
                            return 1;
                        case "FLYING":
                            return 1;
                        case "PSYCHIC":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "BUG":
                            return 1;
                        case "ROCK":
                            return 1;
                        case "GHOST":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "DRAGON":
                            return 1;
                        case "DARK":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "STEEL":
                            return 1;
                        case "FAIRY":
                            return 1;
                        default:
                            return 1;
                    }
                case "DRAGON":
                    switch (defender[0]) {
                        case "NORMAL":
                            return 1;
                        case "FIRE":
                            return 1;
                        case "WATER":
                            return 1;
                        case "GRASS":
                            return 1;
                        case "ELECTRIC":
                            return 1;
                        case "ICE":
                            return 1;
                        case "FIGHTING":
                            return 1;
                        case "POISON":
                            return 1;
                        case "GROUND":
                            return 1;
                        case "FLYING":
                            return 1;
                        case "PSYCHIC":
                            return 1;
                        case "BUG":
                            return 1;
                        case "ROCK":
                            return 1;
                        case "GHOST":
                            return 1;
                        case "DRAGON":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "DARK":
                            return 1;
                        case "STEEL":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "FAIRY":
                            return 1;
                        default:
                            return 1;
                    }
                case "DARK":
                    switch (defender[0]) {
                        case "NORMAL":
                            return 1;
                        case "FIRE":
                            return 1;
                        case "WATER":
                            return 1;
                        case "GRASS":
                            return 1;
                        case "ELECTRIC":
                            return 1;
                        case "ICE":
                            return 1;
                        case "FIGHTING":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "POISON":
                            return 1;
                        case "GROUND":
                            return 1;
                        case "FLYING":
                            return 1;
                        case "PSYCHIC":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "BUG":
                            return 1;
                        case "ROCK":
                            return 1;
                        case "GHOST":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "DRAGON":
                            return 1;
                        case "DARK":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "STEEL":
                            return 1;
                        case "FAIRY":
                            return 0.001;
                        default:
                            return 1;
                    }
                case "STEEL":
                    switch (defender[0]) {
                        case "NORMAL":
                            return 1;
                        case "FIRE":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "WATER":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "GRASS":
                            return 1;
                        case "ELECTRIC":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "ICE":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "FIGHTING":
                            return 1;
                        case "POISON":
                            return 1;
                        case "GROUND":
                            return 1;
                        case "FLYING":
                            return 1;
                        case "PSYCHIC":
                            return 1;
                        case "BUG":
                            return 1;
                        case "ROCK":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "GHOST":
                            return 1;
                        case "DRAGON":
                            return 1;
                        case "DARK":
                            return 1;
                        case "STEEL":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "FAIRY":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        default:
                            return 1;
                    }
                case "FAIRY":
                    switch (defender[0]) {
                        case "NORMAL":
                            return 1;
                        case "FIRE":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "WATER":
                            return 1;
                        case "GRASS":
                            return 1;
                        case "ELECTRIC":
                            return 1;
                        case "ICE":
                            return 1;
                        case "FIGHTING":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "POISON":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "GROUND":
                            return 1;
                        case "FLYING":
                            return 1;
                        case "PSYCHIC":
                            return 1;
                        case "BUG":
                            return 1;
                        case "ROCK":
                            return 1;
                        case "GHOST":
                            return 1;
                        case "DRAGON":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "DARK":
                            return 2 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "STEEL":
                            return 0.5 ** (weightedBool ? typeCounter[defender[0]] : 1);
                        case "FAIRY":
                            return 1;
                        default:
                            return 1;
                    }
                default:
                    return 1;
            }
        } else {
            // because one typed monsters have 2 times the same type in MonsterDex
            return (damageMult2(attacker, [defender[0], defender[0]], weightedBool)
                * damageMult2(attacker, [defender[1], defender[1]], weightedBool));
        }
    };

    let result;

    if (attackerTypes[0] == attackerTypes[1]) {
        result = damageMult2(attackerTypes[0], defenderTypes, weightedBool);
    } else {
        result = Math.max(damageMult2(attackerTypes[0], defenderTypes, weightedBool),
            damageMult2(attackerTypes[1], defenderTypes, weightedBool));
    }

    damageMultCache[key] = result;
    return result;
};

/**
 * statdiff calculates a multiplier that compares the strength of two monsters,
 * giving a higher value if the first monster is stronger than the second.
 * The calculation first compares the smartstats (explained elsewhere) of the two monsters, then
 * looks at the attacking and defensive stats of each to give a better sense
 * of how they will match up in a battle.
 * It is useful to compare monsters of the same type.
 * @param {object} monster1 - Attacker.
 * @param {object} monster2 - Defender.
 * @return {number} The normalized stat difference of the two monsters.
 */
const statdiff = (monster1, monster2) => {

    let diff = monster1.smartStats / monster2.smartStats;

    if (monster1.stats.attack > monster1.stats.sp_attack) {
        diff *= monster1.stats.attack / monster2.stats.defense;
    } else {
        diff *= monster1.stats.sp_attack / monster2.stats.sp_defense;
    }

    if (monster2.stats.attack > monster2.stats.sp_attack) {
        diff /= monster2.stats.attack / monster1.stats.defense;
    } else {
        diff /= monster2.stats.sp_attack / monster1.stats.sp_defense;
    }

    return Math.sqrt(diff);
};

/**
 * This is the same as the damage multiplier but multiplying it by the normalized stats difference (square root of the stats difference) gives a better sense 
 * of how the two monsters will match up in a battle. 
 * Closer to a proper 1v1 efficiency score if you will.
 * @param {object} monster1 - Attacker.
 * @param {object} monster2 - Defender.
 * @return {number} The type edge by normalized stat difference of the two monsters.
 */
const typeEdgeByNormalizedStatDiff = (monster1, monster2) => {

    let key = monster1.id + '-' + monster2.id;

    if (typeEdgeByNormalizedStatDiffCache.hasOwnProperty(key)) {
        return typeEdgeByNormalizedStatDiffCache[key];
    }

    let result = statdiff(monster1, monster2)
        * Math.min(8, damageMult(monster1.types, monster2.types, false)
            / damageMult(monster2.types, monster1.types, false));

    typeEdgeByNormalizedStatDiffCache[key] = result;
    return result;
}

/**
 * Handles the "Format" button click event, processing the input data.
 * 
 * Will display, change or hide various input and title elements. 
 * Will clean and parse both text inputs.
 * Will process and format all the monsters from the input to the formattedMonsters array.
 * 
 * The function also sets up the UI elements for tier selection after processing the input.
 */
const onFormatButtonClick = async () => {

    document.getElementById('formatButton').style.display = 'none';
    document.getElementById('small-input').style.display = 'none';
    document.getElementById('small-input2').style.display = 'none';

    document.getElementById('title').style.display = 'none';
    document.getElementById('title2').style.display = 'none';
    document.getElementById('title3').style.display = 'none';

    /**
     * Converts a tier string to a number. The tier string is an array containing one element, the tier name.
     * @param {array} tiers - The tier string.
     * @return {number} The numerical representation of the tier.
     * @example
     *  tierStrToInt(['Untiered']) // returns 0
     *  tierStrToInt(['Never Used']) // returns 1
     *  tierStrToInt(['Under Used']) // returns 2
     *  tierStrToInt(['Over Used']) // returns 3
     *  tierStrToInt(['Invalid']) // returns 666
     */
    let tierStrToInt = (tiers) => {
        switch (tiers[0]) {
            case "Untiered":
                return 0;
            case "Never Used":
                return 1;
            case "Under Used":
                return 2;
            case "Over Used":
                return 3;
            default:
                return 666;
        }
    };

    let monsters;

    try {//removes non-asci chars, control chars, and probably other BS we dont care about
        monsters = JSON.parse(
            document.getElementById('small-input').value
                .replace(/[^\x00-\x7F]/g, "")
                .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
        );
    } catch (error) {
        document.getElementById('title').style.display = 'block';
        document.getElementById('title').innerHTML = `Bad JSON`;
        document.getElementById('title2').style.display = 'block';
        document.getElementById('title2').innerHTML = `CTRL+F5 to Restart.`;
        document.getElementById('content').innerHTML = `Error: ${error}`;
        console.error(error);
        abort = true;
    }

    if (abort) { return };

    document.getElementById('small-input').value = '';

    let bans = document.getElementById('small-input2').value
        .replace(/[^\x00-\x7F\n]/g, "") // keep ASCII chars and \n
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, function (char) {
            return char === "\n" ? "\n" : ""; // removes control chars but not newlines (\n) because it's the separator specified to the user.
        });

    document.getElementById('small-input2').value = '';

    // Split bans string into array formattedBans, and trim whitespace from each ban
    bans.split('\n').forEach((ban) => {
        if (ban.trim() !== '') {
            formattedBans.push(ban.trim());
        }
    });

    //We remove some unrelevant monsters from the pool
    monsters.forEach((monster) => {
        if (!monster.obtainable) { return };
        if (monster.tiers.includes("Ubers")) { return };
        if (formattedBans.some(ban => monster.name.includes(ban))) { return };

        formattedMonsters.push({
            id: monster.id,
            name: monster.name,
            types: monster.types,
            stats: monster.stats,
            tiers: tierStrToInt(monster.tiers),
            evolutions: monster.evolutions,
            globalWeightedEdge: 1,
            smartStats: 0,
            statScore: 1
        });
    });

    document.getElementById('title').innerHTML = `Select Tiers`;
    document.getElementById('title').style.display = 'block';
    document.getElementById('tierSelect').style.display = 'block';
    document.getElementById('tierButton').style.display = 'block';


};

document.getElementById('formatButton').addEventListener('click', onFormatButtonClick);

/**
 * Handles the "Tier" button click event, processing the filtered list of monsters based on the selected tier.
 * 
 * Hides tier selection UI elements, filters the monsters to only include those within the desired tier, 
 * and removes monsters that have evolutions present in the pool (dominated monsters).
 * 
 * Calculates the "smartStats" for each remaining monster, which is a weighted sum of its stats, 
 * and caches the product of type edge by normalized stat difference for efficiency.
 * 
 * Sorts the monsters by their global weighted edge (Metascore) to prepare for the next step in the process, 
 * which involves selecting contenders and CPU usage.
 * 
 * Updates the UI to reflect the next step, displaying the contenders list and options for work amount and CPU usage.
 */
const onTierButtonClick = async () => {

    document.getElementById('tierSelect').style.display = 'none';
    document.getElementById('tierButton').style.display = 'none';

    let desiredTier = document.getElementById('tierSelect').value;

    // filters out monsters of higher tiers
    formattedMonsters = formattedMonsters.filter((monster) => {
        return (monster.tiers <= desiredTier
            /*&& monster.tiers >= desiredTier - 2*/);//<--not useful unless running on ultra-potato AND wanting to compute 100+ (stupid)
    });

    console.log(formattedMonsters.length + ' monsters before purging');

    // removes dominated monsters (aka ignore it if it has an evolution in the pool)
    formattedMonsters = formattedMonsters.filter((monster) => {

        if (typeof monster.evolutions === 'undefined'
            || monster.evolutions === null
            || monster.evolutions.length == 0) { return true };

        let evolutions = [];

        monster.evolutions.forEach((evolution) => { evolutions.push(evolution.id) });

        if (evolutions.length == 0) { return true };

        for (var i = 0; i < formattedMonsters.length; i++) {
            if (evolutions.includes(formattedMonsters[i].id)) { return false };
        }

        return (true);
    });

    console.log(formattedMonsters.length + ' monsters after purging');

    // Loops through all formatted monsters and calculate their smart stats
    //
    // Basically it is the stat difference ignoring the weakest attack of the attacker and the opposite defense of the defender
    // example: higher attacker's "attack" means we ignore 
    // the attacker's "sp_attack" 
    // and the defenders "sp_defense"
    // in the calculation of the stats
    //
    // it is normalized (using sqrt) to use as a multiplier for the type edge,
    // resulting in the first half of the "1v1 score"
    //
    // the actual "1v1 score" is calculated using the score of one monster attacking the other, 
    // divided by the score of the other monster attacking the first one.
    //
    // it is important so that redundant calculations are NOT done during computation,
    // which avoids up to billions of divisions
    //
    // note: since the division is done before caching,
    // typeEdgeByNormalizedStatDiff(monster_a, monster_b) doesnt need to be
    // called the other way around / called twice
    formattedMonsters.forEach((monster) => {
        monster.smartStats = (monster.stats.hp
            + Math.max(monster.stats.attack, monster.stats.sp_attack)
            + monster.stats.defense
            + monster.stats.sp_defense
            + monster.stats.speed);
    });

    formattedMonsters.forEach((monster_a) => {

        let edgesArray = [];

        formattedMonsters.forEach((monster_b) => {
            // this will also cache the edge of each monster against each other monster
            // note: the cached edge is normalized by the smart stats diff as mentionned above
            edgesArray.push(typeEdgeByNormalizedStatDiff(monster_a, monster_b));
        });
        // arithmetic average of the edges of one monster against all the others
        // for early sorting so we can ignore the worst ones by picking the top X monsters.
        // called Metascore on the interface
        monster_a.globalWeightedEdge = edgesArray.reduce((a, b) => a + b) / edgesArray.length;
    });

    // actual sorting
    formattedMonsters.sort((a, b) => { return (b.globalWeightedEdge - a.globalWeightedEdge) });

    // UI stuff for the next step
    document.getElementById('title').innerHTML = `Select Work Amount`;
    document.getElementById('title').style.display = 'block';
    document.getElementById('contendersPrompt').style.display = 'block';
    document.getElementById('title2').innerHTML = `Select CPU Usage`;
    document.getElementById('title2').style.display = 'block';
    document.getElementById('cpuPrompt').style.display = 'block';
    document.getElementById('title3').innerHTML = `All Good?`;
    document.getElementById('title3').style.display = 'block';

    document.getElementById('contendersButton').style.display = 'block';


    // contenders list for the user, sorted by global score
    let contendersListStr = `<br>=============================<br>&emsp;&emsp;&emsp;Current Contenders<br>=============================<br>RANK&emsp;&emsp;NAME(ID)&emsp;&emsp;&emsp;&emsp;METASCORE<br>`;
    let tmpcounter = 1;
    formattedMonsters.forEach((monster) => {
        contendersListStr += `${tmpcounter++}&emsp;&emsp;&emsp;&emsp;${monster.name}(${monster.id})&emsp;&emsp;&emsp;&emsp;${(monster.globalWeightedEdge).toFixed(2)}<br>`;
    });
    document.getElementById('content').innerHTML = contendersListStr;

};

document.getElementById('tierButton').addEventListener('click', onTierButtonClick);

const onContendersButtonClick = async () => {

    // not needed anymore
    delete damageMultCache;

    /**
     * Converts an integer to a string with spaces as thousand separators.
     * 
     * @param {number} i - The integer to be converted.
     * @returns {string} - The formatted string with spaces as thousand separators.
     */
    let intToSpacedStr = (i) => {
        return i.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }

    document.getElementById('title').innerHTML = ``;
    document.getElementById('contendersPrompt').style.display = 'none';
    document.getElementById('contendersButton').style.display = 'none';
    document.getElementById('cpuPrompt').style.display = 'none';
    document.getElementById('title2').style.display = 'none';
    document.getElementById('title3').style.display = 'none';

    const totalContenders = Math.min(formattedMonsters.length, Number(document.getElementById('selector-paragraph').querySelector('select').value));
    console.log(`total contenders: ${totalContenders}`);

    // cleans monster objects to eat less memory
    formattedMonsters.forEach((monster) => {
        delete monster.types;
        delete monster.stats;
        delete monster.tiers;
        delete monster.evolutions;
        delete monster.globalWeightedEdge;
        delete monster.smartStats;
        delete monster.statScore;
    });

    //number of workers/threads. if 0 (default) then as many logical cores available are used
    const numWorkers = Number(document.getElementById('selector-paragraph2').querySelector('select').value)
        == -1 ? 
            Math.max(2, Math.floor(navigator.hardwareConcurrency * 2/3)) : 
            Number(document.getElementById('selector-paragraph2').querySelector('select').value) || navigator.hardwareConcurrency;

    /**
     * Calculates the number of combinations of k items in a set of size n.
     * @param {number} n - The number of items to choose from.
     * @param {number} k - The number of items to choose.
     * @return {number} The number of combinations of n items taken k at a time.
     * @example combinations(5, 3) // returns 10
     */
    function combinations(n, k) {
        if (k > n) return 0; // Les combinaisons ne sont pas définies pour k > n
        if (k === 0 || k === n) return 1; // Cas triviaux
        k = Math.min(k, n - k); // Optimisation : calculer C(n, k) = C(n, n-k)

        let numerator = BigInt(1);
        let denominator = BigInt(1);
        for (var i = 0; i < k; i++) {
            numerator *= BigInt(n - i);
            denominator *= BigInt(i + 1);
        }

        return numerator / denominator;
    }

    const totalCombinations = Number(combinations(totalContenders, 6));
    const chunkSize = Math.ceil(totalCombinations / numWorkers);

    console.log("combinations: " + totalCombinations);
    console.log("workers: " + numWorkers);
    console.log("chunk size: " + chunkSize);

    document.getElementById('title').innerHTML = `Making ${intToSpacedStr(totalCombinations)} parties...`;
    document.getElementById('content').innerHTML = ``;
    document.getElementById('extraContent').innerHTML = `<br>Might freeze, just wait.`;
    document.getElementById('extraContent').style.display = 'block';

    if (abort) { return };

    document.getElementById('content').innerHTML = ``;

    const progress = [];
    for (var i = 0; i < numWorkers; i++) {
        progress.push(0);
    }

    /**
     * Waits until all workers have finished their task.
     * While waiting, updates the progress, elapsed time and ETA in the UI.
     * @returns {Promise<void>}
     */
    let waitForCycle = async () => {
        let startTime = performance.now();
        let avgProgress = 0;// arithmetic average of the progress of all the workers
        let elapsedTime = 0;
        let etaCycleCounter = 0;// counter used to not refresh the ETA UI too often so it doesnt blink
        let etas = new Array(3);// array of ETAs used to display the ETA as the arithmetic average of its values, for smoothness
        let etasPointer = 0;// pointer to the next ETA to be changes in the etas array, so by cycling we replace the oldest one

        /**
         * Initializes all the values of the 'etas' array to 'eta'.
         * @param {number} eta - The value to which all the elements of 'etas' will be set.
         */
        let etasInit = (eta) => {
            for (var i = 0; i < etas.length; i++) {
                etas[i] = eta;
            }
        }

        /**
         * Converts a duration in milliseconds to a string with units of years, months, days, hours, minutes and seconds.
         * @param {number} millis - The duration in milliseconds.
         * @returns {string} - The duration as a string with units of years, months, days, hours, minutes and seconds.
         */
        let millisToDateStr = (millis) => {
            var years = Math.floor(millis / 31536000000);
            var months = Math.floor((millis % 31536000000) / 2628000000);
            var days = Math.floor((millis % 2628000000) / 86400000);
            var hours = Math.floor((millis % 86400000) / 3600000);
            var minutes = Math.floor((millis % 3600000) / 60000);
            var seconds = ((millis % 60000) / 1000).toFixed(0);
            return (years > 0 ? years + "y " : '') + (months > 0 ? months + "mo " : '')
                + (days > 0 ? days + "d " : '') + (hours > 0 ? hours + ":" : '0:')
                + (minutes < 10 ? '0' : '') + minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
        }

        /**
        * Calculates the ETA (estimated time remaining) of a task.
        * @param {number} elapsedTime - Elapsed time in milliseconds.
        * @param {number} progress - Progress of the task, between 0 and 1.
        * @returns {number} - Estimated time remaining in milliseconds. Returns Infinity if progress is 0.
        */
        let calculateETA = (elapsedTime, progress) => {
            if (progress <= 0) {
                return Infinity; // Éviter la division par zéro
            }
            if (progress >= 1) {
                return 0; // Si la tâche est terminée, il reste 0 ms
            }

            const estimatedTotalTime = elapsedTime / progress;
            const remainingTime = estimatedTotalTime - elapsedTime;

            return Math.round(remainingTime);
        }

        /**
         * Updates the oldest entry in the etas array. (using the etasPointer)
         * Returns the arithmetic average of the etas array, with some small correction.
         * @param {number} newEta - The most recent ETA, to b added to the etas array.
         * @returns {number} - ETA (smoothed/average).
         */
        let refreshEta = (newEta) => {
            etas[etasPointer] = newEta;
            etasPointer = (etasPointer + 1) % etas.length;
            return Math.max(0, (etas.reduce((acc, a) => acc + a, 0) / etas.length) - 1000);// -1s cause a little late on the last moments due to averageing
        }
        /**
         * Checks if all workers have completed their tasks.
         * 
         * Iterates over each worker's progress and determines if any worker has not yet completed their task.
         * 
         * @returns {boolean} - Returns true if all workers have finished their tasks (progress is 1.0 or more), false otherwise.
         */
        let finishCheck = () => {
            for (var i = 0; i < numWorkers; i++) {
                if (progress[i] < 1.0) {
                    return false;
                }
            }
            return true;
        }

        let firstEta = true;// to set all etas array values to the first ETA we get (whenever a worker as done minimal progress)

        document.getElementById('extraContent').style.display = 'none';
        document.getElementById('extraContent').innerHTML = ``;

        while (true) {
            if (!finishCheck() && !abort) {

                //the progress array is fed elsewhere, on receiving a message from a worker
                avgProgress = progress.reduce((acc, a) => acc + a, 0) / numWorkers;
                elapsedTime = performance.now() - startTime;

                document.getElementById('content').innerHTML = `Total: ${(avgProgress * 100).toFixed(2)}%`;
                document.getElementById('time').innerHTML = `Time: ${millisToDateStr(elapsedTime)}`;

                if (etaCycleCounter++ > 4) {//4 -> every 1ish second
                    etaCycleCounter = 0;
                    if (avgProgress > 0) {
                        if (firstEta) {
                            etasInit((calculateETA(elapsedTime, avgProgress)));
                            firstEta = false;
                        }
                        document.getElementById('eta').innerHTML = `ETA: ${millisToDateStr(refreshEta(calculateETA(elapsedTime, avgProgress)))}`;
                    }
                }

                await sleep(200);

            } else {
                break;
            }
        }

        // reset the progress so next task doesnt get skipped
        for (var i = 0; i < numWorkers; i++) {
            progress[i] = 0.0;
        }
    }

    let results = new Array(numWorkers);//[[party, score]] workers feed this

    // Create Web Workers
    const workers = [];
    for (var i = 0; i < numWorkers; i++) {
        //const worker = new Worker('worker.js'); <-- not possible locally because it triggers cross-origin prevention

        // It's fockin ogly m8
        const workerBlob = new Blob(
            ["(" + worker_function.toString() + ")()"],
            { type: 'text/javascript' }
        );
        const workerURL = URL.createObjectURL(workerBlob);
        const worker = new Worker(workerURL);

        workers.push(worker);
    }

    // Send data to Web Workers
    workers.forEach((worker, index) => {
        worker.postMessage({
            id: index,
            chunkSize: chunkSize,
            monsters: formattedMonsters,
            totalCombinations: totalCombinations,
            typeEdgeByNormalizedStatDiffCache: typeEdgeByNormalizedStatDiffCache
        });
    });

    // Receive results from Web Workers
    workers.forEach((worker) => {
        worker.onmessage = (event) => {

            if (event.data.abort) {
                console.log("aborting computation");
                console.error(event.data.error);
                abort = true;
                workers.forEach((worker) => { worker.terminate() });
                return;
            }

            progress[event.data.id] = event.data.progress;

            // if event.data.score exist and non-0, event.data.party is the result
            // if only precompute is done, progress will be 1 but there will be no score
            if (event.data.progress === 1.0 && event.data.score) {
                results[event.data.id] = [event.data.party, event.data.score];
                worker.terminate();
                console.log("worker " + event.data.id + " done");
            }
        };
    });

    try {

        // workers have started precomputing (making combinations) on receiving the data we sent above
        // we wait until they are all done
        await waitForCycle();

    } catch (error) {
        abort = true;
        workers.forEach((worker) => { worker.terminate() });
        document.getElementById('title').innerHTML = `Good Job You Broke It!`;
        document.getElementById('title2').style.display = 'block';
        document.getElementById('title2').innerHTML = `CTRL+F5 to Restart. Try Lower sizes.`;
        document.getElementById('content').innerHTML = `Error: ${error}`;
        document.getElementById('extraContent').innerHTML = ``;
        console.error(error);
        return;
    }

    await sleep(2000);

    // tells workers to start computing since all workers are done precomputing
    workers.forEach((worker) => { worker.postMessage({ go: 1 }) });

    let finalBestParty;

    try {
        document.getElementById('title').innerHTML = `Comparing ${intToSpacedStr(totalCombinations)} parties...`;
        document.getElementById('content').innerHTML = `Total: ${(0).toFixed(2)}%`;
        document.getElementById('time').innerHTML = `Time: 0:00`;
        document.getElementById('eta').innerHTML = `ETA:`;

        // wait for computation to be completed on all the workers
        await waitForCycle();

        // result array is fed on receiving a message from a worker with a progress:1.0 and a party/partyscore
        // party (results[x][0]) with the highest score (results[x][1]) is the best party
        finalBestParty = abort ? null : results.reduce((acc, a) => acc[1] > a[1] ? acc : a)[0];

    } catch (error) {
        abort = true;
        workers.forEach((worker) => { worker.terminate() });
        document.getElementById('title').innerHTML = `Good Job You Broke It!`;
        document.getElementById('title2').style.display = 'block';
        document.getElementById('title2').innerHTML = `CTRL+F5 to Restart. Try Lower sizes.`;
        document.getElementById('content').innerHTML = `Error: ${error}`;
        document.getElementById('extraContent').innerHTML = ``;
        console.error(error);
        return;
    }

    if (abort) { return };

    document.getElementById('eta').innerHTML = ``;
    document.getElementById('content').innerHTML = ``;
    document.getElementById('extraContent').innerHTML = ``;

    document.getElementById('title').innerHTML = `Best Party is:`;

    let bestPartyText = `NAME(ID)<br><br>`;
    finalBestParty.forEach((monster) => {
        bestPartyText += `${monster.name}(${monster.id})<br>`;
    });
    bestPartyText += `<br>`;

    document.getElementById('content').innerHTML = bestPartyText;
    document.getElementById('end').style.display = 'block';

};

document.getElementById('contendersButton').addEventListener('click', onContendersButtonClick);