import { writeToJSON } from "/lib/includes"
import { objectArraySort } from "/lib/includes"
import { printArray } from "/lib/includes.js"
//import { openPorts } from "/lib/includes.js"
//import { objectArraySort } from "/lib/includes.js"
import { getServers } from "/lib/includes.js"
import { getServersWithRam } from "/lib/includes.js"
import { getServersWithMoney } from "/lib/includes.js"
//import { secondsToHMS } from "/lib/includes.js"
import { getBestFaction } from "/lib/includes.js"


const imports = `
import { printArray } from "/lib/includes.js"
import { openPorts } from "/lib/includes.js"
import { objectArraySort } from "/lib/includes.js"
import { getServers } from "/lib/includes.js"
import { getServersWithRam } from "/lib/includes.js"
import { getServersWithMoney } from "/lib/includes.js"
import { secondsToHMS } from "/lib/includes.js"
import { killAllButThis } from "/lib/includes.js"
import { connecter } from "/lib/includes.js"
`

/** @param {NS} ns */
/** @param {import("../.").NS} ns */
export async function main(ns) {
	/**Path for dynamic scripts */
	const path = "/bn4/dynScripts/",
		logPort = ns.getPortHandle(1),
		wantGang = true,
		timeToWaitForAugs = 300 * 1000,
		augInstallTimer = 60000 * 120, //120min
		wantAugsInstalled = true,
		wantBuyAugs = true,
		wantHackNet = true,
		wantJobs = true,
		wantAugNum = 5;
	ns.tail();
	let paused = false,
		doc = globalThis["document"];
	ns.disableLog("ALL");
	let draggables = doc.querySelectorAll(".react-draggable");
	let logWindow = draggables[draggables.length - 1]; // Reference to the full log window, not just the log area. Needed because the buttons aren't in the log area.

	let killButton = logWindow.querySelector("button");
	let pauseButton = killButton.cloneNode(); //copies the kill button for styling purposes
	pauseButton.addEventListener("click", () => {
		paused = !paused;
		pauseButton.innerText = paused ? "Unpause" : "Pause";
	})
	pauseButton.innerText = "Pause";
	killButton.insertAdjacentElement("beforeBegin", pauseButton);

	ns.exec("/watcher/watcher.js", "home");
	ns.exec("/bn4/sleeves.js", "home");
	ns.exec("/hacknet/hackNet.js", "home");
	ns.exec("/gang/thugGang.js", "home");
	ns.exec("/ver6/ver6.js", "home");


	ns.clearLog();
	const sin = eval("ns.singularity");
	const gangServers = ["CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z", "The-Cave", "w0r1d_d43m0n"];
	let servers = getServersWithRam(ns);
	let boughtAug = 0;
	let prevJobTime = ns.getTimeSinceLastAug() - 5000;
	let prevTime = ns.getTimeSinceLastAug() - 5000;
	let timer = 0;

	let files = [
		"/bn4/homicide.js",
		"/bn4/mug.js",
		"/bn4/buyHomeRam.js",
		"/bn4/faction.js"
	];
	let activityText = [],
		logA = ["", "", "", "", ""];


	const dynFunctions = [
		`//backdoors
		const gangServers = ["CSEC",
		 "avmnite-02h",
		  "I.I.I.I",
		   "run4theh111z",
		    "The-Cave", 
			"w0r1d_d43m0n",
			"ecorp",
			"megacorp",
			"blade",
			"clarkinc",
			"omnitek",
			"4sigma",
			"kuai-gong",
			"fulcrumassets",
			"omnia"
			];
			for (let server of gangServers) {
			if (ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel()
				&& !ns.getServer(server).backdoorInstalled
				&& ns.hasRootAccess(server)
				&& !server.startsWith("perke")) { //PURCHASED SERVER
				connecter(ns, server);
				if (server == "w0r1d_d43m0n") {
					break;
					let time = ns.getPlayer().totalPlaytime;
					await ns.write("lastBNend.txt", time, "w");
				}
				ns.tprint("Installing backdoor on " + server);
				await ns.singularity.installBackdoor();
				break;
			}
		}`
		,

		`//joinFactions
		for (let fact of ns.singularity.checkFactionInvitations()) {
			ns.singularity.joinFaction(fact);
		}`
		,

		`//buyHomeRam
		for (let server of getServersWithRam(ns)) {
			if (ns.getServerMaxRam(server) - ns.getServerUsedRam(server) >= ns.getScriptRam("/bn4/buyHomeRam.js")) {
				if (ns.singularity.getUpgradeHomeRamCost() * 2 < ns.getServerMoneyAvailable("home")) {
					ns.exec("/bn4/buyHomeRam.js", server);
					ns.print("Bought homeram");
					return;
				}
			}
		}`
		,
		`//getJobs
		//Corp:Faction
		const jobCorps = [
			{ "ECorp": "ECorp" },
			{ "MegaCorp": "MegaCorp" },
			{ "Blade Industries": "Blade Industries" },
			{ "Clarke Incorporated": "Clarke Incorporated" },
			{ "OmniTek Incorporated": "OmniTek Incorporated" },
			{ "Four Sigma": "Four Sigma" },
			{ "KuaiGong International": "KuaiGong International" },
			{ "Fulcrum Technologies": "Fulcrum Secret Technologies" },
			{ "Omnia Cybersystems": "OmniTek Incorporated" },
			{ "NWO": "NWO" }
		];

		let corpFactions = [
			"Blade Industries",
			"ECorp",
			"MegaCorp",
			"KuaiGong International",
			"Four Sigma",
			"NWO",
			"OmniTek Incorporated",
			"Bachman & Associates",
			"Clarke Incorporated",
			"Fulcrum Secret Technologies"
		];

		for (const corpO of jobCorps) {
			if (!ns.getPlayer().factions.includes(Object.values(corpO)[0])) {
				if ((Object.keys(corpO)[0] == "Fulcrum Technologies" && ns.getServerRequiredHackingLevel("fulcrumassets") < ns.getHackingLevel())
					|| Object.keys(corpO)[0] != "Fulcrum Technologies")
					ns.singularity.applyToCompany(Object.keys(corpO)[0], "it");
			}
		}`
		,
		`//startGang
		const logPort = ns.getPortHandle(1);
		if (ns.args[0] && !ns.gang.inGang() && !ns.isRunning("/gang/thugGang.js", "home") && ns.heart.break() < -54000) {
				logA.push("Create gang");
				logPort.write("Create gang");
				ns.gang.createGang("Slum Snakes");
				ns.exec("/gang/thugGang.js", "home");
			}`
	]

	for (let dynFunc of dynFunctions) {
		await writeScript(dynFunc);
	}
	await copyProgs();

	ns.tail();
	while (true) {
		while (paused) {
			await ns.sleep(100);
		}
		if (prevTime + 5000 < ns.getTimeSinceLastAug()) {
			await ns.write("bestFact.txt", await getBestFaction(ns), "w");
			if (wantJobs) runFunc("getJobs");
			runFunc("startGang", wantGang);
			if (wantBuyAugs) getAugs();
			buyDarkweb();
			await copyProgs();
			runFunc("joinFactions");
			runFunc("backdoors");
			runFunc("buyHomeRam");
			prevTime = ns.getTimeSinceLastAug();
		}
		await idle();
		updateTail();
		await ns.sleep(30)
	}

	function updateTail() {

		ns.clearLog();
		while (logA.length > 15) logA.splice(0, 1);

		ns.print("=============MAIN===============")
		ns.print(ns.gang.inGang() ? "In gang" : "Not in gang");
		for (let i = 0; i < 3; i++) {
			if (activityText[i]) ns.print(activityText[i]);
			else ns.print("");
		}

		ns.print("=============LOG================")
		for (let i = 0; i < 15; i++) {
			if (logA[i]) ns.print(logA[i]);
			else ns.print("");
		}
	}






	function runFunc(func, runarg1 = false, runarg2 = false) {
		let fileName = path + func + ".js";
		for (let server of servers) {
			if (ns.getServerMaxRam(server) - ns.getServerUsedRam(server) >= ns.getScriptRam(fileName)
				&& !ns.isRunning(fileName, "home")) {
				ns.exec(fileName, server, 1, runarg1, runarg2);
			} break;
		}
	}

	async function writeScript(func) {
		let fileName = func.substring(func.indexOf("/") + 2, func.indexOf("\n"));
		const startOfFile = `/** @param {NS} ns */ \nexport async function main(ns) {\n`;
		const toWrite = imports + startOfFile + func + "\n}";
		const name = path + fileName + ".js";
		await ns.write(name, toWrite, "w");
	}

	async function idle() {
		let daedalus, redPill;
		for (let aug of ns.singularity.getOwnedAugmentations()) {
			if (aug == "The Red Pill") redPill = true;
		}
		for (let fact of ns.getPlayer().factions) {
			if (fact == "Daedalus") daedalus = true;
		}
		if (!redPill && daedalus && !sin.isBusy()) {
			ns.singularity.workForFaction("Daedalus", "Hacking contracts", false);
			activityText[0] = "Hacking for daedalus";
		}

		else if ((wantGang && (!ns.gang.inGang()) && !sin.isBusy())) {
			murder();
		}
		else if (ns.getPlayer().factions.length != 0 && (!wantGang || ns.gang.inGang()) && prevJobTime + 5000 < ns.getTimeSinceLastAug()) {
			prevJobTime = ns.getTimeSinceLastAug();
			let bestFact = await getBestFaction(ns).faction;
			if (bestFact != "Nope" && bestFact) {
				if (!ns.singularity.workForFaction(bestFact, "Hacking contracts", false))
					ns.singularity.workForFaction(bestFact, "Field work", false);
				activityText[0] = "Working for " + bestFact + " " + await getBestFaction(ns).aug;
			}
		}
	}

	async function copyProgs() {
		for (let serv of getServers(ns)) {
			for (let file of files) {
				await ns.scp(file, serv);
			}
		}
	}

	function getAugs() {
		let wantedAugs = [
			"company_rep_mult",
			"faction_rep_mult",
			"hacki"
		];
		const gangAugs = [
			"strength",
			"defense",
			"dexterity",
			"agility"
		],
			hackNetAugs = [
				"hacknet"
			];

		if (wantGang && !ns.gang.inGang()) wantedAugs.push(...gangAugs);
		if (wantHackNet) wantedAugs.push(...hackNetAugs);


		for (let fact of ns.getPlayer().factions) {
			let augs = ns.singularity.getAugmentationsFromFaction(fact);
			for (let aug of augs) {
				let dontBuy = true;
				let tempArr = Object.keys(ns.singularity.getAugmentationStats(aug));
				for (let text of tempArr) {
					for (let i of wantedAugs) {
						if (text.startsWith(i)) {
							dontBuy = false;
						}
					}
				}

				if (aug == "Neuroreceptor Management Implant"
					|| aug == "The Red Pill"
					|| aug == "CashRoot Starter Kit") dontBuy = false;
				if (aug.startsWith("NeuroFlux Govern")) dontBuy = true;

				if (!dontBuy || (boughtAug >= wantAugNum || (boughtAug > 0 && ns.getTimeSinceLastAug() > augInstallTimer))) { //60 min
					if (ns.singularity.purchaseAugmentation(fact, aug)) {
						logA.push("Bought " + aug + " for main dude");
						logPort.write("Bought " + aug + " for main dude");
						boughtAug += 1;
						timer = ns.getTimeSinceLastAug();
						//ns.exec("/test/fireworks.js", "home", 1);
					}
				}
			}
		}
		if (wantAugsInstalled && (boughtAug >= wantAugNum || (boughtAug > 0 && ns.getTimeSinceLastAug() > augInstallTimer))) {
			if (timer + timeToWaitForAugs < ns.getTimeSinceLastAug())
				ns.exec("/bn4/restart.js", "home");
			for (const file of ["/gang/thugGang.js", "/lib/purchaseServers.js"])
				if (ns.isRunning(file, "home")) ns.kill(file, "home");
			logA.push("Restarting in " + Math.floor((timer + timeToWaitForAugs - ns.getTimeSinceLastAug()) / 1000) + "s");
			logPort.write("Restarting in " + Math.floor((timer + timeToWaitForAugs - ns.getTimeSinceLastAug()) / 1000) + "s")
		}
	}

	/* 	async function backdoors() {
			for (let server of gangServers) {
				if (ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel()
					&& !ns.getServer(server).backdoorInstalled
					&& ns.hasRootAccess(server)
					&& !server.startsWith("perke")) { //PURCHASED SERVER
					connecter(server);
					if (server == "w0r1d_d43m0n") {
						let time = ns.getPlayer().totalPlaytime;
						await ns.write("lastBNend.txt", time, "w");
					}
					ns.print("Installing backdoor on " + server);
					await ns.singularity.installBackdoor();
					break;
				}
			}
		} */

	function buyDarkweb() {
		if (ns.getServerMoneyAvailable("home") > 200000) ns.singularity.purchaseTor();

		let dwProgs = ns.singularity.getDarkwebPrograms();
		for (let prog of dwProgs) {
			if (ns.singularity.getDarkwebProgramCost(prog) < ns.getServerMoneyAvailable("home")) {
				if (!ns.fileExists(prog, "home")) if (ns.singularity.purchaseProgram(prog)) {
					logA.push("Bought " + prog);
					logPort.write("Bought " + prog);
				}
			}
		}
	}

	/* 	function faction() {
			for (let server of servers) {
				if (ns.getServerMaxRam(server) - ns.getServerUsedRam(server) >= ns.getScriptRam("/bn4/faction.js")) {
					ns.exec("/bn4/faction.js", server);
					break;
				}
			}
		} */

	/* 	function buyHomeRam() {
			for (let server of servers) {
				if (ns.getServerMaxRam(server) - ns.getServerUsedRam(server) >= ns.getScriptRam("/bn4/buyHomeRam.js")) {
					if (ns.singularity.getUpgradeHomeRamCost() * 2 < ns.getServerMoneyAvailable("home")) {
						ns.exec("/bn4/buyHomeRam.js", server);
						ns.print("Bought homeram");
						return;
					}
				}
			}
		} */

	function murder() {
		for (let server of servers) {
			if (ns.hasRootAccess(server) && ns.getServerMaxRam(server) - ns.getServerUsedRam(server) >= ns.getScriptRam("/bn4/homicide.js")) {
				if (ns.getPlayer().strength > 74) {
					activityText[0] = "Main is homiciding";
					ns.exec("/bn4/homicide.js", server);
				}
				else {
					ns.exec("/bn4/mug.js", server);
					activityText[0] = "Main is a mug";
				}
				activityText[1] = "Karma: " + (ns.heart.break()).toFixed(2);
				return;
			}
		}
		logA.push("WARN Not enough ram for murder.js");
		logPort.write("Not enough ram for murder.js");
	}

	function connecter(targ) {
		ns.singularity.connect("home");
		let target = targ;
		let paths = { "home": "" };
		let queue = Object.keys(paths);
		let name;
		let pathToTarget = [];
		while ((name = queue.shift())) {
			let path = paths[name];
			let scanRes = ns.scan(name);
			for (let newSv of scanRes) {
				if (paths[newSv] === undefined) {
					queue.push(newSv);
					paths[newSv] = `${path},${newSv}`;
					if (newSv == target)
						pathToTarget = paths[newSv].substr(1).split(",");
				}
			}
		}
		pathToTarget.forEach(server => ns.singularity.connect(server));
	}
}