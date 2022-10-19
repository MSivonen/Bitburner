//Created: 14.10.2022 10:01:43
//Last modified: 19.10.2022 19:19:44
import {
    printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
    secondsToHMS, killAllButThis, connecter, randomInt, map, readFromJSON, writeToJSON, openPorts2, getBestFaction, col
}
    from '/lib/includes.js'

/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {
    ns.singularity.joinFaction("ECorp");
    for (let i = 0; i < ns.sleeve.getNumSleeves(); i++)
    ns.sleeve.setToBladeburnerAction(i, "Infiltrate synthoids");
    while (true) {
        ns.bladeburner.startAction("General", "Incite Violence");
        await ns.sleep(ns.bladeburner.getActionTime("General", "Incite Violence"));
        let augCost;
        let count = 0;
        for (let i = 0; i < 20; i++) {
            while (1234) {
                augCost = ns.singularity.getAugmentationPrice("NeuroFlux Governor");
                if (ns.getServerMoneyAvailable("home") > augCost * 1.2) {
                    ns.singularity.donateToFaction("ECorp", augCost * .2);
                }
                if (ns.singularity.purchaseAugmentation("ECorp", "NeuroFlux Governor")) {
                    count++;
                } else break;
            }

        }
        if (count > 0)
            ns.singularity.softReset("/bn4/spamNeuroFlux.js")
        else ns.tprint("No spamming spammed");
        await ns.sleep(1000);
    }
}
