/** @param {NS} ns */
export async function main(ns) {
	const multByPi = pi => val => val * pi;
	;

	const multByPie = val => val * 3.1415;
	const mult = (val, val2) => val * val2;

	//	ns.tprint(multByPi(2.718));
	//	ns.tprint(multByPie(2.718));
	//	[0, 1, 2, 3, 4, 5].forEach(e => ns.tprint(e * 3.1415));
	ns.tprint(multByPi(2)(4));
}