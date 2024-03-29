import { readFromJSON, writeToJSON } from '/lib/includes.js';
/** @param {NS} ns */
/** @param {import('..').NS} ns */
export async function main(ns) {
    const doc = eval("document");
    let textArea = doc.querySelectorAll(".react-draggable:first-of-type")[0]; //find overview
    let g_sets = {
        var1: true,
        var2: true,
        var3: true
    };
    if (!ns.fileExists("g_settings_test.txt")) //if file doesn't exist, make it
        await writeToJSON(ns, g_sets, "g_settings_test.txt");
    for (const key of Object.keys(g_sets)) {
        if (!readFromJSON(ns, "g_settings_test.txt").hasOwnProperty(key)) { //if file doesn't have some of the variables, rewrite it
            await writeToJSON(ns, g_sets, "g_settings_test.txt");
            break;
        }
    }
    g_sets = readFromJSON(ns, "g_settings_test.txt");
    ns.tprint(g_sets);
    const buttonsTextStyle = //text beside button
     `color:#090;
		margin:0px auto;
		font-family:'Comic Sans MS';
        font-size:15px;
		text-align:left;
        `;
    let buttonsA = [];
    for (const key of Object.keys(g_sets)) { //make button objects
        if (key == "var3")
            buttonsA.push(new Control("The thing", "thing: ", key, g_sets[key])); //custom text
        else
            buttonsA.push(new Control(key, "", key, g_sets[key])); //just the variable as text
    }
    for (const butt of buttonsA)
        makeButton(butt); //put the button objects to overview
    function makeButton(butt) {
        let newButton = //width:40px is good for 'on/off' text
         `<button id=${butt.buttonId} style="
            border: 2px solid transparent;
            border-radius: 7px;
            border-color:#090;
            background-color:#131;
            width:auto; 
            height:fit-content;
            align:center;
            font-family:'Comic Sans MS';
            font-size:10px;
            color:#0c0;
            ">${butt.variable ? butt.buttonText + "ON" : butt.buttonText + "OFF"}</button>`;
        textArea.insertAdjacentHTML('beforeend', `<table style="width:90%; border:0px; margin-left:auto; margin-right:auto;">
            <tr>
                <th style="${buttonsTextStyle}">${butt.text}</th>
                <th style="text-align:right">${newButton}</th>
            </tr>
            </table>`); //table is used for buttons and text alignment
        let btn = doc.querySelector("#" + butt.buttonId);
        btn.addEventListener("click", () => {
            butt.variable = !butt.variable;
            btn.innerText =
                butt.variable ? butt.buttonText + "ON" : butt.buttonText + "OFF";
        });
    }
    /**@param {string} text Text beside button
    *@param {string} buttonText Text inside button
    *@param {string} buttonId Unique id for finding this button
    *@param {boolean} variable variable this button controls */
    function Control(text, buttonText, buttonId, variable = true) {
        this.text = text;
        this.buttonText = buttonText;
        this.buttonId = buttonId;
        this.variable = variable;
    }
    ns.atExit(() => {
        for (const butt of buttonsA) //remove buttons
            doc.getElementById(butt.buttonId).remove();
        for (let i = 0; i < buttonsA.length; i++) //remove button texts
            textArea.removeChild(textArea.lastChild);
    });
    let a = 0;
    let add = 1;
    while (true) {
        a += add;
        add += .0001;
        add **= 1.01;
        textArea.style = `transform:rotate(${Math.sin(1 - add) * 15 + add}deg)`;
        await ns.sleep(20);
        await buttonsLoop();
    }
    async function buttonsLoop() {
        for (const butt of buttonsA) {
            let btn = doc.querySelector("#" + butt.buttonId);
            btn.innerText =
                butt.variable ? butt.buttonText + "ON" : butt.buttonText + "OFF";
            btn.style.backgroundColor = butt.variable ? "#030" : "#000";
            g_sets[butt.buttonId] = butt.variable;
        }
        await writeToJSON(ns, g_sets, "g_settings_test.txt");
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3ZCdXR0b25zX3NpbXBsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy93YXRjaGVyL292QnV0dG9uc19zaW1wbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsTUFDM0Isa0JBQWtCLENBQUM7QUFFNUIscUJBQXFCO0FBQ3JCLGtDQUFrQztBQUNsQyxNQUFNLENBQUMsS0FBSyxVQUFVLElBQUksQ0FBQyxFQUFFO0lBQ3pCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUM3QixJQUFJLFFBQVEsR0FBRyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsZ0NBQWdDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQWU7SUFFekYsSUFBSSxNQUFNLEdBQUc7UUFDVCxJQUFJLEVBQUUsSUFBSTtRQUNWLElBQUksRUFBRSxJQUFJO1FBQ1YsSUFBSSxFQUFFLElBQUk7S0FDYixDQUFDO0lBQ0YsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMscUJBQXFCLENBQUMsRUFBRSxnQ0FBZ0M7UUFDdkUsTUFBTSxXQUFXLENBQUMsRUFBRSxFQUFFLE1BQU0sRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO0lBQ3pELEtBQUssTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtRQUNuQyxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLHdEQUF3RDtZQUN4SCxNQUFNLFdBQVcsQ0FBQyxFQUFFLEVBQUUsTUFBTSxFQUFFLHFCQUFxQixDQUFDLENBQUM7WUFDckQsTUFBTTtTQUNUO0tBQ0o7SUFDRCxNQUFNLEdBQUcsWUFBWSxDQUFDLEVBQUUsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO0lBQ2pELEVBQUUsQ0FBQyxNQUFNLENBQUMs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