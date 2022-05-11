/** @param {NS} ns */
export async function main(ns) {

	/*
		if (!ns.fileExists("/home/servers.txt")) {
			var savedServers = [];
			var init = ns.scan(thisServer);
			await ns.write("/jsScripts/servers.txt", init);
		}
	*/

	let servers = [];
	let serversToScan = ns.scan("home");
	while (serversToScan.length > 0) {
		let server = serversToScan.shift();
		if (!servers.includes(server)) {
			servers.push(server);
			let tempServ = ns.scan(server);
			for (var i = 0; i < tempServ.length; i++) {
				serversToScan.push(tempServ[i]);
			}
			ns.tprint(server);
			ns.tprint(serversToScan);
		}
	}
	await ns.write("/jsScripts/servers.txt", servers, "w");
}