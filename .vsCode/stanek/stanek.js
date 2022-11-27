/** @param {import('../.').NS} ns */
export async function main(ns) {
    const path = "/stanek/dyn/",
        startTime = performance.now(),
        spamStart = (ns.args[0] ?? 120) * 1000, //default spam time 2min
        spamEveryXseconds = 60;  //after spamming, charge once every 60s 
    let fragments = [],
        files = [],
        prevLogTime = performance.now(),
        prevtime = performance.now(),
        interval = -1,
        worm = "................................öoOOOOo";

    await setup();

    while (1 / 0 == Infinity) {
        await copyProgs();
        if (startTime + spamStart < performance.now())
            interval = spamEveryXseconds * 1000;
        if (prevtime + interval < performance.now())
            chargePieces();
        if (prevLogTime + 1000 < performance.now()) printLog();
        await ns.sleep(50);
    }




    async function setup() {
        ns.stanek.acceptGift();
        ns.disableLog("ALL");

        for (const file of ns.ls("home"))
            if (file.startsWith(path))
                ns.rm(file);

        for (const frag of ns.stanek.activeFragments()) {
            if (frag.type == 18) continue;
            fragments.push(frag);
            writeScript("x" + frag.x + "y" + frag.y,
                `await ns.stanek.chargeFragment(${frag.x}, ${frag.y});`);
        }

        if (fragments.length == 0) {
            ns.alert("Go and make the stanek tetris!");
            ns.print("\x1b[31mGo and make the stanek tetris!");
            ns.tprint("\x1b[31mGo and make the stanek tetris!");
            ns.exit();
        }
    }

    async function copyProgs() {
        for (const serv of getServersWithRam(ns)) {
            if (!ns.fileExists(files[0], serv))
                ns.scp(files, serv);
        }
    }

    function printLog() {
        ns.clearLog();
        fragments.sort((a, b) => a.y - b.y);
        fragments.sort((a, b) => a.x - b.x);
        if (interval == -1)
            ns.print("\tSpamming until: " + Math.floor((startTime + spamStart - performance.now()) / 1000) + "s");
        else
            ns.print("\tNext charge in: " + Math.floor((prevtime + interval - performance.now()) / 1000) + "s");

        ns.print(worm.slice(0, 30));
        worm = worm.substring(1) + worm[0];

        for (const frag of fragments)
            ns.print("\nX:" + frag.x + " Y:" + frag.y + "═╗" +
                "\n\t╟Highest charge: " + ns.nFormat(frag.highestCharge, "0.00a") +
                "\n\t╟NumCharge:      " + ns.nFormat(frag.numCharge, "0.00a") +
                "\n\t╙Power:          " + ns.nFormat(frag.numCharge * frag.highestCharge, "0.00a"));

        prevLogTime = performance.now();
    }

    function chargePieces() {
        fragments = [];
        let threads = 0;
        for (const frag of ns.stanek.activeFragments()) {
            if (frag.type == 18) continue; //skip booster fragment
            fragments.push(frag);
        }
        fragments.sort((a, b) => a.numCharge * a.highestCharge - b.numCharge * b.highestCharge); //pick the weakest piece
        for (const serv of getServersWithRam(ns)) {
            const freeRam = ns.getServerMaxRam(serv) - ns.getServerUsedRam(serv);
            threads = Math.floor(freeRam / 2); //constant 2GB per script
            if (threads > 0) ns.exec(`${path}x${fragments[0].x}y${fragments[0].y}.js`, serv, threads);
        }
        prevtime = performance.now();
    }

    function writeScript(fileName, func) {
        const startOfFile = `/** @param {NS} ns */ \nexport async function main(ns) {\n`;
        const toWrite = startOfFile + func + "\n}";
        const name = path + fileName + ".js";
        ns.write(name, toWrite, "w");
        files.push(name);
    }
}

export const getServers = (ns, a = new Set(["home"])) => {
    a.forEach(s => ns.scan(s).map(s => a.add(s)));
    return [...a];
}

/**@param {NS} ns @return {array} Array with server names that have more than 3GB of ram */
export const getServersWithRam = (ns, ram = 3) => getServers(ns).filter(a => ns.getServerMaxRam(a) >= ram);
