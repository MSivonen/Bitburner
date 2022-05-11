/** @param {NS} ns */
export async function main(ns) {
	var what = 1;
	var printti = (what == 1 ? "yksi" : "ei yksi");
	ns.tprint(printti);
}





const arr = [1, 2, 3];
const iter = arr[Symbol.iterator]();
let i = iter.next();

while (!i.done) {
	console.log(i.value);
	i = iter.next();
}

//That's basically the same as doing 
const arr = [1, 2, 3];

for (const value of arr) {
	console.log(value);
}