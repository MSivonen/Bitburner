import {
    printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
    secondsToHMS, killAllButThis, connecter, map, readFromJSON, writeToJSON, openPorts2, getBestFaction, randomInt, col
}
    from '/lib/includes.js'



/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {

    const router = (server) => {
        let route = [server]
        while (server != "home") {
            route.unshift(server = ns.scan(server)[0]);
        }
        return route.join("; connect ");
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

    ns.tprint(servers);
}