//Created: 08.08.2022 13:34:21
//Last modified: 19.10.2022 19:21:37
import {
    printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
    secondsToHMS, killAllButThis, connecter, randomInt, map, readFromJSON, writeToJSON, openPorts2, getBestFaction
}
    from '/lib/includes.js'

/** @param {NS} ns */
/** @param {import('..').NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");

    let target = "joesguns",
        weakFile = "/lib/weak.js",
        growfile = "/lib/grow.js",
        useFile;

    if (typeof ns.args[0] == "string") target = ns.args[0];
    while (true || ns.getHackingLevel() < ns.getServerRequiredHackingLevel("phantasy")) {
        if (ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target))
            useFile = weakFile;
        else useFile = growfile;
        for (const serv of getServersWithRam(ns)) {
            let servRam = ns.getServerMaxRam(serv);
            if (serv == "home") servRam -= 30;
            const threads = Math.floor((
                servRam - ns.getServerUsedRam(serv)) / ns.getScriptRam(useFile));
            if (threads > 0) {
                await ns.scp(useFile, serv);
                ns.exec(useFile, serv, threads, target);
            }
        }
        await ns.sleep(50);
    }
}