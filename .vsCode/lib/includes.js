//import { printArray } from "/lib/includes.js"
//import { openPorts } from "/lib/includes.js"
//import { objectArraySort } from "/lib/includes.js"
//import { getServers } from "/lib/includes.js"
//import { getServersWithRam } from "/lib/includes.js"
//import { getServersWithMoney } from "/lib/includes.js"
//import { secondsToHMS } from "/lib/includes.js"
//import { killAllButThis } from "/lib/includes.js"
//import { connecter } from "/lib/includes.js"
//import { randomInt } from "/lib/includes.js"
//import { map } from "/lib/includes.js"
//import { readFromJSON } from "/lib/includes.js"
//import { writeToJSON } from "/lib/includes.js"
//import { openPorts2 } from "/lib/includes.js"

export async function openPorts2(ns, servers) {
	let hacked = 0;
	let progs = ["brutessh.exe", "ftpcrack.exe", "relaysmtp.exe", "httpworm.exe", "sqlinject.exe", "dsfsd"];
	const ownedProgs = progs.filter((x) => ns.fileExists(x));
	for (const serv of servers) {
		for (const prog of ownedProgs) {
			switch (prog) {
				case "brutessh.exe":
					ns.brutessh(serv);
					break;
				case "ftpcrack.exe":
					ns.ftpcrack(serv);
					break;
				case "relaysmtp.exe":
					ns.relaysmtp(serv);
					break;
				case "httpworm.exe":
					ns.httpworm(serv);
					break;
				case "sqlinject.exe":
					ns.sqlinject(serv);
					break;
			}
		}
		if (ns.getServerNumPortsRequired(serv) <= ownedProgs.length) {
			ns.nuke(serv);
			hacked++;
		}
	}
	if (hacked == servers.length) allHacked = true;
}

export async function readFromJSON(ns, filename = "/test/jsontest.txt") {
	let readed = await ns.read(filename);
	return JSON.parse(readed);
}

export async function writeToJSON(ns, jsonObject, filename = "/test/jsontest.txt") {
	let toWrite = JSON.stringify(jsonObject);
	await ns.write(filename, toWrite, "w");
}

/**Map input value to output range. 
 * @example: map(5, 0, 10, 0, 100) -> outputs 50*/
export function map(number, inMin, inMax, outMin, outMax) {
	return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

/**Random int between minVal and maxVal
 * @param minVal {number} minimum value 
 * @param maxVal {number} maximum value */
export function randomInt(minVal = 0, maxVal = 1) {
	return Math.round((Math.random()) * (maxVal + .9999 - minVal) + minVal - .5);
}

export function connecter(ns, targ) {
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

export function printArray(ns, thisArray, log = "terminal") {
	if (typeof thisArray !== 'object') {
		ns.tprint("Tried to print something that's not an iterable or a object");
	} else if (thisArray[Symbol.iterator]) {
		for (const value of thisArray) {
			if (log != "tail") ns.tprint(value);
			else ns.print(value);
		}
	} else {
		for (const [key, value] of Object.entries(thisArray)) {
			if (log != "tail") ns.tprint(`${key}: ${value}`);
			else ns.print(`${key}: ${value}`);
		}
	}
}

export function killAllButThis(ns) {
	var servers = getServers(ns);
	for (let i = 0; i < servers.length; i++) {
		if (servers[i] != "home") ns.killall(servers[i]);
	}
	let notThis = ns.ps("home");
	for (let i = notThis.length - 1; i >= 0; i--) {

		if (ns.getRunningScript().filename != notThis[i].filename) {
			ns.tprint(notThis[i]);
			ns.kill(notThis[i].filename, ns.getHostname(), ...notThis[i].args);
		}
	}
}

export function openPorts(ns, openPortsServers, files = ["/lib/hack.js", "/lib/weak.js", "/lib/grow.js"]) {
	for (let serv of openPortsServers) {
		ns.exec("/lib/ports.js", "home", 1, serv, ...files);
	}
}

/**Sort array of objects by some value
 * @param thisArray {array} array name
 * @param value {string} object's value to sort by
 * @param big {"big"|"small"} biggest or smallest first
 */
export function objectArraySort(ns, thisArray, value, big) { //objectArraySort(serversObjectArray, "freeRam", "big|small");
	if (big == "big") thisArray.sort((c1, c2) => (c1[value] < c2[value]) ? 1 : (c1[value] > c2[value]) ? -1 : 0);//biggest first
	if (big == "small") thisArray.sort((c1, c2) => (c1[value] > c2[value]) ? 1 : (c1[value] < c2[value]) ? -1 : 0);//smallest first
}

/** @param {NS} ns @param seconds @return HH:MM:SS*/
export function secondsToHMS(ns, s) {
	let time = {
		hours: ((s - s % 3600) / 3600) % 60,
		minutes: ((s - s % 60) / 60) % 60,
		seconds: s % 60
	}
	time.seconds = time.seconds.toFixed(0);
	return time.hours + ":" + time.minutes + ":" + time.seconds;
}

/** @param {NS} ns */
export function getServers(ns, root = 'home', found = new Set()) {
	// We add the current node to the found servers list
	found.add(root);
	// We then loop through the children of that server
	for (const server of ns.scan(root))
		// If it's not already in the list, skip it
		if (!found.has(server))
			// Otherwise, call the function recursively, passing the children as root, and our list of already found servers
			getServers(ns, server, found);
	// Returns found servers, the ... converts the Set to an Array
	return [...found];
}

/**@param {NS} ns @return {array} Array with server names that have more than 3GB of ram */
export function getServersWithRam(ns, ram = 3, root = 'home', found = new Set()) {
	found.add(root);
	for (const server of ns.scan(root))
		if (!found.has(server))
			getServers(ns, server, found);
	let targetArray = [];
	let servers = Array.from(found);
	for (let i = 0; i < servers.length; i++) {
		if (ns.getServerMaxRam(servers[i]) >= ram) {
			targetArray.push(servers[i]);
		}
	}
	return targetArray;
}

/** @param {NS} ns @return {array} Array with server names that have money*/
export function getServersWithMoney(ns, root = 'home', found = new Set()) {
	found.add(root);
	for (const server of ns.scan(root))
		if (!found.has(server))
			getServers(ns, server, found);
	let targetArray = [];
	let servers = Array.from(found);
	for (let i = 0; i < servers.length; i++) {
		if (ns.getServerMaxMoney(servers[i]) > 1000 && servers[i] != "home" && servers[i] != "fulcrumassets") {
			targetArray.push(servers[i]);
		}
	}
	return targetArray;
}