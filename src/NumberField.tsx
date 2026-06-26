// A labelled numeric input with −/+ steppers. The steppers give touch users a
// way to adjust values without summoning the keyboard; the input stays available
// for fast direct entry. Values are clamped to be non-negative.

interface NumberFieldProps {
    id: string;
    label: string;
    value: number;
    onChange: (value: number) => void;
    /** Render the label for assistive tech only (use when context is visible). */
    hideLabel?: boolean;
}

function clamp(n: number): number {
    return Number.isFinite(n) && n > 0 ? n : 0;
}

export function NumberField({
    id,
    label,
    value,
    onChange,
    hideLabel,
}: NumberFieldProps) {
    return (
        <div className="field">
            <label
                htmlFor={id}
                className={hideLabel ? "sr-only" : "field__label"}
            >
                {label}
            </label>
            <div className="stepper">
                <button
                    type="button"
                    className="stepper__btn"
                    aria-label={`Decrease ${label}`}
                    disabled={value <= 0}
                    onClick={() => onChange(clamp(value - 1))}
                >
                    −
                </button>
                <input
                    id={id}
                    type="number"
                    className="stepper__input"
                    min={0}
                    inputMode="numeric"
                    value={value}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => onChange(clamp(Number(e.target.value)))}
                />
                <button
                    type="button"
                    className="stepper__btn"
                    aria-label={`Increase ${label}`}
                    onClick={() => onChange(clamp(value + 1))}
                >
                    +
                </button>
            </div>
        </div>
    );
}
