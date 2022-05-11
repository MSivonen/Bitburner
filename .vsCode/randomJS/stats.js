/** @param {NS} ns */
export async function main(ns) {
	//	var targetArray = ns.args[0].split(",");
	var targetArray = ns.read("/randomJS/targetArray.txt").split(",");

	//	while (true) {
	ns.tprint("");
	for (var i = 0; i < targetArray.length; i++) {
		var minsec = ns.getServerMinSecurityLevel(targetArray[i]);
		var money = Math.floor(ns.getServerMoneyAvailable(targetArray[i]) / 1000000);
		var security = ns.getServerSecurityLevel(targetArray[i]);
		var maxmoney = Math.floor(ns.getServerMaxMoney(targetArray[i]) / 1000000);
		minsec = minsec.toFixed(3);
		money = money.toFixed(3);
		maxmoney = maxmoney.toFixed(3);
		security = security.toFixed(3);

		ns.tprint("INFO------------------------------------------------" + targetArray[i] + " Money: " + money + "/" + maxmoney + " millions");
		ns.tprint("INFO------------------------------------------------" + targetArray[i] + " Security: " + security + ", minimum: " + minsec);
	}
	ns.tprint("");
	//		await ns.sleep(120000);
	//	}
}