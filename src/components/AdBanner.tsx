import { ReactNode } from "react";

interface AdBannerProps {
    position: "left" | "right";
    children?: ReactNode;
}

export function AdBanner({ position, children }: AdBannerProps) {
    return (
        <div
            className={`hidden xl:flex fixed top-1/2 -translate-y-1/2 ${position === "left" ? "left-4" : "right-4"
                } w-[160px] h-[600px] bg-gradient-to-br from-secondary/50 to-muted/30 backdrop-blur-sm border border-border/50 rounded-xl flex-col items-center justify-center text-center p-4 z-40`}
        >
            {children || (
                <>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                        <span className="text-2xl">📢</span>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                        Рекламное место
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                        160 × 600
                    </p>
                    <div className="mt-4 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        Ваша реклама здесь
                    </div>
                </>
            )}
        </div>
    );
}
