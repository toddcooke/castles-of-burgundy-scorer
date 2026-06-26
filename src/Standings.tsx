import { useState } from "react";
import { type Player, playerTotal } from "./scoring";
import { placeLabel, rankedPlayers, standingsText } from "./format";

interface StandingsProps {
    players: Player[];
    places: Map<string, number>;
}

// Copy text to the clipboard, returning whether it succeeded. Tries the async
// Clipboard API first, then falls back to a hidden-textarea execCommand for
// older or non-secure-context browsers where the API is unavailable.
async function copyText(text: string): Promise<boolean> {
    try {
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch {
        // Fall through to the legacy approach.
    }
    try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        return ok;
    } catch {
        return false;
    }
}

// A compact, always-visible leaderboard so you can see who's ahead — and by how
// much — without scrolling through every card. Shown only with 2+ players.
export function Standings({ players, places }: StandingsProps) {
    const [copied, setCopied] = useState(false);

    const sorted = rankedPlayers(players, places);
    // Scale the score bars against the current leader (guard against divide-by-zero).
    const max = Math.max(1, ...players.map(playerTotal));

    async function share() {
        const text = standingsText(players);
        // Prefer the native share sheet (great on mobile); fall back to copying.
        if (navigator.share) {
            try {
                await navigator.share({ text });
            } catch {
                // User dismissed the share sheet — nothing to do.
            }
            return;
        }
        if (await copyText(text)) {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        }
    }

    return (
        <section className="standings" aria-label="Standings">
            <div className="standings__head">
                <h2 className="section-title">Standings</h2>
                <button type="button" className="btn btn--sm" onClick={share}>
                    {copied ? "Copied ✓" : "Share"}
                </button>
            </div>
            <ol className="standings__list">
                {sorted.map((p) => {
                    const place = places.get(p.id) ?? players.length;
                    const total = playerTotal(p);
                    const rankClass =
                        place <= 4 ? `rank-${place}` : "rank-other";
                    return (
                        <li key={p.id} className="standing">
                            <span
                                className="standing__bar"
                                style={{ width: `${(total / max) * 100}%` }}
                                aria-hidden="true"
                            />
                            <span
                                className={`pip ${rankClass}`}
                                aria-hidden="true"
                            >
                                {place}
                            </span>
                            <span className="standing__name">
                                <span className="sr-only">
                                    {placeLabel(place)} place:{" "}
                                </span>
                                {p.name}
                            </span>
                            <span className="standing__total">{total}</span>
                        </li>
                    );
                })}
            </ol>
        </section>
    );
}
