import {
    printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
    secondsToHMS, killAllButThis, connecter, randomInt, map, readFromJSON, writeToJSON, openPorts2, getBestFaction, col
}
    from '/lib/includes.js'

/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {

    printArray
    ns.tail();
    ns.disableLog("ALL");
    ns.clearLog();
    const
        debug = false,
        maxTargets = 1, //todo
        batchInterval = 80,
        useHashes = ns.args[0] ?? true, //todo
        useHacknetServersForBatching = true; //todo


    let
        batchesA = [],
        preppingA = [],
        endTimesA = [],
        targetsA = [],
        id = 100,
        batchNumber = 0;

    const
        hackFile = "/ver7/hack7.js",
        growFile = "/ver7/grow7.js",
        weakFile = "/ver7/weak7.js",
        allFiles = [weakFile, hackFile, growFile],
        weakRam = ns.getScriptRam(weakFile),
        growRam = ns.getScriptRam(growFile),
        hackRam = ns.getScriptRam(hackFile);

    class Batch {
        files = [];
        alive = true;
        constructor({ targetServer, hackThreads, growThreads, weak1Threads, weak2Threads, batchNO }) {
            this.targetServer = targetServer;
            this.batchNO = batchNO;
            this.hackThreads = hackThreads;
            this.growThreads = growThreads;
            this.weak1Threads = weak1Threads;
            this.weak2Threads = weak2Threads;
            this.batchStartTimeDebug = performance.now();
            this.start();
        }

        start() {
            if (!this.runBatch()) this.terminate();
            else if (this.files.some(f => checkForCollision(f.startTime))) this.terminate();
            else this.files.forEach(f => endTimesA.push({ batching: true, target: this.targetServer, endTime: f.startTime + f.time }));
        }

        getHackTime() {
            const tServ = ns.getServer(this.targetServer);
            tServ.moneyAvailable = tServ.moneyMax;
            tServ.hackDifficulty = tServ.minDifficulty;
            return ns.formulas.hacking.hackTime(tServ, ns.getPlayer());
        }

        getGrowTime() {
            const tServ = ns.getServer(this.targetServer);
            tServ.moneyAvailable = tServ.moneyMax;
            tServ.hackDifficulty = tServ.minDifficulty;
            return ns.formulas.hacking.growTime(tServ, ns.getPlayer())
        }

        getWeakTime() {
            const tServ = ns.getServer(this.targetServer);
            tServ.moneyAvailable = tServ.moneyMax;
            tServ.hackDifficulty = tServ.minDifficulty;
            return ns.formulas.hacking.weakenTime(tServ, ns.getPlayer());
        }

        runBatch() {
            const hs = findRamHG(this.hackThreads, hackFile);
            if (!hs) return;
            ns.clearPort(id);

            this.files.push(
                {
                    name: "hack",
                    id: id,
                    pid: ns.exec(hackFile, hs, this.hackThreads, this.targetServer, id++, Math.random(), this.getHackTime()),
                    startTime: performance.now() + this.getWeakTime() - batchInterval,
                    time: this.getHackTime(),
                    started: false
                });

            const gs = findRamHG(this.growThreads, growFile);
            if (!gs) return;
            ns.clearPort(id);
            this.files.push(
                {
                    name: "grow",
                    id: id,
                    pid: ns.exec(growFile, gs, this.growThreads, this.targetServer, id++, Math.random(), this.getGrowTime()),
                    startTime: performance.now() + this.getWeakTime() + batchInterval,
                    time: this.getGrowTime(),
                    started: false
                });

            const w1s = findRamW(this.weak1Threads);
            if (!w1s) return;
            w1s.forEach(s => {
                ns.clearPort(id);
                this.files.push(
                    {
                        name: "weak1",
                        id: id,
                        pid: ns.exec(weakFile, s.server, s.threads, this.targetServer, id++, Math.random(), this.getWeakTime()),
                        startTime: performance.now(),
                        time: 0,// this.getWeakTime(),
                        started: false
                    })
            });

            const w2s = findRamW(this.weak2Threads);
            if (!w2s) return;
            w2s.forEach(s => {
                ns.clearPort(id);
                this.files.push(
                    {
                        name: "weak2",
                        id: id,
                        pid: ns.exec(weakFile, s.server, s.threads, this.targetServer, id++, Math.random(), this.getWeakTime()),
                        startTime: performance.now() + 2 * batchInterval,
                        time: 0,// this.getWeakTime(),
                        started: false
                    })
            });

            //console.table(this.files);
            return "Great success!";
        }

        terminate() {
            this.files.forEach(f =>
                ns.kill(f.pid));
            this.alive = false;
            if (debug) ns.tprint("Killed batch no " + this.batchNO);
        }

        isRunning() {
            for (let i = this.files.length - 1; i >= 0; i--) {
                if (!ns.isRunning(this.files[i].pid)) {
                    if (debug) console.log("Batch " + this.batchNO + " " + this.files[i].name + " end at: " + (performance.now() - this.batchStartTimeDebug));
                    this.files.splice(i, 1);
                }
            }
            if (!this.files.length) {
                if (debug && this.batchStartTimeDebug - performance.now() > 100) ns.tprint("Batch " + this.batchNO + " end");
                return false;
            }
            return true;
        }

        update() {
            this.files.forEach(f => {
                if (f.name == "hack") f.time = this.getHackTime();
                if (f.name == "grow") f.time = this.getGrowTime();
                if (performance.now() >= f.startTime - f.time && !f.started) {
                    if (debug) console.log("Batch " + this.batchNO + " Starting " + f.name + ", endtime: " + (f.startTime + f.time - this.batchStartTimeDebug));
                    ns.writePort(f.id, "Badger");
                    f.started = true;
                }
            });
            this.alive = this.isRunning();
        }
    }

    class Prep extends Batch {
        constructor({ targetServer, batchNO }) {
            super({ targetServer, batchNO });
        }

        async update() {
            this.weakTime = ns.getWeakenTime(this.targetServer);
            this.growTime = ns.getGrowTime(this.targetServer);
            if (!this.isRunning() && this.alive) {
                if (this.needsWeak())
                    this.weaken();
                else if (this.needsGrow())
                    this.grow();
                else this.terminate();
            }
            await ns.sleep(100);
            super.update();
            // console.table(this.files);
            //console.log(performance.now())
            // ns.exit();
        }

        start() {
            this.alive = true;
        }

        needsWeak() {
            return ns.getServerSecurityLevel(this.targetServer) > ns.getServerMinSecurityLevel(this.targetServer);
        }
        needsGrow() {
            return ns.getServerMoneyAvailable(this.targetServer) < ns.getServerMaxMoney(this.targetServer);
        }

        weaken() {
            const ws = findRamW(this.getWeakThreads());
            if (debug) console.log("start weak in servers: " + ws)
            if (!ws) return;
            ws.forEach(s => {
                console.log("server: " + s.server + ", threads: " + s.threads + ", MAX: " + getMaxThreads(s.server, weakFile))
                ns.clearPort(id);
                this.files.push(
                    {
                        name: "weakPrep",
                        id: id,
                        pid: ns.exec(weakFile, s.server, s.threads, this.targetServer, id++, Math.random()),
                        startTime: performance.now(),
                        time: this.weakTime,
                        started: false
                    })
            });
            // console.table(this.files)

        }

        grow() {
            const missingMoney = ns.getServerMaxMoney(this.targetServer) - ns.getServerMoneyAvailable(this.targetServer);
            const missingPercent = ns.getServerMaxMoney(this.targetServer) / missingMoney;
            const gs = findRamW(getGrowThreads(this.targetServer, "n00dles", missingPercent), "grow"); //noodles for cores calc, wip
            if (typeof (gs.at(-1)) == "number") gs.pop();
            if (debug) console.log("start grow in servers: " + gs)

            if (!gs) return;
            gs.forEach(s => {
                ns.clearPort(id);
                this.files.push(
                    {
                        name: "growPrep",
                        id: id,
                        pid: ns.exec(growFile, s.server, s.threads, this.targetServer, id++, Math.random()),
                        startTime: performance.now(),
                        time: performance.now() + this.weakTime - this.growTime + batchInterval,
                        started: false
                    })
            });
        }

        getWeakThreads() {
            return Math.ceil(
                (ns.getServerSecurityLevel(this.targetServer) - ns.getServerMinSecurityLevel(this.targetServer))
                / ns.weakenAnalyze(1)
            );
        }
    }
    const getRamServers = (bigFirst) => {
        if (bigFirst) return getServersWithRam(ns).sort((a, b) => getFreeRam(b) - getFreeRam(a));
        else return getServersWithRam(ns).sort((a, b) => getFreeRam(a) - getFreeRam(b));
    };
    const getFreeRam = (server) => ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
    const getMaxThreads = (server, file) => Math.floor(getFreeRam(server) / ns.getScriptRam(file));
    const isServerPrepped = (server) => ns.getServerMoneyAvailable(server) == ns.getServerMaxMoney(server) &&
        ns.getServerSecurityLevel(server) == ns.getServerMinSecurityLevel(server);
    const getAllTotalRam = () => getServersWithRam(ns).reduce((prev, curr) => prev + ns.getServerMaxRam(curr), 0);
    const getAllFreeRam = () => getServersWithRam(ns).reduce((prev, curr) => prev + getFreeRam(curr), 0);


    const getTargets = () =>
        getServersWithMoney(ns).
            filter(s => ns.getServerRequiredHackingLevel(s) < ns.getHackingLevel() / 2).
            sort((a, b) => {
                const servA = ns.getServer(a), servB = ns.getServer(b);
                servA.hackDifficulty = servA.minDifficulty;
                servB.hackDifficulty = servB.minDifficulty;
                const weakTimeA = ns.formulas.hacking.weakenTime(servA, ns.getPlayer()),
                    weakTimeB = ns.formulas.hacking.weakenTime(servB, ns.getPlayer());
                return servA.moneyMax / weakTimeA - servB.moneyMax / weakTimeB;
            });

    const getGrowThreads = (targetServer, runServer, stealPercent = moneyToSteal, prep) => {
        const tServ = ns.getServer(targetServer);
        if (!prep) {
            tServ.moneyAvailable = tServ.moneyMax * (1 - stealPercent * 1.01);
            tServ.hackDifficulty = tServ.minDifficulty;
        }
        let threads = 1,
            foundBiggest = false,
            minGuess = 1,
            maxGuess = 2,
            newMoney = 0;

        while ("binary search for number of growThreads") {
            if ((minGuess == maxGuess || minGuess + 1 == maxGuess) && newMoney >= tServ.moneyMax) return threads;
            newMoney = (tServ.moneyAvailable + threads) *
                ns.formulas.hacking.growPercent(tServ, threads, ns.getPlayer(), ns.getServer(runServer).cpuCores);
            if (!foundBiggest && newMoney < tServ.moneyMax) maxGuess *= 16; else foundBiggest = true; //first find a too big number
            if (newMoney >= tServ.moneyMax) { //if too much threads, set maxGuess to current and lower the guess
                maxGuess = threads;
                threads = Math.floor(minGuess + (maxGuess - minGuess) / 2);
            } else {//if not enough threads, set minGuess to current and raise the guess
                minGuess = threads;
                threads = Math.ceil(minGuess + (maxGuess - minGuess) / 2) + 1;
            }
        }
    }

    const getHackThreads = (targetServer, stealPercent = moneyToSteal()) => {
        const tServ = ns.getServer(targetServer);
        tServ.moneyAvailable = tServ.moneyMax * (1 - stealPercent);
        tServ.hackDifficulty = tServ.minDifficulty;
        return Math.max(1, Math.floor(stealPercent / ns.formulas.hacking.hackPercent(tServ, ns.getPlayer())));
    }

    const getWeakThreads = (runServer, threads = { hack: undefined, grow: undefined }) => {
        if (threads.hack) {
            return Math.ceil((threads.hack * 0.002) / ns.weakenAnalyze(1, ns.getServer(runServer).cpuCores));
        }
        if (threads.grow) {
            return Math.ceil((threads.grow * 0.004) / ns.weakenAnalyze(1, ns.getServer(runServer).cpuCores));
        }
    }

    const findRamHG = (threads, file) => {
        for (const s of getRamServers()) {
            if (getMaxThreads(s, file) >= threads) return s;
        }
    }

    /**@param threads {number}
     * @param prep {string | undefined} "grow" for grow threads, undefined for weak threads */
    const findRamW = (threads, prep) => {
        const retArr = [];
        for (const s of getRamServers(prep)) {
            const fits = getMaxThreads(s, prep == "grow" ? growFile : weakFile);
            if (!fits) continue;
            if (fits >= threads) {
                retArr.push({ server: s, threads: threads });
                threads = 0;
                break;
            }
            retArr.push({ server: s, threads: fits });
            threads -= fits;
        }
        if (!threads) return retArr;
        if (threads < 0) { //debug. Threads should never be <0 if my brain is half awake
            ns.tprint(col.r + "Error in W(tf) threads");
            exitWithError();
        }
        if (prep) return [...retArr, threads];
    }

    const checkForCollision = (time) => {
        const timeWindow = batchInterval;
        if (endTimesA.some(t => t.endTime < time + timeWindow && t.endTime > time - timeWindow)) {
            if (debug) ns.tprint(col.y + "collision");
            return true;
        }
    }

    const moneyToSteal = () => {
        return [
            [0, .01],
            [6000, .07],
            [30000, .1],
            [60000, .15],
            [120000, .3],
            [180000, .35],
            [360000, .75],
            [7000000, .9]
        ].filter(x => x[0] <= getAllTotalRam()).pop()[1];
    }



    function filterEndTimes(arr, prop = "endTime") {
        return arr.filter(t => t[prop] > performance.now());
    }

    ns.atExit(() => {
        batchesA.forEach(b =>
            b.files.forEach(f =>
                ns.kill(f.pid)));
        preppingA.forEach(b =>
            b.files.forEach(f =>
                ns.kill(f.pid)));
    })

    class Stats {
        stats = {
            "Total Ram:    ": 1234,
            "Free Ram:     ": 1234,
            "Money steal%: ": moneyToSteal(),
            "Targets:      ": []
        }

        update() {
            this.stats['Total Ram:    '] = ns.nFormat(getAllTotalRam() * 1e9, "0.00b");
            this.stats['Free Ram:     '] = ns.nFormat(getAllFreeRam() * 1e9, "0.00b");
            this.stats['Money steal%: '] = Math.floor(moneyToSteal() * 100) + "%";
            this.stats['Targets:      '] = "";
            targetsA.forEach(t => {
                this.stats['Targets:      '] += col.w + t + col.g + " batches running: " + col.w + batchesA.length +
                    col.c + "\nMoney:        " + col.y + ns.nFormat(ns.getServerMoneyAvailable(t), "0.00a").toString().padEnd(8) + col.c + " / " +
                    col.y + ns.nFormat(ns.getServerMaxMoney(t).toString().padEnd(8), "0.00a") +
                    col.c + "\nSecurity:     " + col.m + ns.getServerSecurityLevel(t).toFixed(1).toString().padEnd(8) + col.c + " / " +
                    col.m + ns.getServerMinSecurityLevel(t).toFixed(1).toString().padEnd(8);
            })
        }

        print() {
            ns.clearLog();
            Object.entries(this.stats).forEach(([k, v]) => ns.print(k + v));
        }
    }

    let stats = new Stats();

    function runNewBatch() {
        let target = getTargets().pop();
        target = "phantasy";
        targetsA = [target];

        let hackThr = getHackThreads(target, moneyToSteal());
        let growThr = getGrowThreads(target, "home", moneyToSteal());

        getServersWithRam(ns).forEach(s => ns.scp(allFiles, s));

        stats.update();
        stats.print();
        if (isServerPrepped(targetsA[0])) {
            endTimesA = filterEndTimes(endTimesA);
            batchesA.push(new Batch({
                targetServer: target,
                hackThreads: hackThr,
                growThreads: growThr,
                weak1Threads: getWeakThreads("home", { hack: hackThr }),
                weak2Threads: getWeakThreads("home", { grow: growThr }),
                batchNO: batchNumber++
            }));
        } else {
            if (preppingA.length == 0) {
                preppingA.push(new Prep({
                    targetServer: target,
                    batchNO: batchNumber++
                }));
            }
        }
    }


    //test stuff



    let prevTime = 0;

    while ("main loop") {
        if (prevTime + batchInterval * 5 < performance.now()) {
            runNewBatch();
            prevTime = performance.now();
        }
        await ns.sleep(3);
        batchesA.forEach(b => b.update());
        for (const p of preppingA) await p.update();
        batchesA = batchesA.filter(b => b.alive);
        preppingA = preppingA.filter(p => p.alive);
        //if (!preppingA.length) break;
        //if (batchNumber > 1000) break;
    }
}