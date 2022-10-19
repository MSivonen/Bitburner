import {
    printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
    secondsToHMS, killAllButThis, connecter, randomInt, map, readFromJSON, writeToJSON, openPorts2, getBestFaction, col
}
    from '/lib/includes.js'

/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {
    const cities = ["Aevum", "Chongqing", "Sector-12", "New Tokyo", "Ishima", "Volhaven"];

    while (true) {
        await ns.sleep();
        for (const divi of ns.corporation.getCorporation().divisions) {
            const division = divi.name;
            for (const city of cities) {
                try { ns.corporation.expandCity(division, city); } catch { };
                try { ns.corporation.purchaseWarehouse(division, city); } catch { };
                for (let i = 0; i < 100; i++) {
                    ns.corporation.upgradeOfficeSize(division, city, 15);
                    ns.corporation.hireEmployee(division, city);
                    ns.corporation.upgradeWarehouse(division, city);
                }
                let index = 0;
                let jobs = ["Operations", "Engineer", "Business", "Management", "Research & Development"];

                //jobs=["Operations", "Engineer", "Research & Development"];
                //jobs=["Operations", "Engineer", "Business", "Business", "Management"];
                for (const dude of ns.corporation.getOffice(division, city).employees) {
                    if (index % 1000 == 0) await ns.sleep();
                    //ns.corporation.assignJob(division, city, dude, jobs[index % 0]);
                    ns.corporation.assignJob(division, city, dude, "Unassigned");
                    index++;
                }
            }
        }
    }
}