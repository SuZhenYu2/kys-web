class InputHandler {
    constructor(gameClient) {
        this.gameClient = gameClient;
        this.keys = {};
        this.setupListeners();
    }
    
    setupListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }
    
    isKeyPressed(key) {
        return this.keys[key];
    }
    
    getMovement() {
        let dx = 0, dy = 0;
        
        if (this.isKeyPressed('w') || this.isKeyPressed('W') || this.isKeyPressed('ArrowUp')) {
            dy = -1;
        }
        if (this.isKeyPressed('s') || this.isKeyPressed('S') || this.isKeyPressed('ArrowDown')) {
            dy = 1;
        }
        if (this.isKeyPressed('a') || this.isKeyPressed('A') || this.isKeyPressed('ArrowLeft')) {
            dx = -1;
        }
        if (this.isKeyPressed('d') || this.isKeyPressed('D') || this.isKeyPressed('ArrowRight')) {
            dx = 1;
        }
        
        return { dx, dy };
    }
}
