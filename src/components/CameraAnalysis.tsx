import { useRef, useEffect, useCallback, useState } from "react";
import { useFaceDetection } from "@/hooks/useFaceDetection";
import { FaceQualityPanel } from "@/components/FaceQualityPanel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Camera, CameraOff, FlipHorizontal, ScanFace, Loader2 } from "lucide-react";

interface CameraAnalysisProps {
    onCapture: (imageBase64: string) => void;
}

export function CameraAnalysis({ onCapture }: CameraAnalysisProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [cameraError, setCameraError] = useState<string | null>(null);
    const [cameraReady, setCameraReady] = useState(false);
    const [isMirrored, setIsMirrored] = useState(true);
    const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
    const [isCapturing, setIsCapturing] = useState(false);

    const { state, loadModels, startDetection, stopDetection } = useFaceDetection(videoRef, canvasRef);

    const stopCamera = useCallback(() => {
        stopDetection();
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        setCameraReady(false);
    }, [stopDetection]);

    const startCamera = useCallback(async (mode: "user" | "environment" = "user") => {
        stopCamera();
        setCameraError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: false,
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current?.play();
                    setCameraReady(true);
                };
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                if (err.name === "NotAllowedError") {
                    setCameraError("Доступ к камере запрещён. Разрешите доступ в настройках браузера.");
                } else if (err.name === "NotFoundError") {
                    setCameraError("Камера не найдена на устройстве.");
                } else {
                    setCameraError("Не удалось запустить камеру. Попробуйте ещё раз.");
                }
            }
        }
    }, [stopCamera]);

    // Load models on mount
    useEffect(() => {
        loadModels();
    }, [loadModels]);

    // Start camera once models loaded
    useEffect(() => {
        if (state.isModelLoaded) {
            startCamera(facingMode);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.isModelLoaded]);

    // Start detection loop when camera is ready
    useEffect(() => {
        if (cameraReady && state.isModelLoaded) {
            startDetection();
        }
    }, [cameraReady, state.isModelLoaded, startDetection]);

    // Cleanup on unmount
    useEffect(() => {
        return () => stopCamera();
    }, [stopCamera]);

    const handleFlipCamera = () => {
        const next = facingMode === "user" ? "environment" : "user";
        setFacingMode(next);
        setIsMirrored(next === "user");
        startCamera(next);
    };

    const handleCapture = useCallback(() => {
        const video = videoRef.current;
        if (!video || !cameraReady) return;

        setIsCapturing(true);

        const captureCanvas = document.createElement("canvas");
        captureCanvas.width = video.videoWidth;
        captureCanvas.height = video.videoHeight;
        const ctx = captureCanvas.getContext("2d");
        if (!ctx) return;

        if (isMirrored) {
            ctx.translate(captureCanvas.width, 0);
            ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0);

        const base64 = captureCanvas.toDataURL("image/jpeg", 0.92);

        setTimeout(() => {
            setIsCapturing(false);
            onCapture(base64);
        }, 200);
    }, [cameraReady, isMirrored, onCapture]);

    const quality = state.faceQuality;
    const isReady = state.faceDetected && quality && quality.overall >= 55;

    return (
        <div className="flex flex-col gap-4 w-full animate-fade-in">
            {/* Camera viewport */}
            <div className="relative rounded-2xl overflow-hidden border border-border bg-black aspect-video w-full max-h-[480px] flex items-center justify-center">

                {/* Loading state */}
                {(state.isLoadingModels || (!cameraReady && !cameraError)) && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/80 backdrop-blur-sm">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        <p className="text-sm text-white/80 font-medium">
                            {state.isLoadingModels ? "Загружаем нейросеть..." : "Запускаем камеру..."}
                        </p>
                    </div>
                )}

                {/* Camera error */}
                {cameraError && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-black/90 px-6 text-center">
                        <CameraOff className="w-12 h-12 text-rose-400" />
                        <p className="text-white/90 text-sm leading-relaxed">{cameraError}</p>
                        <Button variant="outline" size="sm" onClick={() => startCamera(facingMode)}>
                            Попробовать снова
                        </Button>
                    </div>
                )}

                {/* Flash effect on capture */}
                {isCapturing && (
                    <div className="absolute inset-0 z-30 bg-white animate-pulse rounded-2xl pointer-events-none" />
                )}

                {/* Video element */}
                <video
                    ref={videoRef}
                    playsInline
                    muted
                    className={cn(
                        "w-full h-full object-cover",
                        isMirrored && "scale-x-[-1]"
                    )}
                />

                {/* Canvas overlay (face detection) — not mirrored since face-api draws on video coords */}
                <canvas
                    ref={canvasRef}
                    className={cn(
                        "absolute inset-0 w-full h-full pointer-events-none",
                        isMirrored && "scale-x-[-1]"
                    )}
                />

                {/* Top controls */}
                <div className="absolute top-3 right-3 z-10 flex gap-2">
                    <button
                        onClick={() => setIsMirrored(m => !m)}
                        className="p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
                        title="Отразить"
                    >
                        <FlipHorizontal className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleFlipCamera}
                        className="p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
                        title="Переключить камеру"
                    >
                        <Camera className="w-4 h-4" />
                    </button>
                </div>

                {/* Face detected badge */}
                {cameraReady && state.isModelLoaded && (
                    <div
                        className={cn(
                            "absolute top-3 left-3 z-10 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm flex items-center gap-1.5 transition-all duration-500",
                            state.faceDetected
                                ? "bg-emerald-500/80 text-white"
                                : "bg-black/60 text-white/70"
                        )}
                    >
                        <ScanFace className="w-3.5 h-3.5" />
                        {state.faceDetected ? "Лицо обнаружено" : "Ищем лицо..."}
                    </div>
                )}
            </div>

            {/* Quality panel */}
            {cameraReady && state.isModelLoaded && (
                <div className="glass-card p-4 rounded-xl">
                    <h4 className="text-sm font-semibold mb-3 text-foreground/80">Качество кадра</h4>
                    {quality ? (
                        <FaceQualityPanel
                            lighting={quality.lighting}
                            angle={quality.angle}
                            distance={quality.distance}
                            overall={quality.overall}
                            hint={quality.hint}
                        />
                    ) : (
                        <p className="text-xs text-muted-foreground text-center">
                            Направьте камеру на лицо...
                        </p>
                    )}
                </div>
            )}

            {/* Capture button */}
            <Button
                variant="hero"
                size="lg"
                className={cn(
                    "w-full gap-2 transition-all duration-300",
                    !isReady && "opacity-60"
                )}
                onClick={handleCapture}
                disabled={!cameraReady || !state.isModelLoaded || !state.faceDetected || isCapturing}
            >
                {isCapturing ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Делаем снимок...
                    </>
                ) : (
                    <>
                        <ScanFace className="w-5 h-5" />
                        {isReady ? "Сделать снимок и анализировать" : "Улучшите качество кадра..."}
                    </>
                )}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
                🔒 Камера работает только локально — видео не передаётся на серверы
            </p>
        </div>
    );
}
