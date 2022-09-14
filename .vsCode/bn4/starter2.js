import {
    printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
    secondsToHMS, killAllButThis, connecter, randomInt, map, readFromJSON, writeToJSON, openPorts2, getBestFaction
}
    from '/lib/includes.js'

/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {
    const files = [
        { name: "Commander", file: "/bn4/startSin.js", delay: 0, kill: false, running: false },
        { name: "hackNet", file: "/hacknet/hackNet.js", delay: 0, kill: false, running: false },
        //wait for homicide to end
        { name: "Start gang", file: "/gang/thugGang.js", delay: 0, kill: false, running: false },
        { name: "Stocks", file: "/stock/stockXsinx.js", delay: 0, kill: false, running: false },
        { name: "Batcher", file: "/ver6/ver6.js", delay: 0, kill: false, running: false },
        { name: "Sleeves", file: "/bn4/sleeves.js", delay: 0, kill: false, running: false }
    ]
    while (42) {
        let allRunning = true;
        for (const file of files) {
            if (file.running) continue;
            for (const serv of getServersWithRam(ns)) {
                if (file.running) break;
                await ns.scp("/lib/tables_xsinx.js", serv);
                await ns.scp("/lib/includes.js", serv);
                await ns.scp(file.file, serv);
                if (ns.exec(file.file, serv, 1) != 0) {
                    file.running = true;
                    break;
                }
            }
            if (!file.running)
                allRunning = false;
        }
        if (allRunning) return;
        await ns.sleep(20);
    }
}