/** @param {NS} ns */
export async function main(ns) {
	function r(s = "home", f = []) {
		if (!f.includes(s)) f.push(s);
		let c = ns.scan(s);
		if (f.length != 96) r(c[Math.round(Math.random() * (c.length - 1 + .9999) - .5)], f);
		return (f);
	}
	ns.tail();
	ns.tprint(r());
}