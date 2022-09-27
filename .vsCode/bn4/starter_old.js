import {
    printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
    secondsToHMS, killAllButThis, connecter, randomInt, map, readFromJSON, writeToJSON, openPorts2, getBestFaction, col
}
    from '/lib/includes.js'

/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {
    let skip = ns.args[0] ?? false;
    ns.disableLog("ALL");
    ns.tail();
    if (ns.singularity.isBusy())
        if (ns.singularity.getCurrentWork().type != "GRAFTING") ns.singularity.stopAction();

    //PID -1 not started, -2 done
    let spawnQueue = [
        { name: "Buy programs", file: "/lib/buyPrograms.js", killAfter: -1, args: "", pid: -1 },
        { name: "Log", file: "/watcher/watcher.js", killAfter: -1, args: "", pid: -1 },
        { name: "Open ports", file: "/lib/openPorts.js", killAfter: -1, args: "", pid: -1 },
        { name: "Spam JoesGuns", file: "/lib/spamJoesGuns.js", killAfter: 120, args: "n00dles", pid: -1 },
        { name: "Stanek charge", file: "/stanek/stanek.js", killAfter: 120, args: 120, pid: -1 },
        { name: "Stanek charge", file: "/stanek/stanek.js", killAfter: -1, args: 0, pid: -1 },
        { name: "Batcher", file: "/ver6/ver6.js", killAfter: -1, args: "", pid: -1 },
        { name: "Commander", file: "/bn4/commando.js", killAfter: -1, args: "", pid: -1 },
        { name: "Homicide", file: "/bn4/spamHomicide.js", killAfter: 99e99, args: "", pid: -1 },
        { name: "Run next starter", file: "/bn4/starter2.js", killAfter: -1, args: "", pid: -1 },
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
                // if (!ns.gang.inGang() && spawnQueue[i].name != "Homicide")
                spawnQueue[i].pid = ns.run(spawnQueue[i].file, 1, spawnQueue[i].args);
                // else { continue; }
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
            if (spawnQueue[i].killAfter == -1 || !ns.isRunning(spawnQueue[i].pid) || skip) {
                spawnQueue[i].pid = -2;
                i++;
            }
        }

        updateTail();
        await ns.sleep(50);
    }

    await ns.sleep(1000);
    updateTail();
    if (ns.singularity.isBusy())
        if (ns.singularity.getCurrentWork().type != "GRAFTING") ns.singularity.stopAction();

    //kill ver6
    ns.ps("home").filter((f) => f.filename.includes("ver6")).forEach(k => ns.kill(k.pid));

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
}