import { getServers } from "/lib/includes.js"


/** @param {NS} ns */
export async function main(ns) {
	for (let serv of getServers(ns)) {
		if (serv != "home") ns.rm("crawlerScan.js", serv);
	}
}