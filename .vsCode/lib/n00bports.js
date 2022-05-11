import { getServers } from "/lib/includes.js"

/** @param {NS} ns */
export async function main(ns) {
	var servers = getServers(ns);
	for (let serv of servers) {
		if (ns.hasRootAccess(serv)) ns.print("Already open " + serv);
		else {
			if (!serv.startsWith("perkele") && serv != "home") {
				let openPorts = 0;
				if (ns.fileExists("brutessh.exe")) {
					openPorts++;
					ns.brutessh(serv);
				}
				if (ns.fileExists("ftpcrack.exe")) {
					openPorts++;
					ns.ftpcrack(serv);
				}
				if (ns.fileExists("relaysmtp.exe")) {
					openPorts++;
					ns.relaysmtp(serv);
				}
				if (ns.fileExists("httpworm.exe")) {
					openPorts++;
					ns.httpworm(serv);
				}
				if (ns.fileExists("sqlinject.exe")) {
					openPorts++;
					ns.sqlinject(serv);
				}
				if (ns.getServerNumPortsRequired(serv) <= openPorts) ns.nuke(serv);
				if (ns.hasRootAccess(serv)) ns.tprint("Opened " + serv);
				else ns.tprint("Failed to open " + serv);
			}
		}
	}
}