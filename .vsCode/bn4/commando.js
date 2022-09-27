import {
    printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
    secondsToHMS, killAllButThis, connecter, randomInt, map, col, readFromJSON, writeToJSON, openPorts2, getBestFaction
}
    from 'lib/includes.js'

/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.tail();
    const allFiles = { //copy these to all servers
        includes: "/lib/includes.js",
        hack: "/ver6/hack6.js",
        grow: "/ver6/grow6.js",
        weak: "/ver6/weak6.js",
        share: "/lib/share.js",
        tables: "/lib/tables_xsinx.js",
        stocks: "/stock/stockXsinx.js"
    };

    const shareServers = ns.gang.inGang() ? 7 : 0,
        augsToInstall = 10;

    let tailObject = {
        task: "",
        grafting: "",
        donating: "wip",
        graftables: ""
    };

    let spendMoneyFunctions = [
        graftAug,
        buyServers
    ]


    await copyFiles();

    while (true != !true) {
        if (numAugsBought() < augsToInstall)
            for (const t of spendMoneyFunctions)
                await t();
        await share();
        updateTail();
        await ns.sleep(200);
    }

    async function spendMoney() {
        //buyHomeCores();
        //donate();
        graftAug();
        await buyServers();
    }

    function updateTail() {
        if (ns.singularity.getCurrentWork())
            if (ns.singularity.getCurrentWork().type == "FACTION")
                tailObject.task = "Working for faction " + col.r + ns.singularity.getCurrentWork().factionName;

        ns.clearLog();
        ns.print(col.c + "Current task: " + col.w + tailObject.task);
        ns.print(col.c + "Donating to: " + col.w + tailObject.donating);
        ns.print(col.c + "Grafting aug: " + col.w + tailObject.grafting);
        ns.print(col.c + "All graftable augs: \n" + col.w + tailObject.graftables);

    }

    function runningSomewhere(file) {
        let running = [];
        getServers(ns).forEach(s => {
            ns.ps(s).forEach(f => {
                if (f.filename.includes(file))
                    running.push({
                        server: s,
                        filename: f.filename,
                        pid: f.pid
                    })
            })
        });
        if (running.length != 0) return running;
        else return;
    }

    function numAugsBought() {
        return ns.singularity.getOwnedAugmentations(true).length - ns.singularity.getOwnedAugmentations(false).length;
    }

    function filterObject(o, func) {
        return Object.fromEntries(Object.entries(o).filter(e => func(e[0], e[1])));
    }

    function isGrafting() {
        if (ns.singularity.getCurrentWork() != null)
            return (ns.singularity.getCurrentWork().type == "GRAFTING");
        return false;
    }

    async function share() {
        const allPservers = ns.getPurchasedServers();
        for (let i = 1; i < Math.min(shareServers, allPservers.length / 2); i++) {
            if (!ns.fileExists(allFiles.share, allPservers[i]))
                await ns.scp(allFiles.share, allPservers[i]);
            const threads = Math.floor(ns.getServerMaxRam(allPservers[i]) / ns.getScriptRam(allFiles.share, allPservers[i]));
            if (threads) ns.exec(allFiles.share, allPservers[i], threads);
        }
    }

    function graftAug(type = "rep") {
        if (ns.getBitNodeMultipliers().HackingLevelMultiplier * ns.getPlayer().mults.hacking > 12) return;
        let augs = getGrafableAugs(type);
        if (augs.length < 2) {
            augs = getGrafableAugs("hacking");
            if (augs.length < 4) augs = [];
        }

        tailObject.graftables = "";

        for (const a of augs) {
            let stats = "";
            const price = ns.nFormat(ns.grafting.getAugmentationGraftPrice(a), "0.00a");

            for (const s of Object.entries(filterObject(ns.singularity.getAugmentationStats(a), (k, v) =>
                (k.startsWith("hacki") || k.startsWith("factio")) && v > 1))) {
                stats += col.g + "\t\t" + s[0] + ": " + col.w + s[1] + "\n";
            }
            tailObject.graftables += col.w + "\t" + a + ": " + col.y + price + col.w + "\n" + stats;
        }


        if (isGrafting()) {
            const aug = ns.singularity.getCurrentWork().augmentation;
            let stats = ns.singularity.getAugmentationStats(aug);
            stats = filterObject(stats, (k, v) => v > 1);
            tailObject.grafting = "";
            tailObject.grafting += aug + "\n";
            Object.entries(stats).forEach(s => tailObject.grafting += col.g + "\t\t" + s[0] + " " + col.w + s[1] + "\n");
            return;
        }
        if (!augs) return;


        if (ns.grafting.getAugmentationGraftPrice(augs.at(-1)) < ns.getServerMoneyAvailable("home")) {
            if (ns.getPlayer().city != "New Tokyo")
                if (!ns.singularity.travelToCity("New Tokyo")) return;
            for (const a of augs)
                if (ns.grafting.graftAugmentation(a, true)) { //try all from expensive to cheap until ok
                    return;
                }
        }
    }

    function getGrafableAugs(type_) {
        let type = type_ == "rep" ? "faction_rep" : type_;
        let augs = ns.grafting.getGraftableAugmentations().
            filter(a => ns.singularity.getAugmentationStats(a)[type] > 1).
            sort((a, b) => ns.grafting.getAugmentationGraftPrice(b) - ns.grafting.getAugmentationGraftPrice(a));
        if (ns.grafting.getGraftableAugmentations().includes("nickofolas Congruity Implant")) augs.unshift("nickofolas Congruity Implant");
        if (augs.length == 0) return;
        return augs;
    }

    async function copyFiles() {
        for (const serv of getServers(ns)) {
            await ns.scp(Object.values(allFiles), serv);
        }
    }

    async function buyServers(maxRam = ns.getPurchasedServerMaxRam()) {
        const maxServers = ns.getPurchasedServerLimit();
        if (maxServers == 0) return;
        let ram,
            biggestServer,
            smallestServer,
            serversOA = [];
        let buy = false;
        let allPservers = ns.getPurchasedServers();
        if (allPservers.length > 0) {
            allPservers.forEach(s => { serversOA.push({ name: s, ram: ns.getServerMaxRam(s) }) });
            biggestServer = serversOA.reduce((prev, current) => (prev.ram > current.ram) ? prev : current);
            smallestServer = serversOA.reduce((prev, current) => (prev.ram < current.ram) ? prev : current);
        }

        if (biggestServer == undefined) ram = 32; //no pservers
        else ram = biggestServer.ram;

        while (ram < maxRam && ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram * 2)) {
            ram *= 2; //increase ram until happy
            buy = true;
            if (ram >= maxRam) {
                ram = maxRam;
            }
        }
        if (smallestServer != undefined)
            if (ram == smallestServer.ram) return;

        if (buy) {
            if (serversOA.length == maxServers) {
                ns.killall(smallestServer.name);
                ns.deleteServer(smallestServer.name);
            }
            let servNumbers = [];
            for (const s of serversOA)
                servNumbers.push(Number(s.name.substring(7)));
            let servNumber = 0;
            for (let i = 0; i < maxServers; i++)
                if (!servNumbers.includes(i)) {
                    servNumber = i;
                    break;
                }
            if (ns.purchaseServer("perkele" + servNumber, ram) != "") {
                await copyFiles();
                ns.tprint("Purchased perkele" + servNumber + " with " + ram + "GB of ram.");
            }
            else ns.tprint(col.r + "Something went wrong purchasing server. Perkele. Money needed: " +
                ns.nFormat(ns.getPurchasedServerCost(ram), "0.00a"));
        }
    }
}