class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cameraX = 0;
        this.cameraY = 0;
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
    
    setCamera(playerX, playerY, mapWidth, mapHeight) {
        this.cameraX = playerX - (this.canvas.width / this.tileSize) / 2;
        this.cameraY = playerY - (this.canvas.height / this.tileSize) / 2;
        
        this.cameraX = Math.max(0, Math.min(this.cameraX, mapWidth - this.canvas.width / this.tileSize));
        this.cameraY = Math.max(0, Math.min(this.cameraY, mapHeight - this.canvas.height / this.tileSize));
    }
    
    drawMap(map) {
        this.ctx.fillStyle = map.backgroundColor || '#2d4a3e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const startTileX = Math.floor(this.cameraX);
        const startTileY = Math.floor(this.cameraY);
        const endTileX = startTileX + Math.ceil(this.canvas.width / this.tileSize) + 1;
        const endTileY = startTileY + Math.ceil(this.canvas.height / this.tileSize) + 1;
        
        for (let x = startTileX; x < endTileX; x++) {
            for (let y = startTileY; y < endTileY; y++) {
                const tile = map.getTile(x, y);
                this.drawTile(x, y, tile);
            }
        }
    }
    
    drawTile(x, y, tile) {
        const screenX = (x - this.cameraX) * this.tileSize;
        const screenY = (y - this.cameraY) * this.tileSize;
        
        if (tile && tile.color) {
            this.ctx.fillStyle = tile.color;
        } else {
            this.ctx.fillStyle = '#3d5a4e';
        }
        
        this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
        
        this.ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        this.ctx.strokeRect(screenX, screenY, this.tileSize, this.tileSize);
    }
    
    drawPlayer(player) {
        player.draw(this.ctx, this.cameraX, this.cameraY, this.tileSize);
    }
    
    drawOtherPlayers(players) {
        players.forEach(player => {
            player.draw(this.ctx, this.cameraX, this.cameraY, this.tileSize);
        });
    }
}
