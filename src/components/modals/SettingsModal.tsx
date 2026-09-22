import React, { useState } from 'react';
import { X, Volume2, VolumeX, Palette, User, Download, Check } from 'lucide-react';
import { GameTheme } from '../../types/mahjong';
import { savePlayerProfile, saveTheme, saveSound } from '../../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  theme: GameTheme;
  soundEnabled: boolean;
  playerProfile: { name: string; avatar: string; color: string };
  pwaInstallable: boolean;
  onInstallPwa: () => void;
  onThemeChange: (theme: GameTheme) => void;
  onSoundToggle: () => void;
  onProfileChange: (profile: { name: string; avatar: string; color: string }) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  theme,
  soundEnabled,
  playerProfile,
  pwaInstallable,
  onInstallPwa,
  onThemeChange,
  onSoundToggle,
  onProfileChange,
  onClose
}) => {
  const [name, setName] = useState(playerProfile.name);
  const [avatar, setAvatar] = useState(playerProfile.avatar);
  const [color, setColor] = useState(playerProfile.color);

  if (!isOpen) return null;

  const AVATARS = ['🀄', '🀐', '🀅', '🎋', '🎯', '🐉', '🌸', '👑', '⭐', '🐯'];
  const COLORS = ['#2D6A4F', '#1B4332', '#B91C1C', '#1D4ED8', '#D99B26', '#8B5CF6', '#3D2817'];

  const handleSaveProfile = () => {
    const updated = { name: name.trim() || playerProfile.name, avatar, color };
    savePlayerProfile(updated);
    onProfileChange(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E1D5] shadow-2xl transform animate-scale-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
          <h2 className="text-2xl font-black text-vita-wood tracking-tight">Settings & Profile</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Theme Selection */}
        <div className="mb-6">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-3">
            <Palette className="w-4 h-4 text-emerald-600" />
            <span>Table Theme</span>
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { id: 'ivory', name: 'Warm Ivory', bg: 'bg-[#FAF7F2]', border: 'border-[#E5DEC9]' },
              { id: 'sage', name: 'Gentle Sage', bg: 'bg-[#E8ECE9]', border: 'border-[#CBD5CD]' },
              { id: 'wood', name: 'Mahogany Wood', bg: 'bg-[#3D2817] text-white', border: 'border-[#5C3E28]' },
              { id: 'dark', name: 'Charcoal Dark', bg: 'bg-[#1F2421] text-white', border: 'border-[#333C37]' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => {
                  onThemeChange(t.id as GameTheme);
                  saveTheme(t.id as GameTheme);
                }}
                className={`
                  p-3 rounded-2xl border-2 flex items-center justify-between text-xs font-bold transition-all
                  ${t.bg} ${t.border}
                  ${theme === t.id ? 'ring-2 ring-emerald-500 shadow-md' : 'opacity-80 hover:opacity-100'}
                `}
              >
                <span>{t.name}</span>
                {theme === t.id && <Check className="w-4 h-4 text-emerald-600" />}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Audio Toggle */}
        <div className="mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl text-white ${soundEnabled ? 'bg-emerald-600' : 'bg-gray-400'}`}>
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-sm font-bold text-vita-wood">Sound Effects</div>
              <div className="text-xs text-gray-400">Tile taps, match chimes & fanfare</div>
            </div>
          </div>

          <button
            onClick={() => {
              onSoundToggle();
              saveSound(!soundEnabled);
            }}
            className={`
              w-12 h-6 rounded-full transition-colors relative p-0.5
              ${soundEnabled ? 'bg-emerald-600' : 'bg-gray-300'}
            `}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${soundEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* 3. Player Profile Customization */}
        <div className="mb-6">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-3">
            <User className="w-4 h-4 text-emerald-600" />
            <span>Player Profile</span>
          </label>

          {/* Name input */}
          <input
            type="text"
            maxLength={15}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleSaveProfile}
            placeholder="Enter your name..."
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold mb-3"
          />

          {/* Avatar choice */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-3">
            {AVATARS.map(av => (
              <button
                key={av}
                onClick={() => {
                  setAvatar(av);
                  const updated = { name, avatar: av, color };
                  savePlayerProfile(updated);
                  onProfileChange(updated);
                }}
                className={`
                  w-10 h-10 rounded-xl text-lg flex items-center justify-center border transition-all shrink-0
                  ${avatar === av ? 'bg-amber-100 border-amber-400 scale-110 shadow-xs' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}
                `}
              >
                {av}
              </button>
            ))}
          </div>

          {/* Color choice */}
          <div className="flex items-center gap-2">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => {
                  setColor(c);
                  const updated = { name, avatar, color: c };
                  savePlayerProfile(updated);
                  onProfileChange(updated);
                }}
                style={{ backgroundColor: c }}
                className={`
                  w-8 h-8 rounded-full transition-transform
                  ${color === c ? 'ring-4 ring-offset-2 ring-emerald-500 scale-110 shadow-sm' : 'hover:scale-105'}
                `}
              />
            ))}
          </div>
        </div>

        {/* 4. Install PWA Button */}
        {pwaInstallable && (
          <button
            onClick={onInstallPwa}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 mb-3"
          >
            <Download className="w-5 h-5" />
            <span>Install App on Home Screen (PWA)</span>
          </button>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-vita-wood hover:bg-vita-woodDark text-white font-bold text-sm shadow transition-all active:scale-98"
        >
          Close & Return to Game
        </button>
      </div>
    </div>
  );
};
