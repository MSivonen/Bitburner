import { readFromJSON } from "/lib/includes"
import { printArray } from "/lib/includes.js"
import { openPorts } from "/lib/includes.js"
import { objectArraySort } from "/lib/includes.js"
import { getServers } from "/lib/includes.js"
import { getServersWithRam } from "/lib/includes.js"
import { getServersWithMoney } from "/lib/includes.js"
//import { secondsToHMS } from "/lib/includes.js"
//import { killAllButThis } from "/lib/includes.js"
//import { connecter } from "/lib/includes.js"
import { randomInt } from "/lib/includes.js"
import { map } from "/lib/includes.js"
//import { readFromJSON } from "/lib/includes.js"
//import { writeToJSON } from "/lib/includes.js"

/** @param {NS} ns */
/** @param {import("../.").NS} ns */
export function main(ns, serv) {
    const playerObject = ns.getPlayer(),
        serverObject = ns.getServer("foodnstuff"),
        cores = serverObject.cpuCores;

    let newMoney = 0,
        prevThreads,
        minGuess = 1,
        maxGuess = 2,
        foundBiggest = false,
        threads = 1,
        foundThreads = false,
        iter = 0;

    serverObject.hackDifficulty = serverObject.minDifficulty;
    serverObject.moneyAvailable = serverObject.moneyMax * .75;
    while (!foundThreads) {
        iter++;
        if (minGuess == maxGuess) foundThreads = true;
        prevThreads = threads; //previous guess
        let serverGrowth = ns.formulas.hacking.growPercent(serverObject, threads, playerObject, cores);
        newMoney = (serverObject.moneyAvailable + threads) * serverGrowth;
        if (!foundBiggest && newMoney < serverObject.moneyMax) maxGuess *= 16; else foundBiggest = true; //first find a too big number
        if (newMoney >= serverObject.moneyMax) { //if too much threads, set maxGuess to this and lower the guess
            maxGuess = threads;
            threads = Math.ceil(minGuess + (maxGuess - minGuess) / 2);
        } else {//if not enough threads, set minGuess to this and raise the guess
            minGuess = threads;
            threads = Math.ceil(minGuess + (maxGuess - minGuess) / 2);
        }
        minGuess = minGuess + 1 == maxGuess ? maxGuess : minGuess; //offset 1 to make it work
        ns.tprint("Server: " + serv + ", Guess: " + ns.nFormat(newMoney, "0.000a") + ", maxMoney: " + ns.nFormat(serverObject.moneyMax, "0.000a") + ", threads: " + threads + " iterations: " + iter);
    }
    return threads;
}