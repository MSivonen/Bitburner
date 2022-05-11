/** @param {NS} ns */
export async function main(ns) {
  ns.tail();
  let logAreas = document.querySelectorAll(".react-draggable .react-resizable");
  let logArea = logAreas[logAreas.length - 1];
  logArea.children[0].style.display = "none";
  let canvas = logArea.appendChild(document.createElement("canvas")),
    context = canvas.getContext("2d");
  canvas.width = "500";
  canvas.height = "500";
  canvas.style.height = "100%";
  canvas.style.width = "100%";

  let i = 0;
  let posY = 0;
  let posX = 0;

  while (true) {
    i += 0.05;
    posY = 200 * -Math.abs(Math.sin(i));
    posY += canvas.height - 50;
    posX += 1;
    if (posX > canvas.width) posX = 0;
    var drawing = canvas.getContext("2d");
    context.fillStyle = "rgba(0, 50, 0, 1)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "rgba(120, 255, 0, 1)";
    context.fillRect(posX, posY, 50, 50);
    await ns.sleep(5);
  }
}