import { motion } from 'motion/react';
import { Lock, Sparkles, Trophy, Target } from 'lucide-react';

interface Deck {
  id: number;
  title: string;
  icon: string;
  progress: number;
  totalCards: number;
  completedCards: number;
  isCompleted: boolean;
  category: string;
}

const mockDecks: Deck[] = [
  {
    id: 1,
    title: "Psychologie Cognitive",
    icon: "🧠",
    progress: 100,
    totalCards: 45,
    completedCards: 45,
    isCompleted: true,
    category: "Sciences Humaines"
  },
  {
    id: 2,
    title: "Astrophysique",
    icon: "🌌",
    progress: 67,
    totalCards: 60,
    completedCards: 40,
    isCompleted: false,
    category: "Sciences"
  },
  {
    id: 3,
    title: "Économie",
    icon: "📈",
    progress: 100,
    totalCards: 38,
    completedCards: 38,
    isCompleted: true,
    category: "Business"
  },
  {
    id: 4,
    title: "Histoire Moderne",
    icon: "⚔️",
    progress: 45,
    totalCards: 72,
    completedCards: 32,
    isCompleted: false,
    category: "Histoire"
  },
  {
    id: 5,
    title: "Philosophie",
    icon: "💭",
    progress: 89,
    totalCards: 50,
    completedCards: 44,
    isCompleted: false,
    category: "Sciences Humaines"
  },
  {
    id: 6,
    title: "Biologie Moléculaire",
    icon: "🧬",
    progress: 23,
    totalCards: 55,
    completedCards: 13,
    isCompleted: false,
    category: "Sciences"
  },
  {
    id: 7,
    title: "Art & Culture",
    icon: "🎨",
    progress: 0,
    totalCards: 48,
    completedCards: 0,
    isCompleted: false,
    category: "Culture"
  },
  {
    id: 8,
    title: "Mathématiques",
    icon: "∑",
    progress: 100,
    totalCards: 64,
    completedCards: 64,
    isCompleted: true,
    category: "Sciences"
  }
];

export function Atlas() {
  return (
    <div className="h-full w-full overflow-y-auto bg-[#0F1115]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-b from-[#0F1115] via-[#0F1115] to-transparent pt-8 pb-6 px-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2EE6D6] to-[#3BE38A] flex items-center justify-center">
            <Target className="w-6 h-6 text-[#0F1115]" />
          </div>
          <div>
            <h1 className="text-2xl text-white">L'Atlas</h1>
            <p className="text-sm text-white/50">Votre conquête intellectuelle</p>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="bg-[#181B22] rounded-xl p-3 border border-white/5">
            <div className="text-2xl text-[#2EE6D6]">8</div>
            <div className="text-xs text-white/50">Decks</div>
          </div>
          <div className="bg-[#181B22] rounded-xl p-3 border border-white/5">
            <div className="text-2xl text-[#3BE38A]">3</div>
            <div className="text-xs text-white/50">Complétés</div>
          </div>
          <div className="bg-[#181B22] rounded-xl p-3 border border-white/5">
            <div className="text-2xl text-[#2EE6D6]">187</div>
            <div className="text-xs text-white/50">Cartes</div>
          </div>
        </div>
      </div>

      {/* Decks Grid */}
      <div className="px-6 pb-24">
        <div className="grid grid-cols-2 gap-4">
          {mockDecks.map((deck, index) => (
            <motion.div
              key={deck.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative"
            >
              <DeckCard deck={deck} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DeckCard({ deck }: { deck: Deck }) {
  const isCompleted = deck.isCompleted;
  const isLocked = deck.progress === 0 && deck.id > 6;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative aspect-square rounded-2xl p-4 flex flex-col justify-between cursor-pointer
        transition-all duration-300 overflow-hidden
        ${isCompleted 
          ? 'bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-amber-600/20 border-2 border-amber-500/50' 
          : 'bg-gradient-to-br from-[#181B22] via-[#1f2330] to-[#181B22] border border-white/10'
        }
        ${isLocked ? 'opacity-50' : ''}
      `}
    >
      {/* Shine Effect for Completed */}
      {isCompleted && (
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-pulse" />
      )}

      {/* Lock Overlay */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-2xl">
          <Lock className="w-8 h-8 text-white/50" />
        </div>
      )}

      {/* Icon */}
      <div className="relative z-10">
        <div className={`
          text-4xl mb-2
          ${isCompleted ? 'drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' : ''}
        `}>
          {deck.icon}
        </div>
        <h3 className={`
          text-sm leading-tight
          ${isCompleted ? 'text-amber-100' : 'text-white'}
        `}>
          {deck.title}
        </h3>
      </div>

      {/* Progress Section */}
      <div className="relative z-10">
        {/* Circular Progress */}
        <div className="flex items-center justify-between mb-2">
          <div className="relative w-12 h-12">
            <svg className="w-12 h-12 -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                className="text-white/10"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 20}`}
                strokeDashoffset={`${2 * Math.PI * 20 * (1 - deck.progress / 100)}`}
                className={isCompleted ? 'text-amber-400' : 'text-[#2EE6D6]'}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-xs ${isCompleted ? 'text-amber-400' : 'text-[#2EE6D6]'}`}>
                {deck.progress}%
              </span>
            </div>
          </div>

          {/* Trophy Badge */}
          {isCompleted && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center"
            >
              <Trophy className="w-4 h-4 text-[#0F1115]" />
            </motion.div>
          )}
        </div>

        {/* Cards Count */}
        <div className="text-xs text-white/50">
          {deck.completedCards}/{deck.totalCards} cartes
        </div>

        {/* Category Tag */}
        <div className={`
          mt-2 text-[10px] px-2 py-1 rounded-full inline-block
          ${isCompleted 
            ? 'bg-amber-500/20 text-amber-300' 
            : 'bg-[#2EE6D6]/10 text-[#2EE6D6]'
          }
        `}>
          {deck.category}
        </div>
      </div>

      {/* Sparkles for Completed */}
      {isCompleted && (
        <Sparkles className="absolute top-3 right-3 w-5 h-5 text-amber-400 animate-pulse" />
      )}
    </motion.div>
  );
}
