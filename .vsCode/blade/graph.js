import {
	printArray, openPorts, objectArraySort, getServers, getServersWithRam, getServersWithMoney,
	secondsToHMS, killAllButThis, connecter, randomInt, map, readFromJSON, writeToJSON, openPorts2, getBestFaction, col
}
	from '/lib/includes.js'

/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {
	//-----edit these-----
	let w = 1400, h = 800;
	let hours = 3 * 24;
	const statFile = "intfarmstats.txt";

	const graphedItems = [{
		prop: "intExp",
		color: "rgba(255,255,255,1)",
		title: "Int exp"
	}, {
		prop: "H",
		color: "rgba(20,255,20,0.8)",
		title: "Hyperdrive"
	}, {
		prop: "I",
		color: "rgba(255,90,90,0.4)",
		title: "Investigation",
		scale: 1200
	}, {
		prop: "U",
		color: "rgba(20,255,255,0.4)",
		title: "Undercover Operation",
		scale: 1200
	}, {
		prop: "A",
		color: "rgba(255,255,20,0.4)",
		title: "Assassination",
		scale: 11000
	}];
	//--------------------

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
	let canvas = logArea.appendChild(doc.createElement("canvas")),
		ctx = canvas.getContext("2d");
	canvas.width = w;
	canvas.height = h;
	let titleH = logArea.children[0].clientHeight;
	canvas.style.height = `calc(100% - ${titleH + 4}px)`;
	canvas.style.width = "calc(100% - 1px)";
	canvas.style.marginLeft = "1px";
	canvas.style.marginTop = "1px";

	logArea.style.backdropFilter = "blur(10px)";

	let minimized = false;
	[...doc.querySelectorAll(".react-draggable")].pop().querySelectorAll("button")[1].addEventListener("click", () => { //minimize button
		minimized = !minimized;
		minimized ? canvas.style.display = "none" : canvas.style.display = "";
		/*if (minimized) { canvas.style.height = "30px"; canvas.style.width = w + "px" }
		else { canvas.style.width = "100%"; canvas.style.height = "100%"; }*/
	});

	ns.atExit(() => {
		logArea.style = "";
		logArea.removeChild(canvas);
	});

	//make an array with timestamps every minute from (current time-hours) to current time
	//If no arg, include all times of stat file
	function makeEmptyArr(hours) {
		let arr = readFromJSON(ns, statFile);
		let emptyArr = [];
		let endTime = new Date().valueOf();
		let startTime = hours ? endTime - (1000 * 60 * 60 * hours) : new Date(arr[0].time).valueOf();
		for (let i = startTime; i <= endTime; i += 60 * 1000) {
			emptyArr.push(new Date(Math.floor(i / 60000) * 60000));
		}
		return emptyArr;
	}

	function hoursInArr() {
		let statsA = readFromJSON(ns, statFile);
		let startD = new Date(statsA[0].time);
		let endD = new Date(statsA.at(-1).time);
		return Math.ceil((endD - startD) / (1000 * 60 * 60));
	}

	async function drawStat(emptyArr, prop, color, text, textY, scale) {
		let arr = readFromJSON(ns, statFile);
		arr.forEach(e => e.time = new Date(Math.floor(new Date(e.time).valueOf() / 60000) * 60000));
		let startIndex = 0;
		for (let i = 0; i < arr.length; i++) {
			if (!arr[i][prop]) continue;
			startIndex = i; break;
		}
		let first = arr[startIndex][prop];

		if (!scale) {
			arr.forEach(a => a[prop] && (a[prop] -= first));
		}

		let yMax = Math.max(...arr.map(o => o[prop] ?? 0));
		let yMin = Math.min(...arr.map(o => o[prop] ?? Infinity));


		if (scale) { yMax = scale; yMin = 0; }
		let xRes = (canvas.width - lMargin - rMargin) / emptyArr.length;

		ctx.beginPath();
		let drawInterval = Math.floor(emptyArr.length / (canvas.width));
		let startFound = false;
		let prevY = 0;
		for (let i = 0; i < emptyArr.length; i++) {
			if (i % 1000 == 0) await ns.sleep();
			const time = emptyArr[i];
			if (arr.length > 0) {
				while (time.valueOf() > arr[0].time.valueOf()) { arr.shift() }
				//ns.tprint(time.valueOf() + " " + arr[0].time.valueOf())
				if (time.valueOf() == arr[0].time.valueOf() || arr.length == 1) {
					if (arr[0][prop] == undefined) { arr.shift(); continue; }
					const y = Math.max(map(arr.shift()[prop], yMin, yMax, tMargin * 1.5, canvas.height - bMargin * 1.5), prevY);
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
		return [`${text} ${ns.nFormat(offset, "0.00a")} to ${ns.nFormat(offset + yMax, "0.00a")}`, 25, textY, color.replace(/[\d\.]+\)$/g, '1)')];
	}

	function drawGrid(emptyArr) {
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

		ctx.strokeStyle = "rgba(20,100,20,1)";
		ctx.roundRect(lMargin, tMargin, canvas.width - rMargin - lMargin, canvas.height - tMargin - bMargin, 5).stroke();

	}

	let prevUpdate = new Date();



	while (true) {
		const emptyArray = makeEmptyArr(hours);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = "rgba(0,10,0,0.7)";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		drawGrid(emptyArray);

		let titles = [];
		let pos = 25;

		for (const g of graphedItems) {
			titles.push(await drawStat(emptyArray, g.prop, g.color, g.title, pos += 20, g.scale));
		}

		ctx.fillStyle = "black";
		ctx.strokeStyle = "rgba(20,90,20,0.6)";
		ctx.lineWidth = 5;
		ctx.roundRect(5, 5, 360, 150, 20).fill();
		ctx.roundRect(5, 5, 360, 150, 20).stroke();

		ctx.font = '18px Consolas';
		for (let e of titles) {
			ctx.fillStyle = e.pop();
			ctx.fillText(...e);
		}

		const h = (emptyArray.at(-1).valueOf() - emptyArray[0].valueOf()) / 1000 / 60 / 60;
		ctx.fillStyle = "white";
		ctx.fillText(h + "h", canvas.width / 2, 50);
		while (prevUpdate.getMinutes() == new Date().getMinutes())
			await ns.sleep(1000);
		prevUpdate = new Date();
	}

	function map(number, inMin, inMax, outMin, outMax) {
		return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
	}

	function HSBToRGB(h, s, b) {
		s /= 100;
		b /= 100;
		const k = (n) => (n + h / 60) % 6;
		const f = (n) => b * (1 - s * Math.max(0, Math.min(k(n), 4 - k(n), 1)));
		return [255 * f(5), 255 * f(3), 255 * f(1)];
	};
}