import {
    printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
    secondsToHMS, killAllButThis, connecter, randomInt, map, readFromJSON, writeToJSON, col, openPorts2, getBestFaction
}
    from '/lib/includes.js'

/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {
    ns.tail();
    const doc = eval("document");

    const logArea = [...doc.querySelectorAll(".react-draggable .react-resizable")].pop();
    logArea.children[1].style.display = "none";
    const text = doc.createElement("SPAN");
    text.id = "notCheat";
    logArea.style.backgroundColor = "#550055";
    logArea.style.color = "#20AB20";
    logArea.style.font = "32px Comic Sans MS";
    logArea.appendChild(text);
    ns.disableLog("ALL");
    text.innerHTML = "ns.singularity.getOwnedSourceFiles()";
}
