/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.tail();
    let statsA;
    const file = "stats.txt"
    if (ns.fileExists(file))
        statsA = readFromJSON(ns, file);
    else statsA = [{
        time: new Date()
    }];

    let prevStats = Object.assign({}, statsA.at(-1));

    while (42) {
        ns.clearLog();
        prevStats = Object.assign({}, statsA.at(-1));
        let newStats = {};
        newStats.time = new Date();
        newStats.money = ns.getServerMoneyAvailable("home");
        newStats.h = ns.getPlayer().skills.hacking;
        newStats.hxp = ns.getPlayer().exp.hacking;
        prevStats.time = new Date(prevStats.time);

        //update at one minute intervals
        if (newStats.time.getMinutes() != prevStats.time.getMinutes()) {
            statsA.push(newStats);
            await writeToJSON(ns, statsA, file);
        }

        ns.print("Moneys:        " + newStats.money);
        ns.print("Hacking xp:    " + newStats.hxp);
        ns.print("Hacking level: " + newStats.h);

        await ns.sleep(1000);
    }
}

/** @param {import('../.').NS} ns */
export function readFromJSON(ns, filename = "/test/jsontest.txt") {
    ns.scp(filename, ns.getServer().hostname, "home")
    return JSON.parse(ns.read(filename));
}

/** @param {import('../.').NS} ns */
export async function writeToJSON(ns, jsonObject, filename = "/test/jsontest.txt") {
    await ns.write(filename, JSON.stringify(jsonObject), "w");
    ns.scp(filename, "home");
}