/** @param {NS} ns */
/** @param {import('..').NS} ns */
export async function main(ns) {
    const doc = eval("document");
    let textArea = doc.querySelectorAll(".react-draggable:first-of-type")[0];
    if (!textArea.textContent.includes("***")) {
        let text = doc.createTextNode("Test text");
        textArea.style = "white-space:pre; font-family: 'Lucida Console'; color: #20AB20; font-size: 10px; text-align: center";
        textArea.appendChild(text);
    }

    ns.disableLog("ALL");
    const pixX = 20, pixY = 80,
        gravity = .2,
        empty = "";
    let pixels = new Array(pixY),
        pixelsCA = [],
        floor = pixY - 5,
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
        constructor(x_, y_, char_, floor_, index_) {
            this.x = x_;
            this.y = y_;
            this.char = char_;
            this.velY = 0;
            this.accY = 0;
            this.floor = floor_;
            this.atFloor = false;
            this.alive = true;
            this.dropTime = 99e99;
            this.index = index_;
        }

        update() {
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
                if (this.dropTime == 99e99) this.dropTime = ns.getTimeSinceLastAug();
                this.atFloor = true;
            }
            if (this.dropTime + 4000 < ns.getTimeSinceLastAug()) {
                this.floor += 9999;
                this.atFloor = false;
                if (this.x == 0) {
                    floor++;
                    for (const char of pixelsCA) {
                        if (char.index != this.index) {
                            char.floor++;
                            char.atFloor = false;
                        }
                    }
                }
                this.dropTime = 99e99;
            }
            if (this.y > pixY) this.alive = false;
        }

        draw() {
            if (this.x >= 0 && this.y >= 0 && this.x <= pixX - 1 && this.y <= pixY - 1) {
                pixels[Math.floor(this.y)][Math.floor(this.x)] = this.char;
            }
        }

    }

    while (true) {
        clearDisplay();
        makeTextLine(await ns.prompt("Huh?", {type: "text"}));
        floor--;

        for (let i = pixelsCA.length - 1; i >= 0; i--) {
            if (!pixelsCA[i].alive) {
                pixelsCA.splice[i, 1];
                continue;
            }
            pixelsCA[i].update();
        }

        display();
        await ns.sleep(20);
    }

    function makeTextLine(textLine) {
        for (let i = 0; i < textLine.length; i++) {
            pixelsCA.push(new Pixel(i, -1, textLine[i], floor, index));
        }
        index++;
    }

    function clearDisplay() { //Fill the array with empty chars
        for (let yy = 0; yy < pixY; yy++) {
            for (let xx = 0; xx < pixX; xx++) {
                yy == pixY - 1 ? pixels[yy][xx] = "*" : pixels[yy][xx] = empty;
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
        textArea.lastChild.nodeValue = data; //display the string
    }
}