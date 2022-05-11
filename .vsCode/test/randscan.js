/** @param {NS} ns */
export async function main(ns) {
    const llI = (Ill, lIl = "home", lII = []) => {
        if (!lII.includes(lIl)) lII.push(lIl);
        let IlI = ns.scan(lIl);
        if (lII.length != Ill) llI(Ill, IlI[Math.round(Math.random() * (IlI.length - 1 + .9999) - .5)], lII);
        return (lII);
    }
    function III() {
        let IIl = [];
        for (let Ill = 0; Ill < 500; Ill++) {
            let lll = [];
            try { lll = llI(Math.round(Math.random() * 150)); } catch { }
            if (lll.length > IIl.length) IIl = lll;
        }
        return (IIl);
    }
    ns.tprint(III());
}