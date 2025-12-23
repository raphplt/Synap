import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, RotateCw, ChevronDown, Zap } from 'lucide-react';

interface Card {
  id: number;
  front: {
    title: string;
    content: string;
    category: string;
  };
  back: {
    explanation: string;
  };
  likes: number;
  progress: number;
}

const mockCards: Card[] = [
  {
    id: 1,
    front: {
      title: "L'Effet Dunning-Kruger",
      content: "Les personnes les moins compétentes dans un domaine ont tendance à surestimer drastiquement leurs capacités, tandis que les experts doutent souvent de leurs compétences.",
      category: "Psychologie Cognitive"
    },
    back: {
      explanation: "Découvert en 1999, ce biais cognitif explique pourquoi les débutants sont souvent les plus confiants. Le savoir véritable apporte l'humilité de reconnaître l'étendue de ce qu'on ignore."
    },
    likes: 2847,
    progress: 65
  },
  {
    id: 2,
    front: {
      title: "Le Paradoxe de Fermi",
      content: "Si l'univers est si vaste et ancien, où sont toutes les civilisations extraterrestres ? L'absence de preuves de vie intelligente est statistiquement troublante.",
      category: "Astrophysique"
    },
    back: {
      explanation: "Formulé en 1950 par Enrico Fermi. Plusieurs hypothèses : le Grand Filtre (obstacle universel), la rareté de la vie intelligente, ou l'auto-destruction des civilisations avancées."
    },
    likes: 3912,
    progress: 42
  },
  {
    id: 3,
    front: {
      title: "La Loi de Pareto (80/20)",
      content: "Dans de nombreux systèmes, 80% des résultats proviennent de 20% des efforts. Ce principe s'applique en économie, productivité, et nature.",
      category: "Économie"
    },
    back: {
      explanation: "Observé en 1896 par l'économiste Vilfredo Pareto. Exemples : 20% des clients génèrent 80% du CA, 20% du code cause 80% des bugs. Concentrez-vous sur ce qui compte vraiment."
    },
    likes: 5234,
    progress: 88
  }
];

export function SmartFeed() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [liked, setLiked] = useState(false);
  const [direction, setDirection] = useState<'up' | 'down'>('down');

  const currentCard = mockCards[currentIndex];

  const handleNext = () => {
    setDirection('up');
    setIsFlipped(false);
    setLiked(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % mockCards.length);
    }, 300);
  };

  const handleEvaluation = (retained: boolean) => {
    // Simulate evaluation
    setTimeout(() => {
      handleNext();
    }, 500);
  };

  return (
    <div className="h-full w-full relative bg-gradient-to-b from-[#0F1115] via-[#1a1d26] to-[#0F1115] overflow-hidden">
      {/* Neural Network Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#2EE6D6] rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#3BE38A] rounded-full blur-[100px]" />
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#2EE6D6]" />
          <span className="text-sm text-white/70">Streak: 12 jours</span>
        </div>
        <div className="text-xs text-white/50 bg-white/5 px-3 py-1 rounded-full backdrop-blur-sm">
          {currentCard.category}
        </div>
      </div>

      {/* Card Container */}
      <div className="h-full flex items-center justify-center px-4 py-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: direction === 'down' ? 100 : -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: direction === 'down' ? -100 : 100 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md"
          >
            <motion.div
              className="relative w-full h-[600px] cursor-pointer"
              onClick={() => !isFlipped && setIsFlipped(true)}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Front of Card */}
              <div
                className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#181B22] via-[#1f2330] to-[#181B22] border border-white/10 p-8 flex flex-col justify-between shadow-2xl"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="flex-1 flex flex-col justify-center">
                  <h2 className="text-3xl mb-6 text-[#2EE6D6]">{currentCard.front.title}</h2>
                  <p className="text-lg leading-relaxed text-white/90">
                    {currentCard.front.content}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLiked(!liked);
                      }}
                      className="flex items-center gap-2 transition-colors"
                    >
                      <Heart
                        className={`w-5 h-5 ${liked ? 'fill-[#3BE38A] text-[#3BE38A]' : 'text-white/50'}`}
                      />
                      <span className="text-sm text-white/70">{currentCard.likes}</span>
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 text-white/50">
                    <RotateCw className="w-4 h-4" />
                    <span className="text-sm">Retourner</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#2EE6D6] to-[#3BE38A]"
                    style={{ width: `${currentCard.progress}%` }}
                  />
                </div>
              </div>

              {/* Back of Card */}
              <div
                className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#2EE6D6]/20 via-[#181B22] to-[#3BE38A]/20 border border-[#2EE6D6]/30 p-8 flex flex-col justify-between shadow-2xl"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                <div className="flex-1 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 text-[#2EE6D6] mb-4">
                    <div className="w-8 h-0.5 bg-[#2EE6D6]" />
                    <span className="text-sm uppercase tracking-wider">Explication</span>
                  </div>
                  <p className="text-lg leading-relaxed text-white/90">
                    {currentCard.back.explanation}
                  </p>
                </div>

                {/* Evaluation Buttons */}
                {isFlipped && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex gap-3"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEvaluation(false);
                      }}
                      className="flex-1 py-4 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:border-red-500/50 hover:text-red-400 transition-all"
                    >
                      Oublié
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEvaluation(true);
                      }}
                      className="flex-1 py-4 rounded-xl bg-[#3BE38A]/10 border border-[#3BE38A]/30 text-[#3BE38A] hover:bg-[#3BE38A]/20 transition-all"
                    >
                      Retenu
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 animate-bounce">
        <ChevronDown className="w-6 h-6" />
        <span className="text-xs">Swipe pour continuer</span>
      </div>
    </div>
  );
}
