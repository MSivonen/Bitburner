/** @param {NS} ns */
export async function main(ns) {
	var hackTarget = ns.args[0];
	var hackRam = ns.getScriptRam("/jsScripts/homeHack.js");
	var moneyThresh = ns.getServerMaxMoney(hackTarget) * 0.95;
	var securityThresh = ns.getServerMinSecurityLevel(hackTarget) * 1.08;
	var threads = -150 + Math.floor((ns.getServerMaxRam("home")) / hackRam);
	ns.tprint(threads);
	ns.exec("/jsScripts/homeHack.js", "home", threads, hackTarget, moneyThresh, securityThresh, "home");
	await ns.sleep(100);
}