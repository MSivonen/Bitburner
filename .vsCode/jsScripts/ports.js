/** @param {NS} ns */
export async function main(ns) {
	var serv = ns.args[0];
	var hackTarget = ns.args[1];
	var moneyThresh = ns.args[2];
	var securityThresh = ns.args[3];

	var openPorts = 0;
	var hackRam = ns.getScriptRam("/jsScripts/otherHack.js");
	var threads = Math.floor((ns.getServerMaxRam(serv)) / hackRam);
	var portsRequired = ns.getServerNumPortsRequired(serv);

	ns.tprint(serv + " ports required: " + portsRequired);

	while (portsRequired > openPorts) {
		if (ns.fileExists("brutessh.exe") && !sshChecked) {
			var sshChecked = true;
			openPorts++;
			ns.brutessh(serv);
		}

		if (ns.fileExists("ftpcrack.exe") && !ftpChecked) {
			var ftpChecked = true;
			openPorts++;
			ns.ftpcrack(serv);
		}
		if (ns.fileExists("relaysmtp.exe") && !relChecked) {
			var relChecked = true;
			openPorts++;
			ns.relaysmtp(serv);
		}
		if (ns.fileExists("httpworm.exe") && !httpChecked) {
			var httpChecked = true;
			openPorts++;
			ns.httpworm(serv);
		}
		if (ns.fileExists("sqlinject.exe") && !sqlChecked) {
			var sqlChecked = true;
			openPorts++;
			ns.sqlinject(serv);
		}
		await ns.sleep(5000);
	}
	ns.nuke(serv);

	if (threads > 0) {
		ns.exec("/jsScripts/otherHack.js", serv, threads, hackTarget, moneyThresh, securityThresh, serv);
	}

	ns.tprint("starting " + serv + ", threads: " + threads);

}