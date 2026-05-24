export class TouchController {
    constructor() {
        this.targetPosition = null;
        this.isMoving = false;
        this.clickIndicator = null;
        this.init();
    }

    init() {
        this.clickIndicator = document.getElementById('click-indicator');
        this.setupGameClickListener();
        this.setupSideButtons();
        this.setupBattleButtons();
    }

    setupGameClickListener() {
        const gameContainer = document.getElementById('game-container');
        if (!gameContainer) return;

        const handleClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // 获取点击位置（兼容touch和mouse）
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            
            // 显示点击指示器
            this.showClickIndicator(clientX, clientY);
            
            // 触发事件通知游戏
            this.emitMoveToPoint(clientX, clientY);
        };

        // 同时支持点击和触摸
        gameContainer.addEventListener('click', handleClick);
        gameContainer.addEventListener('touchstart', handleClick, { passive: false });
    }

    showClickIndicator(x, y) {
        if (!this.clickIndicator) return;
        
        this.clickIndicator.style.left = x + 'px';
        this.clickIndicator.style.top = y + 'px';
        this.clickIndicator.classList.remove('active');
        
        // 重绘以重启动画
        void this.clickIndicator.offsetWidth;
        this.clickIndicator.classList.add('active');
        
        // 动画结束后移除active类
        setTimeout(() => {
            if (this.clickIndicator) {
                this.clickIndicator.classList.remove('active');
            }
        }, 500);
    }

    emitMoveToPoint(clientX, clientY) {
        const event = new CustomEvent('touch-move-to', {
            detail: { clientX, clientY }
        });
        window.dispatchEvent(event);
    }

    setupSideButtons() {
        const buttons = {
            'btn-menu': 'menu',
            'btn-inventory': 'inventory',
            'btn-skill': 'skill'
        };

        Object.entries(buttons).forEach(([id, action]) => {
            const btn = document.getElementById(id);
            if (btn) {
                this.addButtonEvents(btn, action);
            }
        });
    }

    setupBattleButtons() {
        const buttons = {
            'btn-battle-attack': 'battle-attack',
            'btn-battle-skill': 'battle-skill',
            'btn-battle-item': 'battle-item',
            'btn-battle-escape': 'battle-escape'
        };

        Object.entries(buttons).forEach(([id, action]) => {
            const btn = document.getElementById(id);
            if (btn) {
                this.addButtonEvents(btn, action);
            }
        });
    }

    addButtonEvents(btn, action) {
        const handlePress = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.emitAction(action);
        };

        btn.addEventListener('click', handlePress);
        btn.addEventListener('touchstart', handlePress, { passive: false });
    }

    emitAction(action) {
        const event = new CustomEvent('touch-action', {
            detail: { action }
        });
        window.dispatchEvent(event);
    }

    setBattleMode(active) {
        const battleControls = document.getElementById('battle-controls');
        const sideButtons = document.getElementById('side-buttons');
        
        if (battleControls) {
            battleControls.classList.toggle('active', active);
        }
        
        if (sideButtons) {
            sideButtons.style.display = active ? 'none' : 'flex';
        }
    }

    updateStatusBar(playerData) {
        const hpFill = document.getElementById('hp-fill');
        const hpText = document.getElementById('hp-text');
        const mpFill = document.getElementById('mp-fill');
        const mpText = document.getElementById('mp-text');
        
        if (hpFill && hpText) {
            const hpPercent = (playerData.hp / playerData.maxHP) * 100;
            hpFill.style.width = `${hpPercent}%`;
            hpText.textContent = `${playerData.hp}/${playerData.maxHP}`;
        }
        
        if (mpFill && mpText) {
            const mpPercent = (playerData.mp / playerData.maxMP) * 100;
            mpFill.style.width = `${mpPercent}%`;
            mpText.textContent = `${playerData.mp}/${playerData.maxMP}`;
        }
    }
}

export const touchController = new TouchController();
