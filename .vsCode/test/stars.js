/** @param {NS} ns */
export async function main(ns) {
	let amount = 500;
	let speed = 0.01;

	let doc = eval("document");
	let win = eval("window");
	var canvas = doc.createElement('canvas');
	canvas.id = "CursorLayer";
	canvas.width = win.innerWidth;
	canvas.height = 300;
	canvas.style.zIndex = 8;
	canvas.style.position = "absolute";
	var body = doc.getElementsByTagName("body")[0];
	body.appendChild(canvas);

	let width = canvas.width / 2;
	let height = canvas.height / 2;

	class Spot {
		constructor() {
			this.x = (Math.random() - 0.5) * 2 + width;
			this.y = (Math.random() - 0.5) * 2 + height;
			this.z = width / 2;
			this.r;
			this.a = Math.random() * 2 * 3.1415;
			this.life = 0;
			this.randSize = 0.5 - Math.random();
		}

		display() {
			drawing.fillStyle = "rgba(120, 255, 0, 1)";
			let spot = map(this.z, 450, width / 2, 8, 0.1) + this.randSize;
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

	let b = [];
	for (let i = 0; i < amount; i++) {
		b[i] = new Spot();
	}

	while (true) {
		var drawing = canvas.getContext("2d");
		drawing.fillStyle = "rgba(0, 0, 0, 0.2)";
		drawing.fillRect(0, 0, canvas.width, canvas.height);
		drawing.lineWidth = 0;
		for (let i = 0; i < amount; i++) {
			b[i].move();
			b[i].display();
		}

		await ns.sleep(1);
	}

	function map(number, inMin, inMax, outMin, outMax) {
		return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
	}
}