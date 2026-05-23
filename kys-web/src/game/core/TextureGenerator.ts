import { Engine } from './Engine';

const generatedTextures_ = new Map<string, ImageBitmap>();

function createCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  return [c, ctx];
}

async function canvasToBitmap(canvas: HTMLCanvasElement): Promise<ImageBitmap> {
  return createImageBitmap(canvas);
}

export async function generateEarthTextures(count: number = 500): Promise<void> {
  for (let i = 1; i <= count; i++) {
    const key = `earth_${i}`;
    if (generatedTextures_.has(key)) continue;

    const [c, ctx] = createCanvas(36, 36);
    const hue = (i * 37) % 360;
    const sat = 20 + (i * 7) % 30;
    const lit = 15 + (i * 13) % 20;

    ctx.fillStyle = `hsl(${hue}, ${sat}%, ${lit}%)`;
    ctx.beginPath();
    ctx.moveTo(18, 0);
    ctx.lineTo(36, 18);
    ctx.lineTo(18, 36);
    ctx.lineTo(0, 18);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = `hsl(${hue}, ${sat - 5}%, ${lit + 8}%)`;
    ctx.lineWidth = 0.5;
    ctx.stroke();

    const variation = i % 5;
    if (variation === 0) {
      ctx.fillStyle = `hsl(${(hue + 30) % 360}, ${sat}%, ${lit + 5}%)`;
      ctx.fillRect(12, 12, 12, 12);
    } else if (variation === 1) {
      ctx.fillStyle = `hsl(${(hue + 60) % 360}, ${sat - 10}%, ${lit + 3}%)`;
      ctx.beginPath();
      ctx.arc(18, 18, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (variation === 2) {
      ctx.fillStyle = `hsla(${(hue + 120) % 360}, ${sat}%, ${lit + 10}%, 0.3)`;
      ctx.fillRect(8, 8, 20, 20);
    }

    const bitmap = await canvasToBitmap(c);
    generatedTextures_.set(key, bitmap);
  }
}

export async function generateBuildingTextures(count: number = 500): Promise<void> {
  for (let i = 1; i <= count; i++) {
    const key = `building_${i}`;
    if (generatedTextures_.has(key)) continue;

    const [c, ctx] = createCanvas(36, 72);
    const hue = (i * 23 + 15) % 360;
    const sat = 15 + (i * 11) % 25;
    const lit = 20 + (i * 7) % 25;

    ctx.fillStyle = `hsl(${hue}, ${sat}%, ${lit}%)`;
    ctx.fillRect(4, 20, 28, 48);

    ctx.fillStyle = `hsl(${hue}, ${sat}%, ${lit + 10}%)`;
    ctx.fillRect(2, 18, 32, 6);

    ctx.fillStyle = `hsl(${(hue + 40) % 360}, ${sat + 10}%, ${lit + 15}%)`;
    ctx.fillRect(12, 36, 12, 16);

    ctx.fillStyle = `hsl(${(hue + 180) % 360}, ${sat}%, ${lit + 20}%)`;
    ctx.fillRect(14, 38, 8, 12);

    ctx.strokeStyle = `hsl(${hue}, ${sat - 5}%, ${lit - 5}%)`;
    ctx.lineWidth = 1;
    ctx.strokeRect(4, 20, 28, 48);

    const bitmap = await canvasToBitmap(c);
    generatedTextures_.set(key, bitmap);
  }
}

export async function generatePersonTextures(count: number = 256): Promise<void> {
  const directions = ['右后', '右前', '左后', '左前'];
  const poses = ['站', '走1', '走2', '走3'];

  for (let i = 0; i < count; i++) {
    const key = `person_${i}`;
    if (generatedTextures_.has(key)) continue;

    const [c, ctx] = createCanvas(48, 64);
    const dirIdx = Math.floor(i / 4) % 4;
    const poseIdx = i % 4;
    const hue = (i * 47) % 360;

    const bodyColor = `hsl(${hue}, 50%, 40%)`;
    const headColor = `hsl(30, 40%, 70%)`;
    const outlineColor = `hsl(${hue}, 40%, 25%)`;

    const bodyX = 24;
    const bodyY = 32;
    const legOffset = poseIdx === 1 ? -3 : poseIdx === 3 ? 3 : 0;

    ctx.fillStyle = headColor;
    ctx.beginPath();
    ctx.arc(bodyX, bodyY - 16, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = bodyColor;
    ctx.fillRect(bodyX - 8, bodyY - 8, 16, 20);
    ctx.strokeStyle = outlineColor;
    ctx.strokeRect(bodyX - 8, bodyY - 8, 16, 20);

    ctx.fillStyle = bodyColor;
    ctx.fillRect(bodyX - 7 + legOffset, bodyY + 12, 6, 14);
    ctx.fillRect(bodyX + 1 - legOffset, bodyY + 12, 6, 14);

    if (dirIdx === 0 || dirIdx === 2) {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(bodyX - 3, bodyY - 17, 2, 0, Math.PI * 2);
      ctx.arc(bodyX + 3, bodyY - 17, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(bodyX - 3, bodyY - 17, 1, 0, Math.PI * 2);
      ctx.arc(bodyX + 3, bodyY - 17, 1, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(bodyX, bodyY - 17, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(bodyX, bodyY - 17, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    const bitmap = await canvasToBitmap(c);
    generatedTextures_.set(key, bitmap);
  }
}

export async function generateEffectTextures(count: number = 100): Promise<void> {
  for (let i = 1; i <= count; i++) {
    const key = `effect_${i}`;
    if (generatedTextures_.has(key)) continue;

    const [c, ctx] = createCanvas(64, 64);
    const hue = (i * 61) % 360;
    const frame = i % 8;

    ctx.fillStyle = 'transparent';
    ctx.clearRect(0, 0, 64, 64);

    const radius = 8 + frame * 3;
    const alpha = 1 - frame * 0.1;
    ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${alpha})`;
    ctx.beginPath();
    ctx.arc(32, 32, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `hsla(${(hue + 60) % 360}, 90%, 80%, ${alpha * 0.6})`;
    ctx.beginPath();
    ctx.arc(32, 32, radius * 0.5, 0, Math.PI * 2);
    ctx.fill();

    const bitmap = await canvasToBitmap(c);
    generatedTextures_.set(key, bitmap);
  }
}

export async function generateTitleBackground(): Promise<void> {
  const key = 'title_bg';
  if (generatedTextures_.has(key)) return;

  const [c, ctx] = createCanvas(1024, 640);

  const grad = ctx.createLinearGradient(0, 0, 0, 640);
  grad.addColorStop(0, '#1a0a00');
  grad.addColorStop(0.3, '#2a1508');
  grad.addColorStop(0.5, '#1a0a00');
  grad.addColorStop(0.7, '#0d0500');
  grad.addColorStop(1, '#0a0300');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 640);

  for (let i = 0; i < 200; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 640;
    const r = 0.5 + Math.random() * 1.5;
    const alpha = 0.1 + Math.random() * 0.4;
    ctx.fillStyle = `rgba(200, 160, 80, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 5; i++) {
    const x = 100 + Math.random() * 824;
    const y = 200 + Math.random() * 300;
    const grad2 = ctx.createRadialGradient(x, y, 0, x, y, 60 + Math.random() * 40);
    grad2.addColorStop(0, 'rgba(100, 60, 20, 0.15)');
    grad2.addColorStop(1, 'rgba(100, 60, 20, 0)');
    ctx.fillStyle = grad2;
    ctx.fillRect(x - 100, y - 100, 200, 200);
  }

  const bitmap = await canvasToBitmap(c);
  generatedTextures_.set(key, bitmap);
}

export async function generateAllPlaceholderTextures(): Promise<void> {
  await generateTitleBackground();
  await generateEarthTextures(500);
  await generateBuildingTextures(500);
  await generatePersonTextures(256);
  await generateEffectTextures(100);
}

export function getGeneratedTexture(key: string): ImageBitmap | undefined {
  return generatedTextures_.get(key);
}

export function hasGeneratedTexture(key: string): boolean {
  return generatedTextures_.has(key);
}
