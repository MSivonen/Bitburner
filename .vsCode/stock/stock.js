import { printArray } from "/lib/includes.js"
//import { openPorts } from "/lib/includes.js"
import { objectArraySort } from "/lib/includes.js"
//import { getServers } from "/lib/includes.js"
//import { getServersWithRam } from "/lib/includes.js"
//import { getServersWithMoney } from "/lib/includes.js"
//import { secondsToHMS } from "/lib/includes.js"

/** @param {NS} ns */
export async function main(ns) {
	let symbols = ns.stock.getSymbols();
	let stockObjects = [];
	let owned = [];

	for (let sym of symbols) {
		let tempObject = {
			name: sym,
			price: ns.stock.getPrice(sym),
			forecast: ns.stock.getForecast(sym)
		}
		stockObjects.push(tempObject);
	}
	objectArraySort(ns, stockObjects, "forecast", "big");
	printArray(ns, stockObjects);

	while (true) {
		for (let sto of stockObjects) {
			sto.price = ns.stock.getPrice(sto.name);
			sto.forecast = ns.stock.getForecast(sto.name);
		}
		objectArraySort(ns, stockObjects, "forecast", "big");
		if (ns.getServerMoneyAvailable("home") > 1000000000) {
			for (let i = 0; i < stockObjects.length; i++) {
				if (ns.stock.getForecast(stockObjects[i].name) > 0.62) {
					let amount = (ns.getServerMoneyAvailable("home") * 0.8) / ns.stock.getPrice(stockObjects[i].name);
					amount = amount > ns.stock.getMaxShares(stockObjects[i].name) ? ns.stock.getMaxShares(stockObjects[i].name) : amount;
					ns.stock.buy(stockObjects[i].name, amount);
					let removed = stockObjects.splice(i, 1);
					owned.push(removed[0]);
				}
			}
		}
		for (let i = 0; i < owned.length; i++) {
			if (ns.stock.getForecast(owned[i].name) < 0.5) {
				ns.stock.sell(owned[i].name, 9999999999999999999999999);
				let removed = (owned.splice(i, 1));
				stockObjects.push(removed[0]);
			}
		}
		ns.clearLog();
		printArray(ns, owned, "log");
		await ns.sleep(1000);
	}
}