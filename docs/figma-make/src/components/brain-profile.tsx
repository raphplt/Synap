import { motion } from 'motion/react';
import { Zap, Trophy, Target, TrendingUp, Award, Brain } from 'lucide-react';

interface UserStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  totalCards: number;
  completedDecks: number;
  accuracy: number;
  rank: string;
}

const mockStats: UserStats = {
  level: 24,
  xp: 3847,
  xpToNextLevel: 5000,
  streak: 12,
  totalCards: 187,
  completedDecks: 3,
  accuracy: 87,
  rank: "Neural Explorer"
};

const achievements = [
  { id: 1, icon: "🔥", title: "Streak Master", description: "12 jours consécutifs", unlocked: true },
  { id: 2, icon: "⚡", title: "Speed Learner", description: "100 cartes en un jour", unlocked: true },
  { id: 3, icon: "🎯", title: "Perfectionniste", description: "95% de précision", unlocked: false },
  { id: 4, icon: "🏆", title: "Conquérant", description: "5 decks complétés", unlocked: false },
  { id: 5, icon: "💎", title: "Elite Brain", description: "Niveau 50 atteint", unlocked: false },
  { id: 6, icon: "🧬", title: "Polymaths", description: "10 catégories maîtrisées", unlocked: false }
];

export function BrainProfile() {
  const xpPercentage = (mockStats.xp / mockStats.xpToNextLevel) * 100;

  return (
    <div className="h-full w-full overflow-y-auto bg-[#0F1115]">
      {/* Header with Neural Avatar */}
      <div className="relative pt-8 pb-12 px-6">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#2EE6D6]/20 rounded-full blur-[100px]" />
        
        <div className="relative z-10 flex flex-col items-center">
          {/* Neural Avatar */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative mb-4"
          >
            <NeuralAvatar level={mockStats.level} />
          </motion.div>

          {/* Level Badge */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 mb-2"
          >
            <div className="px-4 py-1 rounded-full bg-gradient-to-r from-[#2EE6D6]/20 to-[#3BE38A]/20 border border-[#2EE6D6]/30">
              <span className="text-lg text-[#2EE6D6]">Niveau {mockStats.level}</span>
            </div>
          </motion.div>

          {/* Rank */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-white/70 mb-4"
          >
            {mockStats.rank}
          </motion.div>

          {/* XP Bar */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full max-w-xs"
          >
            <div className="flex justify-between text-xs text-white/50 mb-2">
              <span>{mockStats.xp} XP</span>
              <span>{mockStats.xpToNextLevel} XP</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpPercentage}%` }}
                transition={{ delay: 0.6, duration: 1 }}
                className="h-full bg-gradient-to-r from-[#2EE6D6] to-[#3BE38A] rounded-full"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<Zap className="w-5 h-5 text-[#2EE6D6]" />}
            value={mockStats.streak}
            label="Jour de Streak"
            highlight
          />
          <StatCard
            icon={<Target className="w-5 h-5 text-[#3BE38A]" />}
            value={mockStats.totalCards}
            label="Cartes Maîtrisées"
          />
          <StatCard
            icon={<Trophy className="w-5 h-5 text-[#2EE6D6]" />}
            value={mockStats.completedDecks}
            label="Decks Complétés"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-[#3BE38A]" />}
            value={`${mockStats.accuracy}%`}
            label="Précision"
          />
        </div>
      </div>

      {/* Achievements */}
      <div className="px-6 pb-24">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-[#2EE6D6]" />
          <h2 className="text-white">Succès</h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <AchievementCard achievement={achievement} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NeuralAvatar({ level }: { level: number }) {
  // More complex neural network for higher levels
  const complexity = Math.min(Math.floor(level / 10) + 2, 6);
  
  return (
    <div className="relative w-32 h-32">
      {/* Outer Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#2EE6D6] to-[#3BE38A] rounded-full blur-xl opacity-50 animate-pulse" />
      
      {/* Main Circle */}
      <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-[#2EE6D6]/20 to-[#3BE38A]/20 border-2 border-[#2EE6D6]/50 flex items-center justify-center backdrop-blur-sm">
        {/* Neural Network Pattern */}
        <Brain className="w-16 h-16 text-[#2EE6D6]" />
        
        {/* Orbiting Nodes */}
        {[...Array(complexity)].map((_, i) => {
          const angle = (i / complexity) * 360;
          const delay = i * 0.2;
          
          return (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-[#3BE38A] rounded-full"
              style={{
                left: '50%',
                top: '50%',
              }}
              animate={{
                x: Math.cos((angle * Math.PI) / 180) * 50,
                y: Math.sin((angle * Math.PI) / 180) * 50,
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3,
                delay,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ icon, value, label, highlight = false }: {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  highlight?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`
        rounded-xl p-4 border
        ${highlight 
          ? 'bg-gradient-to-br from-[#2EE6D6]/10 to-[#3BE38A]/10 border-[#2EE6D6]/30' 
          : 'bg-[#181B22] border-white/5'
        }
      `}
    >
      <div className="flex items-start justify-between mb-2">
        {icon}
        {highlight && <Zap className="w-4 h-4 text-[#2EE6D6] animate-pulse" />}
      </div>
      <div className="text-2xl text-white mb-1">{value}</div>
      <div className="text-xs text-white/50">{label}</div>
    </motion.div>
  );
}

function AchievementCard({ achievement }: { achievement: typeof achievements[0] }) {
  return (
    <div
      className={`
        rounded-xl p-4 border transition-all
        ${achievement.unlocked
          ? 'bg-gradient-to-br from-[#2EE6D6]/10 to-[#3BE38A]/10 border-[#2EE6D6]/30'
          : 'bg-[#181B22]/50 border-white/5 opacity-50'
        }
      `}
    >
      <div className="text-3xl mb-2">{achievement.icon}</div>
      <div className={`text-sm mb-1 ${achievement.unlocked ? 'text-white' : 'text-white/50'}`}>
        {achievement.title}
      </div>
      <div className="text-xs text-white/40">
        {achievement.description}
      </div>
      
      {achievement.unlocked && (
        <div className="mt-2 text-[10px] text-[#3BE38A] flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-[#3BE38A] rounded-full" />
          Débloqué
        </div>
      )}
    </div>
  );
}
