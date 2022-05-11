import { printArray } from "/lib/includes.js"
//import { openPorts } from "/lib/includes.js"
//import { objectArraySort } from "/lib/includes.js"
//import { getServers } from "/lib/includes.js"
//import { getServersWithRam } from "/lib/includes.js"
//import { getServersWithMoney } from "/lib/includes.js"
import { secondsToHMS } from "/lib/includes.js"

/** @param {NS} ns */
export async function main(ns) {
	let randTest = 0;
	let randArr = []
	let iter = 10000000;
	for (let ind = 0; ind < 211; ind++) {
		randArr[ind] = 0;
	}
	for (let i = 0; i < iter; i++) {
		let randomNum = randomInt(-100, 100)
		randTest += randomNum;
		randArr[randomNum + 105]++;
	}
	ns.tprint("ERROR " + randTest / iter);
	for (let ind = 0; ind < 211; ind++) {
		ns.tprint(ind - 105 + ": " + randArr[ind]);
	}


	/**Random int between minVal and maxVal
	 * @param minVal {number} minimum value 
	 * @param maxVal {number} maximum value */
	function randomInt(minVal = 0, maxVal = 1) {
		return Math.round((Math.random()) * (maxVal + .9999 - minVal) + minVal - .5);
	}

	function map(number, inMin, inMax, outMin, outMax) {
		return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
	}
}