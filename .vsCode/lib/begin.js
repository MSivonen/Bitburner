/**
 * @typedef {import("/lib/IgetServers.js").getServers} getServers
 */
import { getServers } from "/lib/IgetServers.js"

/** @param {NS} ns
 * @typedef {import("/lib/IgetServers.js").getServers} getServers
 */
export async function main(ns) {
	const ramUsage = ns.getScriptRam("/lib/hack.js") + ns.getScriptRam("/lib/grow.js") + ns.getScriptRam("/lib/weak.js");
	let scripts = ["/lib/hack.js", "/lib/weak.js", "/lib/grow.js"];
	var scriptstxt = scripts.toString();
	ns.disableLog("ALL");
	ns.tail();
	var servers = getServers(ns);
	const server = "home";
	var target = "";
	ns.tprint("Go buy tor router")
	ns.tprint("INFO   Darkweb buy commands are in tail");
	ns.print("\n\n\nbuy FTPCrack.exe");
	ns.print("buy relaySMTP.exe");
	ns.print("buy HTTPWorm.exe");
	ns.print("buy SQLInject.exe");
	ns.print("buy ServerProfiler.exe");
	ns.print("buy DeepscanV2.exe");
	ns.print("buy AutoLink.exe");
	ns.print("buy Formulas.exe");
	ns.print("buy FTPCrack.exe;buy relaySMTP.exe;buy HTTPWorm.exe;buy SQLInject.exe;buy ServerProfiler.exe;buy DeepscanV1.exe;buy DeepscanV2.exe;buy AutoLink.exe;buy Formulas.exe");

	for (let serv of servers) {
		if (ns.getServerNumPortsRequired(serv) == 0) ns.nuke(serv);
	}

	for (let i = 0; i < servers.length; i++) {
		ns.exec("/lib/ports.js", "home", 1, servers[i], scriptstxt);
	}

	for (let i = 0; i < 0; i++) {
		ns.print("Wait " + 10 - i + " sec...");
	}
	await ns.sleep(10000);

	while (!ns.fileExists("SQLInject.exe")) {
		if (ns.getHackingLevel() < 10) target = "n00dles";
		else target = "joesguns";

		let availableRam = ns.getServerMaxRam(server) - 4 - ns.getServerUsedRam(server);
		if (availableRam > ramUsage) {
			let threads = Math.floor(availableRam / ramUsage);
			ns.exec("/lib/weak.js", server, threads, target);
			ns.exec("/lib/grow.js", server, threads, target);
			if (ns.getServerMoneyAvailable(target) / ns.getServerMaxMoney(target) > 0.5) ns.exec("/lib/hack.js", server, threads, target);
		}

		await ns.sleep(100);
	}
	ns.tprint('Ending "begin" script');
}