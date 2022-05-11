import { printArray } from "/lib/includes.js"
//import { openPorts } from "/lib/includes.js"
//import { objectArraySort } from "/lib/includes.js"
//import { getServers } from "/lib/includes.js"
//import { getServersWithRam } from "/lib/includes.js"
//import { getServersWithMoney } from "/lib/includes.js"
import { secondsToHMS } from "/lib/includes.js"

/** @param {NS} ns */
export async function main(ns) {
	let factions =

	{
		Illuminati: "Illuminati",
		Daedalus: "Daedalus",
		TheCovenant: "The Covenant",
		ECorp: "ECorp",
		MegaCorp: "MegaCorp",
		BachmanAssociates: "Bachman & Associates",
		BladeIndustries: "Blade Industries",
		NWO: "NWO",
		ClarkeIncorporated: "Clarke Incorporated",
		OmniTekIncorporated: "OmniTek Incorporated",
		FourSigma: "Four Sigma",
		KuaiGongInternational: "KuaiGong International",
		FulcrumSecretTechnologies: "Fulcrum Secret Technologies",
		BitRunners: "BitRunners",
		TheBlackHand: "The Black Hand",
		NiteSec: "NiteSec",
		Aevum: "Aevum",
		Chongqing: "Chongqing",
		Ishima: "Ishima",
		NewTokyo: "New Tokyo",
		Sector12: "Sector-12",
		Volhaven: "Volhaven",
		SpeakersForTheDead: "Speakers for the Dead",
		TheDarkArmy: "The Dark Army",
		TheSyndicate: "The Syndicate",
		Silhouette: "Silhouette",
		Tetrads: "Tetrads",
		SlumSnakes: "Slum Snakes",
		Netburners: "Netburners",
		TianDiHui: "Tian Di Hui",
		CyberSec: "CyberSec",
		Bladeburners: "Bladeburners",
		ChurchOfTheMachineGod: "Church of the Machine God",
		ShadowsOfAnarchy: "Shadows of Anarchy",
	}

	for (let fact of Object.values(factions)) {
		//ns.tprint(fact);
		for (let aug of ns.singularity.getAugmentationsFromFaction(fact)) {
			if (Object.keys(ns.singularity.getAugmentationStats(aug)).length == 0) ns.tprint(aug);
		}
	}
}