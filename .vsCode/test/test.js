import {
    printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
    secondsToHMS, killAllButThis, connecter, randomInt, map, readFromJSON, writeToJSON, openPorts2, getBestFaction, col
}
    from '/lib/includes.js'

/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {

    /** Array[y][x] */
    let arrrr = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ]

    let arrrr2 = [
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
    ]

    ns.tprint(arrrr2.entries())

    function insertWindow(arr1, arr2, startY, startX) {
        for (const [i, iArr] of arr2.entries()) {
            arr1[i + startY].splice(startX, iArr.length, ...iArr);
        }
    }

    insertWindow(arrrr, arrrr2, 3, 4);
    printArray(ns, arrrr)

    /*result==[
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,0],
    [0,0,0,0,0,1,1,1,0],
    [0,0,0,0,0,1,1,1,0],
    [0,0,0,0,0,0,0,0,0],
    ]*/
    return
    let exclude = ["joesguns"]

    let targets = getServersWithMoney(ns).filter(name => !exclude.includes(name));
    if (targets.length == 0) return;
    targets = targets.filter((ss) => {
        let s = ns.getServer(ss);
        s.moneyAvailable = s.moneyMax;
        s.hackDifficulty = s.minDifficulty;
        return ns.getHackingLevel(s.hostname) > ns.getServerRequiredHackingLevel(s.hostname) * 2 &&
            ns.hasRootAccess(s.hostname) &&
            ns.formulas.hacking.weakenTime(s, ns.getPlayer()) < 3 * 60 * 1000;
    });

    printArray(ns, targets)

    return;
    ns.tail();
    ns.disableLog("ALL");
    ns.clearLog();

    let chars = [" ", "░", "▒", "▓", "█"];
    // chars = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'."
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

    class Line {
        constructor(text_, lineLength_, xStart_, yStart_, color_, title_) {
            this.title = title_ ?? false;
            this.lineLength = lineLength_;
            this.color = color_ ?? col.g;
            this.text = text_;
            this.xStart = xStart_;
            this.yStart = yStart_;
        }

        textToArray() {
            const tempText = this.color + this.text;
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
            return tempA;
        }

        insertText(y, x) {
            let tempA = this.textToArray()
            for (let i = 0; i < this.lineLength; i++) {
                characterA[this.yStart][this.xStart + i] = tempA[i] ?? " ";
            }
        }
    }

    class AllText {
        /**@param cols{[array]} columns' x start points */
        constructor(cols) {
            this.linesCA = [];
            this.columns = cols;
            this.lineLengths = [];

            for (let i = 0; i < this.columns.length; i++) {
                this.lineLengths[i] = (this.columns[i + 1] ?? w) - 1 - this.columns[i];
            }

            for (let i = 0; i < cols.length; i++) {
                this.linesCA.push([]);
            }

        }

        addLine(text_, column_, title_) {
            const yStart = this.linesCA[column_].length + 1;
            this.linesCA[column_].push(new Line(text_, this.lineLengths[column_], this.columns[column_], yStart, title_));
            h = this.linesCA.reduce((acc, arr) => (acc.length > arr.length) ? acc : arr).length + 2;
        }
    }

    let allText = new AllText([1, 15, 45]);
    allText.addLine("test" + col.r + "ing", 0);
    allText.addLine("asdasdadasdasda", 1);
    for (let i = 0; i < 40; i++)
        allText.addLine(Math.random(), 2);
    for (let i = 0; i < 8; i++)
        allText.addLine("uiouioui", 1);

    while ("yes") {
        makeEdges(chars, index);
        for (const a of allText.linesCA[2])
            a.text = Math.random();
        for (const a of allText.linesCA)
            for (const l of a)
                l.insertText(2, 5);
        printShit(characterA);
        index += acc;
        if (index > 100 || index < 1) acc *= 1;
        await ns.sleep(500);
    }

    function makeEdges(c, i = 0) {
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