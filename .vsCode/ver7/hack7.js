
/** @param {NS} ns */
/** @param {import("..").NS} ns */
export async function main(ns) {
    let runTime = ns.args[3];
    let port = ns.getPortHandle(ns.args[1]);
    await port.nextWrite();
    const start = performance.now();
    await ns.hack(ns.args[0]);
    ns.tprint("\x1b[33m" + "H " + runTime + "   " + (performance.now() - start));

}