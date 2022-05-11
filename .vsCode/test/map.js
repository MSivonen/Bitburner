/** @param {NS} ns */
export async function main(ns) {
	ns.tprint(map(4, 0, 10, -100, 100));

	function map(number, inMin, inMax, outMin, outMax) {
		return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
	}
}