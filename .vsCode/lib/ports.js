/** @param {NS} ns */
export async function main(ns) {
	var thisServer = ns.args[0];
	var scripts = ns.args[1].split(",");

	var toPrint = "";
	for (let i = 0; i < scripts.length; i++) {
		await ns.scp(scripts[i], thisServer);
		toPrint += scripts[i] + " ";
	}
	//ns.tprint("copied to " + thisServer + ": " + toPrint);

	if (thisServer.substring(0, 7) != "perkele" && thisServer != "home") {
		var openPorts = 0;
		var portsRequired = ns.getServerNumPortsRequired(thisServer);
		while (portsRequired > openPorts) {
			if (ns.fileExists("brutessh.exe") && !sshChecked) {
				var sshChecked = true;
				openPorts++;
				ns.brutessh(thisServer);
			}
			if (ns.fileExists("ftpcrack.exe") && !ftpChecked) {
				var ftpChecked = true;
				openPorts++;
				ns.ftpcrack(thisServer);
			}
			if (ns.fileExists("relaysmtp.exe") && !relChecked) {
				var relChecked = true;
				openPorts++;
				ns.relaysmtp(thisServer);
			}
			if (ns.fileExists("httpworm.exe") && !httpChecked) {
				var httpChecked = true;
				openPorts++;
				ns.httpworm(thisServer);
			}
			if (ns.fileExists("sqlinject.exe") && !sqlChecked) {
				var sqlChecked = true;
				openPorts++;
				ns.sqlinject(thisServer);
			}
			await ns.sleep(5000);
		}
		ns.nuke(thisServer);
	}
}