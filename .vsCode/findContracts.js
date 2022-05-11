import { getServers } from "/lib/includes.js"
/** @param {NS} ns */
export async function main(ns) {
	var servers = getServers(ns);
	var contracts = [];
	for (var i = 0; i < servers.length; i++) {
		let serverContracts = ns.ls(servers[i], ".cct");
		if (serverContracts.length != 0) {
			contracts.push(servers[i] + ": " + serverContracts);
		}
	}
	for (var contract of contracts) {
		ns.tprint(contract);
	}
}