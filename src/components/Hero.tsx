import { Button } from "@/components/ui/button";
import { Shield, Sparkles, Clock } from "lucide-react";

interface HeroProps {
  onStartAnalysis: () => void;
}

export function Hero({ onStartAnalysis }: HeroProps) {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0 -z-10"
        style={{ background: "var(--gradient-hero)" }}
      />

      {/* Decorative circles */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            AI-анализ кожи нового поколения
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Персонализированный анализ
            <span className="gradient-text block mt-2">состояния вашей кожи</span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Используйте камеру в реальном времени или загрузите фото для получения детального отчёта
            о состоянии кожи с профессиональными рекомендациями по уходу
          </p>

          {/* CTA */}
          <Button
            variant="hero"
            size="xl"
            onClick={onStartAnalysis}
            className="mb-12"
          >
            Начать анализ бесплатно
          </Button>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <FeatureItem
              icon={<Clock className="w-5 h-5" />}
              title="30 секунд"
              description="Быстрый анализ"
            />
            <FeatureItem
              icon={<Shield className="w-5 h-5" />}
              title="Приватность"
              description="Данные не сохраняются"
            />
            <FeatureItem
              icon={<Sparkles className="w-5 h-5" />}
              title="AI-точность"
              description="Медицинские алгоритмы"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureItem({
  icon,
  title,
  description
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
        {icon}
      </div>
      <div className="text-left">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
