import {
    printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
    secondsToHMS, killAllButThis, connecter, randomInt, map, readFromJSON, writeToJSON, openPorts2, getBestFaction
}
    from '/lib/includes.js'

/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {
    let file = "";
    const path = "/stanek/" + ns.stanek.giftWidth() + "x" + ns.stanek.giftHeight() + "/";
    if (ns.args.length == 0) {
        file = await ns.prompt("Select file to overwrite", {
            type: "select",
            choices: [...ns.ls("home", path), "new file", "cancel"]
        });
    } else file = path + ns.args[0] + ".txt";

    if (file == "new file") {
        file = path + await ns.prompt("Input file name, or empty to cancel", { type: "text" }) + ".txt";
    }
    if (file == "" || file == "cancel") { ns.tprint("File not saved"); return; }

    if (ns.fileExists(file)) {
        if (!await ns.prompt("File exists, overwrite?")) {
            ns.tprint("File not saved");
            return;
        }
    }
    await writeToJSON(ns, ns.stanek.activeFragments(), file);
    ns.tprint("Stanek Tetris saved to " + file);
}