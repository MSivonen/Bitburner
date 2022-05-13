/** @param {NS} ns */
/** @param {import("..").NS} ns */
export async function main(ns) {
    //args=target, sleep, random, scriptTime, batcInterval, debug on
    const startTime = Date.now();
    const expEnd = startTime + ns.args[1] + ns.args[3];
    await ns.sleep(ns.args[1]);
    await ns.weaken(ns.args[0]);
    const endTime = Date.now();
    const expVSobs = endTime - expEnd;
    if (ns.args[5]) { //if debug on
        if (ns.args[1] > 1) ns.tprint("     end of                weak2                // Observed - expected endtime = " + expVSobs + "   RAW: exp=" + expEnd % 100000 + " obs=" + endTime % 100000);
        else if (ns.args[1] == 1)
            ns.tprint("INFO end of init weak");
        else ns.tprint("INFO end of      weak1                          // Observed - expected endtime = " + expVSobs + "   RAW: exp=" + expEnd % 100000 + " obs=" + endTime % 100000);
    }
}