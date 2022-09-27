/** @param {import('../.').NS} ns */
export async function main(ns) {
    const c64colors = [234, 253, 131, 110, 133, 70, 63, 185, 130, 94, 238, 243, 155, 105, 249];
    const fgcolors = c64colors.map(x => x = "\x1b[38;5;" + x + "m");
    const bgcolors = c64colors.map(x => x = "\x1b[48;5;" + x + "m");

    fgcolors.forEach(c => ns.tprint(c + "This color is awesome"));
    bgcolors.forEach(c => ns.tprint(c + "       "));
}