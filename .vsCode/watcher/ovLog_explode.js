/** @param {NS} ns */
/** @param {import('..').NS} ns */
export async function main(ns) {
    const doc = eval("document");
    let textArea = doc.querySelectorAll(".react-draggable:first-of-type")[0]; //find overview
    if (!textArea.textContent.includes("***")) { //check if this script hasn't been run... probably maybe.
        let text = doc.createTextNode("Someone fucked up something.\nProbably you.");
        textArea.style = "white-space:pre; font-family: 'Lucida Console'; color: #20AB20; font-size: 10px; text-align: center";
        textArea.appendChild(text);
    }
    ns.disableLog("ALL");
    const lines = 10, //number of lines to have before dropping oldest
    pixX = 40, pixY = lines + 8, //print area xx char cols, yy char rows.
    gravity = .1, //constant for all particles
    empty = " "; //empty character
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
            this.velX += this.accX;
            this.x += this.velX;
            this.accX = 0;
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
            if (this.y >= pixY || this.x > pixX || this.x < 0)
                this.alive = false; //this char went outside print area, kill it
        }
        draw() {
            if (this.x >= 0 && this.y >= 0 && this.x <= pixX - 1 && this.y <= pixY - 1) {
                pixels[Math.floor(this.y)][Math.floor(this.x)] = this.char;
            }
        }
    }
    const logPort = ns.getPortHandle(1); //strings only, please
    ns.atExit(() => {
        textArea.removeChild(textArea.lastChild); //remove log
    });
    let prevTime = ns.getTimeSinceLastAug();
    let prevTime2 = ns.getTimeSinceLastAug();
    while (true) {
        if (prevTime2 + 500 < ns.getTimeSinceLastAug()) {
            logPort.write(Math.random());
            prevTime2 = ns.getTimeSinceLastAug();
        }
        if (prevTime + 5000 < ns.getTimeSinceLastAug()) {
            prevTime = ns.getTimeSinceLastAug();
            ns.print("BOOOM");
            explode();
        }
        updateLog();
        await ns.sleep(20);
    }
    function explode() {
        for (const line of pixelsCA) {
            floor++;
            for (const char of line) {
                char.floor = 99e99;
                char.dropped = true;
                char.accX = 2 * (Math.random() - .5);
                char.accY = 2 * (Math.random() - .8);
            }
        }
    }
    function updateLog() {
        clearDisplay();
        while (!logPort.empty()) {
            makeTextLine(logPort.read().toString());
            floor--;
        }
        for (let i = pixelsCA.length - 1; i >= 0; i--) {
            for (let j = pixelsCA[i].length - 1; j >= 0; j--) {
                pixelsCA[i][j].update();
                if (!pixelsCA[i][j].alive) { //remove dead pixels. Hahaha.
                    pixelsCA[i].splice(j, 1);
                }
                if (pixelsCA[i].length == 0)
                    pixelsCA.splice(i, 1); //remove empty lines
            }
            if (pixelsCA.length > lines) { //drop the oldest line
                for (const pix of pixelsCA[0]) {
                    pix.drop = true;
                }
            }
        }
        display();
    }
    function makeTextLine(textLine) {
        pixelsCA.push([]);
        const pos = Math.floor((pixX - textLine.length) / 2);
        for (let i = pos; i < textLine.length + pos; i++) {
            pixelsCA[pixelsCA.length - 1].push(new Pixel(i, -1, textLine[i - pos], floor, index));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3ZMb2dfZXhwbG9kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy93YXRjaGVyL292TG9nX2V4cGxvZGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEscUJBQXFCO0FBQ3JCLGtDQUFrQztBQUNsQyxNQUFNLENBQUMsS0FBSyxVQUFVLElBQUksQ0FBQyxFQUFFO0lBQ3pCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUM3QixJQUFJLFFBQVEsR0FBRyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsZ0NBQWdDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQWU7SUFFekYsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUseURBQXlEO1FBQ2xHLElBQUksSUFBSSxHQUFHLEdBQUcsQ0FBQyxjQUFjLENBQUMsNkNBQTZDLENBQUMsQ0FBQztRQUM3RSxRQUFRLENBQUMsS0FBSyxHQUFHLHFHQUFxRyxDQUFDO1FBQ3ZILFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDOUI7SUFFRCxFQUFFLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3JCLE1BQU0sS0FBSyxHQUFHLEVBQUUsRUFBRSxnREFBZ0Q7SUFDOUQsSUFBSSxHQUFHLEVBQUUsRUFBRSxJQUFJLEdBQUcsS0FBSyxHQUFHLENBQUMsRUFBRSx3Q0FBd0M7SUFDckUsT0FBTyxHQUFHLEVBQUUsRUFBRSw0QkFBNEI7SUFDMUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxDQUFDLGlCQUFpQjtJQUNsQyxJQUFJLE1BQU0sR0FBRyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxvRUFBb0U7SUFDOUYsUUFBUSxHQUFHLEVBQUUsRUFDYixLQUFLLEdBQUcsSUFBSSxHQUFHLENBQUMsRUFBRSxzQkFBc0I7SUFDeEMsS0FBSyxHQUFHLENBQUMsQ0FBQztJ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