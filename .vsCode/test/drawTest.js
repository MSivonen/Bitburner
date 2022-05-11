export async function main(ns) {
    const doc = eval("document");
    const canvas = document.querySelector('.myCanvas');
    const ctx = canvas.getContext('2d');
    const width = canvas.width = window.innerWidth;
    const height = canvas.height = 200;
    let output = "pöööööööö";



    output += ['<canvas width="320" height="240">',
        "<p>Your browser doesn't support canvas. Boo hoo!</p>",
        "ctx.fillStyle = 'rgb(0, 0, 0)'",
        "ctx.fillRect(0, 0, width, height)",
        "</canvas>"].join("");

    const list = doc.getElementById("terminal");
    list.insertAdjacentHTML('beforeend', output);
}