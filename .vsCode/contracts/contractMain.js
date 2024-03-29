import {
    printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
    secondsToHMS, killAllButThis, connecter, randomInt, map, readFromJSON, writeToJSON, openPorts2, getBestFaction
}
    from '/lib/includes.js'

/** @param {NS} ns */
/** @param {import('..').NS} ns */
export async function main(ns) {
    let allContracts = [];
    getServers(ns).forEach(serv => {
        ns.ls(serv, ".cct").forEach(file => allContracts.push({
            server: serv,
            contract: file,
            contractType: ns.codingcontract.getContractType(file, serv)
        }));
    });

    for (let i = 0; i < allContracts.length; i++) {
        const contr = allContracts[i];
        await ns.sleep(10);
        ns.tprint("Contracts left: " + (allContracts.length - i));
        switch (contr.contractType) {
            case "Merge Overlapping Intervals":
                mergeOverlappingIntervals(contr.contract, contr.server);
                break;
            case "Spiralize Matrix":
                spiralizeMatrix(contr.contract, contr.server);
                break;
            case "Unique Paths in a Grid I":
                uniquePathsInAGridI(contr.contract, contr.server);
                break;
            case "Unique Paths in a Grid II":
                uniquePathsInAGridII(contr.contract, contr.server);
                break;
            case "Subarray with Maximum Sum":
                subarrayWithMaximumSum(contr.contract, contr.server);
                break;
            case "Compression I: RLE Compression":
                compressionI(contr.contract, contr.server);
                break;
            case "Shortest Path in a Grid":
                shortestPathInAGrid(contr.contract, contr.server);
                break;
            case "Algorithmic Stock Trader I":
                algorithmicStockTraderI(contr.contract, contr.server);
                break;
            case "Find Largest Prime Factor":
                findLargestPrimeFactor(contr.contract, contr.server);
                break;
            case "Sanitize Parentheses in Expression":
                sanitizeParenthesesInExpression(contr.contract, contr.server);
                break;
            case "Generate IP Addresses":
                generateIpAddresses(contr.contract, contr.server);
                break;
            default:
                ns.tprint("\x1b[35mconnecter " + (contr.server).padEnd(20) + "\x1b[33m" + (contr.contractType).padEnd(43) + " \x1b[32mno solver.");
        }
    }

    function emptyTemplate(contract, server) {
        let inputArray = ns.codingcontract.getData(contract, server);
        let solved = [];

        ns.tprint("INFO Solving " + ns.codingcontract.getContractType(contract, server) + " at " + server);
        ns.tprint("Original array: ");
        printArray(ns, inputArray);


        ns.tprint("Solved array:");
        ns.tprint(solved);
        ns.tprint("Reward:");
        //ns.tprint(ns.codingcontract.attempt(solved, contract, server, { returnReward: true }));
    }

    function generateIpAddresses(contract, server) {
        const inputArray = ns.codingcontract.getData(contract, server).split("");
        let solved = [];

        ns.tprint("INFO Solving " + ns.codingcontract.getContractType(contract, server) + " at " + server);
        ns.tprint("Original string: ");
        ns.tprint(inputArray.join(""));

        function splitNumbers(longNum = [], ipArray = [], retArr = []) {
            if (ipArray.length > 4) return;
            for (let i = 1; i < 4; i++) {
                const tempDigits = longNum.slice(0, i);
                splitNumbers(longNum.slice(i), [...ipArray, tempDigits], retArr);
            }
            if (ipArray.length < 4 || longNum.length > 0) return;

            let retStr = "";
            for (const ip of ipArray) {
                retStr += ip.join("") + ".";
            }

            retStr = retStr.slice(0, -1);
            solved.push(retStr);
        }

        splitNumbers(inputArray);

        for (let i = solved.length - 1; i >= 0; i--) {
            for (const digits of solved[i].split(".")) {
                if (Number(digits) > 255 ||
                    (digits.startsWith("0") && digits.length > 1)
                ) {
                    solved.splice(i, 1);
                    break;
                }
            }
        }

        solved = [...new Set(solved)];

        ns.tprint("Solved array:");
        ns.tprint(solved);
        ns.tprint("Reward:");
        ns.tprint(ns.codingcontract.attempt(solved, contract, server, { returnReward: true }));
    }

    function sanitizeParenthesesInExpression(contract, server) { //https://pastebin.com/8Y0Fqwfu
        let inputString = ns.codingcontract.getData(contract, server);
        let solved = sanitizeParentheses(inputString);

        ns.tprint("INFO Solving " + ns.codingcontract.getContractType(contract, server) + " at " + server);
        ns.tprint("Original string: " + inputString);

        function sanitizeParentheses(data) {
            var solution = Sanitize(data);
            if (solution == null) return ('[""]');
            else return ("[" + solution.join(",") + "]");
        }

        function Sanitize_removeOneParth(item) {
            var possibleAnswers = [];
            for (let i = 0; i < item.length; i++) {
                if (item[i].toLowerCase().indexOf("(") === -1 && item[i].toLowerCase().indexOf(")") === -1) {
                    continue
                }
                let possible = item.substring(0, i) + item.substring(i + 1);
                possibleAnswers.push(possible)
            }
            return possibleAnswers
        }

        function Sanitize_isValid(item) {
            var unclosed = 0
            for (var i = 0; i < item.length; i++) {
                if (item[i] == "(") { unclosed++ }
                else if (item[i] == ")") { unclosed-- }
                if (unclosed < 0) { return false }
            }
            return unclosed == 0
        }

        function Sanitize(data) {
            var currentPossible = [data]
            for (var i = 0; i < currentPossible.length; i++) {
                var newPossible = new Set()
                for (var j = 0; j < currentPossible.length; j++) {
                    let newRemovedPossible = Sanitize_removeOneParth(currentPossible[j])
                    for (let item of newRemovedPossible) {
                        newPossible.add(item)
                    }
                }
                var validBoolList = []
                for (let item of newPossible) {
                    validBoolList.push(Sanitize_isValid(item))
                }
                if (validBoolList.includes(true)) {
                    var finalList = []
                    newPossible = [...newPossible]
                    for (var j = 0; j < validBoolList.length; j++) {
                        if (validBoolList[j]) {
                            finalList.push(newPossible[j])
                        }
                    }
                    finalList = new Set(finalList)
                    return [...finalList]
                }
                currentPossible = [...newPossible]
            }
            return null
        }

        ns.tprint("Solved:");
        ns.tprint(solved);
        ns.tprint("Reward:");
        ns.tprint(ns.codingcontract.attempt(solved.toString(), contract, server, { returnReward: true }));
    }

    function findLargestPrimeFactor(contract, server) {
        let inputNumber = ns.codingcontract.getData(contract, server),
            primes = [];
        const smallOrLarge = 2000; //decide which solver to use for finding primes
        ns.tprint("INFO Solving " + ns.codingcontract.getContractType(contract, server) + " at " + server);
        ns.tprint("Original number: " + inputNumber);

        ((biggest = 100000) => {//find all primes less than this number
            for (let i = 3; i <= smallOrLarge; i = i + 2) { //add small odd numbers.
                primes.push(i);
            }
            primes = primes.filter((x) => { //this is slow on big numbers
                for (let i = 0; primes[i] < x; i++) {
                    if (x % primes[i] == 0) return false;
                }
                return x;
            });
            for (let i = smallOrLarge + 1; i <= biggest; i += 2) { //add big odd numbers
                if (i % 5 != 0) //skip mod5.
                    primes.push(i);
            }
            for (let i = primes.length; i >= 0; --i) {		//don't bother to check if divisor is smaller than n/128
                for (let j = 0; j < primes[i] >> 7; ++j) { 	//doesn't work on small numbers
                    if (primes[i] % primes[j] == 0 && primes[j] != primes[i]) {
                        primes.splice(i, 1);
                        break;
                    }
                }
            }
            primes.unshift(2); //add 2
        })();

        for (const num of primes) {
            while (inputNumber % num == 0) {
                inputNumber /= num;
            }
            if (num * 2 > inputNumber) break;
        }

        ns.tprint("Solved: " + inputNumber);
        ns.tprint("Reward:");
        ns.tprint(ns.codingcontract.attempt(inputNumber.toString(), contract, server, { returnReward: true }));
    }

    function algorithmicStockTraderI(contract, server) {
        let inputArray = ns.codingcontract.getData(contract, server);
        let solved = 0;

        ns.tprint("INFO Solving " + ns.codingcontract.getContractType(contract, server) + " at " + server);
        ns.tprint("Original array: ");
        ns.tprint(inputArray);

        let tempVal = 0;
        for (let i = inputArray.length - 1; i >= 0; i--) {
            for (let j = i - 1; j >= 0; j--) {
                tempVal = inputArray[i] - inputArray[j];
                if (tempVal > solved && tempVal > 0) solved = tempVal;
            }
        }

        ns.tprint("Solved:");
        ns.tprint(solved);
        ns.tprint("Reward:");
        ns.tprint(ns.codingcontract.attempt(solved.toString(), contract, server, { returnReward: true }));
    }

    function shortestPathInAGrid(contract, server) {
        let solved = [];

        const inputArray = ns.codingcontract.getData(contract, server);
        const xMax = inputArray[0].length - 1,
            yMax = inputArray.length - 1;

        ns.tprint("INFO Solving " + ns.codingcontract.getContractType(contract, server) + " at " + server);
        ns.tprint("Original array: ");
        printArray(ns, inputArray);
        ns.tprint("\n\n");
        let iter = 0;
        function walker(posX = 0, posY = 0, path = "", arr) {
            iter++;
            if (iter > 100000) { return; }
            arr = arr.map(a => [...a]);
            if (path.length > 5 * (xMax + yMax)) return; //If path is too long, abort

            if (posX == xMax && posY == yMax) { //end found, yay!
                solved.push(path);
                return;
            }
            arr[posY][posX] = 2; //mark cell as visited

            if (posX != xMax)
                if (arr[posY][posX + 1] == 0) {//right
                    let newPath = path + "R";
                    walker(posX + 1, posY, newPath, arr);
                }

            if (posX != 0)
                if (arr[posY][posX - 1] == 0) {//left
                    let newPath = path + "L";
                    walker(posX - 1, posY, newPath, arr);
                }

            if (posY != yMax)
                if (arr[posY + 1][posX] == 0) {//DOWN
                    let newPath = path + "D";
                    walker(posX, posY + 1, newPath, arr);
                }

            if (posY != 0)
                if (arr[posY - 1][posX] == 0) {//UP
                    let newPath = path + "U";
                    walker(posX, posY - 1, newPath, arr);
                }
        }

        walker(0, 0, "", inputArray);

        solved = solved.length > 0 ? solved.reduce((a, b) => a.length <= b.length ? a : b) : "";

        ns.tprint("Solved result:");
        ns.tprint(solved);
        ns.tprint("Reward:");
        ns.tprint(ns.codingcontract.attempt(solved.toString(), contract, server, { returnReward: true }));
    }

    function compressionI(contract, server) {
        let inputString = ns.codingcontract.getData(contract, server) + "ö";
        let solved = "";

        ns.tprint("INFO Solving " + ns.codingcontract.getContractType(contract, server) + " at " + server);
        ns.tprint("Original array: ");
        ns.tprint(inputString + " disregard the ö at the end. :D");

        let count = 1;
        for (let i = 0; i < inputString.length; i++) {
            let prev = inputString[i - 1];
            let current = inputString[i];
            if (prev == current && count < 9) {
                count++;
            }
            else {
                if (typeof (prev) == "string") solved += count + prev;
                count = 1;
            }
        }

        ns.tprint("Solved array:");
        ns.tprint(solved);
        ns.tprint("Reward:");
        ns.tprint(ns.codingcontract.attempt(solved.toString(), contract, server, { returnReward: true }));
    }

    function subarrayWithMaximumSum(contract, server) {
        let inputArray = ns.codingcontract.getData(contract, server);
        let solved = -99e99;

        ns.tprint("INFO Solving " + ns.codingcontract.getContractType(contract, server) + " at " + server);
        ns.tprint("Original array: ");
        ns.tprint(inputArray);


        for (let i = 0; i < inputArray.length; i++) {
            let tempSum = 0;
            for (let j = i; j < inputArray.length; j++) {
                tempSum += inputArray[j];
                solved = tempSum > solved ? tempSum : solved;
            }
        }

        ns.tprint("Solved result:");
        ns.tprint(solved);
        ns.tprint("Reward:");
        ns.tprint(ns.codingcontract.attempt(solved.toString(), contract, server, { returnReward: true }));
    }

    function uniquePathsInAGridI(contract, server) {
        let solved = 0;
        let x = ns.codingcontract.getData(contract, server)[1];
        let y = ns.codingcontract.getData(contract, server)[0];

        let inputArray = Array(y).fill((Array(x).fill(0)));
        const xMax = inputArray[0].length - 1,
            yMax = inputArray.length - 1;

        ns.tprint("INFO Solving " + ns.codingcontract.getContractType(contract, server) + " at " + server);
        ns.tprint("Original array: ");
        printArray(ns, inputArray);

        function walker(posX, posY) {
            if (posX == xMax && posY == yMax) solved++;
            if (posX < xMax) walker(posX + 1, posY);
            if (posY < yMax) walker(posX, posY + 1);
        }

        walker(0, 0);

        ns.tprint("Solved result:");
        ns.tprint(solved);
        ns.tprint("Reward:");
        ns.tprint(ns.codingcontract.attempt(solved.toString(), contract, server, { returnReward: true }));
    }

    function uniquePathsInAGridII(contract, server) {
        let inputArray = ns.codingcontract.getData(contract, server),
            solved = 0;
        const xMax = inputArray[0].length - 1,
            yMax = inputArray.length - 1;

        ns.tprint("INFO Solving " + ns.codingcontract.getContractType(contract, server) + " at " + server);
        ns.tprint("Original array: ");
        printArray(ns, inputArray);

        function walker(posX, posY) {
            if (inputArray[posY][posX] == 1) return;
            if (posX == xMax && posY == yMax) solved++;
            if (posX < xMax) walker(posX + 1, posY);
            if (posY < yMax) walker(posX, posY + 1);
        }

        walker(0, 0);

        ns.tprint("Solved result:");
        ns.tprint(solved);
        ns.tprint("Reward:");
        ns.tprint(ns.codingcontract.attempt(solved.toString(), contract, server, { returnReward: true }));
    }

    function mergeOverlappingIntervals(contract, server) {
        let allShit = ns.codingcontract.getData(contract, server);
        ns.tprint("INFO Solving " + ns.codingcontract.getContractType(contract, server) + " at " + server);
        ns.tprint("Original array: ");
        ns.tprint(allShit);
        allShit.sort((a, b) => a[0] - b[0]);
        ns.tprint("Sorted:");
        ns.tprint(allShit);

        for (let i = allShit.length - 1; i >= 0; i--) {
            for (let j = allShit.length - 1; j >= 0; j--) {
                if (i != j &&
                    ((allShit[i][0] >= allShit[j][0] && allShit[i][0] <= allShit[j][1]) ||
                        (allShit[i][1] <= allShit[j][1] && allShit[i][1] >= allShit[j][0]))
                ) {
                    allShit[j] = [Math.min(allShit[i][0], allShit[j][0]), Math.max(allShit[i][1], allShit[j][1])];
                    allShit.splice(i, 1);
                    break;
                }
            }
        }

        ns.tprint("Solved array:");
        ns.tprint(allShit);
        ns.tprint("Reward:");
        ns.tprint(ns.codingcontract.attempt(allShit, contract, server, { returnReward: true }));
    }

    function spiralizeMatrix(contract, server) {
        let inputArray = ns.codingcontract.getData(contract, server),
            solved = [], orig = [];
        ns.tprint("INFO Solving " + ns.codingcontract.getContractType(contract, server) + " at " + server);
        ns.tprint("Original array: ");
        printArray(ns, inputArray);
        let xMin = 0;
        let yMin = 0;
        let xMax = inputArray[0].length - 1;
        let yMax = inputArray.length - 1;
        for (const arr of inputArray)
            for (const num of arr)
                orig.push(num);

        while (1) {
            if (solved.length >= orig.length) break;
            for (let i = xMin; i <= xMax; i++) {
                solved.push(inputArray[yMin][i]);
            }
            yMin++;
            if (solved.length >= orig.length) break;
            for (let i = yMin; i <= yMax; i++) {
                solved.push(inputArray[i][xMax]);
            }
            xMax--;
            if (solved.length >= orig.length) break;
            for (let i = xMax; i >= xMin; i--) {
                solved.push(inputArray[yMax][i]);
            }
            yMax--;
            if (solved.length >= orig.length) break;
            for (let i = yMax; i >= yMin; i--) {
                solved.push(inputArray[i][xMin]);
            }
            xMin++;
        }
        ns.tprint("Solved array:");
        ns.tprint(solved);
        ns.tprint("Reward:");
        ns.tprint(ns.codingcontract.attempt(solved.toString(), contract, server, { returnReward: true }));
    }
}