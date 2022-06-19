import { writeToJSON } from '/lib/includes'
import { readFromJSON } from '/lib/includes'
import { printArray } from '/lib/includes.js'
import { openPorts } from '/lib/includes.js'
import { objectArraySort } from '/lib/includes.js'
import { getServers } from '/lib/includes.js'
import { getServersWithRam } from '/lib/includes.js'
import { getServersWithMoney } from '/lib/includes.js'
//import { secondsToHMS } from '/lib/includes.js'
//import { killAllButThis } from '/lib/includes.js'
//import { connecter } from '/lib/includes.js'
import { randomInt } from '/lib/includes.js'
import { map } from '/lib/includes.js'
//import { writeToJSON } from '/lib/includes.js'
import { getBestFaction } from "/lib/includes.js"

/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {


    const logPort = ns.getPortHandle(1);
    const sleevePort = ns.getPortHandle(2);

    while (true) {
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
            if (ns.sleeve.getSleeveStats(slvNum).shock == 0) getSleeveAugs(slvNum);
            if (ns.sleeve.getSleeveStats(slvNum).sync < 50) {
                ns.sleeve.setToSynchronize(slvNum);
                sleeveText[slvNum] = "Sleeve " + slvNum + " syncing: " + ns.sleeve.getSleeveStats(slvNum).sync;
                continue;
            }


            if (!ns.gang.inGang()) {
                if (ns.sleeve.getInformation(slvNum).city != "Aevum")
                    if (!ns.sleeve.travel(slvNum, "Aevum")) {
                        logA.push("ERROR not enough money for sleeve " + slvNum + " to travel to Aevum")
                        logPort.write("ERROR not enough money for sleeve " + slvNum + " to travel to Aevum");
                        continue;
                    }
                let agi = 60, str = 70, dex = 60, def = 60;

                if (ns.sleeve.getSleeveStats(slvNum).strength < str) {
                    ns.sleeve.setToGymWorkout(slvNum, "Crush Fitness Gym", "Strength");
                    sleeveText[slvNum] = "Sleeve" + slvNum + " training strength: " + ns.sleeve.getSleeveStats(slvNum).strength + "/" + str;
                    continue;
                }
                if (ns.sleeve.getSleeveStats(slvNum).agility < agi) {
                    ns.sleeve.setToGymWorkout(slvNum, "Crush Fitness Gym", "Agility");
                    sleeveText[slvNum] = "Sleeve" + slvNum + " training agility: " + ns.sleeve.getSleeveStats(slvNum).agility + "/" + agi;
                    continue;
                }
                if (ns.sleeve.getSleeveStats(slvNum).defense < def) {
                    ns.sleeve.setToGymWorkout(slvNum, "Crush Fitness Gym", "defense");
                    sleeveText[slvNum] = "Sleeve" + slvNum + " training defense: " + ns.sleeve.getSleeveStats(slvNum).defense + "/" + def;
                    continue;
                }
                if (ns.sleeve.getSleeveStats(slvNum).dexterity < dex) {
                    ns.sleeve.setToGymWorkout(slvNum, "Crush Fitness Gym", "Dexterity");
                    sleeveText[slvNum] = "Sleeve" + slvNum + " training dexterity: " + ns.sleeve.getSleeveStats(slvNum).dexterity + "/" + dex;
                    continue;
                }


                ns.sleeve.setToCommitCrime(slvNum, "homicide");
                sleeveText[slvNum] = "Sleeve" + slvNum + " is homiciding";
                continue;
            }

            else if (ns.gang.inGang()) {
                if (ns.sleeve.getSleeveStats(slvNum).hacking < 30) {
                    ns.sleeve.setToUniversityCourse(slvNum, "summit university", "Algorithms");
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
                    { "Omnia Cybersystems": "OmniTek Incorporated" },
                    { "NWO": "NWO" }
                ];

                let corpFactions = [
                    "Blade Industries",
                    "ECorp",
                    "MegaCorp",
                    "KuaiGong International",
                    "Four Sigma",
                    "NWO",
                    "OmniTek Incorporated",
                    "Bachman & Associates",
                    "Clarke Incorporated",
                    "Fulcrum Secret Technologies"
                ];

                let gotJob = false;
                for (const corpO of jobCorps) { //don't work for company, if already in their fucktion
                    if (ns.getPlayer().factions.includes(Object.values(corpO)[0])) {
                        jobsTaken.push(Object.keys(corpO)[0]);
                    }
                }

                for (const job of Object.keys(ns.getPlayer().jobs)) {
                    if (jobsTaken.includes(job)) continue;
                    if (job == "Fulcrum Technologies" && ns.singularity.getCompanyRep(job) > 2.5e5) continue;
                    if (job != "Fulcrum Technologies" && ns.singularity.getCompanyRep(job) > 2e5) continue;
                    ns.sleeve.setToCompanyWork(slvNum, job);
                    sleeveText[slvNum] = "Sleeve " + slvNum + " company work: " + job + " rep: " + ns.nFormat(ns.singularity.getCompanyRep(job), "0a");
                    jobsTaken.push(job);
                    gotJob = true;
                    break;
                }

                if (gotJob) continue;

                let sleeveFaction = "Nope";
                sleeveFaction = getBestFaction(ns, excludedFactions).faction;
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
            if (ns.sleeve.getSleeveStats(slvNum).shock > 0) {
                ns.sleeve.setToShockRecovery(slvNum);
                sleeveText[slvNum] = "Sleeve " + slvNum + " getting shocks: " + ns.sleeve.getSleeveStats(slvNum).shock;
                continue;
            }

            if (slvNum % 2 == 1) {
                ns.sleeve.setToUniversityCourse(slvNum, "summit university", "Algorithms");
                sleeveText[slvNum] = "Sleeve" + slvNum + " is idle; studying algorithms";
            } else {
                ns.sleeve.setToCommitCrime(slvNum, "homicide");
                sleeveText[slvNum] = "Sleeve" + slvNum + " is idle; homiciding";
            }

            function getSleeveAugs(slave) {
                let wantedSleeveAugs = [
                    "company_rep_mult",
                    "faction_rep_mult",
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