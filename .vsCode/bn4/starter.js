import {
    printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
    secondsToHMS, killAllButThis, connecter, randomInt, map, readFromJSON, writeToJSON, openPorts2, getBestFaction, col
}
    from '/lib/includes.js'

/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.tail();
    if (ns.singularity.isBusy())
        if (ns.singularity.getCurrentWork().type != "GRAFTING") ns.singularity.stopAction();

    //PID -1 not started, -2 done
    let spawnQueue = [
        { name: "Buy programs", file: "/lib/buyPrograms.js", killAfter: -1, pid: -1 },
        { name: "Log", file: "/watcher/watcher.js", killAfter: -1, pid: -1 },
        { name: "Open ports", file: "/lib/openPorts.js", killAfter: -1, pid: -1 },
        { name: "Spam JoesGuns", file: "/lib/spamJoesGuns.js", killAfter: 120, pid: -1 },
        { name: "Stanek charge", file: "/stanek/stanek.js", killAfter: 120, pid: -1 },
        { name: "Stanek charge", file: "/stanek/stanek.js", killAfter: -1, pid: -1 },
        { name: "Homicide", file: "/bn4/spamHomicide.js", killAfter: 99e99, pid: -1 },
        { name: "Run next starter", file: "/bn4/starter2.js", killAfter: -1, pid: -1 },
    ];
    const runLast = spawnQueue.pop();

    ns.ps().forEach((ps) => spawnQueue.map(sf => { if (sf.file == ps.filename) sf.pid = ps.pid }));

    let startTime = performance.now();
    let i = 0;
    while (i < spawnQueue.length) {
        if (spawnQueue[i].pid == -2) { i++; continue; }
        if (spawnQueue[i].pid <= -1)//not started //failed to start
        {
            ns.tprint(col.r + "------------" + spawnQueue[i].file);
            printArray(ns, spawnQueue);
            while (spawnQueue[i].pid == 0 || spawnQueue[i].pid == -1) {
                printArray(ns, spawnQueue[i]);
                spawnQueue[i].pid = ns.run(spawnQueue[i].file, 1, spawnQueue[i].killAfter);
                await ns.sleep(1000);
            }
        }

        if (spawnQueue[i].pid > 0)//started
        {
            if (spawnQueue[i].killAfter > 0)
                if (startTime + spawnQueue[i].killAfter * 1000 <= performance.now()) {
                    ns.kill(spawnQueue[i].pid);
                    startTime = performance.now();
                }
            if (spawnQueue[i].killAfter == -1 || !ns.isRunning(spawnQueue[i].pid)) {
                spawnQueue[i].pid = -2;
                i++;
            }
        }

        updateTail();
        await ns.sleep(50);
    }

    await ns.sleep(1000);
    updateTail();
    ns.singularity.upgradeHomeRam();
    if (ns.singularity.isBusy())
        if (ns.singularity.getCurrentWork().type != "GRAFTING") ns.singularity.stopAction();
    ns.spawn(runLast.file);


    function updateTail() {
        ns.clearLog();
        for (const o of spawnQueue) {
            const running = ns.isRunning(o.pid);
            ns.print(
                o.pid == -1 ? col.r + " X " :
                    o.pid == -2 ? col.g + " V " :
                        col.w + "-> ",
                col.c, o.name.padEnd(20),
                o.pid > 0 && o.killAfter > 0 ? (
                    " " + Math.floor((startTime + o.killAfter * 1000 - performance.now()) / 1000) + "s remaining")
                    : "");
        }
    }

    async function playerJobs(job) {
        if (ns.singularity.getCurrentWork().type == "GRAFTING") return;
        switch (job) {
            case "uni":
                ns.print("Getting 200k moneys for travel to Volhaven");
                sleeveJobs("money");
                while (ns.getServerMoneyAvailable("home") <= 2e5) {
                    if (!ns.singularity.isBusy()) ns.singularity.commitCrime("Homicide", true);
                    await ns.sleep(100);
                }
                ns.singularity.travelToCity("Volhaven");
                ns.singularity.universityCourse("ZB Institute of Technology", "Algorithms");
                sleeveJobs("hack");
        }
    }

    function sleeveJobs(job) {
        if (job == "hack") {
            ns.print("Sending sleeves to school");
            for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
                ns.sleeve.travel(i, "Volhaven");
                ns.sleeve.setToUniversityCourse(i, "ZB Institute of Technology", "Algorithms");
            }
        } else if (job == "money") {
            ns.print("Sending sleeves into a mug");
            for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
                ns.sleeve.setToCommitCrime(i, "Mug");
            }
        }
    }
}