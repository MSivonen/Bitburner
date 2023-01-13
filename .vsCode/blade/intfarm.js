import {
    printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
    secondsToHMS, killAllButThis, connecter, randomInt, map, readFromJSON, writeToJSON, openPorts2, getBestFaction, col
}
    from '/lib/includes.js'

/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    const skills = [
        "Blade's Intuition",
        "Cloak",
        "Short-Circuit",
        "Digital Observer",
        "Reaper",
        "Evasive System",
        "Cyber's Edge"
    ];

    let logO = {
        "Blade's Intuition": 0,
        "Cloak": 0,
        "Short-Circuit": 0,
        "Digital Observer": 0,
        "Reaper": 0,
        "Evasive System": 0,
        "Cyber's Edge": 0,
        "Hyperdrive": 0
    };

    let jobs = {
        Assassination: false,
        //Investigation: false,
        // "Undercover Operation": false
    }

    ns.singularity.commitCrime("Homicide");

    ns.run("/blade/bbSleeves.js");

    function updateLog() {
        ns.clearLog();
        for (const job of Object.keys(jobs)) {
            ns.print((job + ": ").padEnd(25, " ") +
                col.off + "\n\tamount: " + (jobs[job] ? col.g : col.r) + ns.bladeburner.getActionCountRemaining("Operations", job).toString().padEnd(8) +
                col.off + "\n\tchance: " + (!diplomacy(job) ? col.g : col.r) + ns.bladeburner.getActionEstimatedSuccessChance("Operations", job)[0]);
        }
        ns.print(col.off + "\nShit bought this run:");
        for (const [k, v] of Object.entries(logO))
            ns.print(k.padEnd(20) + col.w + v);
    }

    function diplomacy(operation) {
        return (jobs[operation] && ns.bladeburner.getActionEstimatedSuccessChance("Operations", operation)[0] < 0.99)
    }

    function enableJob(operation, amount = 1000) {
        if (operation == "Assassination") amount = 1000;
        if (ns.bladeburner.getActionCountRemaining("Operations", operation) > amount)
            jobs[operation] = true;
        if (ns.bladeburner.getActionCountRemaining("Operations", operation) == 0)
            jobs[operation] = false;
    }

    while ("farming int") {
        updateLog();

        if (ns.bladeburner.getSkillUpgradeCost("Hyperdrive") < ns.bladeburner.getSkillPoints()) {
            let bought = 0;
            for (let i = 2 ** 100; i >= 14; i /= 2) {
                const count = Math.floor(i);
                if (ns.bladeburner.upgradeSkill("Hyperdrive", count)) {
                    logO.Hyperdrive += i;
                    bought += i;
                }
            }
            if (bought > 0) ns.tprint("Bought " + bought + " hyperdrives.");
        }

        if (ns.getPlayer().hp.current < ns.getPlayer().hp.max / 10)
            ns.singularity.hospitalize();

        for (const job of Object.keys(jobs)) {
            if (diplomacy(job) && jobs[job]) {
                ns.tprint("chaos: " + ns.bladeburner.getCityChaos("Sector-12"));
                if (ns.bladeburner.getCityChaos("Sector-12") > 1000) {
                    ns.bladeburner.startAction("General", "Diplomacy");
                    await ns.sleep(ns.bladeburner.getActionTime("General", "Diplomacy"));
                }
                if (diplomacy(job) && ns.bladeburner.getCityChaos("Sector-12") < 1000) {
                    for (let i = 1e5; i >= 1; i /= 10) {
                        for (const skill of skills)
                            if (ns.bladeburner.upgradeSkill(skill, i))
                                logO.skill++;
                    }
                }
            }

            if (!diplomacy(job))
                enableJob(job);
        }

        let jobbing = false;
        for (const job of Object.keys(jobs)) {
            if (jobs[job] && !jobbing) {
                jobbing = true;
                ns.bladeburner.startAction("Operations", job);
                await ns.sleep(ns.bladeburner.getActionTime("Operations", job));
            }
        }

        if (!jobbing) {
            ns.bladeburner.startAction("General", "Incite Violence");
            await ns.sleep(ns.bladeburner.getActionTime("General", "Incite Violence"));
        }

        await ns.sleep(10);
    }
}