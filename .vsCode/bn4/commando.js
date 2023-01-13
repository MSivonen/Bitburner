//Created: 28.08.2022 12:34:52
//Last modified: 19.10.2022 19:21:20
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
        stocks: "/stock/stockXsinx.js",
        openPorts: "/lib/openPorts.js",
        buyPrograms: "/lib/buyPrograms.js"
    };

    let tailObject = {
        task: "",
        grafting: "",
        donating: "wip",
        graftables: ""
    };

    let spendMoneyFunctions = [
        graftAug,
        buyServers
    ];

    const
        augsToInstall = 25;

    let
        doRestart = false,
        augsBought = true,
        shareServers = 2; //purchased servers amount divided by this


    copyFiles();

    while (true != !true) {
        doRestart = restartBN("graftAll");
        installAndReset();
        for (const t of spendMoneyFunctions)
            await t();
        await share();
        hashes();
        await runSomewhere(allFiles.openPorts);
        if (!runningSomewhere(allFiles.buyPrograms))
            await runSomewhere(allFiles.buyPrograms);
        updateTail();
        await ns.sleep(200);
    }

    function isGrafting() {
        if (ns.singularity.getCurrentWork() != null)
            if (ns.singularity.getCurrentWork().type == "GRAFTING") return true;
    }

    function installAndReset() {
        if (!isGrafting()) {
            if (!isGrafting() &&
                doRestart &&
                augsBought) {
                ns.singularity.softReset("/bn4/starter.js");
            }
        }
    }

    function grindDaedalusRep() {

        if (ns.singularity.getFactionRep("Daedalus") / ns.singularity.getAugmentationRepReq("The Red Pill") > 0.7)
            return false;

        if (ns.getBitNodeMultipliers().RepToDonateToFaction * 150 <= ns.singularity.getFactionFavor("Daedalus"))
            return false;

        const repMult = ns.getBitNodeMultipliers().RepToDonateToFaction;
        const repToDonate = 150 * repMult; //off by one level of sf12 wtf
        const numberOfResets = Math.floor(repToDonate / 100);
        const repPerReset = Math.ceil(repToDonate / numberOfResets);

        if (ns.singularity.getFactionFavorGain("Daedalus") >= repPerReset)
            return true;
    }

    function restartBN(method) {
        if (method == "graftAll") {
            if (ns.singularity.getOwnedAugmentations(true).includes("The Red Pill") &&
                !ns.singularity.getOwnedAugmentations(false).includes("The Red Pill"))
                return true;

            if (ns.singularity.getOwnedAugmentations().includes("nickofolas Congruity Implant") &&
                ns.getTimeSinceLastAug() == ns.getPlayer().playtimeSinceLastBitnode) {
                return true;
            }
            if (numAugsBought() >= augsToInstall) {
                return true;
            }

            if (grindDaedalusRep())
                return true;
        }

        return false;
    }

    function hashes() {
        if (ns.getServerMoneyAvailable("home") < 50e6)
            ns.hacknet.spendHashes("Sell for Money");
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

    async function runSomewhere(file, args) {
        await ns.sleep();
        copyFiles();
        let returnVal;
        let servers = getServers(ns);
        servers.sort((a, b) => (ns.getServerMaxRam(a) - ns.getServerUsedRam(a)) - (ns.getServerMaxRam(b) - ns.getServerUsedRam(b)));
        for (const serv of servers) {
            if (!ns.hasRootAccess(serv)) continue;
            if (ns.getServerMaxRam(serv) - ns.getServerUsedRam(serv) >= ns.getScriptRam(file)) {
                if (args) returnVal = ns.exec(file, serv, 1, ...args); //return pid
                else returnVal = ns.exec(file, serv, 1);
                break;
            }
        }
        if (returnVal == 0) returnVal = undefined;
        return returnVal;
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
        if (isGrafting() || ns.getServerMoneyAvailable("home") < 1e11) {
            getServers(ns).forEach(s => ns.scriptKill(allFiles.share, s));
            return;
        }

        let allPservers = ns.getPurchasedServers();
        let shareServers_div = shareServers;
        if (ns.getPlayer().factions.includes("Daedalus"))
            shareServers_div = 1;
        for (let i = 1; i < allPservers.length / shareServers_div; i++) {
            if (!ns.fileExists(allFiles.share, allPservers[i]))
                ns.scp(allFiles.share, allPservers[i]);
            const threads = Math.floor(ns.getServerMaxRam(allPservers[i]) / ns.getScriptRam(allFiles.share, allPservers[i]));
            if (threads) ns.exec(allFiles.share, allPservers[i], threads, Math.random());
        }
    }

    function graftAug(type = "hacking") {
        if (ns.getPlayer().factions.includes("Daedalus")) type = "rep";
        if (ns.singularity.getOwnedAugmentations(false).includes("The Red Pill"))
            return;
        //let augs = getGrafableAugs(type);


        let augs = [...getGrafableAugs("hacking"), ...getGrafableAugs("rep")];
        tailObject.graftables = "";

        if (augs)
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
        if (!augs || augs.length == 0) return;

        let lowestPrice = augs.reduce((a, b) => ns.grafting.getAugmentationGraftPrice(b) > ns.grafting.getAugmentationGraftPrice(a) ? a : b);

        if (ns.grafting.getAugmentationGraftPrice(lowestPrice) < ns.getServerMoneyAvailable("home")) {
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
        if (type == "faction_rep")
            augs.sort((a, b) => ns.singularity.getAugmentationStats(b).faction_rep - ns.singularity.getAugmentationStats(a).faction_rep);
        else
            augs.sort((a, b) => ns.singularity.getAugmentationStats(b).hacking - ns.singularity.getAugmentationStats(a).hacking);
        if (ns.grafting.getGraftableAugmentations().includes("nickofolas Congruity Implant")) augs.unshift("nickofolas Congruity Implant");
        if (augs.length == 0) return [];
        return augs;
    }

    function copyFiles() {
        for (const serv of getServers(ns)) {
            ns.scp(Object.values(allFiles), serv, "home");
        }
    }

    function buyServers(maxMoney = 1e12) {
        maxMoney = Math.max(1e12, ns.getServerMoneyAvailable("home") * .2);
        if (ns.getPurchasedServerLimit() == 0) return;

        while (ns.getPurchasedServers().length < ns.getPurchasedServerLimit()) {
            for (let exp = Math.log2(ns.getPurchasedServerMaxRam()); exp > 4; exp--) {
                if (ns.getServerMoneyAvailable("home") >= ns.getPurchasedServerCost(2 ** exp)) {
                    ns.purchaseServer("perkele" + (ns.getPurchasedServers().length), 2 ** exp);
                    copyFiles();
                    break;
                }
            }
            if (ns.getServerMoneyAvailable("home") < ns.getPurchasedServerCost(2 ** 5)) break;
        }

        let servers = ns.getPurchasedServers();
        servers.sort((a, b) => ns.getServerMaxRam(b) - ns.getServerMaxRam(a));

        for (let i = servers.length - 1; i >= 0; i--) {
            for (let exp = Math.log2(ns.getPurchasedServerMaxRam()); exp > Math.log2(ns.getServerMaxRam(servers[i])); exp--) {
                if (
                    ns.getServerMoneyAvailable("home") >= ns.getPurchasedServerUpgradeCost(servers[i], 2 ** exp) &&
                    ns.getPurchasedServerUpgradeCost(servers[i], 2 ** exp) <= maxMoney
                ) {
                    ns.upgradePurchasedServer(servers[i], 2 ** exp);
                    break;
                }
            }
        }
    }
}