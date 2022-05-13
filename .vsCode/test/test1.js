import { printArray } from "/lib/includes.js"
//import { openPorts } from "/lib/includes.js"
//import { objectArraySort } from "/lib/includes.js"
//import { getServers } from "/lib/includes.js"
//import { getServersWithRam } from "/lib/includes.js"
//import { getServersWithMoney } from "/lib/includes.js"
import { secondsToHMS } from "/lib/includes.js"

/** @param {NS} ns */
/** @param {import("..").NS} ns */
export async function main(ns) {
	class u {
		constructor(a, b) {
			{
				this.c = {
					d: {
						e: a,
						f: b
					},
					g: {
						h: {
							i: {
								j: "]",
								k: "["
							},
							l: {
								m: "|",
								n: "-"
							},
							o: ""
						}
					}
				}
			}
			this.p();
		}
		q() {
			for (let i = this.c.d.f; i >= 0; i--) {
				if (this.c.d.e * this.c.d.e / 100 > i)
					this.c.g.h.o += this.c.g.h.l.n;
			}
			this.r();
		}
		s() {
			for (let i = this.c.d.f; i >= 0; i--) {
				if (this.c.d.e * this.c.d.e / 100 <= i)
					this.c.g.h.o += this.c.g.h.l.m;
			}
			this.q();
		}
		r() {
			this.c.g.h.o += this.c.g.h.i.j;
			this.t();
		}
		p() {
			this.c.g.h.o += this.c.g.h.i.k;
			this.s();
		}
		t() {
			ns.tprint(this.c.g.h.o);
		}
	}
	new u(30, 40);
}