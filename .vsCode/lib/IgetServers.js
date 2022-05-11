/** @param {NS} ns 
 * @typedef {getServers} Get all servers
*/
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