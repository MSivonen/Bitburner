/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {
    function sendVariable(data, port) {
        ns.clearPort(port);
        ns.writePort(port, data);
    }

    sendVariable(Math.random(), 123);
}