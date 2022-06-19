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
    ns.tail();
    ns.disableLog("ALL");
    const pixX = 50, pixY = 30;
    let pixels = new Array(pixY);
    for (let i = 0; i < pixY; i++) {
        pixels[i] = new Array(pixX);
    }

    for (let y = 0; y < pixY; y++) {
        for (let x = 0; x < pixX; x++) {
            pixels[y][x] = ".";
        }
    }

    let x = 0, y = 0, xp = 1, yp = 1, iter = 0;

    while (true) {
        //clearDisplay();
        ns.clearLog();
        /*         x += xp;
                y += yp;
                if (x >= pixX - 1 || x < 1) xp *= -1;
                if (y >= pixY - 1 || y < 1) yp *= -1; */

        x = Math.floor(pixX / 4) + Math.round((Math.sin(iter) * 8));
        y = Math.floor(pixY / 2) + Math.round((Math.cos(iter) * 8));


        pixels[y][x] = "x";
        display();
        iter += .05
        if (iter > 3.15 * 2) ns.exit();
        await ns.sleep(100);
    }

    function clearDisplay() {
        for (let yy = 0; yy < pixY; yy++) {
            for (let xx = 0; xx < pixX; xx++) {
                pixels[yy][xx] = ".";
            }
        }
    }
    function display() {
        for (let yy = 0; yy < pixY; yy++) {
            ns.print(...pixels[yy]);
        }
    }

}