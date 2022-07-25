import {
    printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
    secondsToHMS, killAllButThis, connecter, randomInt, map, readFromJSON, writeToJSON, openPorts2, getBestFaction
}
    from '/lib/includes.js'

/** @param {NS} ns */
/** @param {import('..').NS} ns */
export async function main(ns) {
    let doc = eval("document");
    ns.tail();
    //  let logArea = [...doc.querySelectorAll(".react-draggable .react-resizable")].pop();
    let logArea = doc.querySelector(".react-draggable:last-child .react-resizable:last-child");
    logArea.style.width = "601px"; //default 500px
    logArea.style.height = "601px"; //default 500px


    //name=script name
    function resizeTail(name, width, height) {
        for (tail of globalThis['document'].querySelectorAll(`h6[title*="${name}"]`))
            if (tail.parentNode.parentNode.className == 'react-resizable') tail.parentNode.parentNode.setAttribute('style', `width: ${width}px; height: ${height}px;`)
    }
}