import { readFromJSON } from '/lib/includes'
import { printArray } from '/lib/includes.js'
import { openPorts } from '/lib/includes.js'
import { objectArraySort } from '/lib/includes.js'
import { getServers } from '/lib/includes.js'
import { getServersWithRam } from '/lib/includes.js'
import { getServersWithMoney } from '/lib/includes.js'
//import { secondsToHMS } from '/lib/includes.js'
//import { killAllButThis } from '/lib/includes.js'
//import { connecter } from '/lib/includes.js'
import { randomInt } from '/lib/includes.js'
import { map } from '/lib/includes.js'
//import { readFromJSON } from '/lib/includes.js'
//import { writeToJSON } from '/lib/includes.js'

/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {

    for (let i = 0; i < 20; i++)    ns.tprint(randomName());


    function randomName() {
        let name = "";
        let nameLength = 2 + randomInt(3);
        let syllableFirst = [],
            syllableLast = [],
            syllableMiddle = [],
            syllableSingle = [];

        makeSyllables();

        if (randomInt(syllableSingle.length + syllableFirst.length) > syllableFirst.length) {
            name += syllableSingle[randomInt(syllableSingle.length - 1)];
        } else {
            name += syllableFirst[randomInt(syllableFirst.length - 1)];
        }

        for (let i = 0; i < nameLength - 2; i++) {
            name += syllableMiddle[randomInt(syllableMiddle.length - 1)];
        }
        name += syllableLast[randomInt(syllableFirst.length - 1)];

        name = name[0].toUpperCase() + name.substring(1);

        return name;

        function makeSyllables() {
            const allWords = ns.read("/test/dictionary.txt");
            const words = allWords.split("\r\n");
            for (const word of words) {
                let tempSyllables = word.split(";");
                if (tempSyllables.length == 1) syllableSingle.push(...tempSyllables);
                else {
                    syllableLast.push(tempSyllables.pop())
                    syllableFirst.push(tempSyllables.shift());
                    syllableMiddle.push(...tempSyllables);
                }
            }
        }
    }
}