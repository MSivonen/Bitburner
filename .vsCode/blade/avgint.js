//Created: 16.10.2022 09:06:25
//Last modified: 19.10.2022 19:19:40
import {
    printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
    secondsToHMS, killAllButThis, connecter, randomInt, map, readFromJSON, writeToJSON, openPorts2, getBestFaction, col
}
    from '/lib/includes.js'

/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {
    let intStatsHA = [];
    let intStatsDA = [];
    let test = new Date().getDate();
    //    ns.tprint(test);

    let statsA = readFromJSON(ns, "intfarmstats.txt");
    let startTime = statsA[0].time;
    let prevTime = new Date(statsA[0].time);

    for (const stat of statsA) {
        const thisTime = new Date(stat.time);
        if (thisTime.getMinutes() == 0) {
            intStatsHA.push(stat);
        }
        if (thisTime.getDate() != prevTime.getDate()) {
            intStatsDA.push(stat);
        }
        prevTime = thisTime;
    }

    intStatsDA.push(statsA.at(-1));
    intStatsHA.push(statsA.at(-1));

    /*ns.tprint("\nhourA:")
    printArray(ns, intStatsHA);
    ns.tprint("\ndayA:")
    printArray(ns, intStatsDA);*/
    intStatsHA.map(s => s.time = new Date(s.time).toLocaleString("fi-FI"));
    intStatsDA.map(s => s.time = new Date(s.time).toLocaleString("fi-FI"));

    const prevHour = intStatsHA.at(-2).intExp - intStatsHA.at(-3).intExp;
    const currentHour = intStatsHA.at(-1).intExp - intStatsHA.at(-2).intExp;
    const prevDay = intStatsDA.at(-2).intExp - intStatsDA.at(-3).intExp;
    const currentDay = intStatsDA.at(-1).intExp - intStatsDA.at(-2).intExp;

    ns.tprint("Current hour int xp:  " + currentHour);
    ns.tprint("Previous hour int xp: " + prevHour);
    ns.tprint("Current day int xp:   " + currentDay);
    ns.tprint("Previous day int xp:  " + prevDay);

}