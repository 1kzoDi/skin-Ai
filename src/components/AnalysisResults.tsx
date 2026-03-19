import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Info,
  Droplets,
  Sun,
  Wind,
  Heart,
  Stethoscope,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SkinAnalysisResult } from "@/types/analysis";
import { ProductRecommendationsModal } from "./ProductRecommendationsModal";

interface AnalysisResultsProps {
  result: SkinAnalysisResult;
  imageUrl: string;
  onBack: () => void;
}

export function AnalysisResults({ result, imageUrl, onBack }: AnalysisResultsProps) {
  const [showProductModal, setShowProductModal] = useState(false);

  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case "mild": return "severity-badge-mild";
      case "moderate": return "severity-badge-moderate";
      case "severe": return "severity-badge-severe";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case "mild": return "Лёгкая";
      case "moderate": return "Средняя";
      case "severe": return "Тяжёлая";
      default: return severity;
    }
  };

  const getSkinTypeIcon = (type: string) => {
    switch (type) {
      case "dry": return <Droplets className="w-5 h-5" />;
      case "oily": return <Sun className="w-5 h-5" />;
      case "combination": return <Wind className="w-5 h-5" />;
      case "normal": return <CheckCircle2 className="w-5 h-5" />;
      case "sensitive": return <Heart className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getSkinTypeLabel = (type: string) => {
    switch (type) {
      case "dry": return "Сухая";
      case "oily": return "Жирная";
      case "combination": return "Комбинированная";
      case "normal": return "Нормальная";
      case "sensitive": return "Чувствительная";
      default: return type;
    }
  };

  return (
    <section className="py-12 px-4 animate-fade-in">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Назад
          </Button>
          <Button
            variant="hero"
            onClick={() => setShowProductModal(true)}
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Подобрать средства
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image with markers */}
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-border bg-secondary/30">
              <img
                src={imageUrl}
                alt="Анализируемое фото"
                className="w-full h-auto"
              />
              {/* Problem markers overlay */}
              {result.problemZones.map((zone, index) => (
                <div
                  key={index}
                  className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent bg-accent/20 flex items-center justify-center text-xs font-bold text-accent animate-pulse-soft"
                  style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
                  title={zone.problem}
                >
                  {index + 1}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="glass-card p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" />
                Выявленные зоны
              </h4>
              <div className="space-y-2">
                {result.problemZones.map((zone, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <span className="w-6 h-6 rounded-full bg-accent/20 border border-accent text-accent flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <span>{zone.problem}</span>
                    <Badge variant="outline" className={cn("ml-auto", getSeverityClass(zone.severity))}>
                      {getSeverityLabel(zone.severity)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Analysis details */}
          <div className="space-y-6">
            {/* Skin type */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  {getSkinTypeIcon(result.skinType)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Тип кожи</p>
                  <p className="text-xl font-semibold">{getSkinTypeLabel(result.skinType)}</p>
                </div>
              </div>
              <p className="text-muted-foreground">{result.skinTypeDescription}</p>
            </div>

            {/* Conditions */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Состояние кожи</h3>
              <div className="space-y-4">
                {result.conditions.map((condition, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                      condition.severity === "mild" && "bg-success",
                      condition.severity === "moderate" && "bg-warning",
                      condition.severity === "severe" && "bg-destructive"
                    )} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{condition.name}</span>
                        <Badge variant="outline" className={getSeverityClass(condition.severity)}>
                          {getSeverityLabel(condition.severity)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{condition.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Possible causes */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Возможные причины</h3>
              <div className="flex flex-wrap gap-2">
                {result.possibleCauses.map((cause, index) => (
                  <Badge key={index} variant="secondary" className="text-sm py-1.5">
                    {cause}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Рекомендации</h3>
              <div className="space-y-4">
                {result.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">{rec.title}</p>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Doctor recommendation */}
            {result.shouldSeeDermatologist && (
              <div className="glass-card p-6 border-warning/50 bg-warning/5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-warning/20 text-warning flex items-center justify-center flex-shrink-0">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-warning mb-1">Рекомендуем консультацию дерматолога</h4>
                    <p className="text-sm text-muted-foreground">
                      {result.dermatologistReason}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 text-sm text-muted-foreground">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>
                Этот анализ носит информационный характер и не заменяет консультацию
                квалифицированного дерматолога. При серьёзных проблемах с кожей
                обратитесь к специалисту.
              </p>
            </div>
          </div>
        </div>
      </div>

      <ProductRecommendationsModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        skinType={result.skinType}
        conditions={result.conditions}
      />
    </section>
  );
}
