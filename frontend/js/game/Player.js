class Player {
    constructor(x, y, nickname) {
        this.x = x;
        this.y = y;
        this.nickname = nickname;
        this.color = '#ff6b6b';
        this.speed = 0.15;
        this.targetX = x;
        this.targetY = y;
    }
    
    moveTo(x, y) {
        this.targetX = x;
        this.targetY = y;
    }
    
    update(deltaTime) {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0.1) {
            const moveX = (dx / dist) * this.speed * deltaTime;
            const moveY = (dy / dist) * this.speed * deltaTime;
            
            this.x += moveX;
            this.y += moveY;
            
            if (Math.abs(this.x - this.targetX) < 0.1) {
                this.x = this.targetX;
            }
            if (Math.abs(this.y - this.targetY) < 0.1) {
                this.y = this.targetY;
            }
        }
    }
    
    draw(ctx, cameraX, cameraY, tileSize) {
        const screenX = (this.x - cameraX) * tileSize;
        const screenY = (this.y - cameraY) * tileSize;
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(screenX + tileSize/2, screenY + tileSize/2, tileSize/3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText(this.nickname, screenX + tileSize/2, screenY - 5);
    }
}
