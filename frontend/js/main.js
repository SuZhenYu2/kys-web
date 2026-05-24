class GameClient {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.currentPlayer = null;
        this.otherPlayers = new Map();
        this.gameMap = new GameMap();
        this.renderer = null;
        this.inputHandler = null;
        this.gameSocket = null;
        this.lastUpdateTime = 0;
        this.positionUpdateInterval = 100;
        this.lastPositionUpdate = 0;
        this.gameLoop = null;
    }
    
    init() {
        this.canvas = document.getElementById('game-canvas');
        if (this.canvas) {
            this.renderer = new Renderer(this.canvas);
            this.inputHandler = new InputHandler(this);
            this.renderer.resize(Math.min(window.innerWidth, 1200), Math.min(window.innerHeight, 800));
        }
        
        this.setupEventListeners();
        this.checkAuth();
    }
    
    checkAuth() {
        const token = localStorage.getItem('token');
        if (token) {
            const username = localStorage.getItem('username');
            const nickname = localStorage.getItem('nickname');
            const playerId = localStorage.getItem('playerId');
            
            if (username && nickname) {
                this.currentPlayer = {
                    id: playerId,
                    username: username,
                    nickname: nickname,
                    level: 1,
                    hp: 1000,
                    hpMax: 1000,
                    mp: 500,
                    mpMax: 500,
                    x: 50,
                    y: 50
                };
                this.showGameUI();
                this.createDefaultMap();
                this.startGameLoop();
            }
        }
    }
    
    setupEventListeners() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
        
        const registerBtn = document.getElementById('register-btn');
        if (registerBtn) {
            registerBtn.addEventListener('click', () => {
                this.showRegisterPanel();
            });
        }
        
        const regCancel = document.getElementById('reg-cancel');
        if (regCancel) {
            regCancel.addEventListener('click', () => {
                this.showLoginPanel();
            });
        }
        
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }
        
        const chatSend = document.getElementById('chat-send');
        if (chatSend) {
            chatSend.addEventListener('click', () => {
                this.sendChatMessage();
            });
        }
        
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendChatMessage();
            });
        }
        
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }
        
        window.addEventListener('resize', () => {
            if (this.renderer) {
                this.renderer.resize(Math.min(window.innerWidth, 1200), Math.min(window.innerHeight, 800));
            }
        });
    }
    
    createDefaultMap() {
        for (let x = 0; x < 100; x++) {
            for (let y = 0; y < 100; y++) {
                let color = (x + y) % 2 === 0 ? '#3d5a4e' : '#4d6a5e';
                let walkable = true;
                
                if (x === 0 || x === 99 || y === 0 || y === 99) {
                    color = '#5a4a3e';
                    walkable = false;
                }
                
                if (x >= 40 && x <= 60 && y >= 40 && y <= 60) {
                    color = '#7a6a5e';
                }
                
                this.gameMap.tiles.push({
                    x: x,
                    y: y,
                    type: 'grass',
                    walkable: walkable,
                    solid: !walkable,
                    color: color
                });
            }
        }
    }
    
    startGameLoop() {
        this.lastUpdateTime = performance.now();
        this.gameLoop = requestAnimationFrame(() => this.update());
    }
    
    update() {
        const now = performance.now();
        const deltaTime = (now - this.lastUpdateTime) / 16;
        this.lastUpdateTime = now;
        
        if (this.inputHandler && this.currentPlayer) {
            const movement = this.inputHandler.getMovement();
            if (movement.dx !== 0 || movement.dy !== 0) {
                const newX = this.currentPlayer.x + movement.dx * 0.1;
                const newY = this.currentPlayer.y + movement.dy * 0.1;
                
                if (this.gameMap.isWalkable(Math.floor(newX), Math.floor(newY))) {
                    this.currentPlayer.x = Math.max(1, Math.min(newX, this.gameMap.width - 2));
                    this.currentPlayer.y = Math.max(1, Math.min(newY, this.gameMap.height - 2));
                    
                    if (now - this.lastPositionUpdate > this.positionUpdateInterval) {
                        this.lastPositionUpdate = now;
                    }
                }
            }
        }
        
        this.render();
        this.gameLoop = requestAnimationFrame(() => this.update());
    }
    
    render() {
        if (!this.renderer || !this.currentPlayer) return;
        
        this.renderer.clear();
        this.renderer.setCamera(
            this.currentPlayer.x, 
            this.currentPlayer.y, 
            this.gameMap.width, 
            this.gameMap.height
        );
        
        this.renderer.drawMap(this.gameMap);
        
        const player = new Player(
            this.currentPlayer.x, 
            this.currentPlayer.y, 
            this.currentPlayer.nickname
        );
        this.renderer.drawPlayer(player);
        
        const otherPlayerList = Array.from(this.otherPlayers.values());
        this.renderer.drawOtherPlayers(otherPlayerList);
        
        this.updatePlayerInfoUI();
    }
    
    updatePlayerInfoUI() {
        const infoElement = document.getElementById('player-info');
        if (infoElement && this.currentPlayer) {
            infoElement.innerHTML = `
                <div class="hp-bar">
                    <span class="label">HP</span>
                    <div class="bar-fill hp" style="width: ${(this.currentPlayer.hp/this.currentPlayer.hpMax)*100}%"></div>
                </div>
                <div class="mp-bar">
                    <span class="label">MP</span>
                    <div class="bar-fill mp" style="width: ${(this.currentPlayer.mp/this.currentPlayer.mpMax)*100}%"></div>
                </div>
                <div class="info-text">
                    ${this.currentPlayer.nickname} Lv.${this.currentPlayer.level}
                </div>
            `;
        }
    }
    
    showGameUI() {
        document.getElementById('login-panel').classList.add('hidden');
        document.getElementById('register-panel').classList.add('hidden');
        document.getElementById('game-container').classList.remove('hidden');
        this.addChatMessage('系统', '欢迎来到江湖，' + this.currentPlayer.nickname + '！', 'system');
        this.addChatMessage('系统', '使用 WASD 或方向键移动。', 'system');
    }
    
    showRegisterPanel() {
        document.getElementById('login-panel').classList.add('hidden');
        document.getElementById('register-panel').classList.remove('hidden');
    }
    
    showLoginPanel() {
        document.getElementById('register-panel').classList.add('hidden');
        document.getElementById('login-panel').classList.remove('hidden');
    }
    
    async handleLogin() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const errorElement = document.getElementById('login-error');
        
        if (!username || !password) {
            errorElement.textContent = '请填写用户名和密码';
            errorElement.classList.remove('hidden');
            return;
        }
        
        errorElement.classList.add('hidden');
        
        localStorage.setItem('token', 'test-token-' + Date.now());
        localStorage.setItem('playerId', '1');
        localStorage.setItem('username', username);
        localStorage.setItem('nickname', username);
        
        this.currentPlayer = {
            id: '1',
            username: username,
            nickname: username,
            level: 1,
            hp: 1000,
            hpMax: 1000,
            mp: 500,
            mpMax: 500,
            x: 50,
            y: 50
        };
        
        this.showGameUI();
        this.createDefaultMap();
        this.startGameLoop();
    }
    
    async handleRegister() {
        const username = document.getElementById('reg-username').value.trim();
        const password = document.getElementById('reg-password').value;
        const nickname = document.getElementById('reg-nickname').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const errorElement = document.getElementById('register-error');
        
        if (!username || !password || !nickname) {
            errorElement.textContent = '请填写必填项';
            errorElement.classList.remove('hidden');
            return;
        }
        
        if (username.length < 3 || username.length > 50) {
            errorElement.textContent = '用户名长度必须在3-50字符之间';
            errorElement.classList.remove('hidden');
            return;
        }
        
        if (password.length < 6) {
            errorElement.textContent = '密码长度必须至少6个字符';
            errorElement.classList.remove('hidden');
            return;
        }
        
        errorElement.classList.add('hidden');
        alert('注册成功！请登录');
        this.showLoginPanel();
        document.getElementById('username').value = username;
    }
    
    handleLogout() {
        localStorage.removeItem('token');
        localStorage.removeItem('playerId');
        localStorage.removeItem('username');
        localStorage.removeItem('nickname');
        
        this.currentPlayer = null;
        this.otherPlayers.clear();
        
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }
        
        document.getElementById('game-container').classList.add('hidden');
        document.getElementById('login-panel').classList.remove('hidden');
    }
    
    addChatMessage(sender, message, type) {
        const container = document.getElementById('chat-messages');
        if (!container) return;
        
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type || ''}`;
        messageEl.innerHTML = `<strong>${sender}:</strong> ${message}`;
        container.appendChild(messageEl);
        container.scrollTop = container.scrollHeight;
    }
    
    sendChatMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        if (message) {
            this.addChatMessage('你', message);
            input.value = '';
        }
    }
}

const API = {
    baseUrl: 'http://localhost:8080/api',
    
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };
        
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API请求失败:', error);
            throw error;
        }
    },
    
    auth: {
        async login(username, password) {
            return API.request('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });
        },
        
        async register(username, password, nickname, email) {
            return API.request('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ username, password, nickname, email })
            });
        },
        
        async health() {
            return API.request('/auth/health');
        }
    },
    
    player: {
        async getProfile() {
            return API.request('/player/profile');
        },
        
        async updatePosition(data) {
            return API.request('/player/position', {
                method: 'PUT',
                body: JSON.stringify(data)
            });
        }
    },
    
    game: {
        async getMap(mapId) {
            return API.request(`/game/map/${mapId}`);
        },
        
        async health() {
            return API.request('/game/health');
        }
    }
};

const gameClient = new GameClient();
document.addEventListener('DOMContentLoaded', () => {
    gameClient.init();
});
