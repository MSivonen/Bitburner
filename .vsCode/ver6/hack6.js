/** @param {NS} ns */
/** @param {import("../.").NS} ns */
export async function main(ns) {
    //args=target, sleep, random, scriptTime, batcInterval, debug on
    const startTime = Date.now();
    const expEnd = startTime + ns.args[1] + ns.args[3];
    await ns.sleep(ns.args[1]);
    await ns.hack(ns.args[0]);
    const endTime = Date.now();
    const expVSobs = endTime - expEnd;
    if (ns.args[5]) { //if debug on
        ns.tprint("ERROR end of hack                               // Observed - expected endtime = " + expVSobs + "   RAW: exp=" + expEnd % 100000 + " obs=" + endTime % 100000);
    }
}