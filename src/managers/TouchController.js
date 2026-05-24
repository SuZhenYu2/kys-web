export class TouchController {
    constructor() {
        this.activeButtons = new Set();
        this.initControls();
    }

    initControls() {
        const buttons = [
            { id: 'btn-up', direction: 'up' },
            { id: 'btn-down', direction: 'down' },
            { id: 'btn-left', direction: 'left' },
            { id: 'btn-right', direction: 'right' }
        ];

        buttons.forEach(({ id, direction }) => {
            const btn = document.getElementById(id);
            if (btn) {
                this.addButtonEvents(btn, direction);
            }
        });

        const actionButtons = [
            { id: 'btn-interact', action: 'space' },
            { id: 'btn-menu', action: 'esc' },
            { id: 'btn-inventory', action: 'inventory' }
        ];

        actionButtons.forEach(({ id, action }) => {
            const btn = document.getElementById(id);
            if (btn) {
                this.addActionButtonEvents(btn, action);
            }
        });

        // 战斗按钮
        const battleButtons = [
            { id: 'btn-battle-attack', action: 'battle-attack' },
            { id: 'btn-battle-skill', action: 'battle-skill' },
            { id: 'btn-battle-item', action: 'battle-item' },
            { id: 'btn-battle-escape', action: 'battle-escape' }
        ];

        battleButtons.forEach(({ id, action }) => {
            const btn = document.getElementById(id);
            if (btn) {
                this.addActionButtonEvents(btn, action);
            }
        });
    }

    // 切换战斗按钮显示
    setBattleMode(active) {
        const touchControls = document.getElementById('touch-controls');
        const battleControls = document.getElementById('battle-controls');
        
        if (touchControls) {
            touchControls.style.display = active ? 'none' : 'block';
        }
        
        if (battleControls) {
            battleControls.classList.toggle('active', active);
        }
    }

    addButtonEvents(btn, direction) {
        // 鼠标事件
        btn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.activeButtons.add(direction);
        });

        btn.addEventListener('mouseup', (e) => {
            e.preventDefault();
            this.activeButtons.delete(direction);
        });

        btn.addEventListener('mouseleave', (e) => {
            e.preventDefault();
            this.activeButtons.delete(direction);
        });

        // 触屏事件
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.activeButtons.add(direction);
        }, { passive: false });

        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.activeButtons.delete(direction);
        }, { passive: false });

        btn.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.activeButtons.delete(direction);
        }, { passive: false });
    }

    addActionButtonEvents(btn, action) {
        const handlePress = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.emitAction(action);
        };

        btn.addEventListener('mousedown', handlePress);
        btn.addEventListener('touchstart', handlePress, { passive: false });
    }

    getDirection() {
        return {
            up: this.activeButtons.has('up'),
            down: this.activeButtons.has('down'),
            left: this.activeButtons.has('left'),
            right: this.activeButtons.has('right')
        };
    }

    emitAction(action) {
        const event = new CustomEvent('touch-action', {
            detail: { action }
        });
        window.dispatchEvent(event);
    }
}

export const touchController = new TouchController();
