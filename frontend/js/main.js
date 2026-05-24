class GameClient {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.currentPlayer = null;
        this.stompClient = null;
        this.otherPlayers = new Map();
        this.keys = {};
        this.lastUpdateTime = 0;
        this.positionUpdateInterval = 100;
    }

    init() {
        this.canvas = document.getElementById('game-canvas');
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.canvas.width = 1024;
            this.canvas.height = 768;
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
                    x: 1000,
                    y: 1000
                };
                this.showGameUI();
                this.connectGameWebSocket();
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

        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
    }

    async handleLogin() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const errorEl = document.getElementById('login-error');

        if (!username || !password) {
            errorEl.textContent = '请填写用户名和密码';
            errorEl.classList.remove('hidden');
            return;
        }

        errorEl.classList.add('hidden');

        try {
            const response = await API.auth.login(username, password);
            
            if (response.success) {
                const data = response.data;
                localStorage.setItem('token', data.token);
                localStorage.setItem('playerId', data.player.id);
                localStorage.setItem('username', data.player.username);
                localStorage.setItem('nickname', data.player.nickname);
                
                this.currentPlayer = {
                    id: data.player.id,
                    username: data.player.username,
                    nickname: data.player.nickname,
                    level: data.player.level,
                    hp: 1000,
                    hpMax: 1000,
                    mp: 500,
                    mpMax: 500,
                    x: 1000,
                    y: 1000
                };
                
                this.showGameUI();
                this.addChatMessage('系统', '欢迎来到江湖，' + data.player.nickname + '！', 'system');
                this.connectGameWebSocket();
            }
        } catch (error) {
            errorEl.textContent = error.message || '登录失败，请检查用户名和密码';
            errorEl.classList.remove('hidden');
        }
    }

    showRegisterPanel() {
        document.getElementById('login-panel').classList.add('hidden');
        document.getElementById('register-panel').classList.remove('hidden');
    }

    showLoginPanel() {
        document.getElementById('register-panel').classList.add('hidden');
        document.getElementById('login-panel').classList.remove('hidden');
        document.getElementById('register-error').classList.add('hidden');
    }

    async handleRegister() {
        const username = document.getElementById('reg-username').value.trim();
        const password = document.getElementById('reg-password').value;
        const nickname = document.getElementById('reg-nickname').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const errorEl = document.getElementById('register-error');

        if (!username || !password || !nickname) {
            errorEl.textContent = '请填写所有必填项';
            errorEl.classList.remove('hidden');
            return;
        }

        if (username.length < 3 || username.length > 50) {
            errorEl.textContent = '用户名长度必须在3-50字符之间';
            errorEl.classList.remove('hidden');
            return;
        }

        if (password.length < 6) {
            errorEl.textContent = '密码长度必须至少6个字符';
            errorEl.classList.remove('hidden');
            return;
        }

        if (nickname.length < 2 || nickname.length > 50) {
            errorEl.textContent = '昵称长度必须在2-50字符之间';
            errorEl.classList.remove('hidden');
            return;
        }

        errorEl.classList.add('hidden');

        try {
            const response = await API.auth.register(username, password, nickname, email);
            
            if (response.success) {
                alert('注册成功！请登录');
                this.showLoginPanel();
                document.getElementById('username').value = username;
            }
        } catch (error) {
            errorEl.textContent = error.message || '注册失败，请重试';
            errorEl.classList.remove('hidden');
        }
    }

    showGameUI() {
        document.getElementById('login-panel').classList.add('hidden');
        document.getElementById('register-panel').classList.add('hidden');
        document.getElementById('game-container').classList.remove('hidden');
        
        if (this.currentPlayer) {
            document.getElementById('player-info').textContent = 
                `${this.currentPlayer.nickname} (Lv.${this.currentPlayer.level})`;
        }
        
        this.startGameLoop();
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('playerId');
        localStorage.removeItem('username');
        localStorage.removeItem('nickname');
        
        if (this.stompClient) {
            this.stompClient.disconnect();
            this.stompClient = null;
        }
        
        this.currentPlayer = null;
        this.otherPlayers.clear();
        
        document.getElementById('game-container').classList.add('hidden');
        document.getElementById('login-panel').classList.remove('hidden');
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    }

    connectGameWebSocket() {
        const token = localStorage.getItem('token');
        if (!token) return;

        const socket = new SockJS('http://localhost:8080/ws');
        this.stompClient = StompJs.Stomp.over(socket);
        
        const headers = {
            'Authorization': `Bearer ${token}`
        };

        this.stompClient.connect(headers, (frame) => {
            console.log('Game WebSocket connected:', frame);
            this.addChatMessage('系统', '游戏服务器连接成功', 'system');
            this.subscribeToGameChannels();
        }, (error) => {
            console.error('Game WebSocket error:', error);
            this.addChatMessage('系统', '游戏服务器连接失败', 'system');
        });
    }

    subscribeToGameChannels() {
        if (!this.stompClient) return;

        this.stompClient.subscribe('/topic/world/chat', (message) => {
            const data = JSON.parse(message.body);
            this.addChatMessage(data.sender, data.message, 'world');
        });

        this.stompClient.subscribe('/topic/players/position', (message) => {
            const data = JSON.parse(message.body);
            this.updateOtherPlayerPosition(data);
        });

        this.stompClient.subscribe('/topic/system/notification', (message) => {
            const data = JSON.parse(message.body);
            this.addChatMessage('系统', data.message, 'system');
        });
    }

    updateOtherPlayerPosition(data) {
        if (!this.otherPlayers) this.otherPlayers = new Map();
        this.otherPlayers.set(data.playerId, {
            x: data.positionX,
            y: data.positionY,
            nickname: data.nickname
        });
    }

    addChatMessage(sender, message, type) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${type}`;
        msgDiv.innerHTML = `<span class="chat-sender">[${sender}]</span> ${message}`;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    sendChatMessage() {
        const chatInput = document.getElementById('chat-input');
        if (!chatInput) return;
        
        const message = chatInput.value.trim();
        if (!message || !this.stompClient) return;

        this.stompClient.send('/app/chat/world', {}, JSON.stringify({
            sender: this.currentPlayer.nickname,
            message: message
        }));

        chatInput.value = '';
    }

    startGameLoop() {
        const gameLoop = () => {
            this.update();
            this.render();
            requestAnimationFrame(gameLoop);
        };
        requestAnimationFrame(gameLoop);
    }

    update() {
        if (!this.currentPlayer) return;

        const speed = 5;
        if (this.keys['ArrowUp'] || this.keys['w']) this.currentPlayer.y -= speed;
        if (this.keys['ArrowDown'] || this.keys['s']) this.currentPlayer.y += speed;
        if (this.keys['ArrowLeft'] || this.keys['a']) this.currentPlayer.x -= speed;
        if (this.keys['ArrowRight'] || this.keys['d']) this.currentPlayer.x += speed;

        const now = Date.now();
        if (now - this.lastUpdateTime > this.positionUpdateInterval) {
            this.sendPositionUpdate();
            this.lastUpdateTime = now;
        }
    }

    sendPositionUpdate() {
        if (!this.stompClient || !this.currentPlayer) return;

        this.stompClient.send('/app/player/move', {}, JSON.stringify({
            playerId: this.currentPlayer.id,
            nickname: this.currentPlayer.nickname,
            mapId: 'xiangyang',
            positionX: this.currentPlayer.x,
            positionY: this.currentPlayer.y
        }));
    }

    render() {
        if (!this.ctx) return;

        this.ctx.fillStyle = '#2d5016';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.strokeStyle = '#1a3009';
        this.ctx.lineWidth = 1;
        for (let x = 0; x < this.canvas.width; x += 32) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        for (let y = 0; y < this.canvas.height; y += 32) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }

        this.otherPlayers.forEach((player) => {
            this.ctx.fillStyle = '#ffcc00';
            this.ctx.beginPath();
            this.ctx.arc(player.x, player.y, 15, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(player.nickname, player.x, player.y - 20);
        });

        if (this.currentPlayer) {
            this.ctx.fillStyle = '#00ff00';
            this.ctx.beginPath();
            this.ctx.arc(this.currentPlayer.x, this.currentPlayer.y, 15, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.currentPlayer.nickname, this.currentPlayer.x, this.currentPlayer.y - 20);
        }

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(10, 10, 200, 80);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';
        if (this.currentPlayer) {
            this.ctx.fillText(`HP: ${this.currentPlayer.hp}/${this.currentPlayer.hpMax}`, 20, 30);
            this.ctx.fillText(`MP: ${this.currentPlayer.mp}/${this.currentPlayer.mpMax}`, 20, 50);
            this.ctx.fillText(`等级: ${this.currentPlayer.level}`, 20, 70);
        }
    }
}

const game = new GameClient();
document.addEventListener('DOMContentLoaded', () => {
    game.init();
});
