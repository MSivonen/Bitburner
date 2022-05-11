/** @param {NS} ns **/
export async function main(ns) {
	function colorPrint() {
		//if (arguments.length % 2 != 0) throw("colorPrint arguments must come in pairs. Color,Text")
		let findProp = propName => {
			for (let div of eval("document").querySelectorAll("div")) {
				let propKey = Object.keys(div)[1];
				if (!propKey) continue;
				let props = div[propKey];
				if (props.children?.props && props.children.props[propName]) return props.children.props[propName];
				if (props.children instanceof Array) for (let child of props.children) if (child?.props && child.props[propName]) return child.props[propName];
			}
		};
		let term = findProp("terminal");

		let out = [];
		for (let i = 0; i < arguments.length; i += 2) {
			out.push(React.createElement("span", { style: { color: `${arguments[i]}` } }, arguments[i + 1]))
		}
		term.printRaw(out);
		ns.tail();
	}
	colorPrint("green", "This message ", "white", "can ", "cyan", "have ", "#f39c12", "Colors!");
	ns.print(colorPrint("green", "This message ", "white", "can ", "cyan", "have ", "#f39c12", "Colors!"));
}