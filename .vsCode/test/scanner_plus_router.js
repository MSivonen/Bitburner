import {
    printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
    secondsToHMS, killAllButThis, connecter, map, readFromJSON, writeToJSON, openPorts2, getBestFaction, randomInt, col
}
    from '/lib/includes.js'



/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {

    const router = (server) => {
        let route = [server];
        while (server != "home") {
            route.unshift(server = ns.scan(server).shift());
        }
        return "\n\x1b[34m"+ route.join(";\n\x1b[37m connect \x1b[34m");
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