/**
 * Etheria Chronicles - In-Game Chat Box HUD
 */

import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage, gameState } from '../../game/state/GameState';

export const ChatBox: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'system' | 'combat'>('all');
  const [inputText, setInputText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = gameState.subscribeChat((msgs) => {
      setMessages([...msgs]);
    });
    return unsub;
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const profile = gameState.getProfile();
    gameState.addChatMessage(profile.customization.name, inputText.trim(), 'all');
    setInputText('');
  };

  const filtered = messages.filter((m) => {
    if (activeTab === 'all') return true;
    return m.channel === activeTab;
  });

  return (
    <div className="w-80 bg-slate-900/90 border border-slate-700/80 rounded-lg shadow-xl backdrop-blur-xs flex flex-col pointer-events-auto transition-all">
      {/* Tab Bar */}
      <div className="flex items-center justify-between px-2 py-1 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-1">
          {(['all', 'system', 'combat'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2 py-0.5 rounded capitalize font-medium cursor-pointer transition-colors ${activeTab === tab ? 'bg-slate-700 text-amber-300' : 'text-slate-400 hover:text-slate-200'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="text-slate-400 hover:text-white px-1 text-xs cursor-pointer"
          title={isMinimized ? 'Expand Chat' : 'Minimize Chat'}
        >
          {isMinimized ? '▲' : '▼'}
        </button>
      </div>

      {!isMinimized && (
        <>
          {/* Messages Log */}
          <div className="h-32 overflow-y-auto p-2 text-xs font-mono space-y-1 select-text">
            {filtered.map((msg) => {
              let color = 'text-slate-200';
              if (msg.channel === 'system') color = 'text-amber-400';
              else if (msg.channel === 'combat') color = 'text-red-400';

              return (
                <div key={msg.id} className="leading-relaxed break-words">
                  <span className="text-slate-500 text-[10px] mr-1">[{msg.timestamp}]</span>
                  <span className="font-bold mr-1 text-slate-300">{msg.sender}:</span>
                  <span className={color}>{msg.text}</span>
                </div>
              );
            })}
            <div ref={logEndRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSend} className="p-1.5 border-t border-slate-800 flex items-center gap-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Press Enter to chat..."
              className="flex-1 bg-slate-950/80 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              maxLength={120}
            />
            <button
              type="submit"
              className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-2 py-1 rounded text-xs cursor-pointer"
            >
              Send
            </button>
          </form>
        </>
      )}
    </div>
  );
};
