import { readFromJSON } from '/lib/includes'
import { printArray } from '/lib/includes.js'
import { openPorts } from '/lib/includes.js'
import { objectArraySort } from '/lib/includes.js'
import { getServers } from '/lib/includes.js'
import { getServersWithRam } from '/lib/includes.js'
import { getServersWithMoney } from '/lib/includes.js'
//import { secondsToHMS } from '/lib/includes.js'
//import { killAllButThis } from '/lib/includes.js'
//import { connecter } from '/lib/includes.js'
import { randomInt } from '/lib/includes.js'
import { map } from '/lib/includes.js'
//import { readFromJSON } from '/lib/includes.js'
//import { writeToJSON } from '/lib/includes.js'

/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {

    ns.disableLog("ALL");

    const moneyToSpend = 0.4;//% of money
    let sellForMoney = false,
        hackNetServersCA = [];

    class HackNetServer {
        constructor(index_) {
            this.index = index_;
        }

        update() {
            const upgrade = this.bestUpgrade();
            //if (this.index == 4)ns.tprint(upgrade);
            if (ns.getServerMoneyAvailable("home") * moneyToSpend * .2 > upgrade[1])
                ns.hacknet[upgrade[0]](this.index);
            if (ns.hacknet.getCacheUpgradeCost(this.index) < ns.getServerMoneyAvailable("home") * moneyToSpend
                && ns.hacknet.getNodeStats(this.index).hashCapacity < 2000)
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
                        ns.getPlayer().hacknet_node_money_mult)
                        -
                        ns.hacknet.getNodeStats(this.index).production);
                if (profit < best) {
                    best = profit;
                    besti = i;
                }
                //if (this.index == 4) ns.tprint("profit: " + profit / 1e6 + " best: " + best / 1e6 + " besti: " + besti);
            }
            // ns.tprint(best + " " + besti + " " + this.index);

            //return string+cost
            return [["upgradeLevel", "upgradeRam", "upgradeCore"][besti], ns.hacknet[statNames[besti]](this.index)];
        }
    }

    for (let i = 0; i < ns.hacknet.numNodes(); i++) {
        hackNetServersCA.push(new HackNetServer(i));
    }

    if (ns.getServerMoneyAvailable("home") * moneyToSpend > ns.hacknet.getPurchaseNodeCost() &&
        ns.hacknet.maxNumNodes() > ns.hacknet.numNodes()) {
        hackNetServersCA.push(new HackNetServer(ns.hacknet.purchaseNode()));
    }
    for (const serv of hackNetServersCA) serv.update();

    while (true) {
        if (ns.getTimeSinceLastAug() % 120000 < 60000) {
            if (ns.getTimeSinceLastAug() < 1000 * 60 * 60 * 12) for (const serv of hackNetServersCA) serv.update();
            if (ns.getServerMoneyAvailable("home") * moneyToSpend > ns.hacknet.getPurchaseNodeCost() &&
                ns.hacknet.maxNumNodes() > ns.hacknet.numNodes()) {
                hackNetServersCA.push(new HackNetServer(ns.hacknet.purchaseNode()));
            }
        }



        sellForMoney = ns.hacknet.hashCapacity() * .9 < ns.hacknet.numHashes() ? true : false;
        if ((ns.singularity.getOwnedAugmentations(true).length != ns.singularity.getOwnedAugmentations(false).length ||
            ns.getTimeSinceLastAug() > 1000 * 60 * 60 * 12) &&
            ns.getTimeSinceLastAug() != ns.getPlayer().playtimeSinceLastBitnode) sellForMoney = true;
        if (sellForMoney) {
            for (let i = 0; i < 100; i++)ns.hacknet.spendHashes("Sell for Money");
        }
        ns.clearLog();
        for (let i = 0; i < hackNetServersCA.length; i++) {
            ns.print("Node " + i + " level: " + ns.hacknet.getNodeStats(i).level +
                " cores: " + ns.hacknet.getNodeStats(i).cores +
                " ram: " + ns.hacknet.getNodeStats(i).ram);
        }

        await ns.sleep(50);
    }
}