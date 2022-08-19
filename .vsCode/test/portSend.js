/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {
    let port = ns.getPortHandle(8); //x = 1-20
    port.write("┌──────┬───ö────┬──────────┬──────────┬────────────┬────────────┬────────────┐│ SYM  │ Type   │ Forecast │ Forecast │ Shares     │ Money      │ Profit     │");
}