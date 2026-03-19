import { cn } from "@/lib/utils";

interface FaceQualityBarProps {
    label: string;
    value: number;
    icon: string;
}

function QualityBar({ label, icon, value }: FaceQualityBarProps) {
    const color =
        value >= 70
            ? "bg-emerald-500"
            : value >= 40
                ? "bg-amber-500"
                : "bg-rose-500";

    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs font-medium">
                <span className="flex items-center gap-1 text-foreground/80">
                    {icon} {label}
                </span>
                <span
                    className={cn(
                        "font-semibold",
                        value >= 70 ? "text-emerald-400" : value >= 40 ? "text-amber-400" : "text-rose-400"
                    )}
                >
                    {value}%
                </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                    className={cn("h-full rounded-full transition-all duration-300", color)}
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
}

interface FaceQualityPanelProps {
    lighting: number;
    angle: number;
    distance: number;
    overall: number;
    hint: string;
}

export function FaceQualityPanel({ lighting, angle, distance, hint }: FaceQualityPanelProps) {
    return (
        <div className="flex flex-col gap-3">
            <QualityBar label="Освещение" icon="💡" value={lighting} />
            <QualityBar label="Положение" icon="↔️" value={angle} />
            <QualityBar label="Расстояние" icon="🔍" value={distance} />
            <p className="text-xs text-center text-foreground/70 mt-1 font-medium">{hint}</p>
        </div>
    );
}
