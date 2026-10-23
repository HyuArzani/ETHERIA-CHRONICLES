/**
 * Etheria Chronicles - Phaser Game Canvas Component
 * Encapsulates the 60fps Phaser 3 canvas cleanly decoupled from React state
 */

import Phaser from 'phaser';
import React, { useEffect, useRef } from 'react';
import { WorldScene } from '../scenes/WorldScene';
import { ActiveMonster, MonsterTemplate } from '../types';

interface PhaserGameProps {
  onNpcInteract: (npcId: string) => void;
  onTargetChange: (monster: ActiveMonster | null, template: MonsterTemplate | null) => void;
}

export const PhaserGame: React.FC<PhaserGameProps> = ({ onNpcInteract, onTargetChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<WorldScene | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: '100%',
      height: '100%',
      pixelArt: true,
      roundPixels: true,
      backgroundColor: '#0d1117',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [WorldScene],
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    game.events.once('ready', () => {
      const scene = game.scene.getScene('WorldScene') as WorldScene;
      sceneRef.current = scene;
      if (scene) {
        scene.onNpcInteract = onNpcInteract;
        scene.onTargetChange = onTargetChange;
        (window as unknown as { __phaserWorldScene: WorldScene }).__phaserWorldScene = scene;
      }
    });

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
        sceneRef.current = null;
      }
    };
  }, []);

  // Update scene callback references if props change
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.onNpcInteract = onNpcInteract;
      sceneRef.current.onTargetChange = onTargetChange;
    }
  }, [onNpcInteract, onTargetChange]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden select-none bg-slate-950"
      style={{ touchAction: 'none' }}
    />
  );
};
