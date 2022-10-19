//Created: 09.05.2022 07:33:46
//Last modified: 19.10.2022 19:21:44
import {
	printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
	secondsToHMS, killAllButThis, connecter, randomInt, map, readFromJSON, writeToJSON, openPorts2, getBestFaction, col
}
	from "lib/includes.js"


const imports = `
import {
	printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
	secondsToHMS, killAllButThis, connecter, randomInt, map, readFromJSON, writeToJSON, openPorts2, getBestFaction, col
}
	from "/lib/includes.js"
`

/** @param {NS} ns */
/** @param {import("../.").NS} ns */
export async function main(ns) {

	ns.tail();


	/**Path for dynamic scripts */
	const path = "/bn4/dynScripts/",
		logPort = ns.getPortHandle(1),
		wantGang = true,
		timeToWaitForAugs = 300 * 1000,
		augInstallTimer = 60000 * 400, //400min
		firstRun = ns.getTimeSinceLastAug() == ns.getPlayer().playtimeSinceLastBitnode,
		wantAugNum = 6,
		nextBN = 1,
		contractDelay = 60 * 21 * 1000;

	if (ns.getServer().hostname != "home")
		await ns.scp("g_settings.txt", ns.getServer().hostname, "home");

	let g_sets = readFromJSON(ns, "g_settings.txt"),
		wantAugsInstalled = g_sets.wantAugsInstalled,
		wantBuyAugs = g_sets.wantBuyAugs,
		wantHackNet = g_sets.wantHackNet,
		wantJobs = g_sets.wantJobs,
		spamNeuroFlux = g_sets.spamNeuroFlux,
		focusOnWork = g_sets.focusOnWork,
		afkFocusOnWork = g_sets.afkFocusOnWork,
		paused = g_sets.paused,
		overrideVars = g_sets.overrideVars,
		servers = getServersWithRam(ns),
		boughtAug = 0,
		prevJobTime = ns.getTimeSinceLastAug() - 5000,
		prevTime = -99e99,
		timer = 0,
		startScriptsRunned = false,
		contractTimer = -99e99,
		doRestart = false;

	ns.tail();
	ns.disableLog("ALL");

	function runStartScripts() {
		ns.exec("/watcher/watcher.js", "home");
		ns.exec("/stock/stockXsinx.js", "home");
		ns.exec("/ver6/ver6.js", "home");
		ns.exec("/stanek/stanek.js", "home");
		ns.exec("/bn4/sleeves.js", "home");
		ns.exec("/hacknet/hackNet.js", "home");
		ns.exec("/gang/thugGang.js", "home");
		startScriptsRunned = true;
	}

	ns.clearLog();


	let files = [
		"/bn4/homicide.js",
		"/bn4/mug.js",
		"/bn4/buyHomeRam.js",
		"/bn4/faction.js",
		"/contracts/contractMain.js",
		"/lib/includes.js"
	];
	let activityText = [];



	const dynFunctions = [
		`//endBN
		const nextBN = ns.args[0] ?? 1;
		if (ns.getServerRequiredHackingLevel("w0r1d_d43m0n") < ns.getPlayer().skills.hacking) {
			ns.write("lastBNtime.txt", ns.nFormat(ns.getPlayer().playtimeSinceLastBitnode / 1000, "00:00:00"));
			ns.singularity.destroyW0r1dD43m0n(nextBN, "/bn4/starter.js");
		}
		`,
		`//backdoors
		const nextBN=ns.args[0];
		const gangServers = ["CSEC",
		 "avmnite-02h",
		  "I.I.I.I",
		   "run4theh111z",
		    "The-Cave", 
			"ecorp",
			"megacorp",
			"blade",
			"clarkinc",
			"omnitek",
			"4sigma",
			"kuai-gong",
			"fulcrumassets",
			];
			for (let server of gangServers) {
			if (ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel()
				&& !ns.getServer(server).backdoorInstalled
				&& ns.hasRootAccess(server)
				&& !server.startsWith("perke")) { //PURCHASED SERVER
				connecter(ns, server);
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
				if (ns.singularity.getUpgradeHomeRamCost() < ns.getServerMoneyAvailable("home")) {
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
	runFunc("buyHomeRam");

	while (true) {
		//if (!startScriptsRunned && startTime + 3000 < ns.getTimeSinceLastAug())
		//runStartScripts();
		await updateSettings();
		if (!overrideVars) {
			if (ns.getHackingLevel() > 1000 && g_sets.wantJobs) wantJobs = true;
			else wantJobs = false;
		}
		while (paused) {
			await ns.sleep(100);
			await updateSettings();
		}
		if (prevTime + 1000 < ns.getTimeSinceLastAug()) {
			if (contractTimer + contractDelay < ns.getTimeSinceLastAug()) {
				let server = "";
				let ram = 0;
				for (const serv of servers) {
					if (ns.getServerMaxRam(serv) - ns.getServerUsedRam(serv) > ram
						&& ns.getServer(serv).hasAdminRights) {
						server = serv;
						ram = ns.getServerMaxRam(serv) - ns.getServerUsedRam(serv);
						if (ram >= ns.getScriptRam("/contracts/contractMain.js"))
							break;
					}
				}
				if (server == "") return;
				if (ns.exec("/contracts/contractMain.js", server) == 0) {
					ns.tprint("ERROR not enough ram for contracts")
					ns.tprint("NEEDED: " + ns.getScriptRam("/contracts/contractMain.js") + " avail: " + ram + " server: " + server)
				}
				else contractTimer = ns.getTimeSinceLastAug();
			}
			runFunc("buyHomeRam");
			if (wantJobs && ns.getHackingLevel() > 1000) runFunc("getJobs");
			//runFunc("startGang", wantGang);
			if (wantBuyAugs) getAugs();
			buyDarkweb();
			await copyProgs();
			runFunc("joinFactions");
			runFunc("backdoors");
			//runFunc("endBN", nextBN);
			prevTime = ns.getTimeSinceLastAug();
		}
		await idle();
		updateTail();
		//ns.tprint(await getBestFaction(ns, ["Church of the Machine God"], wantHackNet, firstRun))
		if (await getBestFaction(ns, ["Church of the Machine God"], wantHackNet, firstRun) != "Nope")
			donate(await getBestFaction(ns, ["Church of the Machine God"], wantHackNet, firstRun));
		await ns.sleep(15);
	}

	async function updateSettings() {
		if (ns.getServer().hostname != "home")
			await ns.scp("g_settings.txt", ns.getServer().hostname, "home");
		g_sets = readFromJSON(ns, "g_settings.txt");
		wantAugsInstalled = g_sets.wantAugsInstalled,
			wantBuyAugs = g_sets.wantBuyAugs,
			wantHackNet = g_sets.wantHackNet,
			wantJobs = g_sets.wantJobs,
			spamNeuroFlux = g_sets.spamNeuroFlux,
			focusOnWork = g_sets.focusOnWork,
			afkFocusOnWork = g_sets.afkFocusOnWork,
			overrideVars = g_sets.overrideVars,
			paused = g_sets.paused;
	}

	function updateTail() {

		ns.clearLog();
		ns.print("Install augs " + wantAugsInstalled);
		ns.print("Buy augs " + wantBuyAugs);
		ns.print("Buy hacknet augs " + wantHackNet);
		ns.print("Get jobs " + wantJobs);
		ns.print("Spam neuroflux " + spamNeuroFlux);
		ns.print("Focus on work " + focusOnWork);
		ns.print("Focus on work when afk " + afkFocusOnWork);
		ns.print("Override vars " + overrideVars);
		ns.print("First run " + firstRun);
		ns.print("=============MAIN===============")
		ns.print(ns.gang.inGang() ? "In gang" : "Not in gang");
		for (let i = 0; i < 3; i++) {
			if (activityText[i]) ns.print(activityText[i]);
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
		const fileName = func.substring(func.indexOf("/") + 2, func.indexOf("\n"));
		const startOfFile = `/** @param {NS} ns */ \nexport async function main(ns) {\n`;
		const toWrite = imports + startOfFile + func + "\n}";
		const name = path + fileName + ".js";
		await ns.write(name, toWrite, "w");
		await ns.sleep();
	}

	async function idle() {
		if (ns.singularity.getCurrentWork() != null)
			if (ns.singularity.getCurrentWork().type == "GRAFTING") return;
		let daedalus, redPill;
		for (let fact of ns.getPlayer().factions) {
			if (fact == "Daedalus") daedalus = true;
		}
		for (let aug of ns.singularity.getOwnedAugmentations(false)) {
			if (aug == "The Red Pill") redPill = true;
		}

		if ((wantGang && (!ns.gang.inGang()) && !ns.singularity.isBusy())) {
			murder();
		} else if (ns.getPlayer().factions.length != 0 && (!wantGang || ns.gang.inGang()) && prevJobTime + 5000 < ns.getTimeSinceLastAug()) {
			prevJobTime = ns.getTimeSinceLastAug();
			let bestFact = await getBestFaction(ns, ["Church of the Machine God"], wantHackNet, firstRun).faction;

			if (bestFact != "Nope" && bestFact) {
				if (!ns.singularity.workForFaction(bestFact, "Hacking contracts", focusOnWork))
					ns.singularity.workForFaction(bestFact, "Field work", focusOnWork);
				activityText[0] = "Working for " + bestFact + " " + await getBestFaction(ns, ["Church of the Machine God"], wantHackNet, firstRun).aug;
			}
		}

		if (!redPill && daedalus) {
			ns.singularity.workForFaction("Daedalus", "Hacking contracts", focusOnWork);
			activityText[0] = "Hacking for daedalus";
		}
	}

	function donate(bestFaction) {
		let donationFact = bestFaction.faction;
		let bestAug = bestFaction.aug;
		let augCost;
		const boughtNFG = () => {
			let foundNFGp = 0;
			let foundNFG = 0;
			ns.singularity.getOwnedAugmentations(true).forEach(aug => {
				if (aug.startsWith("NeuroFlux")) foundNFGp++;
			});
			ns.singularity.getOwnedAugmentations(false).forEach(aug => {
				if (aug.startsWith("NeuroFlux")) foundNFG++;
			});
			return foundNFGp > foundNFG;
		}
		if (spamNeuroFlux || boughtNFG()) {
			let best = 0;
			bestAug = "NeuroFlux Governor";
			augCost = ns.singularity.getAugmentationPrice("NeuroFlux Governor");
			for (const fact of ns.getPlayer().factions) {
				if (ns.singularity.getFactionFavor(fact) > best && fact != "Slum Snakes" && fact != "Church of the Machine God") {
					donationFact = fact;
					best = ns.singularity.getFactionFavor(fact);
				}
			}
		} else
			if (ns.singularity.getCurrentWork())
				if (ns.singularity.getCurrentWork().factionName == "Daedalus") donationFact = "Daedalus";


		if (donationFact && ns.singularity.getFactionFavor(donationFact) >= ns.getFavorToDonate()) {
			if (donationFact == "Daedalus" && !ns.singularity.getOwnedAugmentations(true).includes("The Red Pill")) {
				augCost = 1e10;
				bestAug = "The Red Pill";
			} else
				augCost = ns.singularity.getAugmentationPrice(bestAug);
			if (ns.getServerMoneyAvailable("home") > augCost * 1.2) {
				//ns.tprint("Faction: " + donationFact + " cost: " + ns.getServerMoneyAvailable("home") / 100);
				//ns.tprint(ns.singularity.getAugmentationRepReq(bestAug) + " " + ns.singularity.getFactionRep(donationFact));
				if (ns.singularity.getAugmentationRepReq(bestAug) > ns.singularity.getFactionRep(donationFact)) {
					ns.singularity.donateToFaction(donationFact, ns.getServerMoneyAvailable("home") / 70);
				}
			}
			ns.print("Donating to " + donationFact);
		}
	}

	async function copyProgs() {
		for (let serv of getServers(ns)) {
			for (let file of files) {
				try { await ns.scp(file, serv); }
				catch { ns.alert("Error in startSin.js line 321 while copying " + file + " to " + serv) }
				await ns.sleep(5);
			}
		}
	}

	function getAugs() {
		let wantedAugs = [
			"company_rep",
			"faction_rep",
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

		boughtAug = ns.singularity.getOwnedAugmentations(true).length - ns.singularity.getOwnedAugmentations(false).length;

		for (let fact of ns.getPlayer().factions) {
			let augs = ns.singularity.getAugmentationsFromFaction(fact);
			for (let aug of augs) {
				let dontBuy = true;
				let augStats = Object.entries(ns.singularity.getAugmentationStats(aug));

				for (const e of augStats) {
					for (const want of wantedAugs)
						if (e[0].startsWith(want) && e[1] != 1)
							dontBuy = false;
				}

				if (aug == "Neuroreceptor Management Implant"
					|| aug == "The Red Pill"
					|| aug == "CashRoot Starter Kit") dontBuy = false;
				if (aug.startsWith("NeuroFlux Govern") && !spamNeuroFlux && !doRestart) dontBuy = true;

				let NiteSecAugs = ns.singularity.getAugmentationsFromFaction("NiteSec").filter(e => {
					return !ns.singularity.getOwnedAugmentations(true).includes(e);
				});
				NiteSecAugs = NiteSecAugs.filter(e => e != "DataJack")
				if (NiteSecAugs.length == 0) doRestart = true;

				if (firstRun && !(ns.getPlayer().factions).includes("NiteSec")) return;
				if (firstRun && NiteSecAugs.length > 0) {
					let canBuy = [];
					for (let i = NiteSecAugs.length - 1; i >= 0; i--) {
						if (ns.singularity.getAugmentationPrereq(NiteSecAugs[i]).every(aug =>
							ns.singularity.getOwnedAugmentations(true).includes(aug)))
							canBuy.push(NiteSecAugs[i]);
					}
					ns.singularity.purchaseAugmentation("NiteSec", canBuy.pop());
				} else
					if (!dontBuy) {
						if (ns.singularity.purchaseAugmentation(fact, aug)) {
							logPort.write("Bought " + aug + " for main dude");
							boughtAug += 1;
							timer = ns.getTimeSinceLastAug();
						}
					}
			}
		}
		if (ns.singularity.getOwnedAugmentations(true).includes("The Red Pill") &&
			!ns.singularity.getOwnedAugmentations(false).includes("The Red Pill"))
			boughtAug += 99;
		if (wantAugsInstalled) {
			if ((firstRun && doRestart) ||
				(!firstRun && (boughtAug >= wantAugNum || (boughtAug > 0 && ns.getTimeSinceLastAug() > augInstallTimer)))) {
				doRestart = true;
				if (timer + timeToWaitForAugs < ns.getTimeSinceLastAug()) {
					if (ns.singularity.getCurrentWork() != null)
						if (ns.singularity.getCurrentWork().type == "GRAFTING") return;
					ns.exec("/bn4/restart.js", "home");
				}
				for (const file of ["/gang/thugGang.js", "/lib/purchaseServers.js"])
					if (ns.isRunning(file, "home")) ns.kill(file, "home");
				if ((ns.ps("home").filter(f => f.filename.includes("stockXsinx"))).length != 0) {
					ns.kill("/stock/stockXsinx.js", "home");
					ns.run("/stock/stockXsinx.js", 1, "sell");
				}
				logPort.write("Restarting in " + Math.floor((timer + timeToWaitForAugs - ns.getTimeSinceLastAug()) / 1000) + "s")
			}
		}
	}

	function buyDarkweb() {
		if (ns.getServerMoneyAvailable("home") > 200000) ns.singularity.purchaseTor();

		let dwProgs = ns.singularity.getDarkwebPrograms();
		for (let prog of dwProgs) {
			if (ns.singularity.getDarkwebProgramCost(prog) < ns.getServerMoneyAvailable("home")) {
				if (!ns.fileExists(prog, "home")) if (ns.singularity.purchaseProgram(prog)) {
					logPort.write("Bought " + prog);
				}
			}
		}
	}

	function murder() {
		for (let server of servers) {
			if (ns.hasRootAccess(server) && ns.getServerMaxRam(server) - ns.getServerUsedRam(server) >= ns.getScriptRam("/bn4/homicide.js")) {
				if (ns.getPlayer().skills.strength > 74) {
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
		logPort.write("Not enough ram for murder.js");
	}
}