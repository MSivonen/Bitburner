import {
    printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
    secondsToHMS, killAllButThis, connecter, randomInt, map, readFromJSON, writeToJSON, openPorts2, getBestFaction
}
    from '/lib/includes.js'

/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {
    let g_sets = { //variables to be controlled with buttons
        var1: true,
        var2: true,
        var3: true
    };
    const logPort = ns.getPortHandle(1);


    ns.tail();
    while (1) {
        ns.clearLog();
        g_sets = readFromJSON(ns, "g_settings_test.txt");
        ns.print("var1: " + g_sets.var1);
        ns.print("var2: " + g_sets.var2);
        ns.print("var3: " + g_sets.var3);
        if (g_sets.var1) logPort.write("var1 is on");
        if (g_sets.var2) logPort.write("var2 is on");
        if (g_sets.var3) logPort.write("var3 is on");
        await ns.sleep(1000);
    }
}