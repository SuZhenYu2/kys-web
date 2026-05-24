import { GameCanvas } from '../components/GameCanvas';
import { LoadingScreen } from '../components/LoadingScreen';
import { useGameStore } from '../game/data/GameState';

export function GamePage() {
  const error = useGameStore((s) => s.error);

  return (
    <div className="w-screen h-screen overflow-hidden bg-black relative">
      <GameCanvas />
      <LoadingScreen />
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-900/90 text-red-200 px-6 py-3 rounded-lg font-serif">
          {error}
        </div>
      )}
    </div>
  );
}