/** @param {NS} ns */
/** @param {import("..").NS} ns */
export async function main(ns) {
    ns.sleep(ns.args[1]);
    ns.weaken(ns.args[0]);
}