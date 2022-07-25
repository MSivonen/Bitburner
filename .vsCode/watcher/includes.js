export function readFromJSON(ns, filename = "/test/jsontest.txt") {
	return JSON.parse(ns.read(filename));
}

export async function writeToJSON(ns, jsonObject, filename = "/test/jsontest.txt") {
	await ns.write(filename, JSON.stringify(jsonObject), "w");
}