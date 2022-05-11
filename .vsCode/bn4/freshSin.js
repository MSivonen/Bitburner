/** @param {NS} ns */
export async function main(ns) {
	if (ns.getScriptRam("/bn4/startSin.js") > ns.getServerMaxRam("home") * 1.5) {
		ns.exec("/bn4/n00bSin.js", "home");
	} else ns.exec("/bn4/startSin.js", "home");
	ns.kill("/bn4/freshSin.js", "home");
}