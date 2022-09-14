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
        logArray = [];
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
    let chars = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOOPASDFGHJKLZXCVBNM";

    for (let i = 0; i < pixY; i++) {
        pixels[i] = new Array(pixX);
    }
    for (let y = 0; y < pixY; y++) {
        for (let x = 0; x < pixX; x++) {
            pixels[y][x] = ".";
        }
    }

    let updated = false;
    while (true) {
         while (logPort.empty()) await ns.sleep(50); //pause if no shit in port
        while (!logPort.empty()) {
            logText = logPort.read();
            logArray = logText.split("");
            updated = true;
        }

        if (updated) makeMatrix();
        display();
        await ns.sleep(1000 / 30);
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
                pixels[y][x] = text_;
            }
        }
        updated = false;
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
                if (Math.random() > 0.998)
                    data += chars[Math.floor(Math.random() * chars.length)];
                else data += pixels[yy][xx]; //make string from a row of x-coordinates
            }
            data += "\n"; //go to next row (next y-coordinate)
        }
        text.innerHTML = data; //display the string
    }
}