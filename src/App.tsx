import { useEffect, useState } from "react";
import {
    type Player,
    MONASTERY_TILES,
    SHIELDS,
    makePlayer,
    ranking,
    neededTiebreakers,
} from "./scoring";
import { PlayerCard } from "./PlayerCard";
import { Standings } from "./Standings";

const STORAGE_KEY = "burgundy-scorer:players";
const MAX_PLAYERS = 4; // Castles of Burgundy supports up to 4 players.

// A fresh calculator: one blank player. Used on first load and on Clear.
function freshPlayers(): Player[] {
    return [makePlayer("Player 1")];
}

// Load saved players from localStorage, backfilling any missing fields so older
// saved data stays valid as the model grows. Falls back to a fresh calculator.
function loadPlayers(): Player[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return freshPlayers();
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed) || parsed.length === 0)
            return freshPlayers();
        return parsed
            .slice(0, MAX_PLAYERS)
            .map((p) => ({ ...makePlayer(p?.name ?? "Player"), ...p }));
    } catch {
        return freshPlayers();
    }
}

export default function App() {
    const [players, setPlayers] = useState<Player[]>(loadPlayers);

    // Persist to localStorage whenever players change (ignore quota/private-mode errors).
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
        } catch {
            // Storage unavailable (private mode, quota) — keep working in-memory.
        }
    }, [players]);

    // Immutably update one base field of one player by id.
    function updateField<K extends keyof Player>(
        id: string,
        key: K,
        value: Player[K],
    ) {
        setPlayers((prev) =>
            prev.map((p) => (p.id === id ? { ...p, [key]: value } : p)),
        );
    }

    function addPlayer() {
        setPlayers((prev) =>
            prev.length >= MAX_PLAYERS
                ? prev
                : [...prev, makePlayer(`Player ${prev.length + 1}`)],
        );
    }

    function removePlayer(id: string) {
        setPlayers((prev) => prev.filter((p) => p.id !== id));
    }

    function addMonastery(ownerId: string, tile: string) {
        setPlayers((prev) =>
            prev.map((p) =>
                p.id === ownerId
                    ? {
                          ...p,
                          monasteries: [...p.monasteries, { tile, count: 1 }],
                      }
                    : p,
            ),
        );
    }

    function setMonasteryCount(ownerId: string, tile: string, count: number) {
        setPlayers((prev) =>
            prev.map((p) =>
                p.id === ownerId
                    ? {
                          ...p,
                          monasteries: p.monasteries.map((h) =>
                              h.tile === tile ? { ...h, count } : h,
                          ),
                      }
                    : p,
            ),
        );
    }

    function removeMonastery(ownerId: string, tile: string) {
        setPlayers((prev) =>
            prev.map((p) =>
                p.id === ownerId
                    ? {
                          ...p,
                          monasteries: p.monasteries.filter(
                              (h) => h.tile !== tile,
                          ),
                      }
                    : p,
            ),
        );
    }

    function addShield(ownerId: string, id: number) {
        setPlayers((prev) =>
            prev.map((p) =>
                p.id === ownerId ? { ...p, shields: [...p.shields, id] } : p,
            ),
        );
    }

    function removeShield(ownerId: string, id: number) {
        setPlayers((prev) =>
            prev.map((p) =>
                p.id === ownerId
                    ? { ...p, shields: p.shields.filter((s) => s !== id) }
                    : p,
            ),
        );
    }

    function clearScores() {
        if (window.confirm("Reset all scores? Players are kept.")) {
            // Zero every score but keep each player's id and name.
            setPlayers((prev) =>
                prev.map((p) => ({ ...makePlayer(p.name), id: p.id })),
            );
        }
    }

    const places = ranking(players);
    const tiebreakers = neededTiebreakers(players);

    // Tiles/shields already owned by someone, so each unique one is offered once.
    const ownedTileIds = new Set(
        players.flatMap((p) => p.monasteries.map((h) => h.tile)),
    );
    const availableTiles = MONASTERY_TILES.filter(
        (t) => !ownedTileIds.has(t.id),
    );
    const ownedShieldIds = new Set(players.flatMap((p) => p.shields));
    const availableShields = SHIELDS.filter((s) => !ownedShieldIds.has(s.id));

    // A leader is highlighted only when 1st place is unshared (no tie at the top).
    const leaders = [...places.values()].filter((place) => place === 1).length;
    const hasSoleLeader = players.length > 1 && leaders === 1;

    return (
        <div className="app">
            <header className="app__header">
                <h1>Castles of Burgundy</h1>
                <p className="app__subtitle">Final score calculator</p>
            </header>

            <div
                className="toolbar"
                role="toolbar"
                aria-label="Calculator actions"
            >
                <button
                    type="button"
                    className="btn btn--primary"
                    disabled={players.length >= MAX_PLAYERS}
                    onClick={addPlayer}
                >
                    + Add player
                </button>
                <button type="button" className="btn" onClick={clearScores}>
                    Clear scores
                </button>
            </div>

            <main>
                {players.length >= 2 && (
                    <Standings players={players} places={places} />
                )}

                <div className="players">
                    {players.map((player, i) => {
                        const place = places.get(player.id) ?? players.length;
                        return (
                            <PlayerCard
                                key={player.id}
                                player={player}
                                index={i}
                                place={place}
                                isLeader={hasSoleLeader && place === 1}
                                canRemove={players.length > 1}
                                availableTiles={availableTiles}
                                availableShields={availableShields}
                                tiebreakers={tiebreakers}
                                onRename={(name) =>
                                    updateField(player.id, "name", name)
                                }
                                onRemove={() => removePlayer(player.id)}
                                onScoreChange={(key, value) =>
                                    updateField(player.id, key, value)
                                }
                                onTiebreakChange={(key, value) =>
                                    updateField(player.id, key, value)
                                }
                                onAddMonastery={(tile) =>
                                    addMonastery(player.id, tile)
                                }
                                onSetMonasteryCount={(tile, count) =>
                                    setMonasteryCount(player.id, tile, count)
                                }
                                onRemoveMonastery={(tile) =>
                                    removeMonastery(player.id, tile)
                                }
                                onAddShield={(id) => addShield(player.id, id)}
                                onRemoveShield={(id) =>
                                    removeShield(player.id, id)
                                }
                            />
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
