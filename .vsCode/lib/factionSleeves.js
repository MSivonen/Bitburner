import {
    printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
    secondsToHMS, killAllButThis, connecter, randomInt, map, readFromJSON, writeToJSON, openPorts2, getBestFaction
}
    from '/lib/includes.js'

/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {
    ns.tprint(ns.getPlayer().factions)
    for (let i = 0; i < 8 && i < ns.getPlayer().factions.length; i++) {
        if (!ns.sleeve.setToFactionWork(i, ns.getPlayer().factions[i], "hacking contracts"))
            ns.sleeve.setToFactionWork(i, ns.getPlayer().factions[i], "field work");
    }

}