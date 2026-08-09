import React from 'react';
import { Smartphone, PenTool, Palette, Scissors, Rocket } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'preview', label: 'Preview', icon: Smartphone },
    { id: 'content', label: 'Edit', icon: PenTool },
    { id: 'theme', label: 'Theme', icon: Palette },
    { id: 'services', label: 'Services', icon: Scissors },
    { id: 'publish', label: 'Publish', icon: Rocket },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-[#0E0E0E] border-t border-white/[0.1] z-40 flex justify-around items-center py-2 lg:hidden pointer-events-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(isActive ? 'preview' : tab.id)}
            className={`flex-1 flex flex-col items-center gap-1 p-2 min-w-0 flex-shrink-0 ${isActive ? 'text-[#D4AF37]' : 'text-gray-500'}`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
