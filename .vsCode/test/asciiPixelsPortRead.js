/** @param {NS} ns */
/** @param {import('..').NS} ns */
export async function main(ns) {
    ns.tail();
    let doc = eval("document");

    let logAreas = doc.querySelectorAll(".react-draggable .react-resizable");
    let logArea = logAreas[logAreas.length - 1];
    logArea.children[1].style.display = "none";
    let text = doc.createTextNode("Hello world");
    logArea.style = "white-space:pre; font-family: 'Lucida Console'; color: #20AB20; font-size: 10px; text-align: center; background-color: black";

    logArea.appendChild(text);


    ns.disableLog("ALL");
    const pixX = 78, pixY = 37,
        logPort = ns.getPortHandle(8);

    let pixels = new Array(pixY);
    let chars = "01";

    for (let i = 0; i < pixY; i++) {
        pixels[i] = new Array(pixX);
    }
    for (let y = 0; y < pixY; y++) {
        for (let x = 0; x < pixX; x++) {
            pixels[y][x] = ".";
        }
    }

    let logText = "";

    while (true) {
        while (logPort.empty()) await ns.sleep(50);
        while (!logPort.empty()) {
            logText = logPort.read();
            await ns.sleep(1);
        }
        // set xy coordinates
        for (let y = 0; y < pixels.length; y++) {
            for (let x = 0; x < pixels[0].length; x++) {
                pixels[y][x] = logText[y * pixX + x] === undefined ? chars[Math.round(Math.random())] : logText[y * pixX + x];
            }
        }
        display();
        await ns.sleep(1000 / 60);
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