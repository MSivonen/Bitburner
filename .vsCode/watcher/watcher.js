/** @param {NS} ns */
import { readFromJSON, writeToJSON } from 'lib/includes';
/** @param {import('..').NS} ns */
export async function main(ns) {
    const doc = eval("document"), win = eval("window");
    let textArea = doc.querySelectorAll(".react-draggable:first-of-type")[0]; //find overview
    // ============================== afk timer ==============================
    let timeOutId;
    const timeOut = 120000; //120s inactivity -> focus on work
    const logPort = ns.getPortHandle(1); //strings only, please
    doc.addEventListener("mousemove", resetTimer, false);
    doc.addEventListener("mousedown", resetTimer, false);
    doc.addEventListener("keypress", resetTimer, false);
    startTimer();
    function startTimer() {
        timeOutId = win.setTimeout(doInactive, timeOut);
    }
    function doInactive() {
        if (g_sets.afkFocusOnWork)
            g_sets.focusOnWork = true;
        return;
    }
    function resetTimer() {
        g_sets.focusOnWork = false;
        win.clearTimeout(timeOutId);
        startTimer();
    }
    // ============================== /afk timer ==============================
    // ============================== buttons ==============================
    let g_sets;
    try {
        readFromJSON(ns, "g_settings.txt");
    }
    catch { }
    if (!ns.fileExists("g_settings.txt")) //if file doesn't exist, make it
     {
        g_sets = {
            wantAugsInstalled: true,
            wantBuyAugs: true,
            wantHackNet: true,
            wantJobs: true,
            spamNeuroFlux: false,
            overrideVars: false,
            afkFocusOnWork: true,
            paused: false
        };
        await writeToJSON(ns, g_sets, "g_settings.txt");
    }
    else {
        g_sets = readFromJSON(ns, "g_settings.txt");
    }
    for (const key of Object.keys(g_sets)) {
        if (!readFromJSON(ns, "g_settings.txt").hasOwnProperty(key)) { //if file doesn't have some of the variables, rewrite it
            await writeToJSON(ns, g_sets, "g_settings.txt");
            break;
        }
    }
    g_sets = readFromJSON(ns, "g_settings.txt");
    g_sets.afkFocusOnWork = true;
    g_sets.focusOnWork = true;
    ns.tprint(g_sets);
    const buttonsTextStyle = //text beside button
     `color:#090;
		margin:0px auto;
		font-family:'Comic Sans MS';
        font-size:15px;
		text-align:left;
        `;
    let buttonsA = [];
    for (const key of Object.keys(g_sets)) { //make button objects
        if (key != "focusOnWork")
            buttonsA.push(new Control(key, "", key, g_sets[key]));
    }
    for (const butt of buttonsA)
        makeButton(butt); //put the button objects to overview
    function makeButton(butt) {
        let newButton = `<button id=${butt.buttonId} style="
            border: 2px solid transparent;
            border-radius: 7px;
            border-color:#090;
            background-color:#131;
            width:40px; 
            height:fit-content;
            align:center;
            font-family:'Comic Sans MS';
            font-size:10px;
            color:#0c0;
            ">${butt.variable ? butt.buttonText + "ON" : butt.buttonText + "OFF"}</button>`;
        textArea.insertAdjacentHTML('beforeend', `<table style="width:90%; border:0px; margin-left:auto; margin-right:auto;">
            <tr>
                <th style="${buttonsTextStyle}">${butt.text}</th>
                <th style="text-align:right">${newButton}</th>
            </tr>
        </table>`);
        let btn = doc.querySelector("#" + butt.buttonId);
        btn.addEventListener("click", () => {
            butt.variable = !butt.variable;
            btn.innerText =
                butt.variable ? butt.buttonText + "ON" : butt.buttonText + "OFF";
        });
    }
    /**@param {string} text Text beside button
    *@param {string} buttonText Text inside button
    *@param {string} buttonId Unique id for finding this button
    *@param {boolean} variable variable this button controls */
    function Control(text, buttonText, buttonId, variable = true) {
        this.text = text;
        this.buttonText = buttonText;
        this.buttonId = buttonId;
        this.variable = variable;
    }
    // ============================== /buttons ==============================
    // ============================== log thing ==============================
    if (!textArea.textContent.includes("***")) { //check if this script hasn't been run... probably maybe.
        let text = doc.createTextNode("Someone fucked up something.\nProbably you.");
        textArea.style = "white-space:pre; font-family: 'Lucida Console'; color: #20AB20; font-size: 10px; text-align: center";
        textArea.appendChild(text);
    }
    ns.disableLog("ALL");
    const lines = 10, //number of lines to have before dropping oldest
    pixX = 40, pixY = lines + 8, //print area xx char cols, yy char rows.
    gravity = .2, //constant for all particles
    empty = ""; //empty character
    let pixels = new Array(pixY), //init print area. Characters here are treated as pixels in drawing.
    pixelsCA = [], floor = pixY - 4, //where the text lands
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
            this.velY += this.accY;
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
                this.dropped = true; //don't run this if() again
            }
            if (this.y >= pixY)
                this.alive = false; //this char went below print area, kill it
        }
        draw() {
            if (this.x >= 0 && this.y >= 0 && this.x <= pixX - 1 && this.y <= pixY - 1) {
                pixels[Math.floor(this.y)][Math.floor(this.x)] = this.char;
            }
        }
    }
    // ============================== /log thing ==============================
    ns.atExit(() => {
        textArea.removeChild(textArea.lastChild); //remove log
        for (const butt of buttonsA) //remove buttons
            doc.getElementById(butt.buttonId).remove();
        for (let i = 0; i < buttonsA.length; i++) //remove button texts
            textArea.removeChild(textArea.lastChild);
        doc.removeEventListener("mousemove", resetTimer, false);
        doc.removeEventListener("mousedown", resetTimer, false);
        doc.removeEventListener("keypress", resetTimer, false);
    });
    while (true) {
        await ns.sleep(20);
        await buttonsLoop();
        updateLog();
    }
    function updateLog() {
        clearDisplay();
        while (!logPort.empty()) {
            makeTextLine(logPort.read());
            floor--;
        }
        for (let i = pixelsCA.length - 1; i >= 0; i--) {
            for (let j = pixelsCA[i].length - 1; j >= 0; j--) {
                pixelsCA[i][j].update();
                if (!pixelsCA[i][j].alive)
                    pixelsCA[i].splice(j, 1); //remove dead pixels. Hahaha.
                if (pixelsCA[i].length == 0)
                    pixelsCA.splice(i, 1); //remove empty lines
            }
            if (pixelsCA.length > lines) //drop the oldest line
                for (const pix of pixelsCA[0])
                    pix.drop = true;
        }
        display();
    }
    async function buttonsLoop() {
        for (const butt of buttonsA) {
            let btn = doc.querySelector("#" + butt.buttonId);
            btn.innerText =
                butt.variable ? butt.buttonText + "ON" : butt.buttonText + "OFF";
            btn.style.backgroundColor = butt.variable ? "#030" : "#000";
            g_sets[butt.buttonId] = butt.variable;
        }
        await writeToJSON(ns, g_sets, "g_settings.txt");
    }
    function makeTextLine(textLine) {
        pixelsCA.push([]);
        for (let i = 0; i < textLine.length; i++) {
            pixelsCA[pixelsCA.length - 1].push(new Pixel(i, -1, textLine[i], floor, index));
        }
        index++;
    }
    function clearDisplay() {
        for (let yy = 0; yy < pixY; yy++) {
            for (let xx = 0; xx < pixX; xx++) {
                yy == pixY - 1 ? pixels[yy][xx] = "*" : pixels[yy][xx] = empty; //last line must be "***" for the check at the top^
            }
        }
    }
    function display() {
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