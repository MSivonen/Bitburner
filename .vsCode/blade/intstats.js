import {
    printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
    secondsToHMS, killAllButThis, connecter, randomInt, map, readFromJSON, writeToJSON, openPorts2, getBestFaction, col
}
    from '/lib/includes.js'

/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.tail();
    let intStatsA;
    if (ns.fileExists("intfarmstats.txt"))
        intStatsA = readFromJSON(ns, "intfarmstats.txt");
    else intStatsA = [{
        time: new Date(),
        int: ns.getPlayer().skills.intelligence,
        intExp: Math.floor(ns.getPlayer().exp.intelligence)
    }];

    let prevStats = Object.assign({}, intStatsA.at(-1));


    while (1) {
        ns.clearLog();
        prevStats = Object.assign({}, intStatsA.at(-1));
        let newStats = {};
        newStats.time = new Date();
        newStats.int = ns.getPlayer().skills.intelligence;
        newStats.intExp = Math.floor(ns.getPlayer().exp.intelligence);
        newStats.I = ns.bladeburner.getActionCountRemaining("Operations", "Investigation");
        newStats.U = ns.bladeburner.getActionCountRemaining("Operations", "Undercover Operation");
        newStats.A = ns.bladeburner.getActionCountRemaining("Operations", "Assassination");
        newStats.H = ns.bladeburner.getSkillLevel("Hyperdrive");
        prevStats.time = new Date(prevStats.time);

        if (newStats.time.getMinutes() != prevStats.time.getMinutes()) {
            intStatsA.push(newStats);
            await writeToJSON(ns, intStatsA, "intfarmstats.txt");
        }

        ns.print("Current time:   " + newStats.time.toLocaleString("fi-FI"));
        ns.print("Previous time:  " + prevStats.time.toLocaleString("fi-FI"));
        ns.print("Int:    " + newStats.int);
        ns.print("Int xp: " + newStats.intExp);
        ns.print("\nOperations:");
        ns.print("Investigation:        " + newStats.I);
        ns.print("Undercover Operation: " + newStats.U);
        ns.print("Assassination:        " + newStats.A);

        await ns.sleep(1000);
    }
}
