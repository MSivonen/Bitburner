/** @param {NS} ns */
/** @param {import('../.').NS} ns */
export async function main(ns) {
	ns.disableLog("ALL");
	ns.clearLog();
	ns.tail();
	const doc = eval("document"), //cheaty cheat
		logArea = [...doc.querySelectorAll(".react-draggable .react-resizable")].pop().children[1], //select newest tail window
		textStyle = `<p style="
		color:lime;
		display:inline;
		font-family:'Comic Sans MS';"
		align="center";
		>`;

	let buttonsA = [],
		newButton;

	buttonsA.push(new Control("This is test1", "TEST1", "id1", false)); //make new buttons
	buttonsA.push(new Control("This is test2", "TEST2", "id2", false));
	buttonsA.push(new Control("This is test3", "TEST3", "id3", false));

	/**@param text Text beside button
	*@param buttonText Text inside button 
	*@param buttonId Unique id for finding this button 
	*@param variable variable this button controls */
	function Control(text, buttonText, buttonId, variable) {
		this.variable = variable;
		this.text = text;
		this.buttonText = buttonText;
		this.buttonId = buttonId;
	}

	for (const butt of buttonsA) makeButton(butt);

	function makeButton(butt) {
		newButton =
			`<button id=${butt.buttonId} style="
			width:100px; height:fit-content;
			font-family:'Comic Sans MS';
			">${butt.variable ? butt.buttonText + " on" : butt.buttonText + " off"}</button>`;

		logArea.insertAdjacentHTML('afterbegin', textStyle + butt.text + " " + newButton + `</p>`);
		doc.querySelector("#" + butt.buttonId).addEventListener("click", () => {
			butt.variable = !butt.variable;
			doc.querySelector("#" + butt.buttonId).innerText =
				butt.variable ? butt.buttonText + " on" : butt.buttonText + " off";
		});
	}

	while (42) {
		ns.clearLog();
		for (const butt of buttonsA) {
			if (butt.variable) {
				ns.tprint(butt.text);
				if (butt.buttonId != "id3")
					butt.variable = false;
				doc.querySelector("#" + butt.buttonId).innerText =
					butt.variable ? butt.buttonText + " on" : butt.buttonText + " off";
			}
		}
		await ns.sleep(1000);
	}
}