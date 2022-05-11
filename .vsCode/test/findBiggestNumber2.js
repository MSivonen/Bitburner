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
/** @param {import("..").NS} ns */
export async function main(ns) {

    let playerObject = ns.getPlayer();
    let cores = 1;
    let servers = getServersWithMoney(ns);
    let totalIter = 0;

    for (let serv of servers) {
        let newMoney = 0;
        let prevThreads;
        let minGuess = 1;
        let maxGuess = 2;
        let iter = 0;
        let foundBiggest = false;
        let threads = 1;
        let foundThreads = false;
        let serverObject = ns.getServer(serv);

        serverObject.hackDifficulty = serverObject.minDifficulty;
        serverObject.moneyAvailable = serverObject.moneyAvailable;
        while (!foundThreads) {
            totalIter++;
            if (prevThreads == threads) foundThreads = true;
            prevThreads = threads;
            let serverGrowth = ns.formulas.hacking.growPercent(serverObject, threads, playerObject, cores);
            newMoney = (serverObject.moneyAvailable + threads) * serverGrowth;
            if (!foundBiggest && newMoney < serverObject.moneyMax) maxGuess *= 16; else foundBiggest = true;
            if (newMoney >= serverObject.moneyMax) {
                maxGuess = threads;
                threads = Math.ceil(minGuess + (maxGuess - minGuess) / 2);
            } else {
                minGuess = threads;
                threads = Math.ceil(minGuess + (maxGuess - minGuess) * 2);
            }
            iter++;
            ns.tprint("Server: " + serv + ", Guess: " + ns.nFormat(newMoney, "0.000a") + ", maxMoney: " + ns.nFormat(serverObject.moneyMax, "0.000a") + ", threads: " + threads + " iterations: " + iter);
            await ns.sleep(1);
            if (iter > 60) {
                ns.tprint("ERROR Server: " + serv + ", Guess: " + ns.nFormat(newMoney, "0.000a") + ", maxMoney: " + ns.nFormat(serverObject.moneyMax, "0.000a") + ", threads: " + threads + " iterations: " + iter);
                ns.exit();
            }
        }
        ns.tprint("Return threads: " + threads);
    }
    ns.tprint("Total iter: " + totalIter);
}