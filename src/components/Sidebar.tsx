import React from 'react';
import { Calendar, Wallet, CheckSquare } from 'lucide-react';
import { ViewMode } from '../types';

interface SidebarProps {
  currentView: ViewMode;
  onChangeView: (view: ViewMode) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  const navItems = [
    { id: 'calendar', label: '캘린더', icon: Calendar },
    { id: 'account', label: '가계부', icon: Wallet },
    { id: 'todo', label: '할 일', icon: CheckSquare },
  ] as const;

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Life Manager</h1>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id as ViewMode)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-600 font-medium' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-indigo-600' : 'text-gray-400'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
