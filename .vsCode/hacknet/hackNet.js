//Created: 23.05.2022 18:20:14
//Last modified: 19.10.2022 19:20:17
import {
    printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
    secondsToHMS, killAllButThis, connecter, randomInt, map, readFromJSON, writeToJSON, openPorts2, getBestFaction, col
}
    from '/lib/includes.js'

/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");

    let moneyToSpend = 0.4,//% of money
        maxCostOfUpgrade = 6e7,
        alwaysBuy = false, //false = wait a minute then buy for a minute
        corp = false,
        blade = false,
        gym = false;

    if (ns.args[0] == "menu") {
        moneyToSpend = Number(await ns.prompt("Money % to spend on an upgrade, 0...1", { type: "text" }));
        maxCostOfUpgrade = Number(await ns.prompt("Max money to spend for a upgrade", { type: "text" }));
        alwaysBuy = await ns.prompt("Constantly buy shit?", { type: "boolean" });
        corp = await ns.prompt("Use hashes for corp?", { type: "boolean" });
        blade = await ns.prompt("Use hashes for bladeburner?", { type: "boolean" });
        gym = await ns.prompt("Use hashes for gym?", { type: "boolean" });
    }


    let sellForMoney = false,
        hackNetServersCA = [];
    class HackNetServer {
        constructor(index_) {
            this.index = index_;
        }

        update() {
            const upgrade = this.bestUpgrade();
            if (upgrade == undefined) return;
            if (upgrade[1] < maxCostOfUpgrade)
                if (ns.getServerMoneyAvailable("home") * moneyToSpend > upgrade[1])
                    ns.hacknet[upgrade[0]](this.index);
            if (ns.hacknet.getCacheUpgradeCost(this.index) < ns.getServerMoneyAvailable("home") * moneyToSpend
                && ns.hacknet.getNodeStats(this.index).hashCapacity < 4000)
                ns.hacknet.upgradeCache(this.index);
        }

        bestUpgrade() {
            let best = Infinity;
            let besti = -1;
            const statNames = ["getLevelUpgradeCost", "getRamUpgradeCost", "getCoreUpgradeCost"];

            for (let i = 0; i < 3; i++) {
                let acc = [0, 0, 0];
                acc[i] = 1;
                let profit =
                    ns.hacknet[statNames[i]](this.index) /
                    (ns.formulas.hacknetServers.hashGainRate(
                        ns.hacknet.getNodeStats(this.index).level + acc[0],
                        0,       //ns.hacknet.getNodeStats(this.index).ramUsed,
                        ns.hacknet.getNodeStats(this.index).ram + acc[1],
                        ns.hacknet.getNodeStats(this.index).cores + acc[2],
                        ns.getPlayer().mults.hacknet_node_money)
                        -
                        ns.hacknet.getNodeStats(this.index).production);
                if (profit < best) {
                    best = profit;
                    besti = i;
                }
                //if (this.index == 4) ns.tprint("profit: " + profit / 1e6 + " best: " + best / 1e6 + " besti: " + besti);
            }
            //ns.tprint(best + " " + besti + " " + this.index);
            if (best == Infinity) return;
            //return string+cost
            return [["upgradeLevel", "upgradeRam", "upgradeCore"][besti], ns.hacknet[statNames[besti]](this.index)];
        }
    }

    for (let i = 0; i < ns.hacknet.numNodes(); i++) {
        hackNetServersCA.push(new HackNetServer(i));
    }

    if (ns.getServerMoneyAvailable("home") * moneyToSpend > ns.hacknet.getPurchaseNodeCost() &&
        ns.hacknet.maxNumNodes() >= ns.hacknet.numNodes() &&
        ns.hacknet.getPurchaseNodeCost() < maxCostOfUpgrade) {
        hackNetServersCA.push(new HackNetServer(ns.hacknet.purchaseNode()));
    }
    for (const serv of hackNetServersCA) serv.update();

    function spend() {
        if (corp) {
            ns.hacknet.spendHashes("Exchange for Corporation Research");
        }
        if (blade) {
            ns.hacknet.spendHashes("Exchange for Bladeburner SP");
            ns.hacknet.spendHashes("Exchange for Bladeburner Rank");
        }
        if (gym) {
            ns.hacknet.spendHashes("Improve Gym Training");
        }
        //        if ((ns.singularity.getOwnedAugmentations(true).length + 2 < ns.singularity.getOwnedAugmentations(false).length ||
        //            ns.getTimeSinceLastAug() > 1000 * 60 * 60 * 12) &&
        //            ns.getTimeSinceLastAug() != ns.getPlayer().playtimeSinceLastBitnode) sellForMoney = true;
        if (sellForMoney) {
            for (let i = 0; i < 100; i++)ns.hacknet.spendHashes("Sell for Money");
        }
    }

    while (true) {
        if (ns.getServer().hostname != "home")
            await ns.scp("g_settings.txt", ns.getServer().hostname, "home");
        let g_sets = readFromJSON(ns, "g_settings.txt");

        while (!g_sets.wantHackNet) {
            g_sets = readFromJSON(ns, "g_settings.txt");
            ns.tprint("Hacknet paused")
            await ns.sleep(2000);
        }

        if (alwaysBuy || ns.getTimeSinceLastAug() % 120000 < 60000) {
            for (const serv of hackNetServersCA) serv.update();
            if (ns.getServerMoneyAvailable("home") * moneyToSpend > ns.hacknet.getPurchaseNodeCost() &&
                ns.hacknet.maxNumNodes() > ns.hacknet.numNodes() &&
                ns.hacknet.getPurchaseNodeCost() < maxCostOfUpgrade) {
                hackNetServersCA.push(new HackNetServer(ns.hacknet.purchaseNode()));
            }
        }

        for (let i = 0; i < 100; i++)
            spend();

        ns.clearLog();
        for (let i = 0; i < hackNetServersCA.length; i++) {
            ns.print("Node " + i + " level: " + ns.hacknet.getNodeStats(i).level +
                " cores: " + ns.hacknet.getNodeStats(i).cores +
                " ram: " + ns.hacknet.getNodeStats(i).ram);
        }

        await ns.sleep(5);
    }
}