/** @param {NS} ns */
export async function main(ns) {
  let doc = eval("document");
  var canvas = doc.createElement('canvas');
  canvas.id = "CursorLayer";
  canvas.width = window.innerWidth;
  canvas.height = 300;
  canvas.style.zIndex = 8;
  canvas.style.position = "absolute";
  var body = doc.getElementsByTagName("body")[0];
  body.appendChild(canvas);
  let cursorLayer = doc.getElementById("CursorLayer");

  console.log(cursorLayer);
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
    drawing.fillStyle = "rgba(0, 50, 0, 1)";
    drawing.fillRect(0, 0, canvas.width, canvas.height);
    drawing.fillStyle = "rgba(120, 255, 0, 1)";
    drawing.fillRect(posX, posY, 50, 50);
    await ns.sleep(5);
  }

  class point {
    constructor() {
      this.posX = 0;
      this.posY = 0;
      this.speed = 0;
      this.dir = Math.random(360);
      this.gravity=1.1;
      this.drag=1.05;
    }

    update(){

    }


  }
}