import {
    printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
    secondsToHMS, killAllButThis, connecter, randomInt, map, readFromJSON, writeToJSON, openPorts2, getBestFaction
}
    from '/lib/includes.js'

/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {
    const file = "/corp/corpMughur.js";
    for (const serv of getServers(ns))
        if (ns.getServerMaxRam(serv) - ns.getServerUsedRam(serv) >= ns.getScriptRam(file)) {
            ns.scp(file, serv);
            ns.exec(file, serv, 1);
            ns.tprint("Corp started in " + serv);
            return;
        }
    ns.tprint("Not enough ram for corp script")
}