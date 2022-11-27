import {
    printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
    secondsToHMS, killAllButThis, connecter, map, readFromJSON, writeToJSON, openPorts2, getBestFaction, randomInt, col
}
    from '/lib/includes.js'



/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {

    const router = (server, route = [server]) => {
        while (route[0] != "home") {
            route.unshift(ns.scan(route[0])[0]);
        }

        return route;
    }

    ns.tprint(router("4sigma"));

    /* const servers = (function s(foundServers = [], thisServ = "home") {
         foundServers.push(thisServ);
         ns.scan(thisServ).forEach(serv => {
             if (!foundServers.includes(serv)) s(foundServers, serv);
         });
         return foundServers;
     })();
     */
    const servers = ((s = (foundServers = [], thisServ = "home") => {
        foundServers.push(thisServ);
        ns.scan(thisServ).forEach(serv => {
            if (!foundServers.includes(serv)) s(foundServers, serv);
        });
        return foundServers;
    }) => s())();

    //ns.tprint(servers);
}