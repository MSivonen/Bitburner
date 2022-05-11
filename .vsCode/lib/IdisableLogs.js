/** @param {NS} ns */
export function disableLogs(ns) {
	var vdisableLogs = ["scan", "exec", "sleep", "getServerMaxRam", "getServerUsedRam", "getServerMinSecurityLevel", "getServerMoneyAvailable", "getServerMaxMoney", "getServerSecurityLevel"];
	for (let i = 0; i < vdisableLogs.length; i++) {
		ns.disableLog(vdisableLogs[i]);
	}
}