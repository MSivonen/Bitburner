//import { printArray } from "/lib/includes.js"
//import { openPorts } from "/lib/includes.js"
//import { objectArraySort } from "/lib/includes.js"
//import { getServers } from "/lib/includes.js"
//import { getServersWithRam } from "/lib/includes.js"
//import { getServersWithMoney } from "/lib/includes.js"
//import { secondsToHMS } from "/lib/includes.js"
//import { killAllButThis } from "/lib/includes.js"
//import { connecter } from "/lib/includes.js"
import { randomInt } from "/lib/includes.js"
import { map } from "/lib/includes.js"

/** @param {NS} ns */
/** @param {import(".").NS } ns */
export async function main(ns) {

	let doc = eval("document");
	ns.tail();
	let logAreas = doc.querySelectorAll(".react-draggable .react-resizable");
	let logArea = logAreas[logAreas.length - 1];
	logArea.children[0].style.display = "none";
	let canvas = logArea.appendChild(doc.createElement("canvas")),
		ctx = canvas.getContext("2d");
	canvas.width = "500";
	canvas.height = "500";
	canvas.style.height = "100%";
	canvas.style.width = "100%";

	let width = 500;
	let height = 500;

	let TWO_PI = Math.PI * 2;
	let windSpeed = 0;
	let particleA = [];
	let randA = [];
	const gravity = -.2;
	const friction = .85;

	//particleA.push(new Particle());

	for (let i = 0; i < 100; i++) {
		randA.push(randomInt(4, 8) / 10);
	}

	class Particle {

		constructor(x_, y_, xs_, ys_, life_) {
			this.pos = { x: x_, y: y_ };
			this.vel = { x: xs_, y: ys_ };
			this.acc = { x: 0, y: 0 };
			this.life = randomInt(5, 15) + .6 * life_;
			this.dead = false;
			this.lifee;
			this.x = x_;
			this.y = y_;
			this.col = randomInt(10, 200);
			this.vel.y = ys_;
			this.vel.x = xs_;
			this.prevtime = ns.getTimeSinceLastAug();
			this.randomNumber = this.life;
			this.vel.x += (Math.random() - .5) * 4;
			this.vel.y += (Math.random() - .5) * 4;
		}

		show() {
			this.lifee = map(this.life, -2, 100, 0, 140);
			//let color = HSBToRGB(this.lifee, 255 - (randomInt(0, 55)), this.lifee * 10 - (15 * windSpeed));
			let radiusHelper = map(this.life, 0, this.randomNumber, 0, Math.PI);
			let radius = Math.sin(radiusHelper) * 10;
			radius = radius < 1 ? 1 : radius;

			let color = [240 - this.lifee, 160 - this.lifee, 70 - this.lifee];
			let a = map(this.lifee, 0, 140, 0, 1);
			a = _.clamp(a, 0, 0.1);
			ctx.fillStyle = `rgba(${color[0] - this.col}, ${color[1] - this.col}, ${color[2] - this.col}, ${a})`;
			this.circle(this.x, this.y, radius);
		}

		circle(x, y, radius) {
			ctx.beginPath();
			ctx.arc(this.pos.x, this.pos.y, radius, 0, TWO_PI);
			ctx.fill();
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
			if (this.life < 2) {
				this.dead = true;
				this.life = 0;
			}
		}

		run() {
			this.update();
			this.show();
		}

	}
	let progress = 0;
	let progressBarStart = 100;
	let progBarWidth = 300;
	let progressup = true;

	while (true) {
		ctx.fillStyle = "rgba(0, 0, 0, 1)";
		ctx.fillRect(0, 0, width, height);
		wind();

		for (let i = progressBarStart; i < progressBarStart + progBarWidth * (progress / 100); i++) {
			let x = i;
			let y = 400 + 2;

			if (randomInt(0, 10) < 2 && progress > 50) {
				particleA.push(new Particle(x, y, windSpeed, randomInt(10, -10) / 1500, progress));
			}
		}
		progress = progressup ? progress + .2 : progress - .2;
		progressup = progress > 99 ? false : progressup;
		progressup = progress < 1 ? true : progressup;

		ctx.strokeStyle = `rgba(${50}, ${222}, ${60}, ${1} )`;
		ctx.fillStyle = `rgba(${50 + progress}, ${120 - progress}, ${20}, ${1} )`;
		ctx.fillRect(progressBarStart, 400, progBarWidth * (progress / 100), 16);

		for (let ii = particleA.length - 1; ii >= 0; ii--) {
			particleA[ii].run();
			if (particleA[ii].dead == true) {
				particleA.splice(ii, 1);
			}
		}

		//ctx.stroke();
		//ctx.fill();

		ctx.font = "12px Arial";
		ctx.fillStyle = "lime";
		ctx.fillText("Progressing: " + Math.round(progress) + "%", 100, 430);
		await ns.sleep(20);
	}

	function HSBToRGB(h, s, b) {
		if (h < 0) h + 255;
		if (h > 255) h - 255;
		if (s < 0) s + 255;
		if (s > 255) s - 255;
		if (b < 0) b + 255;
		if (b > 255) b - 255;
		s /= 100;
		b /= 100;
		const k = (n) => (n + h / 60) % 6;
		const f = (n) => b * (1 - s * Math.max(0, Math.min(k(n), 4 - k(n), 1)));
		return [255 * f(5), 255 * f(3), 255 * f(1)];
	};

	function wind() {
		windSpeed += 3 * (Math.random() - .5) / 20;
		windSpeed = windSpeed < -2 ? -2 : windSpeed;
		windSpeed = windSpeed > 2 ? 2 : windSpeed;
	}
}