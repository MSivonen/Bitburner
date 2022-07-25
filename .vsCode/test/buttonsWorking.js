import { readFromJSON, writeToJSON, printArray }
	from '/lib/includes.js'

/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {
	let g_sets = {
		wantAugsInstalled: true,
		wantBuyAugs: true,
		wantHackNet: true,
		wantJobs: true
	};

	if (!ns.fileExists("g_settings.txt")) {
		await writeToJSON(ns, g_sets, "g_settings.txt");
	}

	g_sets = readFromJSON(ns, "g_settings.txt");

	ns.disableLog("ALL");
	ns.clearLog();
	ns.tail();
	const doc = eval("document"), //cheaty cheat
		logArea = [...doc.querySelectorAll(".react-draggable .react-resizable")].pop().children[1], //select newest tail window
		textStyle = `<p style="
		color:lime;
		display:inline;
		margin:0;
		font-family:'Comic Sans MS';"
		align="right";
		>`;

	let buttonsA = [],
		newButton;

	for (const key of Object.keys(g_sets)) {
		buttonsA.push(new Control(key, "", key, g_sets[key]));
	}

	/**@param text Text beside button
	*@param buttonText Text inside button 
	*@param buttonId Unique id for finding this button 
	*@param variable variable this button controls */
	function Control(text, buttonText, buttonId, variable) {
		this.text = text;
		this.buttonText = buttonText;
		this.buttonId = buttonId;
		this.variable = variable;
	}

	for (const butt of buttonsA) makeButton(butt);

	function makeButton(butt) {
		newButton =
			`<button id=${butt.buttonId} style="
			width:100px; height:fit-content;
			font-family:'Comic Sans MS' font-size:'8px';
			">${butt.variable ? butt.buttonText + " on" : butt.buttonText + " off"}</button>`;

		logArea.insertAdjacentHTML('afterbegin', textStyle + butt.text + " " + newButton + `</p>`);
		doc.querySelector("#" + butt.buttonId).addEventListener("click", () => {
			butt.variable = !butt.variable;
			doc.querySelector("#" + butt.buttonId).innerText =
				butt.variable ? butt.buttonText + " on" : butt.buttonText + " off";
		});
	}

	while (42) {
		await ns.clearLog();
		for (const butt of buttonsA) {
			doc.querySelector("#" + butt.buttonId).innerText =
				butt.variable ? butt.buttonText + " on" : butt.buttonText + " off";
			g_sets[butt.buttonId] = butt.variable;
		}
		await writeToJSON(ns, g_sets, "g_settings.txt");
		printArray(ns, g_sets, "tail"); //debug thingy
		await ns.sleep(1000);
	}
}