export async function main(ns) {


    const doc = eval("document");
    let textArea = doc.querySelectorAll(".react-draggable:first-of-type")[0];
    let text = doc.createTextNode("Hello world\ntesting");
    textArea.style = "white-space:pre";
    textArea.style.color = "#20AB20";
    textArea.style.font = "20px Courier";
    textArea.appendChild(text);



    /*
        
        const doc = eval("document");
        let output = "testing";
    
    
    
    
        //output += ["<p>Your browser doesn't support canvas. Boo hoo!</p>"];//.join("");
        let textArea = doc.querySelectorAll(".react-draggable:first-of-type")[0];
    
        //const list = doc.getElementById("overview-extra-hook-2");
        let text = doc.createTextNode("Hello world");
       // textArea.style.backgroundColor = "#102010";
        textArea.style.color = "#20AB20";
        textArea.style.font = "10px Courier";
       // textArea.insertAdjacentHTML('beforeend', text);
        textArea.appendChild(text);
    
    
        /*logArea.style.backgroundColor = "#102010";
        logArea.style.color = "#20AB20";
        logArea.style.font = "20px Courier";
        logArea.appendChild(text);*/

}