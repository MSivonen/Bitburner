/** @param {NS} ns */
export async function main(ns) {
	var maxRam = ns.args[0];
	var maxServers=ns.getPurchasedServerLimit();
	
	if (!ns.args[0]) maxRam = ns.getPurchasedServerMaxRam();
	var ram = 4;

	while (ns.getServerMoneyAvailable("home") / 4 > ns.getPurchasedServerCost(ram) * maxServers) {
		ram *= 2;
	}

	if (ns.serverExists("perkele24")) {
		ram = ns.getServerMaxRam("perkele24") * 2;
	}

	let nextMoney = ns.getPurchasedServerCost(ram) * maxServers;
	let next_TXT = "";
	if (nextMoney > 1000000000) next_TXT = (nextMoney / 1000000000).toFixed(2) + "b";
	else if (nextMoney > 1000000) next_TXT = (nextMoney / 1000000).toFixed(2) + "M";
	ns.tprint("Next servers will cost " + next_TXT + " in total.");

	while (ram < maxRam) {
		if (ns.getServerMoneyAvailable("home") / 2 > ns.getPurchasedServerCost(ram) * maxServers) {

			var servers = ns.scan("home");
			for (var i = 0; i < servers.length; i++) {
				if (servers[i].substring(0, 7) == "perkele") {
					ns.killall(servers[i]);
					ns.deleteServer(servers[i]);
				}
			}

			let money = ns.getPurchasedServerCost(ram);
			let moneyTXT = "";
			if (money > 1000000000) moneyTXT = (money / 1000000000).toFixed(2) + "b";
			else if (money > 1000000) moneyTXT = (money / 1000000).toFixed(2) + "M";

			ns.tprint("Updating servers to " + ram + "GB RAM, it'll cost " + moneyTXT + " moneys each.");
			var i = 0;

			while (i < ns.getPurchasedServerLimit()) {

				if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
					ns.purchaseServer("perkele" + i, ram);
					await ns.scp(["/lib/hack.js", "/lib/weak.js", "/lib/grow.js"], "perkele" + i);
					ns.tprint("Purchased server number " + i + " with " + ram + "GB RAM at cost " + ns.getPurchasedServerCost(ram) + " moneys.");
				}

				++i;
			}
			await ns.sleep(100);
			ram *= 2;
			nextMoney = ns.getPurchasedServerCost(ram) * 25;
			next_TXT = "";
			if (nextMoney > 1000000000) next_TXT = (nextMoney / 1000000000).toFixed(2) + "b";
			else if (nextMoney > 1000000) next_TXT = (nextMoney / 1000000).toFixed(2) + "M";
			ns.tprint("Next servers will cost " + next_TXT + " in total.");
		}
		await ns.sleep(1000);
	}
}