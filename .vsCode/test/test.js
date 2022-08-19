import {
    printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
    secondsToHMS, killAllButThis, connecter, randomInt, map, readFromJSON, writeToJSON, openPorts2, getBestFaction
}
    from '/lib/includes.js'

/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {
    let testO = {
        name: "ooga booga",
        value: 1234,
        itnelligence: [3, 4, 2, 1]
    }

    let customString = "";

    for (const k of Object.keys(testO)) { if (k != "itnelligence") { ns.tprint(k); customString += k + testO[k]; } }
    for (const v of Object.values(testO)) ns.tprint(v);
    for (const e of Object.entries(testO)) ns.tprint(e);

    ns.tprint(customString);
}