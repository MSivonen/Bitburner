import {
    printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
    secondsToHMS, killAllButThis, connecter, map, readFromJSON, writeToJSON, openPorts2, getBestFaction, randomInt, col
}
    from '/lib/includes.js'



/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {
    const col = {
        "r": "\x1b[31m",
        "g": "\x1b[32m",
        "b": "\x1b[34m",
        "c": "\x1b[36m",
        "m": "\x1b[35m",
        "y": "\x1b[33m",
        "bk": "\x1b[30m",
        "w": "\x1b[37m",
        "bgr": "\x1b[41m",
        "bgg": "\x1b[42m",
        "bgb": "\x1b[44m",
        "bgc": "\x1b[46m",
        "bgm": "\x1b[45m",
        "bgy": "\x1b[43m",
        "bgbk": "\x1b[40m",
        "bgw": "\x1b[47m",
        "off": "\x1b[0m",
        "bold": "\x1b[1m",
        "italic": "\x1b[3m", //nope
        "underline": "\x1b[4m",
        "blink": "\x1b[5m", //nope
        "invert": "\x1b[7m", //nope
        "concealed": "\x1b[8m" //nope
    }

    //basic colors
    ns.tprint(((b = "") => {
        for (const a of Object.keys(col))
            b += col[a] + a + " ";
        return b;
    })());

    const startTime = performance.now();
    ns.tprint(((b = "\n") => { //256 colors foreground
        for (let i = 0; i < 256; i++) {
            b += "\x1b[38;5;" + i + "m" + "i";
            i != 0 && i % 16 == 0 ? b += "\n" : null;
        }
        return b;
    })());
    ns.tprint(((b = "\n") => {//256 colors background
        for (let i = 0; i < 256; i++) {
            b += " \x1b[48;5;" + i + "m" + ns.nFormat(i, "000");
            i != 0 && i % 16 == 0 ? b += "\n" : null;//wtf
        }
        return b;
    })());
    ns.tprint(performance.now() - startTime);
}