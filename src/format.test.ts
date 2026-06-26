import { describe, it, expect } from "vitest";
import { type Player, makePlayer, ranking } from "./scoring";
import { placeLabel, rankedPlayers, standingsText } from "./format";

function player(overrides: Partial<Player>): Player {
    return { ...makePlayer("P"), ...overrides };
}

describe("placeLabel", () => {
    it("uses ordinal suffixes for the podium and TH beyond", () => {
        expect(
            ["1ST", "2ND", "3RD", "4TH"].map((_, i) => placeLabel(i + 1)),
        ).toEqual(["1ST", "2ND", "3RD", "4TH"]);
    });
});

describe("rankedPlayers", () => {
    it("orders players by finishing place", () => {
        const a = player({ name: "Ann", boardVp: 20 });
        const b = player({ name: "Bo", boardVp: 30 });
        const c = player({ name: "Cy", boardVp: 25 });
        const places = ranking([a, b, c]);
        expect(rankedPlayers([a, b, c], places).map((p) => p.name)).toEqual([
            "Bo",
            "Cy",
            "Ann",
        ]);
    });
});

describe("standingsText", () => {
    it("renders a medal-prefixed line per player in finishing order", () => {
        const a = player({ name: "Ann", boardVp: 30 });
        const b = player({ name: "Bo", boardVp: 20 });
        expect(standingsText([a, b])).toBe(
            "Castles of Burgundy — Final Scores\n\n🥇 Ann — 30\n🥈 Bo — 20",
        );
    });

    it("labels places past the podium with an ordinal", () => {
        const ps = [1, 2, 3, 4].map((n) =>
            player({ name: `P${n}`, boardVp: (5 - n) * 10 }),
        );
        const lines = standingsText(ps).split("\n");
        expect(lines[lines.length - 1]).toBe("4th  P4 — 10");
    });
});
