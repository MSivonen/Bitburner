import {
    printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
    secondsToHMS, killAllButThis, connecter, randomInt, map, readFromJSON, writeToJSON, openPorts2, getBestFaction
}
    from '/lib/includes.js'

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
        logObjectOA = [],
        pixelsCA = [];
    text.innerHTML = "Waiting for port " + portNumber;

    /* while (logPort.empty()) await ns.sleep(50);
     while (!logPort.empty()) {
         logText = logPort.read();
         await ns.sleep(1);
     }*/

    /*  for (let i = 0; i < logText.length; i++) {
          if (logText[i] == "┐") {
              pixX = i + 1;
              pixY = logText.length / pixX;
              break;
          }
      }
  
  */

    ns.atExit(() => {
        logArea.removeChild(logArea.lastChild); //remove log
    });

    let pixels = new Array(pixY);
    const chars = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOOPASDFGHJKLZXCVBNM",
        gravity = 0,//.2, //constant for all particles
        dropFrom = 0, //starting y coord of new matrix. Ex: 100 = 100char above floor.
        empty = ""; //empty character

    for (let i = 0; i < pixY; i++) {
        pixels[i] = new Array(pixX);
    }
    for (let y = 0; y < pixY; y++) {
        for (let x = 0; x < pixX; x++) {
            pixels[y][x] = ".";
        }
    }

    function makeHTMLchar(color = "white", backgroundcolor = "#000000", char = "Ä", rot = 0.2) {
        let output = '<span style="';
        output += "color:" + color + ';';
        output += "background-color:" + backgroundcolor + ';';
        //output += `display: inline-block;-webkit-transform:rotate(${rot}turn)`;
        output += '">';
        output += char;
        output += "</span>"
        return output;
    }

    function hexToRGB(hex) {
        if (typeof hex != "string") return hex;
        if (hex == "white") hex = "#FFFFFF";
        if (hex == "green") hex = "#00FF00";
        if (hex == "red") hex = "#FF0000";
        if (hex == "black") hex = "#000000";

        const int = parseInt(hex.slice(1), 16);
        const r = (int >> 16) & 255;
        const g = (int >> 8) & 255;
        const b = int & 255;
        return { "r": r, "g": g, "b": b }
    }

    const borders = [
        '┌', '┬', '┐', '─', '│',
        '├', '┼', '┤', '─', '│',
        '└', '┴', '┘', '─', '│', " "];

    class Pixel {
        /**@param x_ {number} starting x-coordinate 
         * @param y_ {number} starting y-coordinate
         * @param char_ {character} character to print
         * @param floor_ {number} where's the floor now.. Probably -1 from the last line
         * @param index_ unique identifier for every text line, for floor level changing
        */
        constructor(x_, y_, char_ = "Ö", floor_, index_, style_ = { color: "white", backgroundcolor: "#000000" }) {
            this.x = x_;
            this.y = y_ - dropFrom;
            this.color = style_.color;
            this.backgroundcolor = style_.backgroundcolor;
            this.char = char_;
            this.velY = 0;
            this.accY = 0;
            this.velX = 0;
            this.accX = 0;
            this.floor = floor_;
            this.atFloor = false;
            this.alive = true;
            this.dropped = false;
            this.index = index_;
            this.timer = 0;
            this.killDelay = 6000 + Math.random() * 1000;
            this.startTime = performance.now();
            this.color = hexToRGB(this.color);
            this.backgroundcolor = hexToRGB(this.backgroundcolor);
            this.printColor = "";
            this.printBGColor = "";
            this.rotation = 0;
            this.rotationSpeed = 0.1;
        }

        update() {
            this.setPos();
            this.draw();
        }

        changeColor(fadeinout) {
            let mult = 0;
            let r_, g_, b_;
            let br_, bg_, bb_;
            if (!this.dropped) {
                let timePassed = performance.now() - this.startTime;
                mult = fadeinout ? Math.max(0, Math.min(1, (timePassed - 1000) / 1000)) : 1;
                r_ = this.color.r * mult;
                g_ = this.color.g * mult;
                b_ = this.color.b * mult;
                br_ = this.backgroundcolor.r * mult;
                bg_ = this.backgroundcolor.g * mult;
                bb_ = this.backgroundcolor.b * mult;
            } else {
                let timePassed = performance.now() - this.startTime;
                mult = fadeinout ? mult = Math.max(0, Math.min(1, 1000 / timePassed / 3)) : 1;
                //if (mult < 0.05) this.alive = false;
                r_ = this.color.r * mult;
                g_ = this.color.g * mult;
                b_ = this.color.b * mult;
                br_ = this.backgroundcolor.r * mult;
                bg_ = this.backgroundcolor.g * mult;
                bb_ = this.backgroundcolor.b * mult;
            }
            this.printColor = `rgb(${r_},${g_},${b_})`
            this.printBGColor = `rgb(${br_},${bg_},${bb_})`
        }

        setPos() {
            this.velX += this.accX;
            this.x += this.velX;
            this.accX = 0;

            if (this.y >= this.floor) {
                this.y = this.floor;
                this.velY = 0;
                this.atFloor = true;
            } else {
                this.accY += gravity;
                this.velY += this.accY;
                this.y += this.velY;
            }
            this.accY = 0;

            if (this.dropped) {
                this.rotate();
                if (this.y >= pixY || this.y < -50 || this.x < 0 || this.x > pixX + 1) this.alive = false; //this char went outside print area, kill it
                if (this.timer < ns.getTimeSinceLastAug()) this.alive = false;
            }
        }

        drop() {
            this.startTime = performance.now();
            this.atFloor = false;
            this.floor = 99e99;
            this.timer = ns.getTimeSinceLastAug() + this.killDelay;
            this.dropped = true; //don't run this if() again
        }

        draw() { //if inside print area, put it into pixels array
            this.changeColor(false);
            //this.rotate(true);
            if (this.x >= 0 && this.y >= 0 && this.x <= pixX - 1 && this.y <= pixY - 1) {
                pixels[Math.floor(this.y)][Math.floor(this.x)] = makeHTMLchar(this.printColor, this.printBGColor, this.char, this.rotation);
            }
        }

        rotate(kill) {
            if (this.y > 2 && !borders.includes(this.char)) {
                this.rotation += this.rotationSpeed;
                if (this.rotation >= 0.5 && kill && this.dropped) {
                    this.rotation = 0.5;
                    this.alive = false;
                } else if (this.rotation >= 1) this.rotation = 1;
            }
        }

        boom(boomX, boomY) {
            let charAR = 1.6; //character aspect ratio, 10/7=1.42... plus a little bit wtf
            let mult = 150;
            let centerX = boomX;
            //this.color = "red";
            let centerY = boomY;
            let distX = this.x - centerX;
            let distY = (this.y - centerY) * charAR; //characters are not square...
            let mag = Math.sqrt(distX ** 2 + distY ** 2);
            let angle = Math.atan2(distY, distX);
            this.accY = (Math.sin(angle) * (mult / (mag))) / charAR;
            this.accX = Math.cos(angle) * (mult / (mag));
        }
    }

    logPort.clear();
    /*while ("not found end of table") {
        if (logPort.read().includes('┘')) break;
        await ns.sleep(10);
    }*/
    let updated = false;

    let prevTime = performance.now();
    while (true) {
        //while (logPort.empty()) await ns.sleep(50); //pause if no shit in port
        if (!logPort.empty()) {
            let endFound = false;
            let startFound = false;
            while (!endFound) {
                logText = logPort.read();
                if (logText.includes('┌'))
                    startFound = true;
                else if (!startFound) {
                    await ns.sleep();
                    continue;
                }
                if (logText.includes('┘')) endFound = true;
                logObjectOA.push(JSON.parse(logText));
                updated = true;
                await ns.sleep();
            }
        }

        if (updated) {
            let X = Math.random() * pixX;
            let Y = Math.random() * pixY;
            for (const pix of pixelsCA) {
                pix.drop();
                pix.rotate(true);
                //pix.boom(X, Y);
            }
            makeMatrix();
            updated = false;
        }
        updateLog();
        await ns.sleep((1000 / 30) - (performance.now() - prevTime));
        prevTime = performance.now();
    }

    function updateLog() {
        clearDisplay();
        for (let i = pixelsCA.length - 1; i >= 0; i--) {
            pixelsCA[i].setPos();
            if (!pixelsCA[i].alive) {
                pixelsCA.splice(i, 1); //remove dead pixels. Hahaha.
            }
        }
        for (let i = pixelsCA.length - 1; i >= 0; i--) {
            pixelsCA[i].draw();
        }
        display();
    }

    function makeMatrix() {
        // set xy coordinates
        for (let y = 0; y < pixels.length; y++) {
            for (let x = 0; x < pixels[0].length;) {
                let logObject = logObjectOA.shift();
                if (logObject.style == undefined) ns.tprint("WTF")
                let style = logObject.style;
                let data = logObject.data;
                if (data == undefined) {
                    ns.tprint("ERROR undefined shit in log text")
                    break;
                }
                let charIndex = 0;
                while (charIndex < data.length) {
                    let char = data.slice(charIndex, charIndex + 1);
                    charIndex++;
                    pixelsCA.push(new Pixel(x, y, char, y, y * pixX + x, style));
                    x++;
                }
            }
        }
    }

    function clearDisplay() { //Fill the array with <const empty>
        for (let yy = 0; yy < pixY; yy++) {
            for (let xx = 0; xx < pixX; xx++) {
                pixels[yy][xx] = empty;
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