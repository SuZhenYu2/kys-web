export class Audio {
  private static instance: Audio;
  private audioCtx_: AudioContext | null = null;
  private bgmGain_: GainNode | null = null;
  private seGain_: GainNode | null = null;
  private bgmVolume_: number = 0.7;
  private seVolume_: number = 1.0;
  private currentBGM_: AudioBufferSourceNode | null = null;
  private audioBuffers_: Map<string, AudioBuffer> = new Map();
  private bgmPath_: string = '';
  private assetBasePath_: string = '/assets/';

  private constructor() {}

  static getInstance(): Audio {
    if (!Audio.instance) {
      Audio.instance = new Audio();
    }
    return Audio.instance;
  }

  setAssetBasePath(path: string): void {
    this.assetBasePath_ = path;
  }

  init(): void {
    this.audioCtx_ = new AudioContext();
    this.bgmGain_ = this.audioCtx_.createGain();
    this.bgmGain_.gain.value = this.bgmVolume_;
    this.bgmGain_.connect(this.audioCtx_.destination);

    this.seGain_ = this.audioCtx_.createGain();
    this.seGain_.gain.value = this.seVolume_;
    this.seGain_.connect(this.audioCtx_.destination);
  }

  async loadSound(name: string, url: string): Promise<void> {
    if (!this.audioCtx_) return;
    const response = await fetch(this.assetBasePath_ + url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioCtx_.decodeAudioData(arrayBuffer);
    this.audioBuffers_.set(name, audioBuffer);
  }

  setBGMVolume(volume: number): void {
    this.bgmVolume_ = Math.max(0, Math.min(1, volume));
    if (this.bgmGain_) {
      this.bgmGain_.gain.value = this.bgmVolume_;
    }
  }

  getBGMVolume(): number {
    return this.bgmVolume_;
  }

  setSEVolume(volume: number): void {
    this.seVolume_ = Math.max(0, Math.min(1, volume));
    if (this.seGain_) {
      this.seGain_.gain.value = this.seVolume_;
    }
  }

  getSEVolume(): number {
    return this.seVolume_;
  }

  async playBGM(name: string): Promise<void> {
    if (!this.audioCtx_ || !this.bgmGain_) return;
    this.stopBGM();

    let buffer = this.audioBuffers_.get(name);
    if (!buffer) {
      await this.loadSound(name, `audio/${name}`);
      buffer = this.audioBuffers_.get(name);
    }
    if (!buffer) return;

    const source = this.audioCtx_.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(this.bgmGain_);
    source.start();
    this.currentBGM_ = source;
    this.bgmPath_ = name;
  }

  stopBGM(): void {
    if (this.currentBGM_) {
      try {
        this.currentBGM_.stop();
      } catch {}
      this.currentBGM_ = null;
    }
  }

  async playSE(name: string): Promise<void> {
    if (!this.audioCtx_ || !this.seGain_) return;

    let buffer = this.audioBuffers_.get(name);
    if (!buffer) {
      await this.loadSound(name, `audio/${name}`);
      buffer = this.audioBuffers_.get(name);
    }
    if (!buffer) return;

    const source = this.audioCtx_.createBufferSource();
    source.buffer = buffer;
    source.connect(this.seGain_);
    source.start();
  }

  resume(): void {
    if (this.audioCtx_ && this.audioCtx_.state === 'suspended') {
      this.audioCtx_.resume();
    }
  }

  destroy(): void {
    this.stopBGM();
    if (this.audioCtx_) {
      this.audioCtx_.close();
      this.audioCtx_ = null;
    }
  }
}