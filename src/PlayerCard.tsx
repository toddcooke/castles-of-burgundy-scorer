import {
    type Player,
    type NumericKey,
    type TiebreakerKey,
    type MonasteryTile,
    type Shield,
    SCORE_ROWS,
    TIEBREAKER_ROWS,
    monasteryTile,
    monasteryVp,
    shieldById,
    scoreBreakdown,
} from "./scoring";
import { NumberField } from "./NumberField";
import { placeLabel } from "./format";

interface PlayerCardProps {
    player: Player;
    index: number;
    place: number;
    isLeader: boolean;
    canRemove: boolean;
    availableTiles: MonasteryTile[];
    availableShields: Shield[];
    tiebreakers: TiebreakerKey[];
    onRename: (name: string) => void;
    onRemove: () => void;
    onScoreChange: (key: NumericKey, value: number) => void;
    onTiebreakChange: (key: TiebreakerKey, value: number) => void;
    onAddMonastery: (tile: string) => void;
    onSetMonasteryCount: (tile: string, count: number) => void;
    onRemoveMonastery: (tile: string) => void;
    onAddShield: (id: number) => void;
    onRemoveShield: (id: number) => void;
}

export function PlayerCard({
    player,
    index,
    place,
    isLeader,
    canRemove,
    availableTiles,
    availableShields,
    tiebreakers,
    onRename,
    onRemove,
    onScoreChange,
    onTiebreakChange,
    onAddMonastery,
    onSetMonasteryCount,
    onRemoveMonastery,
    onAddShield,
    onRemoveShield,
}: PlayerCardProps) {
    const breakdown = scoreBreakdown(player);
    const rankClass = place <= 4 ? `rank-${place}` : "rank-other";
    // Unique id prefix so labels/inputs in different cards never collide.
    const uid = (suffix: string) => `p${index}-${suffix}`;

    return (
        <section
            className={`card${isLeader ? " card--leader" : ""}`}
            aria-label={`${player.name}: ${breakdown.total} points, ${placeLabel(place)} place`}
        >
            <header className="card__header">
                {/* SR-only heading keeps the h1 → h2 → h3 order intact and lets
                    screen-reader users jump between players by heading. */}
                <h2 className="sr-only">{player.name}</h2>
                <input
                    type="text"
                    className="card__name"
                    value={player.name}
                    aria-label={`Player ${index + 1} name`}
                    onChange={(e) => onRename(e.target.value)}
                />
                <button
                    type="button"
                    className="icon-btn"
                    disabled={!canRemove}
                    aria-label={`Remove ${player.name}`}
                    title={`Remove ${player.name}`}
                    onClick={onRemove}
                >
                    ✕
                </button>
            </header>

            <div className="card__result">
                <span
                    className={`medal ${rankClass}`}
                    aria-label={`${placeLabel(place)} place`}
                >
                    {placeLabel(place)}
                </span>
                <div className="card__total">
                    <span className="card__total-num" aria-live="polite">
                        {breakdown.total}
                    </span>
                    <span className="card__total-label">
                        points{isLeader ? " · leading" : ""}
                    </span>
                </div>
            </div>

            <div className="card__section">
                {SCORE_ROWS.map((row) => (
                    <NumberField
                        key={row.key}
                        id={uid(row.key)}
                        label={row.label}
                        value={player[row.key]}
                        onChange={(v) => onScoreChange(row.key, v)}
                    />
                ))}
            </div>

            <div className="card__section">
                <h3 className="section-title">
                    Monasteries
                    <span className="section-meta">
                        {player.shields.includes(10) && (
                            <span
                                className="x2-badge"
                                title="Shield 10 doubles monastery VP"
                            >
                                ×2
                            </span>
                        )}
                        {breakdown.monastery > 0 && (
                            <span className="section-sum">
                                +{breakdown.monastery} VP
                            </span>
                        )}
                    </span>
                </h3>
                {player.monasteries.length > 0 && (
                    <ul className="holdings">
                        {player.monasteries.map((h) => {
                            const tile = monasteryTile(h.tile);
                            if (!tile) return null;
                            return (
                                <li key={h.tile} className="holding">
                                    <div className="holding__head">
                                        <span className="holding__name">
                                            Monastery {h.tile}
                                        </span>
                                        <button
                                            type="button"
                                            className="icon-btn icon-btn--sm"
                                            aria-label={`Remove Monastery ${h.tile} from ${player.name}`}
                                            title="Remove this monastery"
                                            onClick={() =>
                                                onRemoveMonastery(h.tile)
                                            }
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <div className="holding__body">
                                        <NumberField
                                            id={uid(`mon-${h.tile}`)}
                                            label={`${tile.unitLabel} for Monastery ${h.tile}`}
                                            hideLabel
                                            value={h.count}
                                            onChange={(c) =>
                                                onSetMonasteryCount(h.tile, c)
                                            }
                                        />
                                        <span className="holding__meta">
                                            {tile.unitLabel} · {monasteryVp(h)}{" "}
                                            VP
                                        </span>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
                {availableTiles.length > 0 && (
                    <label className="add-control">
                        <span className="sr-only">
                            Add monastery for {player.name}
                        </span>
                        <select
                            value=""
                            onChange={(e) => {
                                if (e.target.value)
                                    onAddMonastery(e.target.value);
                            }}
                        >
                            <option value="">+ Add monastery…</option>
                            {availableTiles.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.label}
                                </option>
                            ))}
                        </select>
                    </label>
                )}
            </div>

            <div className="card__section">
                <h3 className="section-title">
                    Shields
                    <span className="section-meta">
                        {player.shields.includes(13) && (
                            <span
                                className="x2-badge"
                                title="Shield 13 doubles shield VP"
                            >
                                ×2
                            </span>
                        )}
                        {breakdown.shields > 0 && (
                            <span className="section-sum">
                                +{breakdown.shields} VP
                            </span>
                        )}
                    </span>
                </h3>
                {player.shields.length > 0 && (
                    <ul className="holdings">
                        {[...player.shields]
                            .sort((a, b) => a - b)
                            .map((id) => {
                                const shield = shieldById(id);
                                if (!shield) return null;
                                return (
                                    <li
                                        key={id}
                                        className="holding holding--shield"
                                    >
                                        <div className="holding__head">
                                            <span className="holding__name">
                                                Shield {id}
                                            </span>
                                            <span className="holding__vp">
                                                {shield.vp} VP
                                            </span>
                                            <button
                                                type="button"
                                                className="icon-btn icon-btn--sm"
                                                aria-label={`Remove Shield ${id} from ${player.name}`}
                                                title="Remove this shield"
                                                onClick={() =>
                                                    onRemoveShield(id)
                                                }
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        <p className="holding__effect">
                                            {shield.effect}
                                        </p>
                                    </li>
                                );
                            })}
                    </ul>
                )}
                {availableShields.length > 0 && (
                    <label className="add-control">
                        <span className="sr-only">
                            Add shield for {player.name}
                        </span>
                        <select
                            value=""
                            onChange={(e) => {
                                if (e.target.value)
                                    onAddShield(Number(e.target.value));
                            }}
                        >
                            <option value="">+ Add shield…</option>
                            {availableShields.map((s) => (
                                <option key={s.id} value={s.id}>
                                    Shield {s.id} — {s.effect} ({s.vp} VP)
                                </option>
                            ))}
                        </select>
                    </label>
                )}
            </div>

            {tiebreakers.length > 0 && (
                <div className="card__section card__section--tiebreak">
                    <h3 className="section-title">Tiebreakers</h3>
                    {TIEBREAKER_ROWS.filter((row) =>
                        tiebreakers.includes(row.key),
                    ).map((row) => (
                        <NumberField
                            key={row.key}
                            id={uid(row.key)}
                            label={row.label}
                            value={player[row.key]}
                            onChange={(v) => onTiebreakChange(row.key, v)}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
