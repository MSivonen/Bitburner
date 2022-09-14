import {
    printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
    secondsToHMS, killAllButThis, connecter, randomInt, map, readFromJSON, writeToJSON, openPorts2, getBestFaction
}
    from '/lib/includes.js'

/** @param {import('../.').NS} ns */
export async function main(ns) {
    class Testclass {
        constructor(text_) {
            this.text = text_;
        }

        show() {
            return this.text + "xxx";
        }

        outside() {
            return text;
        }

        nope() {
            return text_;
        }
    }

    let testingInClass = new Testclass("Hello");
    let text = "outside of class";

    ns.tprint(testingInClass.text);
    ns.tprint(testingInClass.show());
    ns.tprint(text);
    ns.tprint(testingInClass.outside());
    ns.tprint(testingInClass.nope());
}