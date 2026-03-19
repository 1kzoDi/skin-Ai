import { useRef, useState, useCallback, useEffect } from "react";
import * as faceapi from "face-api.js";

export interface FaceQuality {
    lighting: number;   // 0-100
    angle: number;      // 0-100
    distance: number;   // 0-100
    overall: number;    // 0-100
    hint: string;
}

export interface FaceDetectionState {
    isModelLoaded: boolean;
    isLoadingModels: boolean;
    faceDetected: boolean;
    faceQuality: FaceQuality | null;
    detections: faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }> | null;
}

const defaultQuality: FaceQuality = {
    lighting: 0,
    angle: 0,
    distance: 0,
    overall: 0,
    hint: "Ожидание...",
};

function computeLighting(canvas: HTMLCanvasElement): number {
    const ctx = canvas.getContext("2d");
    if (!ctx) return 50;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let sum = 0;
    const step = 40; // sample every 10th pixel for perf
    let count = 0;
    for (let i = 0; i < data.length; i += 4 * step) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        sum += 0.299 * r + 0.587 * g + 0.114 * b;
        count++;
    }
    const avg = sum / count;
    // Too dark < 60, ideal 80-180, too bright > 220
    if (avg < 40) return Math.round((avg / 40) * 30);
    if (avg < 80) return Math.round(30 + ((avg - 40) / 40) * 40);
    if (avg <= 190) return Math.round(70 + ((avg - 80) / 110) * 30);
    return Math.round(Math.max(0, 100 - ((avg - 190) / 65) * 60));
}

function computeAngle(
    landmarks: faceapi.FaceLandmarks68,
    boxWidth: number
): number {
    const nose = landmarks.getNose();
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();

    const leftEyeCenter = {
        x: leftEye.reduce((s, p) => s + p.x, 0) / leftEye.length,
        y: leftEye.reduce((s, p) => s + p.y, 0) / leftEye.length,
    };
    const rightEyeCenter = {
        x: rightEye.reduce((s, p) => s + p.x, 0) / rightEye.length,
        y: rightEye.reduce((s, p) => s + p.y, 0) / rightEye.length,
    };

    // Eye tilt
    const dy = rightEyeCenter.y - leftEyeCenter.y;
    const dx = rightEyeCenter.x - leftEyeCenter.x;
    const tiltDeg = Math.abs(Math.atan2(dy, dx) * (180 / Math.PI));

    // Nose horizontal offset from center
    const noseTip = nose[nose.length - 1];
    const centerX = boxWidth / 2;
    const offsetRatio = Math.abs(noseTip.x - centerX) / (boxWidth / 2);

    const anglePenalty = Math.min(tiltDeg / 30, 1) * 50 + offsetRatio * 50;
    return Math.round(Math.max(0, 100 - anglePenalty));
}

function computeDistance(
    detection: faceapi.FaceDetection,
    videoWidth: number,
    videoHeight: number
): number {
    const boxArea = detection.box.width * detection.box.height;
    const frameArea = videoWidth * videoHeight;
    const ratio = boxArea / frameArea;

    // Ideal: face takes 15%-55% of frame
    if (ratio < 0.05) return Math.round((ratio / 0.05) * 40);
    if (ratio < 0.15) return Math.round(40 + ((ratio - 0.05) / 0.10) * 35);
    if (ratio <= 0.55) return Math.round(75 + ((ratio - 0.15) / 0.40) * 25);
    return Math.round(Math.max(0, 100 - ((ratio - 0.55) / 0.45) * 100));
}

function buildHint(lighting: number, angle: number, distance: number): string {
    if (lighting < 40) return "💡 Улучшите освещение — слишком темно";
    if (lighting > 80 && lighting < 85) return "💡 Слишком яркое освещение";
    if (distance < 40) return "🔍 Подойдите ближе к камере";
    if (distance > 85) return "↔️ Отодвиньтесь немного дальше";
    if (angle < 50) return "↩️ Поверните лицо прямо к камере";
    return "✅ Отлично! Нажмите «Сделать снимок»";
}

export function useFaceDetection(
    videoRef: React.RefObject<HTMLVideoElement>,
    canvasRef: React.RefObject<HTMLCanvasElement>
) {
    const [state, setState] = useState<FaceDetectionState>({
        isModelLoaded: false,
        isLoadingModels: true,
        faceDetected: false,
        faceQuality: null,
        detections: null,
    });

    const rafRef = useRef<number | null>(null);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    const loadModels = useCallback(async () => {
        const MODEL_URL = "/models";
        try {
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            ]);
            if (isMountedRef.current) {
                setState(s => ({ ...s, isModelLoaded: true, isLoadingModels: false }));
            }
        } catch (err) {
            console.error("Failed to load face-api models:", err);
            if (isMountedRef.current) {
                setState(s => ({ ...s, isLoadingModels: false }));
            }
        }
    }, []);

    const runDetectionLoop = useCallback(async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || video.readyState < 2) {
            rafRef.current = requestAnimationFrame(runDetectionLoop);
            return;
        }

        const displaySize = { width: video.videoWidth, height: video.videoHeight };
        faceapi.matchDimensions(canvas, displaySize);

        try {
            const det = await faceapi
                .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.4 }))
                .withFaceLandmarks();

            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }

            if (det && isMountedRef.current) {
                const resized = faceapi.resizeResults(det, displaySize);

                // Draw landmark dots
                if (ctx) {
                    faceapi.draw.drawFaceLandmarks(canvas, resized);
                    // Draw bounding box with custom style
                    const box = resized.detection.box;
                    ctx.strokeStyle = "rgba(99, 102, 241, 0.85)";
                    ctx.lineWidth = 2;
                    ctx.strokeRect(box.x, box.y, box.width, box.height);

                    // Corner accents
                    const c = 18;
                    ctx.strokeStyle = "#818cf8";
                    ctx.lineWidth = 3;
                    [[box.x, box.y], [box.x + box.width, box.y], [box.x, box.y + box.height], [box.x + box.width, box.y + box.height]].forEach(([cx, cy]) => {
                        const dx = cx === box.x ? 1 : -1;
                        const dy = cy === box.y ? 1 : -1;
                        ctx.beginPath();
                        ctx.moveTo(cx, cy + dy * c);
                        ctx.lineTo(cx, cy);
                        ctx.lineTo(cx + dx * c, cy);
                        ctx.stroke();
                    });
                }

                // Compute quality metrics from canvas snapshot
                const tmpCanvas = document.createElement("canvas");
                tmpCanvas.width = video.videoWidth;
                tmpCanvas.height = video.videoHeight;
                const tmpCtx = tmpCanvas.getContext("2d");
                if (tmpCtx) tmpCtx.drawImage(video, 0, 0);

                const lighting = computeLighting(tmpCanvas);
                const angle = computeAngle(resized.landmarks, resized.detection.box.width);
                const distance = computeDistance(resized.detection, video.videoWidth, video.videoHeight);
                const overall = Math.round((lighting * 0.3 + angle * 0.4 + distance * 0.3));
                const hint = buildHint(lighting, angle, distance);

                setState({
                    isModelLoaded: true,
                    isLoadingModels: false,
                    faceDetected: true,
                    detections: det,
                    faceQuality: { lighting, angle, distance, overall, hint },
                });
            } else if (isMountedRef.current) {
                setState(s => ({
                    ...s,
                    faceDetected: false,
                    detections: null,
                    faceQuality: { ...defaultQuality, hint: "👤 Наведите камеру на своё лицо" },
                }));
            }
        } catch {
            // silent fail — keep looping
        }

        if (isMountedRef.current) {
            rafRef.current = requestAnimationFrame(runDetectionLoop);
        }
    }, [videoRef, canvasRef]);

    const startDetection = useCallback(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(runDetectionLoop);
    }, [runDetectionLoop]);

    const stopDetection = useCallback(() => {
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
    }, []);

    return { state, loadModels, startDetection, stopDetection };
}
