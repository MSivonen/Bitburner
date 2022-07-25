import {
    printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
    secondsToHMS, killAllButThis, connecter, map, readFromJSON, writeToJSON, openPorts2, getBestFaction, randomInt, col
}
    from '/lib/includes.js'



/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {
    ns.tprint(col.bk + "black " +
        col.r + "red " +
        col.g + "green " +
        col.y + "yellow " +
        col.b + "blue " +
        col.m + "magenta " +
        col.c + "cyan " +
        col.w + "white " +
        col.off + "default " +
        col.underline + "underline " +
        col.bold + "bold ")
    ns.tprint("\x1b[1m" + "test")
}
