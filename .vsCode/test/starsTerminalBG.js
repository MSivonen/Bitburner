/** @param {NS} ns */
/** @param {import("../.").NS} ns */
export async function main(ns) {
	ns.disableLog("ALL");
	ns.tail();
	const doc = eval("document"),
		win = eval("window");
	let canvas,
		area = doc.getElementById("terminal").parentNode,
		drawing;

	function addCanvas() {
		area = doc.getElementById("terminal").parentNode;
		area.classList.add("canvasBG");
		area.insertAdjacentHTML("afterBegin", `<style>.canvasBG{background:transparent;position:relative}.canvasBG canvas{background:red;position:absolute;height:100%;width:100%;z-index:0}</style>`)
		area.insertAdjacentHTML("afterBegin", "<canvas height=500 width=800></canvas>");
		canvas = area.querySelector("canvas");
		drawing = canvas.getContext("2d")

		ns.atExit(() => {
			area.classList.remove("canvasBG");
			area.removeChild(canvas);
			area.querySelector("style").remove();
		});

		canvas.width = win.innerWidth;
		canvas.height = win.innerHeight;
	}

	if (!area.classList.contains("canvasBG")) addCanvas();

	const
		width = canvas.width / 2,
		height = canvas.height / 2,
		amount = 500, //number of stars
		speed = 0.01,
		sizeMult = 1, //multiplier for star size
		starColor = "rgba(120, 255, 0, 1)";

	class Spot {
		constructor() {
			this.x = (Math.random() - 0.5) * 2 + width;
			this.y = (Math.random() - 0.5) * 2 + height;
			this.z = width / 2;
			this.a = Math.random() * 2 * 3.1415;
			this.life = 0;
			this.randSize = 0.5 - Math.random();
		}

		display() {
			drawing.fillStyle = starColor;
			let spot = sizeMult * map(this.z, 450, width / 2, 8, 0.1) + this.randSize;
			drawing.fillRect(width + this.x, height + this.y, spot, spot);
			this.life++;
			if (this.life > 20) this.life = 20;
		}

		move() {
			this.x = map(this.x / this.z, 0, 1, 0, width / 2);
			this.y = map(this.y / this.z, 0, 1, 0, width / 2);
			this.z = this.z - speed;
			if (this.z < 2 || this.x < -width || this.x > width || this.y < -height || this.y > height) {
				this.z = width / 2;
				this.x = (Math.random() - 0.5) * 2 * width;
				this.y = (Math.random() - 0.5) * 2 * height;
			}
		}
	}

	let stars = [];
	for (let i = 0; i < amount; i++) {
		stars.push(new Spot());
	}

	while (true) {
		try { area = doc.getElementById("terminal").parentNode; }
		catch { area = null; }
		if (area)
			if (!area.classList.contains("canvasBG")) {
				addCanvas();
				drawing = canvas.getContext("2d");
			}
		drawing.fillStyle = "rgba(0, 0, 0, 0.2)";
		drawing.fillRect(0, 0, canvas.width, canvas.height);
		drawing.lineWidth = 0;
		for (const star of stars) {
			star.move();
			star.display();
		}
		await ns.sleep(1);
	}

	function map(number, inMin, inMax, outMin, outMax) {
		return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
	}
}