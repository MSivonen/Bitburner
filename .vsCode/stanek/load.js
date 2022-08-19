import {
    printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
    secondsToHMS, killAllButThis, connecter, randomInt, map, readFromJSON, writeToJSON, openPorts2, getBestFaction
}
    from '/lib/includes.js'

/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {
    let file;
    const path = "/stanek/" + ns.stanek.giftWidth() + "x" + ns.stanek.giftHeight() + "/";

    if (ns.args.length == 0) {
        file = await ns.prompt("Select file to load", {
            type: "select",
            choices: ns.ls("home", path).filter((f) => f.includes(".txt"))
        });
    } else file = path + ns.args[0] + ".txt";
    if (!ns.fileExists(file)) {
        ns.tprint("File " + file + " not found");
        return;
    }

    let tetris = readFromJSON(ns, (file));

    ns.stanek.clearGift();
    for (const p of tetris) {
        ns.stanek.placeFragment(p.x, p.y, p.rotation, p.id)
    }
    ns.tprint("Stanek tetris " + file + " assembled.")
}