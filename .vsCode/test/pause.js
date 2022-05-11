/** @param {NS} ns */
export async function main(ns) {
  let paused = false,
    doc=globalThis["document"];
  ns.disableLog("ALL");
  ns.tail();
  let draggables = doc.querySelectorAll(".react-draggable");
  let logWindow = draggables[draggables.length - 1]; // Reference to the full log window, not just the log area. Needed because the buttons aren't in the log area.

  let killButton = logWindow.querySelector("button");
  let pauseButton = killButton.cloneNode(); //copies the kill button for styling purposes
  pauseButton.addEventListener("click",()=>{
    paused=!paused;
    pauseButton.innerText = paused ? "Unpause" : "Pause";
    ns.print(paused ? "Script is now paused" : "Script is now unpaused")
  })
  pauseButton.innerText = "Pause";
  killButton.insertAdjacentElement("beforeBegin",pauseButton);
  
  while(true){
    await ns.asleep(1000);
  }
}