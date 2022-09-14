/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {
    let port = ns.getPortHandle(3); //x = 1-20
    port.write(Math.random());
}