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
	let xoff = .5;
	let yoff = .5;
	let zoff = .11;
	let windSpeed = 0;
	let phase = 0;
	let xmult = 8;
	let ymult = 8;
	let zmult = 1;
	let prevmillis = 0;
	let prevmillis2 = 300;
	let beatmult = 1;
	let particleA = [];
	let randA = [];
	//particleA.push(new Particle());

	for (let i = 0; i < 100; i++) {
		randA.push(randomInt(4, 8) / 10);
	}

	class Particle {

		constructor(x_, y_, xs_, ys_) {
			this.pos = { x: x_, y: y_ };
			this.vel = { x: xs_, y: ys_ };
			this.acc = { x: 0, y: 0 };
			this.life = randomInt(50, 100);
			this.dead = false;
			this.lifee;
			this.x = x_;
			this.y = y_;
			this.col = 255;
			this.vel.y = ys_;
			this.vel.x = xs_;
			this.prevtime = ns.getTimeSinceLastAug();
			this.randomNumber = this.life;
		}

		run() {
			if (ns.getTimeSinceLastAug() > prevtime + 1000 / 60) {
				this.update();
				prevtime = millis();
			}
			this.show();
		}

		show() {
			this.lifee = map(this.life, -2, 100, 0, 140);
			//let color = HSBToRGB(this.lifee, 255 - (randomInt(0, 55)), this.lifee * 10 - (15 * windSpeed));

			let color = [240 - this.lifee, 140 - this.lifee, 50 - this.lifee];
			let a = map(this.lifee, 0, 140, 0, 1);
			a = a < 0 ? 0 : a;
			a = a > 0.1 ? 0.1 : a
			a = 1;
			ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${a})`;
			//ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${a} )`;

			let radiusHelper = map(this.life, 0, this.randomNumber, 0, Math.PI);
			let radius = Math.sin(radiusHelper) * 10;
			radius = radius < 1 ? 1 : radius;

			//ctx.fillStyle = "rgba(255, 0, 0, 1)";
			this.circle(this.x, this.y, radius);
			//ctx.fillRect(this.x - 3, this.y - 3, 6, 6);
		}

		circle(x, y, radius) {
			ctx.beginPath();
			ctx.arc(this.pos.x, this.pos.y, radius, 0, TWO_PI);
			//ctx.stroke();
			ctx.fill();
		}

		update() {
			//this.acc.y += gravity;
			//this.vel.x += this.acc.x;
			//this.vel.y += this.acc.y;
			//this.vel.x *= friction;
			//this.vel.y *= friction;
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
		ctx.fillStyle = "rgba(0, 0, 0, 1)";
		ctx.fillRect(0, 0, width, height);
		wind();
		beat();

		//		ctx.strokeStyle = `rgba(${50}, ${60}, ${20}, ${1} )`; //path
		//		ctx.beginPath(); //path
		//		ctx.moveTo(0, 0); //radar scanner thing
		for (let i = 0; i < TWO_PI; i = i + TWO_PI / 100) {
			//let square = false; //square on radar scanner thingy
			//if (i == 0) square = true;//square on radar scanner thingy
			i = i + phase;
			let x = 16 * Math.pow(Math.sin(i), 3);
			let y = -1 * (13 * Math.cos(i) - 5 * Math.cos(2 * i) - 2 * Math.cos(3 * i) - Math.cos(4 * i));
			x *= xmult * map(beatmult, 1, 100, 1, 1.1);
			y *= ymult * map(beatmult, 1, 100, 1, 1.1);
			x += width / 2;
			y += height / 2;
			ctx.lineTo(x, y);
			//if (square) {
			//	ctx.fillStyle = "rgba(80, 255, 125, 1)";
			//	ctx.fillRect(x - 3, y - 3, 6, 6);
			//}

			if (randomInt(0, 10) < 2) {
				particleA.push(new Particle(x, y, windSpeed, randomInt(-6, -10) / 5));
			}
			i = i - phase;
		}
		//ctx.stroke(); //path
		phase += .01;

		for (let ii = particleA.length - 1; ii >= 0; ii--) {
			particleA[ii].run();
			if (particleA[ii].dead == true) {
				particleA.splice(ii, 1);
			}
		}

		//ctx.font = "30px Arial";
		//ctx.fillStyle = "red";
		//ctx.fillText("wind: " + windSpeed, 10, 50);
		await ns.sleep(20);
	}

	function beat() {
		if (ns.getTimeSinceLastAug() > prevmillis + 1000) {
			beatmult = 100;
			prevmillis = ns.getTimeSinceLastAug();
		}
		if (ns.getTimeSinceLastAug() > prevmillis2 + 1000) {
			beatmult = 100;
			prevmillis2 = ns.getTimeSinceLastAug();
		}
		beatmult -= 10;
		if (beatmult < 1) {
			beatmult = 1;
		}
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
		windSpeed += 3 * (Math.random() - .5) / 50;
		windSpeed = windSpeed < -2 ? -2 : windSpeed;
		windSpeed = windSpeed > 2 ? 2 : windSpeed;
	}
}