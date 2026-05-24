import { useGameStore } from '../game/data/GameState';

export function LoadingScreen() {
  const { loadProgress, isLoading } = useGameStore();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#1a0a00]">
      <div className="text-center">
        <h1 className="text-3xl font-serif text-[#C8A050] mb-8 tracking-widest">
          金庸群侠传
        </h1>
        <div className="w-64 h-2 bg-[#3a2010] rounded-full overflow-hidden mx-auto mb-4">
          <div
            className="h-full bg-gradient-to-r from-[#8B6914] to-[#C8A050] rounded-full transition-all duration-300"
            style={{ width: `${Math.round(loadProgress * 100)}%` }}
          />
        </div>
        <p className="text-[#8B7A5A] text-sm font-serif">
          {loadProgress < 1 ? '加载中...' : '准备就绪'}
        </p>
      </div>
    </div>
  );
}