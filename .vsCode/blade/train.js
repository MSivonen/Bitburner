import {
    printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
    secondsToHMS, killAllButThis, connecter, randomInt, map, readFromJSON, writeToJSON, openPorts2, getBestFaction, col
}
    from '/lib/includes.js'

/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {
    ns.tail();
    ns.tprint(ns.getPlayer().skills)
    const skills = ["strength", "defense", "dexterity", "agility"]
    let ii = 0;

    while (true) {
        ii++;
        ns.singularity.gymWorkout("Powerhouse Gym", skills[ii % 4], false);
        for (let i = 0; i < ns.sleeve.getNumSleeves(); i++)
            ns.sleeve.setToGymWorkout(i, "Powerhouse Gym", skills[ii % 4]);
        await ns.sleep(3000);
    }
}