class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.tileSize = 32;
    }
    
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
    }
    
    clear() {
        this.ctx.fillStyle = '#2d4a3e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawMap(map, camera) {
        this.ctx.fillStyle = map.backgroundColor || '#2d4a3e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const cameraX = camera.x - (this.canvas.width / this.tileSize) / 2;
        const cameraY = camera.y - (this.canvas.height / this.tileSize) / 2;
        
        const startTileX = Math.floor(cameraX);
        const startTileY = Math.floor(cameraY);
        const endTileX = startTileX + Math.ceil(this.canvas.width / this.tileSize) + 1;
        const endTileY = startTileY + Math.ceil(this.canvas.height / this.tileSize) + 1;
        
        for (let x = startTileX; x < endTileX; x++) {
            for (let y = startTileY; y < endTileY; y++) {
                const tile = map.getTile(x, y);
                this.drawTile(x, y, tile, cameraX, cameraY);
            }
        }
    }
    
    drawTile(x, y, tile, cameraX, cameraY) {
        const screenX = (x - cameraX) * this.tileSize;
        const screenY = (y - cameraY) * this.tileSize;
        
        if (tile && tile.color) {
            this.ctx.fillStyle = tile.color;
        } else {
            this.ctx.fillStyle = '#3d5a4e';
        }
        
        this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
        
        this.ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        this.ctx.strokeRect(screenX, screenY, this.tileSize, this.tileSize);
    }
    
    drawPlayer(player, camera) {
        const cameraX = camera.x - (this.canvas.width / this.tileSize) / 2;
        const cameraY = camera.y - (this.canvas.height / this.tileSize) / 2;
        player.draw(this.ctx, cameraX, cameraY, this.tileSize);
    }
}
