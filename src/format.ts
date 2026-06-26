// Presentation helpers shared by the cards and the standings summary.

import { type Player, playerTotal, ranking } from "./scoring";

// "1ST", "2ND", "3RD", else "<n>TH" (player counts are small, so no 21ST edge cases).
export function placeLabel(place: number): string {
    if (place === 1) return "1ST";
    if (place === 2) return "2ND";
    if (place === 3) return "3RD";
    return `${place}TH`;
}

const MEDAL_EMOJI: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

// Players ordered for display: by finishing place, then by total as a stable nudge.
export function rankedPlayers(
    players: Player[],
    places: Map<string, number>,
): Player[] {
    return [...players].sort(
        (a, b) =>
            (places.get(a.id) ?? Infinity) - (places.get(b.id) ?? Infinity) ||
            playerTotal(b) - playerTotal(a),
    );
}

// A plain-text final standings block, suitable for the share sheet / clipboard.
export function standingsText(players: Player[]): string {
    const places = ranking(players);
    const lines = rankedPlayers(players, places).map((p) => {
        const place = places.get(p.id) ?? players.length;
        const badge =
            MEDAL_EMOJI[place] ?? `${placeLabel(place).toLowerCase()} `;
        return `${badge} ${p.name} — ${playerTotal(p)}`;
    });
    return `Castles of Burgundy — Final Scores\n\n${lines.join("\n")}`;
}
