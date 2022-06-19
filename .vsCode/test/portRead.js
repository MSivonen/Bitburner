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
    let port = ns.getPortHandle(1); //x = 1-20
    while (true) {
        while (!port.empty()) {
            ns.tprint(port.read());
            await ns.sleep(100);
        }
        await ns.sleep(100);
    }
}