//Created: 31.05.2022 06:39:11
//Last modified: 19.10.2022 19:21:29
import {
    printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
    secondsToHMS, killAllButThis, connecter, randomInt, map, readFromJSON, writeToJSON, openPorts2, getBestFaction, col
}
    from "lib/includes.js"

/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {
    const firstRun = ns.getTimeSinceLastAug() == ns.getPlayer().playtimeSinceLastBitnode;
    let g_sets = readFromJSON(ns, "g_settings.txt");

    function travel(slvNum, city) {
        if (ns.sleeve.getInformation(slvNum).city != city)
            if (!ns.sleeve.travel(slvNum, city)) {
                logA.push("ERROR not enough money for sleeve " + slvNum + " to travel to " + city);
                logPort.write("ERROR not enough money for sleeve " + slvNum + " to travel to " + city);
            }
    }

    const logPort = ns.getPortHandle(1);
    const sleevePort = ns.getPortHandle(2);

    while (true) {
        g_sets = readFromJSON(ns, "g_settings.txt");
        if (ns.getHackingLevel() > 1000 && g_sets.wantJobs && firstRun) g_sets.wantJobs = true;

        let jobsTaken = [],
            sleevesOA = [],
            excludedFactions = [],
            sleeveText = [];

        for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
            ns.sleeve.setToSynchronize(i);
            sleevesOA.push({
                sleeveNumber: i,
                shock: ns.sleeve.getSleeveStats(i).shock,
                sync: ns.sleeve.getSleeveStats(i).sync,
                sort: ns.sleeve.getSleeveStats(i).sync - ns.sleeve.getSleeveStats(i).shock,
                hack: ns.sleeve.getSleeveStats(i).hacking
            });
        }

        objectArraySort(ns, sleevesOA, "sort", "big");
        objectArraySort(ns, sleevesOA, "hack", "big");
        for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
            const slvNum = sleevesOA[i].sleeveNumber;
            if (ns.sleeve.getSleeveStats(slvNum).shock > 0) {
                ns.sleeve.setToShockRecovery(slvNum);
                sleeveText[slvNum] = "Sleeve " + slvNum + " getting shocks: " + ns.sleeve.getSleeveStats(slvNum).shock;
                continue;
            }
            if (ns.sleeve.getSleeveStats(slvNum).shock == 0) getSleeveAugs(slvNum);
            if (ns.sleeve.getSleeveStats(slvNum).sync < 50) {
                ns.sleeve.setToSynchronize(slvNum);
                sleeveText[slvNum] = "Sleeve " + slvNum + " syncing: " + ns.sleeve.getSleeveStats(slvNum).sync;
                continue;
            }


            if (!ns.gang.inGang() && ns.getPlayer().bitNodeN != 8) {
                let agi = 60, str = 70, dex = 60, def = 60;

                if (ns.sleeve.getSleeveStats(slvNum).strength < str) {
                    travel(slvNum, "Sector-12");
                    ns.sleeve.setToGymWorkout(slvNum, "Powerhouse Gym", "Strength");
                    sleeveText[slvNum] = "Sleeve" + slvNum + " training strength: " + ns.sleeve.getSleeveStats(slvNum).strength + "/" + str;
                    continue;
                }
                if (ns.sleeve.getSleeveStats(slvNum).agility < agi) {
                    travel(slvNum, "Sector-12");
                    ns.sleeve.setToGymWorkout(slvNum, "Powerhouse Gym", "Agility");
                    sleeveText[slvNum] = "Sleeve" + slvNum + " training agility: " + ns.sleeve.getSleeveStats(slvNum).agility + "/" + agi;
                    continue;
                }
                if (ns.sleeve.getSleeveStats(slvNum).defense < def) {
                    travel(slvNum, "Sector-12");
                    ns.sleeve.setToGymWorkout(slvNum, "Powerhouse Gym", "defense");
                    sleeveText[slvNum] = "Sleeve" + slvNum + " training defense: " + ns.sleeve.getSleeveStats(slvNum).defense + "/" + def;
                    continue;
                }
                if (ns.sleeve.getSleeveStats(slvNum).dexterity < dex) {
                    travel(slvNum, "Sector-12");
                    ns.sleeve.setToGymWorkout(slvNum, "Powerhouse Gym", "Dexterity");
                    sleeveText[slvNum] = "Sleeve" + slvNum + " training dexterity: " + ns.sleeve.getSleeveStats(slvNum).dexterity + "/" + dex;
                    continue;
                }


                ns.sleeve.setToCommitCrime(slvNum, "homicide");
                sleeveText[slvNum] = "Sleeve" + slvNum + " is homiciding";
                continue;
            }

            else if (ns.gang.inGang() || ns.getPlayer().bitNodeN == 8) {
                if (ns.sleeve.getSleeveStats(slvNum).hacking < 30) {
                    travel(slvNum, "Volhaven");
                    ns.sleeve.setToUniversityCourse(slvNum, "ZB Institute of Technology", "Algorithms");
                    sleeveText[slvNum] = "Sleeve" + slvNum + " is studying algorithms";
                    continue;
                }

                //Corp:Faction
                const jobCorps = [
                    { "ECorp": "ECorp" },
                    { "MegaCorp": "MegaCorp" },
                    { "Blade Industries": "Blade Industries" },
                    { "Clarke Incorporated": "Clarke Incorporated" },
                    { "OmniTek Incorporated": "OmniTek Incorporated" },
                    { "Four Sigma": "Four Sigma" },
                    { "KuaiGong International": "KuaiGong International" },
                    { "Fulcrum Technologies": "Fulcrum Secret Technologies" },
                    { "NWO": "NWO" }
                ];

                let gotJob = false;
                if (g_sets.wantJobs && !firstRun) {
                    for (const corpO of jobCorps) { //don't work for company, if already in their fucktion
                        if (ns.getPlayer().factions.includes(Object.values(corpO)[0])) {
                            jobsTaken.push(Object.keys(corpO)[0]);
                        }
                    }

                    for (const job of Object.keys(ns.getPlayer().jobs)) {
                        if (jobsTaken.includes(job)) continue;
                        if (ns.singularity.getCompanyRep(job) > 3e5) continue;
                        ns.sleeve.setToCompanyWork(slvNum, job);
                        sleeveText[slvNum] = "Sleeve " + slvNum + " company work: " + job + " rep: " + ns.nFormat(ns.singularity.getCompanyRep(job), "0a");
                        jobsTaken.push(job);
                        gotJob = true;
                        break;
                    }

                    if (gotJob) continue;
                }

                let sleeveFaction = "Nope";
                sleeveFaction = getBestFaction(ns, excludedFactions).faction;
                if (!excludedFactions.includes("NiteSec") && firstRun) sleeveFaction = "NiteSec";
                if (sleeveFaction != "Nope" && sleeveFaction != null) {
                    if (!ns.sleeve.setToFactionWork(slvNum, sleeveFaction, "hacking contracts"))
                        ns.sleeve.setToFactionWork(slvNum, sleeveFaction, "field work");
                    excludedFactions.push(sleeveFaction);
                    sleeveText[slvNum] = "Sleeve " + slvNum + " faction work: " + sleeveFaction;
                    continue;
                }
            }
            if (ns.sleeve.getSleeveStats(slvNum).sync < 100) {
                ns.sleeve.setToSynchronize(slvNum);
                sleeveText[slvNum] = "Sleeve " + slvNum + " syncing";
                continue;
            }



            ns.sleeve.setToShockRecovery(slvNum);
            sleeveText[slvNum] = "Sleeve" + slvNum + " is idle; shocking";

            function getSleeveAugs(slave) {
                let wantedSleeveAugs = [
                    "company_rep",
                    "faction_rep",
                    "hacki"
                ],
                    dontBuy = true,
                    canBuy = ns.sleeve.getSleevePurchasableAugs(slave);

                let moneyAvail = ns.getServerMoneyAvailable("home");
                for (let j = canBuy.length - 1; j >= 0; j--) {
                    //ns.tprint("ERROR  Object.values(canBuy[j])[0] " + Object.values(canBuy[j])[0]);
                    //ns.tprint ("WARN Object.keys(ns.singularity.getAugmentationStats(Object.values(canBuy[j])[0])) " + Object.keys(ns.singularity.getAugmentationStats(Object.values(canBuy[j])[0])));
                    for (let text of Object.keys(ns.singularity.getAugmentationStats(Object.values(canBuy[j])[0]))) {//get aug stat names
                        for (let want of wantedSleeveAugs) {
                            if (!text.startsWith(want)) {
                                //ns.tprint("INFO WANT!!! " + want + " " + text);
                                dontBuy = false;
                            }
                        }
                    }
                    if (dontBuy) canBuy.splice(j, 1);
                }

                objectArraySort(ns, canBuy, "cost", "small");

                if (canBuy.length > 3) {
                    for (let j = 0; j < 3; j++) { //if able to buy 3, buy all
                        moneyAvail -= Object.values(Object.values(canBuy[j]))[1];
                    }
                    //ns.tprint("WARN moneyAvail: " + moneyAvail);
                    if (moneyAvail > 0) {
                        for (let aug of canBuy) {
                            ns.sleeve.purchaseSleeveAug(slave, Object.values(aug)[0]);
                            logPort.write("Bought " + Object.values(aug)[0] + " for sleeve " + slave);
                        }
                    }
                }
            }
        }
        sleevePort.write(sleeveText);
        await ns.sleep(5000);
    }
}