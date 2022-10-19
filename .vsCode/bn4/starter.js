//Created: 28.08.2022 12:36:36
//Last modified: 19.10.2022 19:21:52
import {
    printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
    secondsToHMS, killAllButThis, connecter, randomInt, map, readFromJSON, writeToJSON, col, openPorts2, getBestFaction
}
    from 'lib/includes.js'

/** @param {import('../.').NS} ns */
export async function main(ns) {
    let g_queuePaused;
    const libraries = ["/lib/includes.js", "/lib/tables_xsinx.js", "/lib/weak.js", "/lib/grow.js",
        "/ver6/hack6.js", "/ver6/grow6.js", "/ver6/weak6.js"];

    ns.disableLog("ALL");
    ns.tail();

    function runningSomewhere(file) {
        let running = [];
        getServers(ns).forEach(s => {
            ns.ps(s).forEach(f => {
                if (f.filename.includes(file))
                    running.push({
                        server: s,
                        filename: f.filename,
                        pid: f.pid
                    })
            })
        });
        if (running.length != 0) return running;
        else return;
    }

    async function runSomewhere(file, args) {
        await ns.sleep();
        await copyFiles();
        let returnVal;
        let servers = getServers(ns);
        servers.sort((a, b) => (ns.getServerMaxRam(a) - ns.getServerUsedRam(a)) - (ns.getServerMaxRam(b) - ns.getServerUsedRam(b)));
        //printArray(ns,servers)

        for (const serv of servers) {
            if (!ns.hasRootAccess(serv)) continue;
            if (ns.getServerMaxRam(serv) - ns.getServerUsedRam(serv) >= ns.getScriptRam(file)) {
                if (args) returnVal = ns.exec(file, serv, 1, ...args); //return pid
                else returnVal = ns.exec(file, serv, 1);
                //ns.tprint(file, serv, returnVal)
                break;
            }
        }
        if (returnVal == 0) returnVal = undefined;
        return returnVal;
    }

    async function copyFiles() {
        for (const serv of getServers(ns)) {
            await ns.scp(libraries, serv);
            for (const o of Object.values(spawnQueue))
                await ns.scp(o.file, serv);
        }
    }

    class RunFile {
        constructor(o) {
            this.name = o.name;
            this.file = o.file;
            this.killAfter = o.killAfter;
            this.args = o.args;
            this.pauseQueue = o.pauseQueue;
            this.done = false;
            this.pid = runningSomewhere(this.file)?.pop().pid; //pid or undefined
            this.running = this.pid ? true : false;
            this.timer = 0;
            this.waitFor = o.waitFor;
            this.queuePaused = true;
            this.timeLeft = undefined;

            if (this.waitFor) this.pauseQueue = true;
            if (this.pid) this.done = true;
        }

        async execute() {
            //ns.tprint("trying to run " + this.file);
            this.pid = await runSomewhere(this.file, this.args);
            if (this.pid) {
                //ns.tprint(this.name + " running...");
                this.running = true;
                if (this.killAfter) this.timer = performance.now() + this.killAfter * 1000;
                if (this.waitFor) this.timer = performance.now() + this.waitFor * 1000;
                if (!this.pauseQueue) this.queuePaused = false;
                if (!this.killAfter && !this.waitFor && !this.pauseQueue) this.done = true;
            }
        }

        async update() {
            if (!this.pid && !this.done) await this.execute();
            if (this.killAfter || this.waitFor) {
                this.timeLeft = Math.floor((this.timer - performance.now()) / 1000);
            }
            if (performance.now() > this.timer) {
                if (this.killAfter && this.running)
                    this.kill();
                if (this.waitFor && !this.done) {
                    //ns.tprint(this.name + " wait ended");
                    this.done = true;
                }
            }

            if (!runningSomewhere(this.file) && this.pid)
                this.end();

            if (this.done) this.queuePaused = false;
        }

        print() {
            ns.tprint(this);
            console.log(this);
        }

        end() {
            //ns.tprint(this.name + " ending...");
            this.done = true;
            this.pid = undefined;
            this.running = false;
        }

        kill() {
            //ns.tprint(this.name + " killing...");
            ns.kill(this.pid);
            this.end();
        }
    }

    function updateTail() {
        ns.clearLog();
        //ns.print("paused " + g_queuePaused)
        for (const o of spawnQueue) {
            const qEntry = queue.find(x => x.name == o.name);
            let line = "";
            if (qEntry) {
                line += qEntry.done ? col.g + " V " :
                    qEntry.running ? col.w + "-> " :
                        col.r + "OOM"; //out of memory, or WOO upside down. You decide.
            } else
                line += col.m + " X ";

            line += col.c + o.name.padEnd(20);

            if (qEntry && qEntry.timeLeft && !qEntry.done) line += col.w + qEntry.timeLeft + "s remaining";

            ns.print(line);
        }
        //printArray(ns, queue, "tail");
    }

    let spawnQueue = [ //args is a array!!!
        { name: "Buy programs", file: "/lib/buyPrograms.js", killAfter: 250, args: [true] },
        { name: "Log", file: "/watcher/watcher.js" },
        { name: "Open ports", file: "/lib/openPorts.js", killAfter: 250, args: [true] },
        { name: "Spam JoesGuns", file: "/lib/spamJoesGuns.js", killAfter: 12, args: ["n00dles"], pauseQueue: true },
        { name: "Stanek charge", file: "/stanek/stanek.js", waitFor: 12, args: [11] },
        { name: "Commander", file: "/bn4/commando.js" }, //get to the choppa!
        { name: "Batcher", file: "/ver6/ver6.js" },
        { name: "Homicide", file: "/bn4/spamHomicide.js", pauseQueue: true },
        { name: "Old commander", file: "/bn4/startSin.js" },
        { name: "hackNet", file: "/hacknet/hackNet.js" },
        { name: "Start gang", file: "/gang/thugGang.js" },
        //{ name: "Stocks", file: "/stock/stockXsinx.js" },
        { name: "Sleeves", file: "/bn4/sleeves.js" }
    ];

    let queue = [];
    let index = 0;

    ns.atExit(() => ns.closeTail());

    while (true) {
        g_queuePaused = false;
        queue.forEach(r => { if (r.queuePaused) g_queuePaused = true });

        if (!g_queuePaused && index < spawnQueue.length) {
            await copyFiles();
            queue.push(new RunFile(spawnQueue[index]));
            index++;
        }
        for (const o of queue)
            await o.update();

        updateTail();

        let done = true;
        if (queue.length == spawnQueue.length) {
            for (const o of queue)
                if (!o.done) done = false;
            if (done) break;
        }

        await ns.sleep(100);
    }
}