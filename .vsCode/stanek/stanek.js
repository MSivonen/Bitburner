import {
    printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
    secondsToHMS, killAllButThis, connecter, randomInt, map, readFromJSON, writeToJSON, openPorts2, getBestFaction
}
    from '/lib/includes.js'

/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {
    const path = "/stanek/dyn/",
        startTime = ns.getTimeSinceLastAug(),
        spamStart = (ns.args[0] ?? 120) * 1000;
    let fragments = [],
        files = [],
        prevtime = ns.getTimeSinceLastAug(),
        interval = -1;

    await setup();

    while (1 / 0 == Infinity) {
        await copyProgs();
        if (startTime + spamStart < ns.getTimeSinceLastAug()) interval = 20000; //charge every 20s
        if (prevtime + interval < ns.getTimeSinceLastAug()) {
            chargePieces();
            prevtime = ns.getTimeSinceLastAug();
        }
        printLog();
        await ns.sleep(200);
    }

    async function setup() {
        ns.stanek.acceptGift();
        ns.tail();
        ns.disableLog("ALL");

        for (const file of ns.ls("home"))
            if (file.startsWith(path))
                ns.rm(file);

        for (const frag of ns.stanek.activeFragments()) {
            if (frag.type == 18) continue;
            fragments.push(frag);
            await writeScript("x" + frag.x + "y" + frag.y,
                `await ns.stanek.chargeFragment(${frag.x}, ${frag.y});`)
        }

        if (fragments.length == 0) {
            ns.alert("Go and make the stanek tetris!");
            ns.print("\x1b[31mGo and make the stanek tetris!");
            ns.exit();
        }
    }

    async function copyProgs() {
        for (const serv of getServersWithRam(ns)) {
            if (!ns.fileExists(files[0], serv))
                await ns.scp(files, serv);
        }
    }

    function printLog() {
        ns.clearLog();
        fragments.sort((a, b) => a.y - b.y);
        fragments.sort((a, b) => a.x - b.x);
        if (interval == -1)
            ns.print("Spamming until: " + Math.floor((startTime + spamStart - ns.getTimeSinceLastAug()) / 1000));
        else
            ns.print("Next charge in: " + Math.floor((prevtime + interval - ns.getTimeSinceLastAug()) / 1000));

        for (const frag of fragments)
            ns.print("X:" + frag.x + " Y:" + frag.y +
                "\tHighest charge: " + ns.nFormat(frag.highestCharge, "0.00a") +
                "\tNumCharge: " + ns.nFormat(frag.numCharge, "0.00a") +
                "\tPower: " + ns.nFormat(frag.numCharge * frag.highestCharge, "0.00a"));
    }

    function chargePieces() {
        fragments = [];
        let threads = 0;
        for (const frag of ns.stanek.activeFragments()) {
            if (frag.type == 18) continue; //booster fragment
            fragments.push(frag);
        }
        fragments.sort((a, b) => a.numCharge * a.highestCharge - b.numCharge * b.highestCharge); //pick the weakest
        for (const serv of getServersWithRam(ns)) {
            const freeRam = ns.getServerMaxRam(serv) - ns.getServerUsedRam(serv);
            threads = Math.floor(freeRam / 2); //2GB per script
            if (threads > 0) ns.exec(`${path}x${fragments[0].x}y${fragments[0].y}.js`, serv, threads);
        }
    }

    async function writeScript(fileName, func) {
        const startOfFile = `/** @param {NS} ns */ \nexport async function main(ns) {\n`;
        const toWrite = startOfFile + func + "\n}";
        const name = path + fileName + ".js";
        await ns.write(name, toWrite, "w");
        files.push(name);
    }
}