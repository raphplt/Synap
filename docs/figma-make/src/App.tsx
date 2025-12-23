import { useState } from 'react';
import { SmartFeed } from './components/smart-feed';
import { Atlas } from './components/atlas';
import { BrainProfile } from './components/brain-profile';
import { Home, Map, User, Zap } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'feed' | 'atlas' | 'profile'>('feed');

  return (
    <div className="h-screen w-full bg-[#0F1115] text-white overflow-hidden flex flex-col">
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'feed' && <SmartFeed />}
        {activeTab === 'atlas' && <Atlas />}
        {activeTab === 'profile' && <BrainProfile />}
      </div>

      {/* Bottom Navigation */}
      <nav className="bg-[#181B22] border-t border-white/5 px-6 py-3 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === 'feed' ? 'text-[#2EE6D6]' : 'text-white/50'
          }`}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs">Feed</span>
        </button>
        
        <button
          onClick={() => setActiveTab('atlas')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === 'atlas' ? 'text-[#2EE6D6]' : 'text-white/50'
          }`}
        >
          <Map className="w-6 h-6" />
          <span className="text-xs">Atlas</span>
        </button>
        
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === 'profile' ? 'text-[#2EE6D6]' : 'text-white/50'
          }`}
        >
          <User className="w-6 h-6" />
          <span className="text-xs">Profil</span>
        </button>
      </nav>
    </div>
  );
}
