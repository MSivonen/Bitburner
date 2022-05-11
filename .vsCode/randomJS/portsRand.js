/** @param {NS} ns */
export async function main(ns) {
	var hackingServer = ns.args[0];
	var hackTarget = ns.args[1];
	var moneyThresh = ns.args[2];
	var securityThresh = ns.args[3];
	var growOrWeak = ns.args[4]; //0=grow 1=weak

	var openPorts = 0;
	var portsRequired = ns.getServerNumPortsRequired(hackingServer);


	if (growOrWeak == 0) {
		var hackRam = ns.getScriptRam("/randomJS/grow.js");
		ns.tprint(hackingServer + " GROW, ports required: " + portsRequired);

	}
	if (growOrWeak == 1) {
		var hackRam = ns.getScriptRam("/randomJS/weaken.js");
		ns.tprint(hackingServer + " WEAK, ports required: " + portsRequired);
	}

	var threads = Math.floor((ns.getServerMaxRam(hackingServer)) / hackRam);


	while (portsRequired > openPorts && hackingServer.substring(0, 4) != "perk") {
		if (ns.fileExists("brutessh.exe") && !sshChecked) {
			var sshChecked = true;
			openPorts++;
			ns.brutessh(hackingServer);
		}

		if (ns.fileExists("ftpcrack.exe") && !ftpChecked) {
			var ftpChecked = true;
			openPorts++;
			ns.ftpcrack(hackingServer);
		}
		if (ns.fileExists("relaysmtp.exe") && !relChecked) {
			var relChecked = true;
			openPorts++;
			ns.relaysmtp(hackingServer);
		}
		if (ns.fileExists("httpworm.exe") && !httpChecked) {
			var httpChecked = true;
			openPorts++;
			ns.httpworm(hackingServer);
		}
		if (ns.fileExists("sqlinject.exe") && !sqlChecked) {
			var sqlChecked = true;
			openPorts++;
			ns.sqlinject(hackingServer);
		}
		await ns.sleep(5000);
	}
	ns.nuke(hackingServer);

	if (threads > 0) {
		if (growOrWeak == 0) {
			ns.exec("/randomJS/grow.js", hackingServer, threads, hackTarget, moneyThresh, securityThresh);
			ns.tprint("starting GROW on " + hackingServer + ", targeting " + hackTarget + ", threads: " + threads);
		}
		if (growOrWeak == 1) {
			ns.exec("/randomJS/weaken.js", hackingServer, threads, hackTarget, moneyThresh, securityThresh);
			ns.tprint("starting WEAK on " + hackingServer + ", targeting " + hackTarget + ", threads: " + threads);
		}
	}

}