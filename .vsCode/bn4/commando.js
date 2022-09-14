import {
    printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
    secondsToHMS, killAllButThis, connecter, randomInt, map, readFromJSON, writeToJSON, openPorts2, getBestFaction
}
    from '/lib/includes.js'

/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {
    const allFiles = [ //copy these to all servers
        "/lib/includes.js",
        "/ver6/hack6.js",
        "/ver6/grow6.js",
        "/ver6/weak6.js",


    ]

    await copyFiles();

    while (true != !true) {


        await ns.sleep(20);
    }

    function spendMoney() {
        graftAug();
        buyServers();
    }

    function busy() {
        if (ns.singularity.getCurrentWork() != null)
            if (ns.singularity.getCurrentWork().type == "GRAFTING") return true;

        return false;
    }

    function graftAug(type_ = "rep") {
        if (busy) return;
        let type = type_ == "rep" ? "faction_rep" : "hacking";
        let augs = ns.grafting.getGraftableAugmentations().
            filter(a => ns.singularity.getAugmentationStats(a)[type] > 1).
            sort((a, b) => ns.grafting.getAugmentationGraftPrice(b) - ns.grafting.getAugmentationGraftPrice(a));
        if (!ns.singularity.travelToCity("New Tokyo")) return;

        //augs.forEach(a => ns.tprint(a + " " + ns.nFormat(ns.grafting.getAugmentationGraftPrice(a), "0.00a")));

        for (const a of augs)
            if (ns.grafting.graftAugmentation(a, true))
                return;
    }

    async function copyFiles() {
        getServers(ns).forEach(serv => ns.scp(allFiles, serv));
    }


    function buyServers(maxRam = ns.getPurchasedServerMaxRam()) {
        const maxServers = ns.getPurchasedServerLimit();
        if (maxServers == 0) return;
        let ram,
            biggestServer,
            smallestServer,
            serversOA = [];
        let buy = false;
        let allPservers = ns.getPurchasedServers();
        if (allPservers.length > 0) {
            allPservers.forEach(s => { serversOA.push({ name: s, ram: ns.getServerMaxRam(s) }) });
            biggestServer = serversOA.reduce((prev, current) => (prev.ram > current.ram) ? prev : current);
            smallestServer = serversOA.reduce((prev, current) => (prev.ram < current.ram) ? prev : current);
        }

        if (biggestServer == undefined) ram = 32; //no pservers
        else ram = biggestServer.ram;

        while (ram < maxRam && ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram * 2)) {
            ram *= 2; //increase ram until happy
            buy = true;
            if (ram >= maxRam) {
                ram = maxRam;
            }
        }
        if (smallestServer != undefined)
            if (ram == smallestServer.ram) return;

        if (buy) {
            if (serversOA.length == maxServers) {
                ns.killall(smallestServer.name);
                ns.deleteServer(smallestServer.name);
            }
            let servNumbers = [];
            for (const s of serversOA)
                servNumbers.push(Number(s.name.substring(7)));
            let servNumber = 0;
            for (let i = 0; i < maxServers; i++)
                if (!servNumbers.includes(i)) {
                    servNumber = i;
                    break;
                }
            if (ns.purchaseServer("perkele" + servNumber, ram) != "") {
                ns.tprint("Purchased perkele" + servNumber + " with " + ram + "GB of ram.");
            }
            else ns.tprint("ERROR something went wrong purchasing server. Perkele. Money needed: " +
                ns.nFormat(ns.getPurchasedServerCost(ram), "0.00a"));
        }
    }
}