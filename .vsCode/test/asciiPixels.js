/** @param {NS} ns */
/** @param {import('..').NS} ns */
export async function main(ns) {
    ns.tail();
    let doc = eval("document");

    let logAreas = doc.querySelectorAll(".react-draggable .react-resizable");
    let logArea = logAreas[logAreas.length - 1];
    logArea.children[0].style.display = "none";
    let text = doc.createTextNode("Hello world");
    logArea.style.backgroundColor = "#102010";
    logArea.style.color = "#20AB20";
    logArea.style.font = "20px Courier";
    logArea.appendChild(text);

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

    let x, y, iter = 0;

    while (true) {
        //every other circle is drawn
        //if (iter % (Math.PI * 4) < Math.PI * 2) clearDisplay();
        ns.clearLog();

        // set xy coordinates
        x = Math.floor(pixX / 2) + Math.round((Math.sin(iter) * .7 * iter));
        y = Math.floor(pixY / 2) + Math.round((Math.cos(iter) * .7 * iter));

        pixels[y][x] = "x"; //put x at the coordinates
        display();
        iter += .05
        await ns.sleep();
    }

    function clearDisplay() { //Fill the array with dots
        for (let yy = 0; yy < pixY; yy++) {
            for (let xx = 0; xx < pixX; xx++) {
                pixels[yy][xx] = ".";
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
        logArea.lastChild.nodeValue = data; //display the string
    }
}