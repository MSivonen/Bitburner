import {
	printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
	secondsToHMS, killAllButThis, connecter, randomInt, writeToJSON, openPorts2, getBestFaction, col
}
	from '/lib/includes.js'

/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {
	//-------edit these-------
	const statFile = "intfarmstats2.txt",
		font = "Consolas",
		fontSize = 18,
		hours = undefined,// 24,
		w = 1400, h = 800;

	//Leave scale empty for automatic scale
	const graphedItems = [{
		prop: "intExp",
		color: "rgba(255,255,255,1)",
		title: "Int exp",
		logarithmic: true
	}, {
		prop: "H",
		color: "rgba(20,255,20,0.8)",
		title: "Hyperdrive",
		logarithmic: true
	}, /*{
		prop: "I",
		color: "rgba(255,90,90,0.4)",
		title: "Investigation",
		scale: 1200
	}, {
		prop: "U",
		color: "rgba(20,255,255,0.4)",
		title: "Undercover Operation",
		scale: 1200
	}, */{
		prop: "A",
		color: "rgba(255,255,20,0.4)",
		title: "Assassination",
		scale: 2000
	}, {
		prop: "int",
		color: "rgba(255,155,155,1)",
		title: "Intelligence",
	}];
	//-----ffs stop editing-----

	//margins around the window edges
	const lMargin = 10, rMargin = 10, tMargin = 10, bMargin = 10;

	CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
		if (w < 2 * r) r = w / 2;
		if (h < 2 * r) r = h / 2;
		this.beginPath();
		this.moveTo(x + r, y);
		this.arcTo(x + w, y, x + w, y + h, r);
		this.arcTo(x + w, y + h, x, y + h, r);
		this.arcTo(x, y + h, x, y, r);
		this.arcTo(x, y, x + w, y, r);
		this.closePath();
		return this;
	}

	let doc = eval("document");
	ns.tail();
	await ns.sleep(50);
	ns.resizeTail(w, h);
	let logArea = [...doc.querySelectorAll(".react-draggable .react-resizable")].pop();
	logArea.children[1].style.display = "none";
	let bufferCanvas = doc.createElement("canvas"),
		ctx = bufferCanvas.getContext("2d");
	let canvas = logArea.appendChild(doc.createElement("canvas")),
		ctxDraw = canvas.getContext("2d");
	canvas.width = w;
	canvas.height = h;
	bufferCanvas.width = w;
	bufferCanvas.height = h;
	const titleH = logArea.children[0].clientHeight;
	canvas.style.height = `calc(100% - ${titleH + 3}px)`;
	canvas.style.width = "calc(100% - 1px)";
	canvas.style.marginLeft = "1px";
	canvas.style.marginTop = "1px";


	logArea.style.backdropFilter = "blur(6px)";

	let minimized = false;
	[...doc.querySelectorAll(".react-draggable")].pop().querySelectorAll("button")[1].addEventListener("click", () => { //minimize button
		minimized = !minimized;
		minimized ? canvas.style.display = "none" : canvas.style.display = "";
	});

	ns.atExit(() => {
		logArea.style = "";
		logArea.removeChild(canvas);
		//ns.closeTail(); //dafuq
	});

	//make an array with timestamps every minute from (current time-hours) to current time
	//If no arg, start at the beginning of stat file
	function makeEmptyArr(hours) {
		let arr = readFromJSON(ns, statFile);
		let emptyArr = [];
		console.log(arr.at(-1).time)
		let endTime = new Date(arr.at(-1).time).valueOf();
		console.log(endTime)
		let startTime = hours ? endTime - (1000 * 60 * 60 * hours) : new Date(arr[0].time).valueOf();
		for (let i = startTime; i <= endTime; i += 60 * 1000) {
			emptyArr.push(new Date(Math.floor(i / 60000) * 60000));
		}
		return emptyArr;
	}

	/** @returns [title, scale, logarithmic, color] */
	async function drawStat(emptyArr, prop, color, text, scale, logarithmic) {
		let arr = readFromJSON(ns, statFile);
		arr.forEach(e => e.time = new Date(Math.floor(new Date(e.time).valueOf() / 60000) * 60000));
		let startIndex = 0;
		for (let i = 0; i < arr.length; i++) {
			if (!arr[i][prop] || arr[i].time.valueOf() < emptyArr[0].valueOf()) continue;
			startIndex = i; break;
		}
		arr.splice(0, startIndex);
		const first = arr[0][prop];
		const scaleBiggest = scale ? scale : Math.max(...arr.map(o => o[prop] ?? 0));
		const current = arr.at(-1)[prop];

		if (!scale) {
			arr.forEach(a => a[prop] && (a[prop] -= first));
		}

		if (logarithmic) {
			arr.map(e => e[prop] >= 0 ? e[prop] = Math.log10(e[prop]) : undefined);
		}

		let yMax = Math.max(...arr.map(o => o[prop] ?? 0));
		let yMin = Math.max(0, Math.min(...arr.map(o => o[prop] ?? Infinity)));

		if (scale) { yMax = scale; yMin = 0; }
		let xRes = (canvas.width - lMargin - rMargin) / emptyArr.length;

		ctx.beginPath();
		let drawInterval = Math.max(1, Math.floor(emptyArr.length / (canvas.width)));
		let startFound = false;
		let prevY = 0;
		for (let i = 0; i < emptyArr.length; i++) {

			if (i % 1000 == 0) await ns.sleep();
			const time = emptyArr[i];
			if (arr.length > 0) {
				while (time.valueOf() > arr[0].time.valueOf()) { arr.shift() }
				if (time.valueOf() == arr[0].time.valueOf() || arr.length == 1) {
					if (typeof arr[0][prop] !== "number" || Number.isNaN(arr[0][prop])) { arr.shift(); continue; }
					if (prop == "money") ns.tprint(arr[0][prop])

					const y = Math.max(map(arr.shift()[prop], yMin, yMax, tMargin * 1.5, canvas.height - bMargin * 1.5), prevY);
					if (prop == "money") ns.tprint(yMin + " " + yMax)
					prevY = y;
					if (!startFound) {
						startFound = true;
						ctx.moveTo(lMargin + i * xRes, canvas.height - y);
					} else {
						if (i % drawInterval == 0 || arr.length == 0) {

							ctx.lineTo(lMargin + i * xRes, canvas.height - y);
							prevY = 0;
						}
					}
				}
			}
		}
		ctx.lineWidth = 2.5;
		ctx.strokeStyle = color;
		ctx.stroke();

		let offset = scale ? 0 : first;
		console.log(scale)
		return [text,
			`${ns.nFormat(offset, "0.00a")} to ${ns.nFormat(scaleBiggest, "0.00a")}`,
			logarithmic,
			color.replace(/[\d\.]+\)$/g, '1)')];
	}

	function drawGrid(emptyArr) {
		//bg
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = "rgba(0,10,0,0.7)";
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		//outer border
		ctx.beginPath()
		ctx.lineWidth = "1";
		ctx.strokeStyle = "rgba(20,200,120,1)";
		ctx.rect(1, 1, canvas.width - 2, canvas.height - 2);
		ctx.stroke();

		//vertical lines
		ctx.lineWidth = 1;
		ctx.strokeStyle = "rgba(20,60,20,0.6)";
		ctx.beginPath();
		let prevHour = emptyArr[0];
		let xRes = (canvas.width - lMargin - rMargin) / emptyArr.length;
		for (let i = 0; i < emptyArr.length; i++) {
			if (prevHour.getHours() != emptyArr[i].getHours()) {
				ctx.moveTo(lMargin + i * xRes, canvas.height - bMargin);
				ctx.lineTo(lMargin + i * xRes, tMargin);
				prevHour = emptyArr[i];
			}
		}
		ctx.stroke();

		//inner border
		ctx.strokeStyle = "rgba(20,100,20,1)";
		ctx.roundRect(lMargin, tMargin, canvas.width - rMargin - lMargin, canvas.height - tMargin - bMargin, 5).stroke();
	}

	function drawTextBox(titles) {
		const margin = 15, xOff = 5, yOff = 5;
		ctx.font = fontSize + "px " + font;
		const lineH = fontSize * 1.2;
		const log = (b) => b ? " log" : "";

		const boxW = 2 * margin + titles.reduce((prev, curr) => //find longest text
			Math.max(ctx.measureText(curr[0] + " " + curr[1] + log(curr[2])).width, prev), 0);
		let pos = yOff + lineH / 2.3;
		let textYpos = [];
		titles.forEach(i => textYpos.push(pos += lineH));

		//text box
		ctx.fillStyle = "black";
		ctx.strokeStyle = "rgba(20,90,20,0.6)";
		ctx.lineWidth = 5;
		const box = ctx.roundRect(xOff, yOff, boxW, (yOff + lineH / 2.3) + textYpos.at(-1), 20);
		box.fill();
		box.stroke();

		for (let [i, e] of titles.entries()) {
			ctx.fillStyle = e.pop();
			ctx.fillText(e[0] + " " + e[1] + log(e[2]), xOff + margin, textYpos[i]);
		}
	}


	let prevUpdate = new Date();
	while (true) {
		ctx.clearRect(0, 0, w, h);
		const emptyArray = makeEmptyArr(hours);

		drawGrid(emptyArray);

		let titles = [];
		for (const g of graphedItems) {
			titles.push(await drawStat(emptyArray, g.prop, g.color, g.title, g.scale, g.logarithmic));
		}
		drawTextBox(titles);

		const hh = (emptyArray.at(-1).valueOf() - emptyArray[0].valueOf()) / 1000 / 60 / 60;
		ctx.fillStyle = "white";
		ctx.font = canvas.height / 30 + "px " + font;
		ctx.fillText(hh + "h", canvas.width / 2, 50);

		ctxDraw.clearRect(0, 0, w, h);
		ctxDraw.drawImage(bufferCanvas, 0, 0);
		while (prevUpdate.getMinutes() == new Date().getMinutes())// && new Date().getMinutes() % 10 == 0)
			await ns.sleep(1000);
		prevUpdate = new Date();
	}
}

//lerp
function map(number, inMin, inMax, outMin, outMax) {
	return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

export function readFromJSON(ns, filename = "/test/jsontest.txt") {
	ns.scp(filename, ns.getServer().hostname, "home")
	return JSON.parse(ns.read(filename));
}