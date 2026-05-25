class WebSocketClient {
    constructor(url, gameClient) {
        this.url = url;
        this.gameClient = gameClient;
        this.socket = null;
        this.connected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
        this.otherPlayers = new Map();
    }

    connect() {
        try {
            const isSecure = window.location.protocol === 'https:';
            let wsUrl = this.url;
            
            if (isSecure && wsUrl.startsWith('http:')) {
                wsUrl = wsUrl.replace('http:', 'https:');
            }
            
            this.socket = new SockJS(wsUrl);

            this.socket.onopen = () => {
                console.log('WebSocket connected');
                this.connected = true;
                this.reconnectAttempts = 0;
                this.gameClient.addChatMessage('系统', '已连接到游戏服务器', 'system');
            };

            this.socket.onmessage = (e) => {
                try {
                    const data = JSON.parse(e.data);
                    this.handleMessage(data);
                } catch (err) {
                    console.error('Error parsing message:', err);
                }
            };

            this.socket.onclose = () => {
                console.log('WebSocket disconnected');
                this.connected = false;
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    setTimeout(() => this.reconnect(), this.reconnectDelay);
                }
            };

            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.connected = false;
            };
        } catch (err) {
            console.error('Error connecting to WebSocket:', err);
            this.connected = false;
        }
    }

    reconnect() {
        this.reconnectAttempts++;
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        this.connect();
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        this.connected = false;
        this.otherPlayers.clear();
    }

    sendMove(x, y) {
        if (this.connected) {
            const message = {
                type: 'move',
                x: Math.floor(x),
                y: Math.floor(y)
            };
            this.socket.send(JSON.stringify(message));
        }
    }

    sendChat(message) {
        if (this.connected) {
            const chatMessage = {
                type: 'chat',
                message: message
            };
            this.socket.send(JSON.stringify(chatMessage));
        }
    }

    handleMessage(data) {
        const type = data.type;
        const playerData = data.data;

        switch (type) {
            case 'PLAYER_JOIN':
                this.handlePlayerJoin(playerData);
                break;
            case 'PLAYER_LEAVE':
                this.handlePlayerLeave(playerData);
                break;
            case 'PLAYER_MOVE':
                this.handlePlayerMove(playerData);
                break;
            case 'CHAT':
                this.handleChatMessage(playerData);
                break;
        }
    }

    handlePlayerJoin(playerData) {
        if (!playerData || !playerData.id) return;
        
        const existingPlayer = this.otherPlayers.get(playerData.id);
        if (existingPlayer) {
            existingPlayer.x = playerData.x;
            existingPlayer.y = playerData.y;
            existingPlayer.nickname = playerData.nickname;
            existingPlayer.level = playerData.level;
        } else {
            const otherPlayer = new OtherPlayer(
                playerData.id,
                playerData.x,
                playerData.y,
                playerData.nickname,
                playerData.level
            );
            this.otherPlayers.set(playerData.id, otherPlayer);
            
            this.gameClient.addChatMessage(
                '系统', 
                `${playerData.nickname} 加入了游戏`, 
                'system'
            );
        }
    }

    handlePlayerLeave(playerData) {
        if (!playerData || !playerData.id) return;
        
        const player = this.otherPlayers.get(playerData.id);
        if (player) {
            this.otherPlayers.delete(playerData.id);
            this.gameClient.addChatMessage(
                '系统', 
                `${playerData.nickname} 离开了游戏`, 
                'system'
            );
        }
    }

    handlePlayerMove(playerData) {
        if (!playerData || !playerData.id) return;
        
        const player = this.otherPlayers.get(playerData.id);
        if (player) {
            player.moveTo(playerData.x, playerData.y);
        }
    }

    handleChatMessage(data) {
        if (data && data.sender && data.message) {
            this.gameClient.addChatMessage(data.sender, data.message, 'chat');
        }
    }

    getOtherPlayers() {
        return Array.from(this.otherPlayers.values());
    }

    update(deltaTime) {
        this.otherPlayers.forEach(player => {
            player.update(deltaTime);
        });
    }
}
