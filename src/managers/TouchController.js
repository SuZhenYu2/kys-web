export class TouchController {
    constructor() {
        this.joystickActive = false;
        this.joystickStartX = 0;
        this.joystickStartY = 0;
        this.direction = { up: false, down: false, left: false, right: false };
        
        this.init();
    }

    init() {
        this.setupJoystick();
        this.setupActionButtons();
    }

    setupJoystick() {
        const joystickArea = document.getElementById('joystick-area');
        const joystickStick = document.getElementById('joystick-stick');
        
        if (!joystickArea || !joystickStick) return;

        const startHandler = (e) => {
            e.preventDefault();
            this.joystickActive = true;
            joystickStick.classList.add('active');
            
            const touch = e.touches ? e.touches[0] : e;
            const rect = joystickArea.getBoundingClientRect();
            this.joystickStartX = rect.left + rect.width / 2;
            this.joystickStartY = rect.top + rect.height / 2;
            
            this.handleJoystickMove(touch.clientX, touch.clientY);
        };

        const moveHandler = (e) => {
            if (!this.joystickActive) return;
            e.preventDefault();
            
            const touch = e.touches ? e.touches[0] : e;
            this.handleJoystickMove(touch.clientX, touch.clientY);
        };

        const endHandler = (e) => {
            if (!this.joystickActive) return;
            e.preventDefault();
            
            this.joystickActive = false;
            joystickStick.classList.remove('active');
            this.resetJoystick();
        };

        joystickArea.addEventListener('mousedown', startHandler);
        joystickArea.addEventListener('touchstart', startHandler, { passive: false });
        
        document.addEventListener('mousemove', moveHandler);
        document.addEventListener('touchmove', moveHandler, { passive: false });
        
        document.addEventListener('mouseup', endHandler);
        document.addEventListener('touchend', endHandler);
        document.addEventListener('touchcancel', endHandler);
    }

    handleJoystickMove(x, y) {
        const joystickStick = document.getElementById('joystick-stick');
        const joystickArea = document.getElementById('joystick-area');
        
        if (!joystickStick || !joystickArea) return;

        const rect = joystickArea.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        let dx = x - centerX;
        let dy = y - centerY;
        
        const maxDistance = 40;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > maxDistance) {
            const ratio = maxDistance / distance;
            dx *= ratio;
            dy *= ratio;
        }

        joystickStick.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

        const deadzone = 10;
        this.direction.up = dy < -deadzone;
        this.direction.down = dy > deadzone;
        this.direction.left = dx < -deadzone;
        this.direction.right = dx > deadzone;
    }

    resetJoystick() {
        const joystickStick = document.getElementById('joystick-stick');
        if (joystickStick) {
            joystickStick.style.transform = 'translate(-50%, -50%)';
        }
        this.direction = { up: false, down: false, left: false, right: false };
    }

    setupActionButtons() {
        const buttons = {
            'btn-interact': 'interact',
            'btn-menu': 'menu',
            'btn-inventory': 'inventory',
            'btn-skill': 'skill',
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

        btn.addEventListener('mousedown', handlePress);
        btn.addEventListener('touchstart', handlePress, { passive: false });
        
        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
        });
    }

    getDirection() {
        return this.direction;
    }

    emitAction(action) {
        const event = new CustomEvent('touch-action', {
            detail: { action }
        });
        window.dispatchEvent(event);
    }

    setBattleMode(active) {
        const exploreControls = document.getElementById('explore-controls');
        const battleControls = document.getElementById('battle-controls');
        
        if (exploreControls) {
            exploreControls.style.display = active ? 'none' : 'flex';
        }
        
        if (battleControls) {
            battleControls.classList.toggle('active', active);
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
