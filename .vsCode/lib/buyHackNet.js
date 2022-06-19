/** @param {NS} ns */
/** @param {import("../.").NS} ns */
export async function main(ns) {

	const maxNodes = 16;
	const maxCoreCost = 30000000;
	let sellForMoney = true;

	while (!ns.hacknet.numNodes()) { //if no nodes, loop here until buy one.
		if (ns.hacknet.numNodes() < maxNodes && ns.hacknet.getPurchaseNodeCost() < ns.getServerMoneyAvailable("home")) {
			ns.hacknet.purchaseNode();
		}
		await ns.sleep(30);
	}

	while (true) {
		for (let i = 0; i < ns.hacknet.numNodes(); i++) {
			if (ns.hacknet.numNodes() < maxNodes && ns.hacknet.getPurchaseNodeCost() < ns.getServerMoneyAvailable("home")) {
				ns.hacknet.purchaseNode(1);
			}
			if (ns.hacknet.getLevelUpgradeCost(i) < ns.getServerMoneyAvailable("home")) {
				ns.hacknet.upgradeLevel(i, 1);
			}
			if (ns.hacknet.getRamUpgradeCost(i) < ns.getServerMoneyAvailable("home")) {
				ns.hacknet.upgradeRam(i, 1);
			}
			if (ns.hacknet.getCoreUpgradeCost(i) < ns.getServerMoneyAvailable("home") && ns.hacknet.getCoreUpgradeCost(i) < maxCoreCost) {
				ns.hacknet.upgradeCore(i, 1);
			}
			await ns.sleep();
		}

		while (ns.hacknet.numNodes() <= maxNodes && ns.hacknet.getPurchaseNodeCost() < ns.getServerMoneyAvailable("home")) {
			ns.hacknet.purchaseNode();
			await ns.sleep();
		}

		while (ns.hacknet.getLevelUpgradeCost(ns.hacknet.numNodes() - 1) < ns.getServerMoneyAvailable("home")) {
			for (let i = 0; i < ns.hacknet.numNodes(); i++) {
				ns.hacknet.upgradeLevel(i, 1);
			}
			await ns.sleep();
		}

		while (ns.hacknet.getRamUpgradeCost(ns.hacknet.numNodes() - 1) < ns.getServerMoneyAvailable("home")) {
			for (let i = 0; i < ns.hacknet.numNodes(); i++) {
				ns.hacknet.upgradeRam(i, 1);
			}
			await ns.sleep();
		}

		while (ns.hacknet.getCoreUpgradeCost(ns.hacknet.numNodes() - 1) < ns.getServerMoneyAvailable("home") && ns.hacknet.getCoreUpgradeCost(ns.hacknet.numNodes() - 1) < maxCoreCost) {
			for (let i = 0; i < ns.hacknet.numNodes(); i++) {
				ns.hacknet.upgradeCore(i, 1);
			}
			await ns.sleep();
		}

		while (ns.hacknet.getCacheUpgradeCost(ns.hacknet.numNodes() - 1) < ns.getServerMoneyAvailable("home")) {
			for (let i = 0; i < ns.hacknet.numNodes(); i++) {
				ns.hacknet.upgradeCache(i, 1);
			}
			await ns.sleep();
		}

		if (sellForMoney) ns.hacknet.spendHashes("Sell for Money");
		sellForMoney = ns.hacknet.hashCapacity() / 2 < ns.hacknet.numHashes() ? true : false;
		ns.tprint(sellForMoney);
		await ns.sleep(50);
	}
}