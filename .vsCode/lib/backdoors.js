import {
    printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
    secondsToHMS, killAllButThis, connecter, randomInt, map, readFromJSON, writeToJSON, openPorts2, getBestFaction
}
    from '/lib/includes.js'

/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {
    const gangServers = ["CSEC",
        "avmnite-02h",
        "I.I.I.I",
        "run4theh111z",
        "The-Cave",
        "w0r1d_d43m0n",
        "ecorp",
        "megacorp",
        "blade",
        "clarkinc",
        "omnitek",
        "4sigma",
        "kuai-gong",
        "fulcrumassets",
    ];

    ns.run("/lib/buyPrograms.js");
    ns.run("/lib/openPorts.js");
    for (const serv of gangServers) {
        ns.tprint("Installing backdoor on " + serv);
        connecter(serv);
        try { await ns.singularity.installBackdoor(); }
        catch (error) { ns.tprint(error) };
    }

    function connecter(targ) {
        ns.singularity.connect("home");
        let target = targ;
        let paths = { "home": "" };
        let queue = Object.keys(paths);
        let name;
        let pathToTarget = [];
        while ((name = queue.shift())) {
            let path = paths[name];
            let scanRes = ns.scan(name);
            for (let newSv of scanRes) {
                if (paths[newSv] === undefined) {
                    queue.push(newSv);
                    paths[newSv] = `${path},${newSv}`;
                    if (newSv == target)
                        pathToTarget = paths[newSv].substr(1).split(",");
                }
            }
        }
        pathToTarget.forEach(server => ns.singularity.connect(server));
    }
}