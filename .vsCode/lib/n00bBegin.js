import { getServers } from "/lib/IgetServers.js"
import { getServersWithRam } from "/lib/IgetServersWithRam.js"

/** @param {NS} ns */
export async function main(ns) {
	const ramUsage = ns.getScriptRam("/lib/hack.js") + ns.getScriptRam("/lib/grow.js") + ns.getScriptRam("/lib/weak.js");
	let scripts = ["/lib/hack.js", "/lib/weak.js", "/lib/grow.js"];
	var scriptstxt = scripts.toString();
	ns.disableLog("ALL");
	ns.tail();
	var target = "";
	var servers = [];
	servers = getServersWithRam(ns);
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


	ns.exec("/lib/ports.js", "home", 1, "n00dles", scriptstxt);
	ns.exec("/lib/ports.js", "home", 1, "joesguns", scriptstxt);

	await ns.sleep(10000);

	while (!ns.fileExists("SQLInject.exe")) {
		servers = getServersWithRam(ns);
		for (let i = 0; i < servers.length; i++) {
			if (!ns.fileExists("/lib/weak.js")) ns.scp("/lib/weak.js", server);
			if (!ns.fileExists("/lib/grow.js")) ns.scp("/lib/weak.js", server);
			if (!ns.fileExists("/lib/hack.js")) ns.scp("/lib/weak.js", server);
			let server = servers[i];
			if (ns.getHackingLevel() < 10) target = "n00dles";
			else target = "joesguns";
			let reserve = 0;
			if (server == "home") {
				reserve = 8;
			}
			let availableRam = ns.getServerMaxRam(server) - reserve - ns.getServerUsedRam(server);
			if (availableRam > ramUsage && ns.hasRootAccess(server)) {
				let threads = Math.floor(availableRam / ramUsage);
				ns.exec("/lib/weak.js", server, threads, target);
				ns.exec("/lib/grow.js", server, threads, target);
				ns.exec("/lib/hack.js", server, threads, target);
			}
			await ns.sleep(50);
		}
		await ns.sleep(100);
	}
	ns.tprint('Ending "begin" script');
}