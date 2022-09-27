/** @param {import('../.').NS} ns */
export async function main(ns) {
    const doc = eval("document");
    let target = ((server = ns.args[0]) => {
        let route = [server];
        while (server != "home") {
            route.unshift(server = ns.scan(server).shift());
        }
        return route.join(";connect ");
    })();

    const terminalInput = doc.getElementById("terminal-input");
    terminalInput.value = target;
    const handler = Object.keys(terminalInput)[1];
    terminalInput[handler].onChange({ target: terminalInput });
    terminalInput[handler].onKeyDown({ keyCode: 13, preventDefault: () => null });
}