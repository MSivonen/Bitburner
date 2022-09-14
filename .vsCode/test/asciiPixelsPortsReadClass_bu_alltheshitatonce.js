/** @param {NS} ns */

import { printArray } from '/lib/includes';

/** @param {import('..').NS} ns */
export async function main(ns) {
    ns.tail();
    let doc = eval("document");
    const portNumber = 8;

    let logArea = [...doc.querySelectorAll(".react-draggable .react-resizable")].pop();
    logArea.children[1].style.display = "none";
    let text = doc.createElement("span");
    logArea.style = "white-space:pre; font-family: 'Lucida Console'; color: #20AB20; font-size: 12px; text-align: center; background-color: black";
    logArea.appendChild(text);

    ns.disableLog("ALL");
    let pixX = 78, pixY = 37,
        logPort = ns.getPortHandle(8),
        logText = "",
        logArray = [],
        pixelsCA = [];
    text.innerHTML = "Waiting for port " + portNumber;

    logPort.clear();
    while (logPort.empty()) await ns.sleep(50);
    while (!logPort.empty()) {
        logText = logPort.read();
        await ns.sleep(1);
    }

    /*  for (let i = 0; i < logText.length; i++) {
          if (logText[i] == "┐") {
              pixX = i + 1;
              pixY = logText.length / pixX;
              break;
          }
      }
  
  */
    let pixels = new Array(pixY);
    const chars = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOOPASDFGHJKLZXCVBNM",
        gravity = .2, //constant for all particles
        empty = ""; //empty character

    for (let i = 0; i < pixY; i++) {
        pixels[i] = new Array(pixX);
    }
    for (let y = 0; y < pixY; y++) {
        for (let x = 0; x < pixX; x++) {
            pixels[y][x] = ".";
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
            this.velX = 0; //velocity X
            this.accX = 0; //acceleration X
            this.floor = floor_;
            this.atFloor = false;
            this.alive = true; //set to false for garbage collector to pick it up
            this.dropped = false;
            this.drop = false;
            this.index = index_;
        }

        update() {
            //if (this.x == 2 && this.index == 4) ns.print(this.drop + this.char + "atfloor" + this.atFloor); //debug print
            this.setPos();
            this.draw();
        }

        setPos() {
            this.accY += gravity;
            this.velY += this.accY
            this.y += this.velY;
            this.accY = 0;
            this.velX += this.accX;
            this.x += this.velX;
            this.accX = 0;
            if (this.y > this.floor) {
                this.y = this.floor;
                this.velY = 0;
                this.atFloor = true;
            }
            if (!this.dropped && this.drop) {
                if (this.x == 0) { //triggers once per text line
                    //floor++; //move the floor of new lines +1 down
                    for (let i = 0; i < pixelsCA.length; i++) {
                        for (let j = 0; j < pixelsCA[i].length; j++) { //move the floor of existing lines +1 down
                            pixelsCA[i][j].floor++;
                            pixelsCA[i][j].atFloor = false;
                        }
                    }
                }
                this.atFloor = false;
                this.floor = 99e99;
                this.boom();
                this.dropped = true; //don't run this if() again
            }
            if (this.y >= pixY) this.alive = false; //this char went below print area, kill it
        }

        draw() { //if inside print area, put it into pixels array
            if (this.x >= 0 && this.y >= 0 && this.x <= pixX - 1 && this.y <= pixY - 1) {
                pixels[Math.floor(this.y)][Math.floor(this.x)] = this.char;
            }
        }

        rotate() {

        }

        boom() {
            let dir = (Math.floor(ns.getTimeSinceLastAug() / 1000)) % 40;
            dir /= 10;
            dir -= 2;
            this.velY = -2;
            this.velX = dir;
        }
    }

    let updated = false;
    while (true) {
        //while (logPort.empty()) await ns.sleep(50); //pause if no shit in port
        while (!logPort.empty()) {
            logText = logPort.read();
            logArray = logText.split("");
            updated = true;
        }

        if (updated) {
            for (const pix of pixelsCA) pix.drop = true;
            makeMatrix();
        }
        updateLog();
        await ns.sleep(1000 / 30);
    }

    function updateLog() {
        clearDisplay();
        for (let i = pixelsCA.length - 1; i >= 0; i--) {
            pixelsCA[i].update();
            if (!pixelsCA[i].alive) pixelsCA.splice(i, 1); //remove dead pixels. Hahaha.
        }
        display();
    }

    function makeMatrix() {
        // set xy coordinates
        for (let y = 0; y < pixels.length; y++) {
            for (let x = 0; x < pixels[0].length; x++) {
                let char = logArray.shift();
                let text_ = "";
                if (char == undefined) {
                    text_ = "</span>";
                    ns.tprint("ERROR undefined shit in log text")
                }
                if (char == "ö") {
                    if (x != 0 && y != 0) text_ += "</span>";
                    text_ = `<span style="`;
                    while (char != undefined) {
                        char = logArray.shift();
                        if (char == "ä") {
                            text_ += `">`;
                            char = logArray.shift();
                            text_ += char;
                            break;
                        } else text_ += char;
                    }
                } else text_ = char;
                pixelsCA.push(new Pixel(x, y, text_, y, y * pixX + x));
            }
        }
        updated = false;
    }

    function clearDisplay() { //Fill the array with dots
        for (let yy = 0; yy < pixY; yy++) {
            for (let xx = 0; xx < pixX; xx++) {
                pixels[yy][xx] = " ";
            }
        }
    }

    function display() {
        let data = "";
        for (let yy = 0; yy < pixY; yy++) {
            for (let xx = 0; xx < pixX; xx++) {
                data += pixels[yy][xx]; //make string from a row of x-coordinates
            }
            data += "\n"; //go to next row (next y-coordinate)
        }
        text.innerHTML = data; //display the string
    }
}