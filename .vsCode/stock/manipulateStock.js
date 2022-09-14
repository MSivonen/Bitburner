import {
    printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
    secondsToHMS, killAllButThis, connecter, randomInt, map, readFromJSON, writeToJSON, openPorts2, getBestFaction
}
    from '/lib/includes.js'

/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {
    const weakFile = "/lib/weak.js",
        growfile = "/stock/growStock.js",
        hackFile = "/stock/hackStock.js",
        buyDarkProgramsFile = "/lib/buyPrograms.js",
        openPortsFile = "/lib/openPorts.js";
    let useFile,
        ghFile;

    let target = ns.args[0];
    if (typeof (target) != "string") errorExit("Use args: server, grow|hack. Invalid target: " + ns.args[0]);

    if (ns.args[1] == "grow") ghFile = growfile;
    else if (ns.args[1] == "hack") ghFile = hackFile;
    else errorExit("Use args: server, 'grow'|'hack'. Invalid h/g: " + ns.args[1]);

    function errorExit(text) {
        ns.tprint("ERROR - " + text)
        ns.exit();
    }

    while (true) {
        if (ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target))
            useFile = weakFile;
        else useFile = ghFile;
        for (const serv of getServers(ns)) {
            if (!ns.hasRootAccess(serv) || !ns.hasRootAccess(target)) {
                ns.exec(buyDarkProgramsFile, "home");
                await ns.sleep(500);
                ns.exec(openPortsFile, "home");
                await ns.sleep(500);
                ns.tprint("No root on " + serv + ", trying again");
                break;
            }
            let servRam = ns.getServerMaxRam(serv);
            if (serv == "home") servRam -= 60;
            const threads = Math.floor((
                servRam - ns.getServerUsedRam(serv)) / ns.getScriptRam(useFile));
            if (threads > 0) {
                await ns.scp(useFile, serv);
                ns.exec(useFile, serv, threads, target);
            }
        }
        await ns.sleep(10);
    }
}