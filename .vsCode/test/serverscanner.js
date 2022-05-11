/** @param {NS} ns */
export async function main(ns) {
	function thisIsAOneLinerServScanFunctionNoMatterWhatPeopleSay(serv = "home", found = []) { //start from home with empty array
		found.push(serv); //push this server to array
		let scanned = ns.scan(serv);
		while (scanned.length > 0) {
			const search = scanned.shift(); //joink the first server and save it to var
			let iAlreadyHaveThis = false;
			for (const f of found) {
				if (f == search) iAlreadyHaveThis = true;
			}
			if (!iAlreadyHaveThis) thisIsAOneLinerServScanFunctionNoMatterWhatPeopleSay(search, found); //If it's not in the found array, go there and do some more scanning
		}
		return (found); //gimme gimme
	}
	ns.tprint(thisIsAOneLinerServScanFunctionNoMatterWhatPeopleSay().length);
}


/* export function getServers(ns, root = 'home', found = new Set()) {
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
} */