class OtherPlayer {
    constructor(id, x, y, nickname, level) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
        this.nickname = nickname;
        this.level = level;
        this.color = this.getRandomColor();
        this.speed = 4;
    }

    getRandomColor() {
        const colors = [
            '#8B4513', '#006400', '#00008B', '#800080',
            '#FF4500', '#2E8B57', '#4682B4', '#9932CC'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    moveTo(x, y) {
        this.targetX = x;
        this.targetY = y;
    }

    update(deltaTime) {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0.1) {
            const moveSpeed = this.speed * deltaTime;
            if (distance <= moveSpeed) {
                this.x = this.targetX;
                this.y = this.targetY;
            } else {
                this.x += (dx / distance) * moveSpeed;
                this.y += (dy / distance) * moveSpeed;
            }
        }
    }

    render(ctx, camera) {
        const tileSize = 32;
        const screenX = (this.x - camera.x) * tileSize + 400;
        const screenY = (this.y - camera.y) * tileSize + 300;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(screenX, screenY - 8, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${this.nickname} Lv.${this.level}`, screenX, screenY - 24);
    }
}
