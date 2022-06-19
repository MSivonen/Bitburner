import { printArray } from "/lib/includes.js"
//import { openPorts } from "/lib/includes.js"
import { objectArraySort } from "/lib/includes.js"
//import { getServers } from "/lib/includes.js"
import { getServersWithRam } from "/lib/includes.js"
import { getServersWithMoney } from "/lib/includes.js"
//import { secondsToHMS } from "/lib/includes.js"
/** @param {NS} ns **/
export async function main(ns) {
	const doc = eval("document");
	const hook0 = doc.getElementById('overview-extra-hook-0');
	const hook1 = doc.getElementById('overview-extra-hook-1');
	var servers = getServersWithMoney(ns);
	let roller = ["0Ooo", "O0Oo", "oO0O", "ooO0", "oooO", "Oooo"];
	let rollerIndex = 0;

	var serverObjects = [];

	for (let serv of servers) {
		let tempServ = {
			name: serv,
			mani: ns.getServerMaxMoney(serv)
		}

		serverObjects.push(tempServ);
	}
	printArray(ns, serverObjects);

	objectArraySort(ns, serverObjects, "mani", "big");
	while (true) {
		try {
			const headers = []
			const values = [];

			for (let serv of serverObjects) {
				headers.push(serv.name);
				let mani = ns.getServerMoneyAvailable(serv.name);
				let maxmani = ns.getServerMaxMoney(serv.name);

				if (mani > 1000000000) {
					mani /= 1000000000;
					let decimals = mani > 10 ? 0 : 1;
					mani = mani.toFixed(decimals) + "b";
				} else if (mani > 1000000) {
					mani /= 1000000;
					let decimals = mani > 10 ? 0 : 1;
					mani = mani.toFixed(decimals) + "M";
				} else {
					mani /= 1000;
					let decimals = mani > 10 ? 0 : 1;
					mani = mani.toFixed(decimals) + "k";
				}
				
				if (maxmani > 1000000000) {
					maxmani /= 1000000000;
					let decimals = maxmani > 10 ? 0 : 1;
					maxmani = maxmani.toFixed(decimals) + "b";
				} else if (maxmani > 1000000) {
					maxmani /= 1000000;
					let decimals = maxmani > 10 ? 0 : 1;
					maxmani = maxmani.toFixed(decimals) + "M";
				} else {
					maxmani /= 1000;
					let decimals = maxmani > 10 ? 0 : 1;
					maxmani = maxmani.toFixed(decimals) + "k";
				}


				values.push(mani + "/" + maxmani);
			}


			headers.push("Money");
			values.push(ns.getScriptIncome()[0].toPrecision(2) + '/sec');


			let servers = getServersWithRam(ns);
			let tempFreeRam = 0;
			let tempTotalRam = 0;
			for (let serv of servers) {
				tempFreeRam += ns.getServerMaxRam(serv) - ns.getServerUsedRam(serv); //10% safety reserve ram
				tempTotalRam += ns.getServerMaxRam(serv);
			}
			let freegb = "GB";
			let totalgb = "GB";
			let perce = tempFreeRam / tempTotalRam * 100;
			if (tempTotalRam > 10000000) {
				tempTotalRam /= 1000000;
				totalgb = "PB";
			} if (tempTotalRam > 10000) {
				tempTotalRam /= 1000;
				totalgb = "TB";
			}
			if (tempFreeRam > 10000000) {
				tempFreeRam /= 1000000;
				freegb = "PB";
			} if (tempFreeRam > 10000) {
				tempFreeRam /= 1000;
				freegb = "TB";
			}

			let memBar = "[";
			for (let i = 0; i < 15; i++) {
				if ((perce - 3) * 0.15 <= i) memBar += "|";
			}
			for (let i = 0; i < 15; i++) {
				if ((perce - 3) * 0.15 > i) memBar += "-";
			}
			memBar += "]";

			let decimalFree = tempFreeRam < 100 ? 1 : 0;
			let decimalTotal = tempTotalRam < 100 ? 1 : 0;

			headers.push("RAM: " + tempTotalRam.toFixed(decimalTotal) + totalgb);
			values.push(Math.round(perce) + "% free");
			headers.push(memBar);
			rollerIndex++;
			values.push(roller[rollerIndex % 6]);

			// TODO: Add more neat stuff

			// Now drop it into the placeholder elements
			hook0.innerText = headers.join(" \n");
			hook1.innerText = values.join("\n");
		} catch (err) { // This might come in handy later
			ns.print("ERROR: Update Skipped: " + String(err));
		}
		await ns.sleep(150);
		ns.atExit(() => { hook0.innerHTML = ""; hook1.innerHTML = ""; });
	}

}