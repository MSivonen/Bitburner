/** @param {NS} ns */
export async function main(ns) {

	const maxNodes = 16;
	const maxCoreCost = 30000000;

	while (!ns.hacknet.numNodes()) { //if no nodes, loop here until buy one.
		if (ns.hacknet.numNodes() < maxNodes && ns.hacknet.getPurchaseNodeCost() < ns.getServerMoneyAvailable("home")) {
			ns.hacknet.purchaseNode(1);
		}
		await ns.sleep(300);
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
		}
		await ns.sleep(50);
	}
}