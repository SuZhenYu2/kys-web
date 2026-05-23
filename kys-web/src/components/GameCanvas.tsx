import { useEffect, useRef, useCallback } from 'react';
import { Game } from '../game/core/Game';

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const game = new Game();
    gameRef.current = game;

    const parent = containerRef.current;
    const initW = parent ? parent.clientWidth : 1280;
    const initH = parent ? parent.clientHeight : 720;

    canvas.width = initW;
    canvas.height = initH;

    game.init(canvas);
    game.start();

    return () => {
      game.destroy();
      gameRef.current = null;
    };
  }, []);

  const handleResize = useCallback(() => {
    const game = gameRef.current;
    const parent = containerRef.current;
    if (!game || !parent) return;
    game.resize(parent.clientWidth, parent.clientHeight);
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  return (
    <div ref={containerRef} className="w-full h-full absolute inset-0 bg-black">
      <canvas
        ref={canvasRef}
        className="block w-full h-full cursor-default"
        tabIndex={0}
      />
    </div>
  );
}