interface PathNode {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent: PathNode | null;
}

export class PathFinding {
  private mapWidth_: number;
  private mapHeight_: number;
  private canWalk_: (x: number, y: number) => boolean;

  constructor(mapWidth: number, mapHeight: number, canWalk: (x: number, y: number) => boolean) {
    this.mapWidth_ = mapWidth;
    this.mapHeight_ = mapHeight;
    this.canWalk_ = canWalk;
  }

  findPath(startX: number, startY: number, endX: number, endY: number): { x: number; y: number }[] {
    if (startX === endX && startY === endY) return [];

    const openList: PathNode[] = [];
    const closedList: Set<string> = new Set();

    const startNode: PathNode = {
      x: startX,
      y: startY,
      g: 0,
      h: this.heuristic(startX, startY, endX, endY),
      f: 0,
      parent: null,
    };
    startNode.f = startNode.g + startNode.h;
    openList.push(startNode);

    const dirs = [
      { x: 0, y: -1 }, { x: 0, y: 1 },
      { x: -1, y: 0 }, { x: 1, y: 0 },
      { x: -1, y: -1 }, { x: 1, y: -1 },
      { x: -1, y: 1 }, { x: 1, y: 1 },
    ];

    while (openList.length > 0) {
      openList.sort((a, b) => a.f - b.f);
      const current = openList.shift()!;

      if (current.x === endX && current.y === endY) {
        return this.reconstructPath(current);
      }

      closedList.add(`${current.x},${current.y}`);

      for (const dir of dirs) {
        const nx = current.x + dir.x;
        const ny = current.y + dir.y;

        if (nx < 0 || ny < 0 || nx >= this.mapWidth_ || ny >= this.mapHeight_) continue;
        if (closedList.has(`${nx},${ny}`)) continue;
        if (!this.canWalk_(nx, ny)) continue;

        const isDiagonal = dir.x !== 0 && dir.y !== 0;
        if (isDiagonal) {
          if (!this.canWalk_(current.x + dir.x, current.y)) continue;
          if (!this.canWalk_(current.x, current.y + dir.y)) continue;
        }

        const g = current.g + (isDiagonal ? 1.414 : 1);
        const h = this.heuristic(nx, ny, endX, endY);
        const f = g + h;

        const existingNode = openList.find((n) => n.x === nx && n.y === ny);
        if (existingNode && g >= existingNode.g) continue;

        if (existingNode) {
          existingNode.g = g;
          existingNode.f = f;
          existingNode.parent = current;
        } else {
          openList.push({ x: nx, y: ny, g, h, f, parent: current });
        }
      }
    }

    return [];
  }

  private heuristic(x1: number, y1: number, x2: number, y2: number): number {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }

  private reconstructPath(node: PathNode): { x: number; y: number }[] {
    const path: { x: number; y: number }[] = [];
    let current: PathNode | null = node;
    while (current) {
      path.unshift({ x: current.x, y: current.y });
      current = current.parent;
    }
    return path;
  }
}