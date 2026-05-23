const generatedTextures_ = new Map<string, ImageBitmap>();

function cc(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  return [c, ctx];
}

async function toBitmap(canvas: HTMLCanvasElement): Promise<ImageBitmap> {
  return createImageBitmap(canvas);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function drawDiamond(ctx: CanvasRenderingContext2D, cx: number, cy: number, tw: number, th: number) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - th);
  ctx.lineTo(cx + tw, cy);
  ctx.lineTo(cx, cy + th);
  ctx.lineTo(cx - tw, cy);
  ctx.closePath();
}

export async function generateEarthTextures(): Promise<void> {
  const TW = 36, TH = 18;

  // 0: empty
  // 1-3: grass variants
  for (let v = 1; v <= 3; v++) {
    const [c, ctx] = cc(TW * 2, TH * 2);
    const rng = seededRandom(v * 100);
    const baseG = 60 + v * 15;
    drawDiamond(ctx, TW, TH, TW, TH);
    ctx.fillStyle = `rgb(${30 + v * 5}, ${baseG}, ${20 + v * 3})`;
    ctx.fill();
    for (let i = 0; i < 12; i++) {
      const px = TW * 0.3 + rng() * TW * 1.4;
      const py = TH * 0.3 + rng() * TH * 1.4;
      ctx.fillStyle = `rgb(${25 + v * 5}, ${baseG + 10 + Math.floor(rng() * 20)}, ${15 + v * 3})`;
      ctx.fillRect(px, py, 2, 3);
    }
    for (let i = 0; i < 6; i++) {
      const px = TW * 0.4 + rng() * TW * 1.2;
      const py = TH * 0.4 + rng() * TH * 1.2;
      ctx.strokeStyle = `rgb(${20 + v * 5}, ${baseG + 25}, ${10 + v * 3})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px - 1, py - 4);
      ctx.stroke();
    }
    ctx.strokeStyle = `rgba(0, 40, 0, 0.3)`;
    ctx.lineWidth = 0.5;
    drawDiamond(ctx, TW, TH, TW, TH);
    ctx.stroke();
    generatedTextures_.set(`earth_${v}`, await toBitmap(c));
  }

  // 4: water
  for (let frame = 0; frame < 4; frame++) {
    const [c, ctx] = cc(TW * 2, TH * 2);
    drawDiamond(ctx, TW, TH, TW, TH);
    const grad = ctx.createLinearGradient(0, 0, TW * 2, TH * 2);
    grad.addColorStop(0, '#1a4a7a');
    grad.addColorStop(0.5, '#2a6aaa');
    grad.addColorStop(1, '#1a4a7a');
    ctx.fillStyle = grad;
    ctx.fill();
    for (let i = 0; i < 5; i++) {
      const wy = TH * 0.5 + i * 5 + frame * 1.5;
      ctx.strokeStyle = `rgba(120, 180, 255, ${0.2 + i * 0.05})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(TW * 0.3, wy);
      ctx.quadraticCurveTo(TW + frame * 3, wy - 3 + Math.sin(i + frame) * 2, TW * 1.7, wy);
      ctx.stroke();
    }
    generatedTextures_.set(`earth_${4 + frame}`, await toBitmap(c));
  }

  // 8-10: dirt/road
  for (let v = 8; v <= 10; v++) {
    const [c, ctx] = cc(TW * 2, TH * 2);
    const rng = seededRandom(v * 200);
    drawDiamond(ctx, TW, TH, TW, TH);
    ctx.fillStyle = `rgb(${120 + v * 3}, ${90 + v * 2}, ${55 + v})`;
    ctx.fill();
    for (let i = 0; i < 15; i++) {
      const px = TW * 0.3 + rng() * TW * 1.4;
      const py = TH * 0.3 + rng() * TH * 1.4;
      ctx.fillStyle = `rgba(${100 + v * 3}, ${75 + v * 2}, ${45 + v}, 0.6)`;
      ctx.fillRect(px, py, 2 + rng() * 2, 2 + rng() * 2);
    }
    ctx.strokeStyle = `rgba(80, 60, 30, 0.3)`;
    ctx.lineWidth = 0.5;
    drawDiamond(ctx, TW, TH, TW, TH);
    ctx.stroke();
    generatedTextures_.set(`earth_${v}`, await toBitmap(c));
  }

  // 12: stone floor
  {
    const [c, ctx] = cc(TW * 2, TH * 2);
    drawDiamond(ctx, TW, TH, TW, TH);
    ctx.fillStyle = '#8a8a82';
    ctx.fill();
    ctx.strokeStyle = '#6a6a62';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(TW * 0.5, TH);
    ctx.lineTo(TW * 1.5, TH);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(TW, TH * 0.3);
    ctx.lineTo(TW, TH * 1.7);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(50, 50, 45, 0.3)';
    ctx.lineWidth = 0.5;
    drawDiamond(ctx, TW, TH, TW, TH);
    ctx.stroke();
    generatedTextures_.set('earth_12', await toBitmap(c));
  }

  // 15-17: sand
  for (let v = 15; v <= 17; v++) {
    const [c, ctx] = cc(TW * 2, TH * 2);
    const rng = seededRandom(v * 300);
    drawDiamond(ctx, TW, TH, TW, TH);
    ctx.fillStyle = `rgb(${190 + v * 2}, ${170 + v * 2}, ${120 + v})`;
    ctx.fill();
    for (let i = 0; i < 10; i++) {
      const px = TW * 0.3 + rng() * TW * 1.4;
      const py = TH * 0.3 + rng() * TH * 1.4;
      ctx.fillStyle = `rgba(${200 + v * 2}, ${180 + v * 2}, ${130 + v}, 0.5)`;
      ctx.fillRect(px, py, 1 + rng() * 2, 1 + rng());
    }
    generatedTextures_.set(`earth_${v}`, await toBitmap(c));
  }

  // 20-25: snow
  for (let v = 20; v <= 22; v++) {
    const [c, ctx] = cc(TW * 2, TH * 2);
    const rng = seededRandom(v * 400);
    drawDiamond(ctx, TW, TH, TW, TH);
    ctx.fillStyle = `rgb(${230 + v}, ${235 + v}, ${240 + v})`;
    ctx.fill();
    for (let i = 0; i < 8; i++) {
      const px = TW * 0.3 + rng() * TW * 1.4;
      const py = TH * 0.3 + rng() * TH * 1.4;
      ctx.fillStyle = `rgba(200, 210, 230, 0.4)`;
      ctx.fillRect(px, py, 2, 2);
    }
    generatedTextures_.set(`earth_${v}`, await toBitmap(c));
  }

  // 30-35: mountain/rock
  for (let v = 30; v <= 33; v++) {
    const [c, ctx] = cc(TW * 2, TH * 2);
    const rng = seededRandom(v * 500);
    drawDiamond(ctx, TW, TH, TW, TH);
    ctx.fillStyle = `rgb(${80 + v}, ${75 + v}, ${70 + v})`;
    ctx.fill();
    for (let i = 0; i < 8; i++) {
      const px = TW * 0.4 + rng() * TW * 1.2;
      const py = TH * 0.4 + rng() * TH * 1.2;
      ctx.fillStyle = `rgba(${60 + v}, ${55 + v}, ${50 + v}, 0.5)`;
      ctx.fillRect(px, py, 3 + rng() * 3, 2 + rng() * 2);
    }
    generatedTextures_.set(`earth_${v}`, await toBitmap(c));
  }

  // Fill remaining with generic colored tiles
  for (let i = 1; i <= 500; i++) {
    if (generatedTextures_.has(`earth_${i}`)) continue;
    const [c, ctx] = cc(TW * 2, TH * 2);
    const rng = seededRandom(i * 999);
    const hue = (i * 37) % 360;
    drawDiamond(ctx, TW, TH, TW, TH);
    ctx.fillStyle = `hsl(${hue}, ${15 + rng() * 20}%, ${15 + rng() * 15}%)`;
    ctx.fill();
    ctx.strokeStyle = `hsla(${hue}, 10%, 25%, 0.3)`;
    ctx.lineWidth = 0.5;
    ctx.stroke();
    generatedTextures_.set(`earth_${i}`, await toBitmap(c));
  }
}

export async function generateBuildingTextures(): Promise<void> {
  const TW = 36, TH = 18;

  // Wall tiles (1-20)
  for (let i = 1; i <= 20; i++) {
    const [c, ctx] = cc(TW * 2, TH * 4);
    const rng = seededRandom(i * 600);
    const wallHue = 25 + (i % 5) * 8;
    const wallLit = 30 + (i % 4) * 8;

    ctx.fillStyle = `hsl(${wallHue}, 25%, ${wallLit}%)`;
    ctx.fillRect(0, 0, TW * 2, TH * 4);

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const bx = col * 18 + (row % 2) * 9;
        const by = row * 18;
        ctx.strokeStyle = `hsl(${wallHue}, 20%, ${wallLit - 8}%)`;
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, 18, 18);
        ctx.fillStyle = `hsl(${wallHue}, 22%, ${wallLit + 3 + rng() * 5}%)`;
        ctx.fillRect(bx + 1, by + 1, 16, 16);
      }
    }

    generatedTextures_.set(`building_${i}`, await toBitmap(c));
  }

  // Door tiles (21-30)
  for (let i = 21; i <= 30; i++) {
    const [c, ctx] = cc(TW * 2, TH * 4);
    const isWood = i % 2 === 0;

    ctx.fillStyle = isWood ? '#5a3a1a' : '#7a5a2a';
    ctx.fillRect(0, 0, TW * 2, TH * 4);

    ctx.fillStyle = isWood ? '#4a2a0a' : '#6a4a1a';
    ctx.fillRect(8, 4, TW * 2 - 16, TH * 4 - 8);

    ctx.fillStyle = '#c8a050';
    ctx.beginPath();
    ctx.arc(TW * 2 - 18, TH * 2, 3, 0, Math.PI * 2);
    ctx.fill();

    if (isWood) {
      for (let p = 0; p < 3; p++) {
        ctx.strokeStyle = '#3a1a00';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(12, 8 + p * (TH * 4 - 16) / 3);
        ctx.lineTo(TW * 2 - 12, 8 + p * (TH * 4 - 16) / 3);
        ctx.stroke();
      }
    }

    generatedTextures_.set(`building_${i}`, await toBitmap(c));
  }

  // Roof tiles (31-50)
  for (let i = 31; i <= 50; i++) {
    const [c, ctx] = cc(TW * 2, TH * 2);
    const roofHue = i % 3 === 0 ? 0 : i % 3 === 1 ? 200 : 30;
    const roofSat = 40 + (i % 4) * 10;

    ctx.fillStyle = `hsl(${roofHue}, ${roofSat}%, 25%)`;
    ctx.fillRect(0, 0, TW * 2, TH * 2);

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 5; col++) {
        const tx = col * 15 + (row % 2) * 7 - 2;
        const ty = row * 6;
        ctx.fillStyle = `hsl(${roofHue}, ${roofSat - 5}%, ${28 + (col % 2) * 5}%)`;
        ctx.fillRect(tx, ty, 16, 7);
        ctx.strokeStyle = `hsl(${roofHue}, ${roofSat - 10}%, 18%)`;
        ctx.lineWidth = 0.5;
        ctx.strokeRect(tx, ty, 16, 7);
      }
    }

    generatedTextures_.set(`building_${i}`, await toBitmap(c));
  }

  // Fence/wall low (51-60)
  for (let i = 51; i <= 60; i++) {
    const [c, ctx] = cc(TW * 2, TH * 2);
    ctx.fillStyle = '#6a5a3a';
    ctx.fillRect(0, TH, TW * 2, TH);
    for (let p = 0; p < 4; p++) {
      ctx.fillStyle = '#5a4a2a';
      ctx.fillRect(p * 18 + 2, TH - 6, 6, TH + 6);
    }
    ctx.fillStyle = '#7a6a4a';
    ctx.fillRect(0, TH + 2, TW * 2, 3);
    generatedTextures_.set(`building_${i}`, await toBitmap(c));
  }

  // Tree (61-70)
  for (let i = 61; i <= 70; i++) {
    const [c, ctx] = cc(TW * 2, TH * 6);
    const rng = seededRandom(i * 700);

    ctx.fillStyle = '#4a2a0a';
    ctx.fillRect(TW - 3, TH * 3, 6, TH * 3);

    const treeType = i % 3;
    if (treeType === 0) {
      ctx.fillStyle = '#1a5a1a';
      ctx.beginPath();
      ctx.arc(TW, TH * 2, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#2a7a2a';
      ctx.beginPath();
      ctx.arc(TW - 5, TH * 2 - 5, 14, 0, Math.PI * 2);
      ctx.fill();
    } else if (treeType === 1) {
      ctx.fillStyle = '#1a6a1a';
      ctx.beginPath();
      ctx.moveTo(TW, TH * 0.5);
      ctx.lineTo(TW + 20, TH * 3);
      ctx.lineTo(TW - 20, TH * 3);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#2a8a2a';
      ctx.beginPath();
      ctx.moveTo(TW, TH);
      ctx.lineTo(TW + 15, TH * 2.5);
      ctx.lineTo(TW - 15, TH * 2.5);
      ctx.closePath();
      ctx.fill();
    } else {
      for (let l = 0; l < 3; l++) {
        ctx.fillStyle = `rgb(${20 + l * 15}, ${70 + l * 20}, ${20 + l * 10})`;
        ctx.beginPath();
        ctx.moveTo(TW, TH * (0.5 + l * 0.8));
        ctx.lineTo(TW + 22 - l * 4, TH * (1.5 + l * 0.8));
        ctx.lineTo(TW - 22 + l * 4, TH * (1.5 + l * 0.8));
        ctx.closePath();
        ctx.fill();
      }
    }

    generatedTextures_.set(`building_${i}`, await toBitmap(c));
  }

  // Fill remaining
  for (let i = 1; i <= 500; i++) {
    if (generatedTextures_.has(`building_${i}`)) continue;
    const [c, ctx] = cc(TW * 2, TH * 4);
    const rng = seededRandom(i * 888);
    const hue = (i * 23 + 15) % 360;
    ctx.fillStyle = `hsl(${hue}, ${15 + rng() * 20}%, ${20 + rng() * 15}%)`;
    ctx.fillRect(4, 20, TW * 2 - 8, TH * 4 - 24);
    ctx.strokeStyle = `hsl(${hue}, 10%, 15%)`;
    ctx.lineWidth = 1;
    ctx.strokeRect(4, 20, TW * 2 - 8, TH * 4 - 24);
    generatedTextures_.set(`building_${i}`, await toBitmap(c));
  }
}

export async function generatePersonTextures(): Promise<void> {
  const ROBE_COLORS = [
    { body: '#2255aa', trim: '#1a4488' },
    { body: '#aa2233', trim: '#881a2a' },
    { body: '#22aa55', trim: '#1a8844' },
    { body: '#aa8822', trim: '#886a1a' },
    { body: '#8822aa', trim: '#6a1a88' },
    { body: '#22aaaa', trim: '#1a8888' },
    { body: '#555555', trim: '#333333' },
    { body: '#aa5522', trim: '#88441a' },
    { body: '#ffffff', trim: '#cccccc' },
    { body: '#222222', trim: '#111111' },
    { body: '#4477cc', trim: '#3366aa' },
    { body: '#cc4466', trim: '#aa3355' },
    { body: '#66bb44', trim: '#449933' },
    { body: '#ddaa33', trim: '#bb8822' },
    { body: '#9944cc', trim: '#7733aa' },
    { body: '#44bbbb', trim: '#339999' },
  ];

  const SKIN_TONES = ['#f5d0a9', '#e8c090', '#d4a870', '#c09060'];

  for (let i = 0; i < 256; i++) {
    const [c, ctx] = cc(48, 64);
    const dirIdx = Math.floor(i / 4) % 4;
    const poseIdx = i % 4;
    const colorIdx = Math.floor(i / 16) % ROBE_COLORS.length;
    const skinIdx = Math.floor(i / 256 * SKIN_TONES.length) % SKIN_TONES.length;
    const robe = ROBE_COLORS[colorIdx];
    const skin = SKIN_TONES[skinIdx];

    const cx = 24;
    const cy = 32;
    const legOff = poseIdx === 1 ? -3 : poseIdx === 3 ? 3 : 0;
    const armOff = poseIdx === 1 ? 2 : poseIdx === 3 ? -2 : 0;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 26, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    ctx.fillStyle = robe.trim;
    ctx.fillRect(cx - 6 + legOff, cy + 10, 5, 14);
    ctx.fillRect(cx + 1 - legOff, cy + 10, 5, 14);

    // Shoes
    ctx.fillStyle = '#2a1a0a';
    ctx.fillRect(cx - 7 + legOff, cy + 22, 7, 4);
    ctx.fillRect(cx - 1 - legOff, cy + 22, 7, 4);

    // Body/robe
    ctx.fillStyle = robe.body;
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy - 6);
    ctx.lineTo(cx + 10, cy - 6);
    ctx.lineTo(cx + 8, cy + 12);
    ctx.lineTo(cx - 8, cy + 12);
    ctx.closePath();
    ctx.fill();

    // Robe trim
    ctx.strokeStyle = robe.trim;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 4);
    ctx.lineTo(cx, cy + 10);
    ctx.stroke();

    // Belt
    ctx.fillStyle = robe.trim;
    ctx.fillRect(cx - 9, cy + 4, 18, 3);

    // Arms
    ctx.fillStyle = robe.body;
    if (dirIdx === 0 || dirIdx === 2) {
      ctx.fillRect(cx - 13, cy - 4 + armOff, 5, 12);
      ctx.fillRect(cx + 8, cy - 4 - armOff, 5, 12);
      // Hands
      ctx.fillStyle = skin;
      ctx.fillRect(cx - 13, cy + 7 + armOff, 5, 4);
      ctx.fillRect(cx + 8, cy + 7 - armOff, 5, 4);
    } else {
      const armSide = dirIdx === 1 ? 1 : -1;
      ctx.fillRect(cx + armSide * 8, cy - 4, 5, 12);
      ctx.fillStyle = skin;
      ctx.fillRect(cx + armSide * 8, cy + 7, 5, 4);
    }

    // Head
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(cx, cy - 14, 9, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = '#1a0a00';
    if (dirIdx === 0 || dirIdx === 2) {
      ctx.beginPath();
      ctx.arc(cx, cy - 16, 9, Math.PI, 2 * Math.PI);
      ctx.fill();
      ctx.fillRect(cx - 9, cy - 18, 18, 5);
      // Side hair
      ctx.fillRect(cx - 10, cy - 16, 3, 8);
      ctx.fillRect(cx + 7, cy - 16, 3, 8);
    } else {
      ctx.beginPath();
      ctx.arc(cx, cy - 16, 9, Math.PI, 2 * Math.PI);
      ctx.fill();
      ctx.fillRect(cx - 9, cy - 18, 18, 5);
      // Hair bun
      ctx.beginPath();
      ctx.arc(cx, cy - 24, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Face features
    if (dirIdx === 0 || dirIdx === 2) {
      ctx.fillStyle = '#1a0a00';
      ctx.fillRect(cx - 4, cy - 14, 2, 2);
      ctx.fillRect(cx + 2, cy - 14, 2, 2);
      // Eyebrows
      ctx.fillRect(cx - 5, cy - 16, 3, 1);
      ctx.fillRect(cx + 2, cy - 16, 3, 1);
      // Mouth
      ctx.fillRect(cx - 1, cy - 10, 3, 1);
    } else if (dirIdx === 1) {
      ctx.fillStyle = '#1a0a00';
      ctx.fillRect(cx + 1, cy - 14, 2, 2);
      ctx.fillRect(cx, cy - 10, 2, 1);
    } else {
      ctx.fillStyle = '#1a0a00';
      ctx.fillRect(cx - 3, cy - 14, 2, 2);
      ctx.fillRect(cx - 2, cy - 10, 2, 1);
    }

    // Weapon for some characters
    if (colorIdx < 4 && (dirIdx === 0 || dirIdx === 2)) {
      const weaponSide = dirIdx === 0 ? 1 : -1;
      ctx.fillStyle = '#aaa';
      ctx.fillRect(cx + weaponSide * 14, cy - 12, 2, 20);
      ctx.fillStyle = '#8B6914';
      ctx.fillRect(cx + weaponSide * 13, cy - 2, 4, 5);
    }

    generatedTextures_.set(`person_${i}`, await toBitmap(c));
  }
}

export async function generateEffectTextures(): Promise<void> {
  for (let i = 1; i <= 100; i++) {
    const [c, ctx] = cc(64, 64);
    const hue = (i * 61) % 360;
    const frame = i % 8;
    const radius = 8 + frame * 3;
    const alpha = 1 - frame * 0.1;

    ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${alpha * 0.3})`;
    ctx.beginPath();
    ctx.arc(32, 32, radius + 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `hsla(${hue}, 90%, 70%, ${alpha})`;
    ctx.beginPath();
    ctx.arc(32, 32, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `hsla(${(hue + 60) % 360}, 95%, 85%, ${alpha * 0.7})`;
    ctx.beginPath();
    ctx.arc(32, 32, radius * 0.4, 0, Math.PI * 2);
    ctx.fill();

    for (let p = 0; p < 6; p++) {
      const angle = (p / 6) * Math.PI * 2 + frame * 0.3;
      const px = 32 + Math.cos(angle) * (radius + 4);
      const py = 32 + Math.sin(angle) * (radius + 4);
      ctx.fillStyle = `hsla(${(hue + 120) % 360}, 90%, 80%, ${alpha * 0.5})`;
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    generatedTextures_.set(`effect_${i}`, await toBitmap(c));
  }
}

export async function generateHeadTextures(): Promise<void> {
  const SKIN_TONES = ['#f5d0a9', '#e8c090', '#d4a870', '#c09060'];
  const HAIR_COLORS = ['#1a0a00', '#3a2a1a', '#5a3a1a', '#8a5a2a', '#aaa'];
  const ROBE_COLORS = ['#2255aa', '#aa2233', '#22aa55', '#aa8822', '#8822aa', '#22aaaa', '#555', '#aa5522', '#fff', '#222'];

  for (let i = 0; i < 100; i++) {
    const [c, ctx] = cc(48, 48);
    const skin = SKIN_TONES[i % SKIN_TONES.length];
    const hair = HAIR_COLORS[Math.floor(i / 4) % HAIR_COLORS.length];
    const robe = ROBE_COLORS[Math.floor(i / 20) % ROBE_COLORS.length];

    ctx.fillStyle = robe;
    ctx.beginPath();
    ctx.ellipse(24, 40, 18, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(24, 22, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = hair;
    ctx.beginPath();
    ctx.arc(24, 18, 14, Math.PI, 2 * Math.PI);
    ctx.fill();
    ctx.fillRect(10, 14, 28, 6);

    ctx.fillStyle = '#1a0a00';
    ctx.fillRect(18, 20, 3, 3);
    ctx.fillRect(27, 20, 3, 3);
    ctx.fillRect(21, 27, 6, 2);

    ctx.strokeStyle = '#1a0a00';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(17, 19);
    ctx.lineTo(22, 18);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(31, 18);
    ctx.lineTo(28, 19);
    ctx.stroke();

    generatedTextures_.set(`head_${i}`, await toBitmap(c));
  }
}

export async function generateTitleBackground(): Promise<void> {
  const [c, ctx] = cc(1024, 640);

  const grad = ctx.createLinearGradient(0, 0, 0, 640);
  grad.addColorStop(0, '#0a0500');
  grad.addColorStop(0.2, '#1a0a00');
  grad.addColorStop(0.5, '#0d0500');
  grad.addColorStop(0.8, '#1a0800');
  grad.addColorStop(1, '#0a0300');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 640);

  // Mountains
  for (let layer = 0; layer < 4; layer++) {
    const baseY = 250 + layer * 80;
    const alpha = 0.15 + layer * 0.08;
    ctx.fillStyle = `rgba(${20 + layer * 10}, ${10 + layer * 5}, ${5}, ${alpha})`;
    ctx.beginPath();
    ctx.moveTo(0, baseY + 100);
    for (let x = 0; x <= 1024; x += 20) {
      const h = Math.sin(x * 0.008 + layer * 2) * 60 + Math.sin(x * 0.02 + layer) * 30;
      ctx.lineTo(x, baseY - h);
    }
    ctx.lineTo(1024, baseY + 100);
    ctx.closePath();
    ctx.fill();
  }

  // Moon
  ctx.fillStyle = 'rgba(200, 180, 140, 0.15)';
  ctx.beginPath();
  ctx.arc(750, 120, 50, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(220, 200, 160, 0.1)';
  ctx.beginPath();
  ctx.arc(750, 120, 70, 0, Math.PI * 2);
  ctx.fill();

  // Stars
  const rng = seededRandom(42);
  for (let i = 0; i < 150; i++) {
    const x = rng() * 1024;
    const y = rng() * 300;
    const r = 0.3 + rng() * 1.2;
    const alpha = 0.1 + rng() * 0.5;
    ctx.fillStyle = `rgba(200, 180, 140, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Mist
  for (let i = 0; i < 8; i++) {
    const x = rng() * 1024;
    const y = 300 + rng() * 200;
    const grad2 = ctx.createRadialGradient(x, y, 0, x, y, 80 + rng() * 60);
    grad2.addColorStop(0, 'rgba(100, 80, 50, 0.08)');
    grad2.addColorStop(1, 'rgba(100, 80, 50, 0)');
    ctx.fillStyle = grad2;
    ctx.fillRect(x - 150, y - 150, 300, 300);
  }

  generatedTextures_.set('title_bg', await toBitmap(c));
}

export async function generateAllPlaceholderTextures(): Promise<void> {
  await generateTitleBackground();
  await generateEarthTextures();
  await generateBuildingTextures();
  await generatePersonTextures();
  await generateEffectTextures();
  await generateHeadTextures();
}

export function getGeneratedTexture(key: string): ImageBitmap | undefined {
  return generatedTextures_.get(key);
}

export function hasGeneratedTexture(key: string): boolean {
  return generatedTextures_.has(key);
}
