import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ShoppingBag, ExternalLink } from "lucide-react";
import type { SkinType, SkinCondition } from "@/types/analysis";

interface Product {
  brand: string;
  name: string;
  description: string;
  price: number; // цена в тенге
  imageUrl: string;
  buyUrl: string; // ссылка на покупку
}

interface ProductRecommendation {
  category: string;
  products: Product[];
}

interface ProductRecommendationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  skinType: SkinType;
  conditions: SkinCondition[];
}

const kaspiSearch = (query: string) =>
  `https://kaspi.kz/shop/search/?text=${encodeURIComponent(query)}`;

const getProductRecommendations = (
  skinType: SkinType,
  conditions: SkinCondition[]
): ProductRecommendation[] => {
  const recommendations: ProductRecommendation[] = [];

  // Очищение
  const cleansingProducts: ProductRecommendation = {
    category: "Очищение",
    products: [],
  };

  if (skinType === "oily" || skinType === "combination") {
    cleansingProducts.products.push(
      { 
        brand: "CeraVe", 
        name: "Foaming Facial Cleanser", 
        description: "Пенка с церамидами и ниацинамидом (236 мл)", 
        price: 6300,
        imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&h=200&fit=crop",
        buyUrl: kaspiSearch("CeraVe Foaming Facial Cleanser")
      },
      { 
        brand: "La Roche-Posay", 
        name: "Effaclar Gel", 
        description: "Очищающий гель для жирной кожи с цинком (200 мл)", 
        price: 7400,
        imageUrl: "https://images.unsplash.com/photo-1570194065650-d99fb4ee8f04?w=200&h=200&fit=crop",
        buyUrl: kaspiSearch("La Roche-Posay Effaclar очищающий гель")
      },
      { 
        brand: "Paula's Choice", 
        name: "CLEAR Pore Normalizing Cleanser", 
        description: "Мягкое очищение для проблемной кожи (177 мл)", 
        price: 11200,
        imageUrl: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=200&h=200&fit=crop",
        buyUrl: kaspiSearch("Paula's Choice CLEAR Pore Normalizing Cleanser")
      }
    );
  } else if (skinType === "dry" || skinType === "sensitive") {
    cleansingProducts.products.push(
      { 
        brand: "CeraVe", 
        name: "Hydrating Cleanser", 
        description: "Увлажняющее очищение с гиалуроновой кислотой (236 мл)", 
        price: 5800,
        imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&h=200&fit=crop",
        buyUrl: kaspiSearch("CeraVe Hydrating Cleanser")
      },
      { 
        brand: "La Roche-Posay", 
        name: "Toleriane Caring Wash", 
        description: "Нежное очищение для чувствительной кожи (200 мл)", 
        price: 7900,
        imageUrl: "https://images.unsplash.com/photo-1570194065650-d99fb4ee8f04?w=200&h=200&fit=crop",
        buyUrl: kaspiSearch("La Roche-Posay Toleriane Caring Wash")
      },
      { 
        brand: "Avène", 
        name: "Xeracalm A.D Cleansing Oil", 
        description: "Липидовосполняющее масло для очищения (400 мл)", 
        price: 10500,
        imageUrl: "https://images.unsplash.com/photo-1617897903246-719242758050?w=200&h=200&fit=crop",
        buyUrl: kaspiSearch("Avene Xeracalm масло для очищения")
      }
    );
  } else {
    cleansingProducts.products.push(
      { 
        brand: "CeraVe", 
        name: "SA Smoothing Cleanser", 
        description: "Очищение с салициловой кислотой (236 мл)", 
        price: 6100,
        imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&h=200&fit=crop",
        buyUrl: kaspiSearch("CeraVe SA Smoothing Cleanser")
      },
      { 
        brand: "Clinique", 
        name: "Liquid Facial Soap Mild", 
        description: "Мягкое мыло для лица (200 мл)", 
        price: 10900,
        imageUrl: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=200&h=200&fit=crop",
        buyUrl: kaspiSearch("Clinique Liquid Facial Soap Mild")
      }
    );
  }
  recommendations.push(cleansingProducts);

  // Проверяем на акне
  const hasAcne = conditions.some(c => 
    c.name.toLowerCase().includes("акне") || 
    c.name.toLowerCase().includes("acne") ||
    c.name.toLowerCase().includes("воспалени")
  );

  if (hasAcne) {
    recommendations.push({
      category: "Лечение акне",
      products: [
        { 
          brand: "The Ordinary", 
          name: "Niacinamide 10% + Zinc 1%", 
          description: "Сыворотка для сужения пор и контроля себума (30 мл)", 
          price: 7500,
          imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&h=200&fit=crop",
          buyUrl: kaspiSearch("The Ordinary Niacinamide 10% + Zinc 1%")
        },
        { 
          brand: "Differin", 
          name: "Adapalene Gel 0.1%", 
          description: "Ретиноид для лечения акне (15 г)", 
          price: 6200,
          imageUrl: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=200&h=200&fit=crop",
          buyUrl: kaspiSearch("Differin Adapalene гель")
        },
        { 
          brand: "Paula's Choice", 
          name: "2% BHA Liquid Exfoliant", 
          description: "Культовый эксфолиант с салициловой кислотой (30 мл)", 
          price: 11100,
          imageUrl: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=200&h=200&fit=crop",
          buyUrl: kaspiSearch("Paula's Choice 2% BHA Liquid Exfoliant")
        },
        { 
          brand: "La Roche-Posay", 
          name: "Effaclar Duo+", 
          description: "Корректирующий крем против несовершенств (40 мл)", 
          price: 11800,
          imageUrl: "https://images.unsplash.com/photo-1570194065650-d99fb4ee8f04?w=200&h=200&fit=crop",
          buyUrl: kaspiSearch("La Roche-Posay Effaclar Duo+")
        }
      ]
    });
  }

  // Проверяем на пигментацию
  const hasPigmentation = conditions.some(c => 
    c.name.toLowerCase().includes("пигментац") || 
    c.name.toLowerCase().includes("пятн") ||
    c.name.toLowerCase().includes("постакне")
  );

  if (hasPigmentation) {
    recommendations.push({
      category: "Осветление и выравнивание тона",
      products: [
        { 
          brand: "The Ordinary", 
          name: "Alpha Arbutin 2% + HA", 
          description: "Сыворотка для осветления пигментации (30 мл)", 
          price: 8200,
          imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&h=200&fit=crop",
          buyUrl: kaspiSearch("The Ordinary Alpha Arbutin 2%")
        },
        { 
          brand: "Paula's Choice", 
          name: "C15 Super Booster", 
          description: "Концентрат витамина C 15% (20 мл)", 
          price: 21500,
          imageUrl: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=200&h=200&fit=crop",
          buyUrl: kaspiSearch("Paula's Choice C15 Super Booster")
        },
        { 
          brand: "La Roche-Posay", 
          name: "Mela-D Pigment Control", 
          description: "Сыворотка против пигментных пятен (30 мл)", 
          price: 17500,
          imageUrl: "https://images.unsplash.com/photo-1570194065650-d99fb4ee8f04?w=200&h=200&fit=crop",
          buyUrl: kaspiSearch("La Roche-Posay Mela-D Pigment Control")
        },
        { 
          brand: "Skinceuticals", 
          name: "C E Ferulic", 
          description: "Премиальная сыворотка с витамином C (30 мл)", 
          price: 72000,
          imageUrl: "https://images.unsplash.com/photo-1617897903246-719242758050?w=200&h=200&fit=crop",
          buyUrl: kaspiSearch("Skinceuticals C E Ferulic")
        }
      ]
    });
  }

  // Увлажнение
  const moisturizingProducts: ProductRecommendation = {
    category: "Увлажнение",
    products: [],
  };

  if (skinType === "oily" || skinType === "combination") {
    moisturizingProducts.products.push(
      { 
        brand: "Neutrogena", 
        name: "Hydro Boost Water Gel", 
        description: "Гель с гиалуроновой кислотой (50 мл)", 
        price: 6800,
        imageUrl: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=200&h=200&fit=crop",
        buyUrl: kaspiSearch("Neutrogena Hydro Boost Water Gel")
      },
      { 
        brand: "CeraVe", 
        name: "PM Facial Moisturizing Lotion", 
        description: "Лёгкий увлажняющий лосьон с ниацинамидом (52 мл)", 
        price: 7200,
        imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&h=200&fit=crop",
        buyUrl: kaspiSearch("CeraVe PM Facial Moisturizing Lotion")
      },
      { 
        brand: "La Roche-Posay", 
        name: "Effaclar Mat", 
        description: "Матирующий увлажняющий крем (40 мл)", 
        price: 10900,
        imageUrl: "https://images.unsplash.com/photo-1570194065650-d99fb4ee8f04?w=200&h=200&fit=crop",
        buyUrl: kaspiSearch("La Roche-Posay Effaclar Mat")
      }
    );
  } else if (skinType === "dry" || skinType === "sensitive") {
    moisturizingProducts.products.push(
      { 
        brand: "CeraVe", 
        name: "Moisturizing Cream", 
        description: "Насыщенный крем с церамидами (340 г)", 
        price: 7800,
        imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&h=200&fit=crop",
        buyUrl: kaspiSearch("CeraVe Moisturizing Cream")
      },
      { 
        brand: "La Roche-Posay", 
        name: "Cicaplast Baume B5+", 
        description: "Восстанавливающий бальзам (40 мл)", 
        price: 8900,
        imageUrl: "https://images.unsplash.com/photo-1570194065650-d99fb4ee8f04?w=200&h=200&fit=crop",
        buyUrl: kaspiSearch("La Roche-Posay Cicaplast Baume B5")
      },
      { 
        brand: "Avène", 
        name: "XeraCalm A.D Lipid-Replenishing Cream", 
        description: "Крем для очень сухой кожи (200 мл)", 
        price: 12800,
        imageUrl: "https://images.unsplash.com/photo-1617897903246-719242758050?w=200&h=200&fit=crop",
        buyUrl: kaspiSearch("Avene XeraCalm крем")
      }
    );
  } else {
    moisturizingProducts.products.push(
      { 
        brand: "CeraVe", 
        name: "Daily Moisturizing Lotion", 
        description: "Ежедневный увлажняющий лосьон (236 мл)", 
        price: 6500,
        imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&h=200&fit=crop",
        buyUrl: kaspiSearch("CeraVe Daily Moisturizing Lotion")
      },
      { 
        brand: "Clinique", 
        name: "Dramatically Different Moisturizing Gel", 
        description: "Культовый увлажняющий гель (125 мл)", 
        price: 15900,
        imageUrl: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=200&h=200&fit=crop",
        buyUrl: kaspiSearch("Clinique Dramatically Different Moisturizing Gel")
      }
    );
  }
  recommendations.push(moisturizingProducts);

  // SPF всегда
  recommendations.push({
    category: "Защита от солнца (SPF)",
    products: [
      { 
        brand: "CeraVe", 
        name: "Hydrating Sunscreen SPF50", 
        description: "Увлажняющий солнцезащитный крем (50 мл)", 
        price: 7900,
        imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&h=200&fit=crop",
        buyUrl: kaspiSearch("CeraVe солнцезащитный крем SPF50")
      },
      { 
        brand: "Bioderma", 
        name: "Photoderm MAX Aquafluide SPF50+", 
        description: "Аквафлюид для чувствительной кожи (40 мл)", 
        price: 10200,
        imageUrl: "https://images.unsplash.com/photo-1617897903246-719242758050?w=200&h=200&fit=crop",
        buyUrl: kaspiSearch("Bioderma Photoderm MAX Aquafluide")
      },
      { 
        brand: "La Roche-Posay", 
        name: "Anthelios UVMune 400 SPF50+", 
        description: "Флюид с новейшими фильтрами (50 мл)", 
        price: 13500,
        imageUrl: "https://images.unsplash.com/photo-1570194065650-d99fb4ee8f04?w=200&h=200&fit=crop",
        buyUrl: kaspiSearch("La Roche-Posay Anthelios UVMune 400")
      },
      { 
        brand: "Isdin", 
        name: "Fotoprotector Fusion Water SPF50", 
        description: "Лёгкая текстура, не оставляет белых следов (50 мл)", 
        price: 16800,
        imageUrl: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=200&h=200&fit=crop",
        buyUrl: kaspiSearch("Isdin Fotoprotector Fusion Water")
      }
    ]
  });

  // Сортируем продукты в каждой категории по цене (от дешёвого к дорогому)
  recommendations.forEach(category => {
    category.products.sort((a, b) => a.price - b.price);
  });

  return recommendations;
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('kk-KZ').format(price) + ' ₸';
};

const getPriceClass = (price: number) => {
  if (price < 8000) return "bg-success/10 text-success border-success/30";
  if (price < 15000) return "bg-primary/10 text-primary border-primary/30";
  return "bg-accent/10 text-accent border-accent/30";
};

export function ProductRecommendationsModal({
  isOpen,
  onClose,
  skinType,
  conditions,
}: ProductRecommendationsModalProps) {
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([]);

  useEffect(() => {
    if (isOpen) {
      setRecommendations(getProductRecommendations(skinType, conditions));
    }
  }, [isOpen, skinType, conditions]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-5 h-5 text-primary" />
            Рекомендованные средства
          </DialogTitle>
          <DialogDescription>
            Подборка косметических средств на основе вашего типа кожи и выявленных проблем. Цены актуальны для Казахстана.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {recommendations.map((category, categoryIndex) => (
            <div key={categoryIndex} className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-primary" />
                {category.category}
              </h3>
              <div className="grid gap-3">
                {category.products.map((product, productIndex) => (
                  <div
                    key={productIndex}
                    className="p-4 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-semibold text-primary">{product.brand}</span>
                          <Badge 
                            variant="outline" 
                            className={getPriceClass(product.price)}
                          >
                            {formatPrice(product.price)}
                          </Badge>
                        </div>
                        <p className="font-medium">{product.name}</p>
                        <div className="flex items-center justify-between mt-1 gap-2">
                          <p className="text-sm text-muted-foreground">
                            {product.description}
                          </p>
                          <a
                            href={product.buyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium transition-colors"
                          >
                            Купить
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-4">
            * Цены актуальны на апрель 2026 г. для Казахстана и могут отличаться в зависимости от продавца. 
            Рекомендации носят информационный характер. Перед использованием новых средств 
            рекомендуем провести тест на небольшом участке кожи.
          </p>
          <Button onClick={onClose} className="w-full">
            Понятно, спасибо!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
