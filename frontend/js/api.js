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
            
            if (!response.ok) {
                throw new Error(data.message || '请求失败');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
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

        async updatePosition(mapId, x, y) {
            return API.request('/player/position', {
                method: 'PUT',
                body: JSON.stringify({ mapId, positionX: x, positionY: y })
            });
        }
    }
};
