import { useState, useCallback, useRef } from 'react';
import {
  GrpIdxConverter,
  RESOURCE_TYPES,
  ResourceTypeId,
  saveTexturesToDB,
  hasResourceInDB,
  clearResourceDB,
} from '../game/data/ResourceConverter';

interface ConversionStatus {
  type: ResourceTypeId;
  status: 'idle' | 'converting' | 'done' | 'error';
  progress: number;
  total: number;
  error?: string;
}

export function ResourcePage() {
  const [statuses, setStatuses] = useState<Record<string, ConversionStatus>>(() => {
    const s: Record<string, ConversionStatus> = {};
    for (const rt of RESOURCE_TYPES) {
      s[rt.id] = { type: rt.id, status: 'idle', progress: 0, total: 0 };
    }
    return s;
  });
  const [loadedTypes, setLoadedTypes] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const converterRef = useRef(new GrpIdxConverter());

  const checkExisting = useCallback(async () => {
    const loaded = new Set<string>();
    for (const rt of RESOURCE_TYPES) {
      const has = await hasResourceInDB(rt.id);
      if (has) loaded.add(rt.id);
    }
    setLoadedTypes(loaded);
  }, []);

  useState(() => { checkExisting(); });

  const handleFileUpload = useCallback(async (files: FileList) => {
    const fileMap = new Map<string, File>();
    for (let i = 0; i < files.length; i++) {
      fileMap.set(files[i].name.toLowerCase(), files[i]);
    }

    for (const rt of RESOURCE_TYPES) {
      const idxFile = fileMap.get(rt.idxFile.toLowerCase());
      const grpFile = fileMap.get(rt.grpFile.toLowerCase());

      if (!idxFile || !grpFile) continue;

      setStatuses((prev) => ({
        ...prev,
        [rt.id]: { type: rt.id, status: 'converting', progress: 0, total: 0 },
      }));

      try {
        const idxBuffer = await idxFile.arrayBuffer();
        const grpBuffer = await grpFile.arrayBuffer();

        const textures = await converterRef.current.convertGrpIdx(
          idxBuffer,
          grpBuffer,
          rt.slash,
          (current, total) => {
            setStatuses((prev) => ({
              ...prev,
              [rt.id]: { type: rt.id, status: 'converting', progress: current, total },
            }));
          }
        );

        await saveTexturesToDB(rt.id, textures);

        setStatuses((prev) => ({
          ...prev,
          [rt.id]: { type: rt.id, status: 'done', progress: textures.size, total: textures.size },
        }));
        setLoadedTypes((prev) => new Set(prev).add(rt.id));
      } catch (e: any) {
        setStatuses((prev) => ({
          ...prev,
          [rt.id]: { type: rt.id, status: 'error', progress: 0, total: 0, error: e.message },
        }));
      }
    }
  }, []);

  const handleClear = useCallback(async () => {
    await clearResourceDB();
    setLoadedTypes(new Set());
    setStatuses(() => {
      const s: Record<string, ConversionStatus> = {};
      for (const rt of RESOURCE_TYPES) {
        s[rt.id] = { type: rt.id, status: 'idle', progress: 0, total: 0 };
      }
      return s;
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [handleFileUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files);
    }
  }, [handleFileUpload]);

  return (
    <div className="min-h-screen bg-[#1a0a00] text-[#C8A050] p-8 font-serif">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">游戏资源管理</h1>
        <p className="text-[#8B7A5A] text-center mb-8 text-sm">
          上传 DOS 版金庸群侠传的 GRP/IDX 资源文件，自动转换为 Web 可用格式
        </p>

        <div
          className="border-2 border-dashed border-[#8B6914] rounded-xl p-12 text-center mb-8 cursor-pointer hover:border-[#C8A050] transition-colors"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-5xl mb-4">📁</div>
          <p className="text-xl mb-2">拖拽 GRP/IDX 文件到此处</p>
          <p className="text-sm text-[#8B7A5A]">
            或点击选择文件（支持同时选择多个 .idx 和 .grp 文件）
          </p>
          <p className="text-xs text-[#6B5A3A] mt-4">
            需要的文件：smap.idx/smap.grp, mmap.idx/mmap.grp, fight.idx/fight.grp, head.idx/head.grp 等
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            accept=".idx,.grp"
            onChange={handleFileInput}
          />
        </div>

        <div className="space-y-3 mb-8">
          {RESOURCE_TYPES.map((rt) => {
            const status = statuses[rt.id];
            const isLoaded = loadedTypes.has(rt.id);
            return (
              <div
                key={rt.id}
                className={`flex items-center gap-4 p-4 rounded-lg border ${
                  isLoaded ? 'border-[#4a7a3a] bg-[#0a1a0a]' :
                  status.status === 'converting' ? 'border-[#8B6914] bg-[#1a1500]' :
                  status.status === 'error' ? 'border-[#8B3a3a] bg-[#1a0a0a]' :
                  'border-[#3a2a1a] bg-[#0d0500]'
                }`}
              >
                <div className="w-8 text-center">
                  {isLoaded ? '✅' : status.status === 'converting' ? '⏳' : status.status === 'error' ? '❌' : '⬜'}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold">{rt.label}</span>
                    <span className="text-xs text-[#8B7A5A]">
                      {rt.idxFile} + {rt.grpFile}
                    </span>
                  </div>
                  {status.status === 'converting' && (
                    <div className="w-full h-2 bg-[#2a1a0a] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#8B6914] rounded-full transition-all"
                        style={{ width: `${status.total > 0 ? (status.progress / status.total * 100) : 0}%` }}
                      />
                    </div>
                  )}
                  {status.status === 'done' && (
                    <span className="text-xs text-[#4a7a3a]">已转换 {status.total} 张贴图</span>
                  )}
                  {status.status === 'error' && (
                    <span className="text-xs text-[#8B3a3a]">错误: {status.error}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={handleClear}
            className="px-6 py-2 bg-[#3a1a0a] border border-[#8B3a3a] text-[#cc6666] rounded-lg hover:bg-[#4a2a1a] transition-colors"
          >
            清除所有资源
          </button>
          <a
            href="/"
            className="px-6 py-2 bg-[#1a1500] border border-[#8B6914] text-[#C8A050] rounded-lg hover:bg-[#2a2500] transition-colors inline-block"
          >
            返回游戏
          </a>
        </div>
      </div>
    </div>
  );
}
