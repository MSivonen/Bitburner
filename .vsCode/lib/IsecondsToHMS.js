/** @param {NS} ns */
export function secondsToHMS(ns, s) {
	let time = {
		hours: ((s - s % 3600) / 3600) % 60,
		minutes: ((s - s % 60) / 60) % 60,
		seconds: s % 60
	}
	time.seconds = time.seconds.toFixed(0);
	return time.hours + ":" + time.minutes + ":" + time.seconds;
}