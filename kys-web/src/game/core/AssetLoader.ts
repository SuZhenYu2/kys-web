export class AssetLoader {
  private loadedCount_: number = 0;
  private totalCount_: number = 0;
  private onProgress_: ((loaded: number, total: number) => void) | null = null;
  private onComplete_: (() => void) | null = null;

  onProgress(callback: (loaded: number, total: number) => void): void {
    this.onProgress_ = callback;
  }

  onComplete(callback: () => void): void {
    this.onComplete_ = callback;
  }

  get progress(): number {
    return this.totalCount_ > 0 ? this.loadedCount_ / this.totalCount_ : 0;
  }

  private updateProgress(): void {
    this.loadedCount_++;
    if (this.onProgress_) {
      this.onProgress_(this.loadedCount_, this.totalCount_);
    }
    if (this.loadedCount_ >= this.totalCount_ && this.onComplete_) {
      this.onComplete_();
    }
  }

  async loadImages(
    paths: string[],
    loadFn: (path: string) => Promise<unknown>
  ): Promise<void> {
    this.totalCount_ += paths.length;
    const promises = paths.map(async (path) => {
      try {
        await loadFn(path);
      } catch (e) {
        console.warn(`Failed to load: ${path}`, e);
      }
      this.updateProgress();
    });
    await Promise.all(promises);
  }

  async loadAll(manifest: {
    images?: string[];
    audio?: string[];
    data?: string[];
  }): Promise<Record<string, unknown>> {
    const loaded: Record<string, unknown> = {};
    let total = 0;

    if (manifest.images) total += manifest.images.length;
    if (manifest.audio) total += manifest.audio.length;
    if (manifest.data) total += manifest.data.length;

    this.totalCount_ = total;
    this.loadedCount_ = 0;

    if (manifest.images && manifest.images.length > 0) {
      const imagePromises = manifest.images.map(async (path) => {
        try {
          const response = await fetch(path);
          const blob = await response.blob();
          const bitmap = await createImageBitmap(blob);
          loaded[path] = bitmap;
        } catch (e) {
          console.warn(`Failed to load image: ${path}`, e);
        }
        this.updateProgress();
      });
      await Promise.all(imagePromises);
    }

    if (manifest.audio && manifest.audio.length > 0) {
      const audioCtx = new AudioContext();
      const audioPromises = manifest.audio.map(async (path) => {
        try {
          const response = await fetch(path);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
          loaded[path] = audioBuffer;
        } catch (e) {
          console.warn(`Failed to load audio: ${path}`, e);
        }
        this.updateProgress();
      });
      await Promise.all(audioPromises);
    }

    if (manifest.data && manifest.data.length > 0) {
      const dataPromises = manifest.data.map(async (path) => {
        try {
          const response = await fetch(path);
          const json = await response.json();
          loaded[path] = json;
        } catch (e) {
          console.warn(`Failed to load data: ${path}`, e);
        }
        this.updateProgress();
      });
      await Promise.all(dataPromises);
    }

    return loaded;
  }
}