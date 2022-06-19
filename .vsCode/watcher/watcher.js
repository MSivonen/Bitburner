/** @param {NS} ns */

import { getServers } from '/lib/includes';

/** @param {import('..').NS} ns */
export async function main(ns) {
    const doc = eval("document");
    let textArea = doc.querySelectorAll(".react-draggable:first-of-type")[0]; //find overview
    if (!textArea.textContent.includes("***")) { //check if this script haven't been run, probably maybe.
        let text = doc.createTextNode("Someone fucked up something.\nProbably you.");
        textArea.style = "white-space:pre; font-family: 'Lucida Console'; color: #20AB20; font-size: 10px; text-align: center";
        textArea.appendChild(text);
    }

    ns.disableLog("ALL");
    const pixX = 40, pixY = 80, //print area 20 cols, 80 rows
        gravity = .2, //constant for all particles
        empty = ""; //empty character
    let pixels = new Array(pixY), //init print area. Characters are treated as pixels
        pixelsCA = [],
        floor = pixY - 5, //where the text lands
        index = 0;

    for (let i = 0; i < pixY; i++) {
        pixels[i] = new Array(pixX);
    }
    for (let y = 0; y < pixY; y++) {
        for (let x = 0; x < pixX; x++) {
            y == pixY - 1 ? pixels[y][x] = "*" : pixels[y][x] = empty;
        }
    }

    class Pixel {
        /**@param x_ {number} starting x-coordinate 
         * @param y_ {number} starting y-coordinate
         * @param char_ {character} character to print
         * @param floor_ {number} where's the floor now.. Probably -1 from the last line
         * @param index_ unique identifier for every text line, for floor level changing
        */
        constructor(x_, y_, char_, floor_, index_) {
            this.x = x_;
            this.y = y_;
            this.char = char_;
            this.velY = 0; //velocity Y
            this.accY = 0; //acceleration Y
            this.floor = floor_;
            this.atFloor = false;
            this.alive = true; //set to false for garbage collector
            this.dropped = false;
            this.drop = false;
            this.index = index_;
        }

        update() {
            if (this.x == 2 && this.index == 4) ns.print(this.drop + this.char + "atfloor" + this.atFloor);
            this.setPos();
            this.draw();
        }

        setPos() {
            this.accY += gravity;
            this.velY += this.accY
            this.y += this.velY;
            this.accY = 0;
            if (this.y >= this.floor) {
                this.y = this.floor - 1;
                this.velY = 0;
                this.atFloor = true;
            }
            if (!this.dropped && this.drop) {
                if (this.x == 0) { //triggers once per text line
                    floor++; //move the floor of new lines +1 down
                    for (let i = 0; i < pixelsCA.length; i++) {
                        for (let j = 0; j < pixelsCA[i].length; j++) { //move the floor of existing lines +1 down
                            pixelsCA[i][j].floor++;
                            pixelsCA[i][j].atFloor = false;
                        }
                    }
                }
                this.atFloor = false;
                this.floor = 99e99;
                this.dropped = true; //don't run this if again
            }
            if (this.y >= pixY) this.alive = false; //this char went below print area, kill it
        }

        draw() { //if inside print area, put it into pixels array
            if (this.x >= 0 && this.y >= 0 && this.x <= pixX - 1 && this.y <= pixY - 1) {
                pixels[Math.floor(this.y)][Math.floor(this.x)] = this.char;
            }
        }
    }

    let prevTime = ns.getTimeSinceLastAug(),
        iter = 0;

    const logPort = ns.getPortHandle(1); //string
    const sleevePort = ns.getPortHandle(2); //array

    while (true) {
        clearDisplay();
        while (!logPort.empty()) {
            makeTextLine(logPort.read());
            iter++;
            floor--;
            prevTime = ns.getTimeSinceLastAug();
        }
        for (let i = pixelsCA.length - 1; i >= 0; i--) {
            for (let j = pixelsCA[i].length - 1; j >= 0; j--) {
                pixelsCA[i][j].update();
                if (!pixelsCA[i][j].alive) {
                    pixelsCA[i].splice(j, 1);
                }
                if (pixelsCA[i].length == 0) pixelsCA.splice(i, 1);
            }
            if (pixelsCA.length > 5) {
                for (const pix of pixelsCA[0]) {
                    pix.drop = true;
                }
            }
        }
        ns.atExit(() => { textArea.removeChild(textArea.lastChild) });
        display();
        await ns.sleep(20);
    }

    function makeTextLine(textLine) {
        pixelsCA.push([]);
        for (let i = 0; i < textLine.length; i++) {
            pixelsCA[pixelsCA.length - 1].push(new Pixel(i, -1, textLine[i], floor, index));
        }
        index++;
    }

    function clearDisplay() { //Fill the array with empty chars
        for (let yy = 0; yy < pixY; yy++) {
            for (let xx = 0; xx < pixX; xx++) {
                yy == pixY - 1 ? pixels[yy][xx] = "*" : pixels[yy][xx] = empty; //last line must be "***" for the check at the top^
            }
        }
    }

    function display() {//make a single string from pixels array
        let data = "";
        for (let yy = 0; yy < pixY; yy++) {
            for (let xx = 0; xx < pixX; xx++) {
                data += pixels[yy][xx];
            }
            data += "\n"; //go to next row (next y-coordinate)
        }
        textArea.lastChild.nodeValue = data; //display the string
    }
}