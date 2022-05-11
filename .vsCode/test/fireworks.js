/** @param {NS} ns */
export async function main(ns) {
	let doc = eval("document");
	ns.tail();
	let logAreas = doc.querySelectorAll(".react-draggable .react-resizable");
	let logArea = logAreas[logAreas.length - 1];
	logArea.children[0].style.display = "none";
	let canvas = logArea.appendChild(doc.createElement("canvas")),
		context = canvas.getContext("2d");
	canvas.width = "500";
	canvas.height = "500";
	canvas.style.height = "100%";
	canvas.style.width = "100%";

	var rockets = [];
	let gravity = .04;
	let friction = .98;
	let width = 500;
	let height = 500;

	class Raketti {
		constructor(x_, y_, ys_, xs_, col_) {

			//ns.tprint(x_ + " " + y_);

			this.kipunat = [];
			this.rocket = new Particle(x_, y_, ys_, xs_, 30);
			this.dead = false;
			this.end = false;
			this.life = 70 + Math.round(Math.random() * 30);
			this.col = col_;
			this.size = 1 + Math.random() * 3;
		}

		run() {
			if (!this.dead) {
				this.rocket.update();
				this.rocket.show();
			}
			if (this.life < 1 && !this.dead) {
				this.explode();
				this.dead = true;
			}
			this.life--;
			for (let i = this.kipunat.length - 1; i >= 0; i--) {
				this.kipunat[i].update();
				this.kipunat[i].run();
				if (this.kipunat[i].dead) this.kipunat.splice(i, 1);
			}
			if (this.dead && this.kipunat.length == 0) this.end = true;
		}

		explode() {
			for (let i = 0; i < 100 * this.size; i++) {
				let angle = Math.random() * 3.1415 * 2;
				let sss_x = Math.sin(angle) * Math.random();
				let sss_y = Math.cos(angle) * Math.random();
				sss_x *= map(Math.random(), 0, 1, height / 500, .7 * height / 500) * this.size;
				sss_y *= map(Math.random(), 0, 1, height / 500, .7 * height / 500) * this.size;
				this.kipunat.push(new Particle(this.rocket.pos.x, this.rocket.pos.y, sss_x, sss_y, this.col));
			}
		}
	}

	class Particle {

		constructor(x_, y_, ys_, xs_, col_) {
			this.pos = { x: x_, y: y_ };
			this.vel = { x: xs_, y: ys_ };
			this.acc = { x: 0, y: 0 };
			this.life = 75 + Math.round(Math.random() * 100);
			this.dead = false;
			this.lifee;
			this.x = x_;
			this.y = y_;
			this.xs = xs_;
			this.ys = ys_;
			this.col = col_;
			this.vel.y = this.ys;
			this.vel.x = this.xs;
			//ns.tprint(this.pos.x + " " + this.pos.y);
		}

		show() {
			this.lifee = map(this.life, -2, 175, 0, 5);

			let color = HSBToRGB(this.col, 255 - this.lifee * 40, 255);
			let r = color[0];
			let g = 255 - this.lifee * 40;
			let b = 255;
			let a = this.lifee * 55;
			//context.fillStyle = "rgba(" + color[0] + "," + color[1] + "," + color[2] + "," + a + ")";
			context.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${a} )`;
			context.fillRect(this.pos.x, this.pos.y, 2 * this.lifee, 2 * this.lifee);
		}

		update() {
			this.acc.y += gravity;
			this.vel.x += this.acc.x;
			this.vel.y += this.acc.y;
			this.vel.x *= friction;
			this.vel.y *= friction;
			this.pos.x += this.vel.x;
			this.pos.y += this.vel.y;
			this.acc.x = 0;
			this.acc.y = 0;
			this.life--;
			if (this.life < 1) {
				this.dead = true;
				this.life = 0;
			}
		}

		run() {
			this.update();
			this.show();
		}

	}

	while (true) {
		context.fillStyle = "rgba(0, 0, 0, 0.2)";
		context.fillRect(0, 0, canvas.width, canvas.height);
		if (Math.random() < .03 * height / 400) {
			rockets.push(new Raketti(width / 2, height,
				map(Math.random(), 0, 1, -height / 30, -height / 60),
				map(Math.random(), 0, 1, -width / 80, width / 80),
				Math.random() * 255));
		}

		for (let i = rockets.length - 1; i >= 0; i--) {
			rockets[i].run();
			if (rockets[i].end == true) {
				rockets.splice(i, 1);
			}
		}
		await ns.sleep(15);
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