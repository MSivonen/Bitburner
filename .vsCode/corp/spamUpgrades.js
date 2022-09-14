import {
    printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
    secondsToHMS, killAllButThis, connecter, randomInt, map, readFromJSON, writeToJSON, openPorts2, getBestFaction
}
    from '/lib/includes.js'

/** @param {import('../.').NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    while (true) {
        try { ns.corporation.hireAdVert("TB"); } catch { }
        try { ns.corporation.hireAdVert("FD"); } catch { }
        try { ns.corporation.hireAdVert("AG"); } catch { }
        let upgrades = [];
        ns.corporation.getUpgradeNames().forEach(up => { upgrades.push({ name: up, cost: ns.corporation.getUpgradeLevelCost(up) }) });
        objectArraySort(ns, upgrades, "cost", "small");
        try { upgrades.forEach(up => ns.corporation.levelUpgrade(up.name)); } catch { }
        ns.clearLog(); printArray(ns, upgrades, "tail"); await ns.sleep(100);
    }
}