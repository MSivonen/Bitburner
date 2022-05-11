/** @param {NS} ns */
export async function main(ns) {
	//	var targetArray = ns.args[0].split(",");
	var servers = [];
	var serversWithMoney = [];
	//var targetArray = ns.read("/randomJS/targetArray.txt").split(",");
	getServers();



	for (var i = 0; i < serversWithMoney.length; i++) {
		var minsec = ns.getServerMinSecurityLevel(serversWithMoney[i]);
		var money = Math.floor(ns.getServerMoneyAvailable(serversWithMoney[i]) / 1000000);
		var security = ns.getServerSecurityLevel(serversWithMoney[i]);
		var maxmoney = Math.floor(ns.getServerMaxMoney(serversWithMoney[i]) / 1000000);
		var moneyFull = maxmoney / money;
		var securityMin = security / minsec;
		minsec = minsec.toFixed(2) + "                      ";
		let decimal = money > 100 ? 0 : 1;
		money = money.toFixed(decimal) + "M                      ";
		decimal = maxmoney > 100 ? 0 : 1;
		maxmoney = maxmoney.toFixed(decimal) + "M                      ";
		security = security.toFixed(2) + "                      ";
		let serverName = serversWithMoney[i] + "                      ";
		serverName = serverName.substring(0, 20);
		minsec = minsec.substring(0, 5);
		security = security.substring(0, 5);
		money = money.substring(0, 10);
		maxmoney = maxmoney.substring(0, 10);

		if (securityMin < 1.05) ns.tprint("WARN     " + serverName + " Money: " + money + "/" + maxmoney + " Security: " + security + "/" + minsec);
		else if (moneyFull < 1.05) ns.tprint("ERROR    " + serverName + " Money: " + money + "/" + maxmoney + " Security: " + security + "/" + minsec);
		else ns.tprint("INFO     " + serverName + " Money: " + money + "/" + maxmoney + " Security: " + security + "/" + minsec);
	}
	ns.tprint("");
	//		await ns.sleep(120000);
	//	}

	function getServers() {
		let serversToScan = ns.scan("home");
		while (serversToScan.length > 0) {
			let server = serversToScan.shift();
			if (!servers.includes(server)) {
				if (ns.getServerMaxMoney(server) > 1) {
					serversWithMoney.push(server);
				}
				servers.push(server);
				let tempServ = ns.scan(server);
				for (var i = 0; i < tempServ.length; i++) {
					serversToScan.push(tempServ[i]);
				}
			}
		}
	}
}