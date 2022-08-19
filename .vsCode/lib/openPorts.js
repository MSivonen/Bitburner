import {
    printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
    secondsToHMS, killAllButThis, connecter, randomInt, map, readFromJSON, writeToJSON, openPorts2, getBestFaction
}
    from '/lib/includes.js'

/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {
    for (const serv of getServers(ns)) {
        try { ns.ftpcrack(serv); } catch { }
        try { ns.sqlinject(serv); } catch { }
        try { ns.httpworm(serv); } catch { }
        try { ns.relaysmtp(serv); } catch { }
        try { ns.brutessh(serv); } catch { }
        try { ns.nuke(serv); } catch { }
    }
}