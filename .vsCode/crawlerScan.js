/** @param {NS} ns */
export async function main(ns) { //init - give some arg to init the list
	let init = ns.args[0];
	let serversJSON = {};
	const jsonFile = "serversJSON.txt";
	const thisFile = "crawlerScan.js";

	const thisServer = ns.getServer().hostname;
	ns.tprint("INFO: " + thisServer);
	if (!init) { //initialize
		serversJSON = {};
		await writeToJSON();
		init = true;
	}
	if (thisServer != "home") await ns.scp(jsonFile, "home", thisServer); //get the json here
	serversJSON = await readFromJSON();

	if (init && !Object.keys(serversJSON).includes(thisServer)) { //have we been here?
		serversJSON[thisServer] = thisServer;  //add thisServer to json
		await writeToJSON();
		await ns.scp(jsonFile, thisServer, "home"); //copy the json to home

		for (let serv of ns.scan()) {
			ns.tprint("ERROR " + serv);
			await ns.scp(thisFile, thisServer, serv); //copy and exec this file to new server
			ns.tprint("ERROR exists: " + ns.fileExists(thisFile, serv));
			ns.exec(thisFile, serv, 1, true);
			await ns.sleep(500); //give the previous script a bit time to exec
		}
	}

	ns.tprint(await readFromJSON());
	if (thisServer != "home") ns.rm(jsonFile);

	async function readFromJSON(filename = jsonFile) {
		let readed = await ns.read(filename);
		return JSON.parse(readed);
	}

	async function writeToJSON(jsonObject = serversJSON, filename = jsonFile) {
		let toWrite = JSON.stringify(jsonObject);
		await ns.write(filename, toWrite, "w");
	}
}