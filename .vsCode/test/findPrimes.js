

/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {
    const inputNumber = 1000000; //find primes up to this number
    const smallOrLarge = 2000; //decide which solver to use
    let startTime = performance.now();
    let primes = [];
    for (let i = 3; i <= smallOrLarge; i = i + 2) { //add small odd numbers.
        primes.push(i);
    }
    primes = primes.filter((x) => { //this is slow on big numbers
        for (let i = 0; primes[i] < x; i++) {
            if (x % primes[i] == 0) return false;
        }
        return x;
    });

    for (let i = smallOrLarge + 1; i <= inputNumber; i += 2) { //add big odd numbers
        if (i % 5 != 0) //skip mod5.
            primes.push(i);
    }

    for (let i = primes.length; i >= 0; --i) {
        for (let j = 0; j < primes[i] >> 7; ++j) { //don't bother to check if divisor is smaller than n/128
            if (primes[i] % primes[j] == 0 && primes[j] != primes[i]) {
                primes.splice(i, 1);
                break;
            }
        }
    }

    primes.unshift(2); //add 2
    ns.tprint("Primes: " + primes.length); //how many primes found?
    ns.tprint("time: ");
    ns.tprint(performance.now() - startTime);
    //correct lengths:
    //n             primes less than n
    //100           25
    //1,000         168
    //10,000        1,229
    //100,000       9,592
    //1,000,000     78,498
    //10,000,000    664,579
    //https://primes.utm.edu/howmany.html
}