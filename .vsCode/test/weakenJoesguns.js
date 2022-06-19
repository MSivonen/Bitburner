import { readFromJSON } from '/lib/includes'
import { printArray } from '/lib/includes.js'
import { openPorts } from '/lib/includes.js'
import { objectArraySort } from '/lib/includes.js'
import { getServers } from '/lib/includes.js'
import { getServersWithRam } from '/lib/includes.js'
import { getServersWithMoney } from '/lib/includes.js'
//import { secondsToHMS } from '/lib/includes.js'
//import { killAllButThis } from '/lib/includes.js'
//import { connecter } from '/lib/includes.js'
import { randomInt } from '/lib/includes.js'
import { map } from '/lib/includes.js'
//import { readFromJSON } from '/lib/includes.js'
//import { writeToJSON } from '/lib/includes.js'

/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {
    await ns.scp("/lib/weak.js", "hacknet-node-0");
    while (true) {
        for (let i = 0; i < 100; i++) {
            ns.exec("/lib/weak.js", "hacknet-node-0", 1, "joesguns", Math.random());
        }
        await ns.sleep();
    }
}