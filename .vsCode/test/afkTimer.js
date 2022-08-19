/** @param {NS} ns */

import { printArray } from '/lib/includes';

/** @param {import('../.').NS} ns */
export async function main(ns) {
    let awake = true,
        timeOutId;
    ns.tail();
    ns.disableLog("ALL");

    const timeOut = 1000; //1000ms = 1s inactivity
    const doc = eval("document"), win = eval("window");

    ns.atExit(() => { //if you don't have this, the eventListeners will be alive even when this script ends. And duplicates will be made when this is run again.
        doc.removeEventListener("mousemove", resetTimer, false);
        doc.removeEventListener("mousedown", resetTimer, false);
        doc.removeEventListener("keypress", resetTimer, false);
    })

    doc.addEventListener("mousemove", resetTimer, false);
    doc.addEventListener("mousedown", resetTimer, false);
    doc.addEventListener("keypress", resetTimer, false);
    startTimer();

    function startTimer() {
        timeOutId = win.setTimeout(doInactive, timeOut)
    }

    function doInactive() { //afk code goes here
        awake = false;
    }


    function resetTimer() { //this is run every time you move the mouse or press a key.
        awake = true;
        win.clearTimeout(timeOutId)
        startTimer();
    }

    while (true) {
        ns.clearLog();
        ns.print(awake ? "O_O" : "-_-");
        await ns.sleep(50);
    }
}