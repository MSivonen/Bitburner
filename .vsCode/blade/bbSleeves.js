import {
    printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
    secondsToHMS, killAllButThis, connecter, randomInt, map, readFromJSON, writeToJSON, openPorts2, getBestFaction, col
}
    from '/lib/includes.js'

/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {

    for (let i = 0; i < 8; i++) {
        ns.sleeve.setToCommitCrime(i, "mug");
    }

    ns.disableLog("ALL");
    const opTime = 61200;
    const slvDelay = 1000;
    const slaves = [];
    class Slave {
        constructor(number) {
            this.slvNum = number;
            this.startTime = Infinity;
            this.prevTime = Infinity;
            this.infiltrating = false;
            this.task = "waiting..";
        }

        update() {
            if (this.infiltrating) {
                if (this.prevTime + opTime < ns.getTimeSinceLastAug()) {
                    ns.sleeve.setToCommitCrime(this.slvNum, "mug");
                    this.infiltrating = false;
                    this.task = "a mug.";
                }
            } else {
                if (this.startTime <= ns.getTimeSinceLastAug()) {
                    ns.sleeve.setToBladeburnerAction(this.slvNum, "Infiltrate synthoids");
                    this.infiltrating = true;
                    this.prevTime = ns.getTimeSinceLastAug();
                    this.startTime = Infinity;
                    this.task = "infiltrating.";
                }
            }
        }

        go() {
            this.startTime = ns.getTimeSinceLastAug() + this.slvNum * slvDelay;
        }
    }

    for (let i = 0; i < 8; i++) {
        slaves.push(new Slave(i));
    }

    while (42) {
        if (slaves.every(s => !s.infiltrating)) {
            slaves.forEach(s => s.go());
        }
        slaves.forEach(s => s.update());

        ns.clearLog();
        slaves.forEach(s => {
            ns.print("Slave " +
                s.slvNum +
                " is " +
                s.task);
        });
        await ns.sleep(5);
    }
}