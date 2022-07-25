import {
	printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
	secondsToHMS, killAllButThis, connecter, randomInt, map, readFromJSON, writeToJSON, openPorts2, getBestFaction
}
	from '/lib/includes.js'
import { sound } from '/test/sound.js'

/** @param {NS} ns */
/** @param {import('..').NS} ns */
export async function main(ns) {

	const
		c = [16.35, 32.70, 65.41, 130.81, 261.63, 523.25, 1046.50, 2093.00, 4186.01],
		db = [17.32, 34.65, 69.30, 138.59, 277.18, 554.37, 1108.73, 2217.46, 4434.92],
		d = [18.35, 36.71, 73.42, 146.83, 293.66, 587.33, 1174.66, 2349.32, 4698.64],
		eb = [19.45, 38.89, 77.78, 155.56, 311.13, 622.25, 1244.51, 2489.02, 4978.03],
		e = [20.60, 41.20, 82.41, 164.81, 329.63, 659.26, 1318.51, 2637.02],
		f = [21.83, 43.65, 87.31, 174.61, 349.23, 698.46, 1396.91, 2793.83],
		gb = [23.12, 46.25, 92.50, 185.00, 369.99, 739.99, 1479.98, 2959.96],
		g = [24.50, 49.00, 98.00, 196.00, 392.00, 783.99, 1567.98, 3135.96],
		ab = [25.96, 51.91, 103.83, 207.65, 415.30, 830.61, 1661.22, 3322.44],
		a = [27.50, 55.00, 110.00, 220.00, 440.00, 880.00, 1760.00, 3520.00],
		bb = [29.14, 58.27, 116.54, 233.08, 466.16, 932.33, 1864.66, 3729.31],
		b = [30.87, 61.74, 123.47, 246.94, 493.88, 987.77, 1975.53, 3951.07],
		p = "pause";

	let bpm = 130;
	const fullNote = 120000 / bpm;

	const song = [

		d[3], 4,
		f[3], 4,
		a[4], 4,
		d[3], 4,

		d[4], 4,
		f[3], 4,

		g[3], 4,
		f[4], 4,


	];
	const song2 = [

		d[2], 2,

		a[2], 2,

		f[2], 2,
		g[2], 2,


	];

	let transpose = 1;

	function note(thisNote, len, ind = 0) {
		if (thisNote != "pause" && ind == 0) sound.beep({ duration: fullNote / len, freq: thisNote * transpose, type: "square" });
		if (thisNote != "pause" && ind == 1) sound.beep({ duration: fullNote / len, freq: thisNote * transpose, type: "sine" });
	}

	ns.tail();
	ns.disableLog("ALL");
	let i = 0;
	let j = 0;
	let iter = 0;
	let nextTime = performance.now() + fullNote;
	let nextTime2 = performance.now() + fullNote;
	while (1) {
		if (i >= song.length) {
			i = 0;
			j = 0;
		}
		iter++;
		if (performance.now() >= nextTime) {
			//note(song[i], song[i + 1]);
			nextTime += fullNote / song[i + 1];
			i += 2;
		}
		if (performance.now() >= nextTime2) {
			note(song2[j], song2[j + 1], 1);
			nextTime2 += fullNote / song2[j + 1];
			j += 2;
		}

		if (iter > 10000) await ns.asleep();

	}
}