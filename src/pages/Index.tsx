import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { UploadZone } from "@/components/UploadZone";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { Footer } from "@/components/Footer";
import { LoadingAnalysis } from "@/components/LoadingAnalysis";
import { AnalysisResults } from "@/components/AnalysisResults";
import { useToast } from "@/hooks/use-toast";
import type { SkinAnalysisResult } from "@/types/analysis";
import { analyzeSkinWithGemini } from "@/services/skinAnalysis";

type AppState = "landing" | "upload" | "analyzing" | "results";

const Index = () => {
  const [appState, setAppState] = useState<AppState>("landing");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<SkinAnalysisResult | null>(null);
  const [analysisStep, setAnalysisStep] = useState(0);
  const { toast } = useToast();

  const handleStartAnalysis = () => {
    setAppState("upload");
    setTimeout(() => {
      document.getElementById("upload")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleImageUpload = (file: File, preview: string) => {
    setUploadedFile(file);
    setUploadedImage(preview);
  };

  const handleClearImage = () => {
    setUploadedFile(null);
    setUploadedImage(null);
  };

  const handleCameraCapture = async (imageBase64: string) => {
    setUploadedImage(imageBase64);
    setAppState("analyzing");
    setAnalysisStep(0);
    const stepInterval = setInterval(() => {
      setAnalysisStep(prev => {
        if (prev >= 4) { clearInterval(stepInterval); return prev; }
        return prev + 1;
      });
    }, 1500);
    try {
      const result = await analyzeSkinWithGemini(imageBase64);
      clearInterval(stepInterval);
      setAnalysisResult(result);
      setAnalysisStep(5);
      setAppState("results");
    } catch (error) {
      clearInterval(stepInterval);
      console.error("Camera analysis error:", error);
      toast({
        title: "Ошибка анализа",
        description: error instanceof Error ? error.message : "Попробуйте ещё раз позже",
        variant: "destructive",
      });
      setAppState("upload");
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedImage) return;

    setAppState("analyzing");
    setAnalysisStep(0);

    const stepInterval = setInterval(() => {
      setAnalysisStep(prev => {
        if (prev >= 4) { clearInterval(stepInterval); return prev; }
        return prev + 1;
      });
    }, 1500);

    try {
      const result = await analyzeSkinWithGemini(uploadedImage);
      clearInterval(stepInterval);
      setAnalysisResult(result);
      setAnalysisStep(5);
      setAppState("results");
    } catch (error) {
      clearInterval(stepInterval);
      console.error("Analysis error:", error);
      toast({
        title: "Ошибка анализа",
        description: error instanceof Error ? error.message : "Попробуйте ещё раз позже",
        variant: "destructive",
      });
      setAppState("upload");
    }
  };

  const handleBackToUpload = () => {
    setAppState("upload");
    setAnalysisResult(null);
  };

  // Reset scroll position when changing states
  useEffect(() => {
    if (appState === "landing" || appState === "results") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [appState]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-16">
        {appState === "landing" && (
          <>
            <Hero onStartAnalysis={handleStartAnalysis} />
            <Features />
            <HowItWorks />
          </>
        )}

        {appState === "upload" && (
          <>
            <div className="py-8" />
            <UploadZone
              onImageUpload={handleImageUpload}
              onAnalyze={handleAnalyze}
              isAnalyzing={false}
              uploadedImage={uploadedImage}
              onClearImage={handleClearImage}
              onCameraCapture={handleCameraCapture}
            />
            <Features />
          </>
        )}

        {appState === "analyzing" && (
          <LoadingAnalysis currentStep={analysisStep} />
        )}

        {appState === "results" && analysisResult && uploadedImage && (
          <AnalysisResults
            result={analysisResult}
            imageUrl={uploadedImage}
            onBack={handleBackToUpload}
          />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Index;
