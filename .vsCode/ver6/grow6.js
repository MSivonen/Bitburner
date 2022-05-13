/** @param {NS} ns */
/** @param {import("..").NS} ns */
export async function main(ns) {
    //args=target, sleep, random, scriptTime, batcInterval, debug on
    const startTime = Date.now();
    const expEnd = startTime + ns.args[1] + ns.args[3];
    await ns.sleep(ns.args[1]);
    await ns.grow(ns.args[0]);
    const endTime = Date.now();
    const expVSobs = endTime - expEnd;
    if (ns.args[5]) { //if debug on
        if (ns.args[1] == 1)
            ns.tprint("INFO end of init grow");
        else ns.tprint("WARN end of           grow.                     // Observed - expected endtime = " + expVSobs + "   RAW: exp=" + expEnd % 100000 + " obs=" + endTime % 100000);
    }
}