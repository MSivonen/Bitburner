/** @param {NS} ns */
/** @param {import('..').NS} ns */
export async function main(ns) {
    ns.tail();
    const doc = eval("document");

    const logArea = [...doc.querySelectorAll(".react-draggable .react-resizable")].pop();
    logArea.children[1].style.display = "none";
    const text = doc.createElement("SPAN");
    logArea.style.backgroundColor = "#550055";
    logArea.style.color = "#20AB20";
    logArea.style.font = "32px Courier";
    logArea.id = "logAreaID";
    logArea.appendChild(text);
    ns.disableLog("ALL");

    let data = "";

    while (true) {
        addLine(Math.random());
        addLine("Hello");
        addLine("<i>Italic</i>");
        addLine("<span style='font-size: 32px'>Italic</span>");
        display();
        await ns.sleep(1000 / 60);
    }

    function addLine(text) {
        data += text + "<br>";
    }

    function display() {
        logArea.lastChild.innerHTML = data;
        data = "";
    }
}