/** @param {NS} ns */
/** @param {import('..').NS} ns */
export async function main(ns) {
    // ns.tail();
    const doc = eval("document");
    let textArea = doc.querySelectorAll(".react-draggable:first-of-type")[0];
    let text = doc.createTextNode("Hello world\ntesting");
    textArea.style = "white-space:pre; font-family: 'Lucida Console'; color: #20AB20; font-size: 10px; text-align: center";
    //   textArea.style.color = "#20AB20";
    // textArea.style.font = "10px Gridnik";
    textArea.appendChild(text);

    ns.disableLog("ALL");
    const pixX = 20, pixY = 20;
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
        if (iter % (Math.PI * 4) < Math.PI * 2) clearDisplay();
        ns.clearLog();

        // set xy coordinates
        x = Math.floor(pixX / 2) + Math.round((Math.sin(iter) * 8));
        y = Math.floor(pixY / 2) + Math.round((Math.cos(iter) * 8));

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
        textArea.lastChild.nodeValue = data; //display the string
    }
}