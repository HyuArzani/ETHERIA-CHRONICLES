/**
 * Etheria Chronicles - Title Screen & Character Creator
 * Complies with Game Craft guidelines: full-viewport shell, inline bespoke SVG title lockup,
 * atmospheric hero artwork, primary Start CTA, and flat control-hint line.
 */

import React, { useEffect, useState } from 'react';
import { soundEffects } from '../game/audio/SoundEffects';
import { gameState } from '../game/state/GameState';

interface TitleScreenProps {
  onStartGame: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStartGame }) => {
  const [characterName, setCharacterName] = useState('Aerith');
  const [gender, setGender] = useState<'female' | 'male'>('female');
  const [hairColor, setHairColor] = useState('#d97706');
  const [outfitColor, setOutfitColor] = useState('#2563eb');
  const [showCreator, setShowCreator] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || (e.key === ' ' && !showCreator)) {
        handleEnterWorld();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [characterName, gender, hairColor, outfitColor, showCreator]);

  const handleEnterWorld = () => {
    const profile = gameState.getProfile();
    profile.customization.name = characterName.trim() || 'Adventurer';
    profile.customization.gender = gender;
    profile.customization.hairColor = hairColor;
    profile.customization.outfitColor = outfitColor;
    gameState.save();

    soundEffects.playLevelUp();
    onStartGame();
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col justify-between items-center bg-slate-950 select-none text-white">
      {/* Background Pixel Art Artwork */}
      <img
        src="/src/assets/images/etheria_title_hero_1792759427460.jpg"
        alt="Etheria Chronicles Dawnshire Landscape"
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover pixelated opacity-90 scale-105 transition-transform duration-10000 ease-out hover:scale-110"
      />

      {/* Atmospheric Vignette & Contrast Scrims */}
      <div className="absolute inset-0 bg-radial from-transparent via-slate-950/40 to-slate-950/80 pointer-events-none" />
      <div className="absolute inset-0 bg-linear-to-b from-slate-950/70 via-transparent to-slate-950/90 pointer-events-none" />

      {/* Top Bar / Negative Space with Bespoke SVG Title Lockup */}
      <div className="relative z-10 pt-12 flex flex-col items-center">
        {/* Bespoke Inline SVG Title Lockup */}
        <div className="relative group cursor-default">
          <svg
            className="w-80 md:w-112 h-20 md:h-24 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
            viewBox="0 0 440 90"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Subtle glow filter definition */}
            <defs>
              <linearGradient id="titleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="40%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
              <linearGradient id="subGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#e0f2fe" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>

            {/* Main Wordmark */}
            <text
              x="220"
              y="50"
              textAnchor="middle"
              className="font-fantasy font-black tracking-widest text-4xl"
              fill="url(#titleGrad)"
              stroke="#451a03"
              strokeWidth="2.5"
            >
              ETHERIA
            </text>

            {/* Subtitle Lockup */}
            <text
              x="220"
              y="74"
              textAnchor="middle"
              className="font-fantasy font-bold tracking-[0.3em] text-xs uppercase"
              fill="url(#subGrad)"
            >
              CHRONICLES
            </text>

            {/* Decorative Wings */}
            <path
              d="M 50 48 Q 110 46 130 52 M 390 48 Q 330 46 310 52"
              stroke="#fbbf24"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.8"
            />
          </svg>
        </div>

        <p className="text-xs md:text-sm text-amber-200/90 font-medium tracking-wide drop-shadow mt-1">
          A Nostalgic 2D Browser MMORPG Vertical Slice
        </p>
      </div>

      {/* Center Interactive Hero Area */}
      <div className="relative z-10 flex flex-col items-center max-w-md w-full px-4">
        {!showCreator ? (
          <div className="flex flex-col items-center gap-4 w-full">
            {/* Primary Start CTA */}
            <button
              onClick={handleEnterWorld}
              className="w-full max-w-xs py-3.5 px-8 bg-linear-to-b from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 active:scale-98 text-slate-950 font-black font-fantasy text-lg rounded-xl shadow-[0_0_24px_rgba(245,158,11,0.5)] border-2 border-amber-300 cursor-pointer transition-all uppercase tracking-wider flex items-center justify-center gap-2 group"
            >
              <span>Enter Etheria</span>
              <span className="text-xl group-hover:translate-x-1 transition-transform">⚔️</span>
            </button>

            {/* Customize Character Toggle */}
            <button
              onClick={() => setShowCreator(true)}
              className="text-xs text-amber-200/90 hover:text-white underline underline-offset-4 cursor-pointer transition-colors"
            >
              Customize Character ({characterName})
            </button>
          </div>
        ) : (
          /* Character Creator Panel */
          <div className="w-full bg-slate-900/90 border border-slate-700 p-4 rounded-xl shadow-2xl backdrop-blur-md space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-sm text-slate-100 font-fantasy">Character Creation</span>
              <button
                onClick={() => setShowCreator(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                Back
              </button>
            </div>

            {/* Name Input */}
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">Adventurer Name</label>
              <input
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                maxLength={16}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-semibold"
              />
            </div>

            {/* Gender / Sprite Style */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`flex-1 py-1.5 rounded text-xs font-semibold cursor-pointer border ${gender === 'female' ? 'bg-amber-600/30 border-amber-400 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
              >
                Female Adventurer
              </button>
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`flex-1 py-1.5 rounded text-xs font-semibold cursor-pointer border ${gender === 'male' ? 'bg-amber-600/30 border-amber-400 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
              >
                Male Adventurer
              </button>
            </div>

            {/* Hair Color Selection */}
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">Hair Tint</label>
              <div className="flex items-center gap-2">
                {[
                  { label: 'Blond', color: '#d97706' },
                  { label: 'Brunette', color: '#78350f' },
                  { label: 'Crimson', color: '#dc2626' },
                  { label: 'Azure', color: '#2563eb' },
                  { label: 'Emerald', color: '#16a34a' },
                  { label: 'Silver', color: '#e2e8f0' },
                ].map((c) => (
                  <button
                    key={c.label}
                    type="button"
                    onClick={() => setHairColor(c.color)}
                    style={{ backgroundColor: c.color }}
                    title={c.label}
                    className={`w-6 h-6 rounded-full border-2 cursor-pointer transition-transform ${hairColor === c.color ? 'scale-125 border-white shadow' : 'border-slate-800 opacity-70 hover:opacity-100'}`}
                  />
                ))}
              </div>
            </div>

            {/* Enter World Button */}
            <button
              onClick={handleEnterWorld}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg cursor-pointer transition-colors uppercase tracking-wider mt-2"
            >
              Save & Enter Game
            </button>
          </div>
        )}
      </div>

      {/* Flat Control Hint Line (as mandated by game craft guidelines) */}
      <div className="relative z-10 pb-6 text-center">
        <p className="text-xs md:text-sm text-slate-300/80 font-mono tracking-wider drop-shadow">
          WASD Move · Space Action · F Interact & Loot · C Status · I Bag · Esc Close
        </p>
      </div>
    </div>
  );
};
