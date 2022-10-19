//Created: 09/05/2022 07:33:47
//Last modified: 19/10/2022 19:15:50

import {
    printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
    secondsToHMS, killAllButThis, connecter, randomInt, map, readFromJSON, writeToJSON, openPorts2, getBestFaction, col
}
    from '/lib/includes.js'


/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {

    const ww = 600, hh = 400;
    let doc = eval("document");
    ns.tail();
    await ns.sleep(50);
    ns.resizeTail(ww, hh);
    let logArea = [...doc.querySelectorAll(".react-draggable .react-resizable")].pop();
    logArea.children[1].style.display = "none";
    let canvas = logArea.appendChild(doc.createElement("canvas")),
        ctx = canvas.getContext("2d");
    canvas.width = ww;
    canvas.height = hh;
    // logArea.style.position = "relative";
    let titleH = logArea.children[0].clientHeight;
    canvas.style.height = `calc(100% - ${titleH + 4}px)`;
    canvas.style.width = "calc(100% - 1px)";
    canvas.style.marginLeft = "1px";
    canvas.style.marginTop = "1px";
    //   canvas.style.width = "calc(100% - 1px)";
    //logArea.style = "height:100%;width:100%;backdrop-filter: blur(10px);";
    logArea.style.backdropFilter = "blur(10px)";

    let minimized = false;
    [...doc.querySelectorAll(".react-draggable")].pop().querySelectorAll("button")[1].addEventListener("click", () => { //minimize button
        minimized = !minimized;
        minimized ? canvas.style.display = "none" : canvas.style.display = "";
        /*if (minimized) { canvas.style.height = "30px"; canvas.style.width = w + "px" }
        else { canvas.style.width = "100%"; canvas.style.height = "100%"; }*/
    });

    ns.tprint(logArea.children[0].clientHeight);

    ns.atExit(() => {
        logArea.style = "";
        logArea.removeChild(canvas);
    });

    ctx.fillStyle = "rgba(255,0,0,0.4)";
    ctx.fillRect(0, 0, ww, hh);

    await ns.prompt("end")

    return
    ns.disableLog("ALL");
    ns.clearLog();

    let chars = [" ", "░", "▒", "▓", "█"];
    // chars = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'."
    const edges = {
        nw: "╔", h: "═", ne: "╗",
        tw: "╟", t: "─", te: "╢",
        v: "║",
        sw: "╚", se: "╝"
    }
    let w = 80, h = 60;

    let characterA = [];
    for (let y = 0; y < h; y++) {
        characterA.push([]);
        for (let x = 0; x < w; x++) {
            characterA[y][x] = "-";
        }
    }

    let index = 1;
    let acc = 1;

    class Region {
        /**@param h_ number of lines + 2 lines for borders
         * @param w_ number of columns + 2 cols for borders
         */
        constructor(xStart_, yStart_, w_, h_, textColor_ = col.off, titleColor_ = col.c, borderColor_ = col.w) {
            this.xStart = xStart_;
            this.yStart = yStart_;
            this.w = w_ + 2;
            this.h = h_ + 3;
            this.lines = [];
            this.region = [];
            this.borderColor = borderColor_;
            this.titleColor = titleColor_;
            this.textColor = textColor_;
        }

        /*addLine(text, title, color) {
            this.lines.push({ text: text, title: title, color: color });
        }*/

        addLine(obj) {
            this.lines.push(obj);
        }

        addArray(arr = [], title, color) {
            if (title) this.lines.push({ text: arr.shift(), title: true });
            for (const a of arr) {
                this.lines.push({ text: a, color: color });
            }
        }

        /**@param title true|"div"|undefined ---> title|divider|text*/
        makeLine(text = " ", title, color) {
            let tempA = [];
            if (title === true) {
                color = color ?? this.titleColor;
                tempA.push(textToArray(text, this.w, color, this.borderColor));
                tempA.push(textToArray(undefined, this.w, undefined, this.borderColor, "div"));
            } else if (title == "div") {
                tempA.push(textToArray(undefined, this.w, undefined, this.borderColor, "div"));
            }
            else {
                color = color ?? this.textColor;
                tempA.push(textToArray(text, this.w, color, this.borderColor));
            }

            return tempA;
        }

        debug() {
            printArray(ns, this.region);
        }

        update() {
            //  let title = this.region.splice(1, 1);
            this.makeRegion();
            // ns.tprint(title)
            // this.region.splice(1, 0, title[0]);
        }

        makeRegion() {
            this.region = [];

            this.region.push(textToArray(undefined, this.w, undefined, this.borderColor, "top"));

            while (this.lines.length < this.h - 2) {
                this.lines.push({});
            }

            for (const line of this.lines) {
                for (const makedLine of this.makeLine(line.text, line.title, line.color))
                    this.region.push(makedLine);
            }

            this.region.push(textToArray(undefined, this.w, undefined, this.borderColor, "bottom"));
        }
    }

    class Layout {
        constructor(w_, h_) {
            this.regions = [];
            this.w = w_;
            this.h = h_;
        }

        addRegion(reg) {
            this.regions.push(reg);
        }

        debug() {
            printArray(ns, characterA);
        }

        insertRegion(region, arr1 = characterA) {
            let arr2 = region.region;
            for (const [i, reg] of arr2.entries()) {
                arr1[i + region.yStart].splice(region.xStart, reg.length, ...reg);
            }
        }

        showAll() {
            for (const reg of this.regions)
                this.insertRegion(reg);
        }

        update() {
            for (const reg of this.regions) {
                reg.update();
            }
        }

    }

    let layout = new Layout(60, 40);

    let reg1 = new Region(3, 3, 15, 6, undefined, col.y);
    reg1.addLine({ text: "Too long title, damnit", title: true });
    reg1.addLine({ text: "Moro" + col.r + " mucho texto unfittable", color: col.y });
    reg1.makeRegion();
    //reg1.debug();

    let reg2 = new Region(13, 13, 25, 5, col.c, col.w);
    reg2.addLine({ text: "Random numbers", title: true });
    for (let i = 0; i < 20; i++) {
        reg2.addLine({ text: Math.random() });
    }
    reg2.makeRegion();

    let reg3 = new Region(20, 17, 30, 16, col.y, col.g, col.b);
    const reg3Arr = ["hello", "world", 123, "hi"];
    reg3.addArray(reg3Arr, "From array");
    reg3.makeRegion();

    layout.addRegion(reg1);
    layout.addRegion(reg2);
    layout.addRegion(reg3);
    makeBackground(chars);
    // layout.debug();


    while ("yes") {
        makeBackground(chars, index);
        // reg1.debug()
        layout.update();
        layout.showAll();

        printShit(characterA);
        index += acc;
        if (index > 100 || index < 1) acc *= 1;
        for (const line of reg2.lines) {

        }

        await ns.sleep(1500);
        for (const line of reg2.lines) {
            if (!line.title)
                line.text = Math.random();
        }
        reg1.lines[1].text = "KLSDkfkgfhjghbnm";
    }

    function textToArray(text, len, color = col.off, edgeColor = col.w, divider, padChar = " ") {
        let edgeW = edges.v, edgeE = edges.v;
        if (divider == "div") {
            edgeW = edges.tw;
            edgeE = edges.te;
            color = edgeColor;
            padChar = edges.t;
        }
        if (divider == "top") {
            edgeW = edges.nw;
            edgeE = edges.ne;
            color = edgeColor;
            padChar = edges.h;
        }
        if (divider == "bottom") {
            edgeW = edges.sw;
            edgeE = edges.se;
            color = edgeColor;
            padChar = edges.h;
        }
        text = text ?? padChar;

        const tempText = edgeColor + edgeW +
            color + text;

        let tempA = [];
        for (let i = 0; i < tempText.length; i++) {
            let tempChar = tempText[i];
            if (tempText[i] == "\x1b") {
                while (tempText[i] != "m") {
                    i++;
                    tempChar += tempText[i];
                }
                i++;
                tempChar += tempText[i];
            }
            tempA.push(tempChar);
        }
        tempA = tempA.slice(0, len - 1);
        while (tempA.length < len - 1)
            tempA.push(padChar);
        tempA.push(edgeColor + edgeE);
        return tempA;
    }

    function makeBackground(c, i = 0) {
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                characterA[y][x] = col.bk + c[prettyThing(x, y, i, chars.length)];
            }
            characterA[y][w - 1] += "\n";
        }
    }

    function prettyThing(x, y, i, m) {
        return Math.round(Math.abs(Math.sin(h / 2 + y / 10) + (Math.cos(w / 2 + x / 10))) * index) % chars.length;
    }

    function printShit(arr) {
        ns.clearLog();
        let string = "";
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                string += arr[y][x];
            }
        }
        ns.print(string);
    }
}

export function charsFromCode() {
    let edges = {
        bottom: {},
    }

    for (let i = 0x0; i < 0x8; i++)
        edges.bottom["c" + i] = String.fromCharCode(0x2590 + i);
}