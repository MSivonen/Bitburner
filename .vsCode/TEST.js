//import { printArray } from "/lib/includes.js"
//import { openPorts } from "/lib/includes.js"
//import { objectArraySort } from "/lib/includes.js"
//import { getServers } from "/lib/includes.js"
//import { getServersWithRam } from "/lib/includes.js"
//import { getServersWithMoney } from "/lib/includes.js"
//import { secondsToHMS } from "/lib/includes.js"
//import { killAllButThis } from "/lib/includes.js"
//import { connecter } from "/lib/includes.js"
import { randomInt } from "/lib/includes.js"
import { map } from "/lib/includes.js"

/** @param {NS} ns */
/** @param {import(".").NS } ns */
export async function main(ns) {
    const a = (number, low, high) => number < low ? low : number > high ? high : number;
    for (let i = -10; i < 20; i++) {
        ns.tprint(a(i, 0, 10));
        ns.tprint(_.clamp(i, 0, 10));
    }
}