// Glengala Fresh - Gamification System
// Handles streaks, loyalty points, challenges, and rewards

class GamificationSystem {
    constructor() {
        this.apiBase = window.location.origin + '/api';
        this.userId = this.getUserId();
        this.userData = null;
        this.init();
    }

    getUserId() {
        return localStorage.getItem('glengala_user_id');
    }

    setUserId(id) {
        localStorage.setItem('glengala_user_id', id);
        this.userId = id;
    }

    async init() {
        if (this.userId) {
            await this.loadUserData();
            this.displayGamificationUI();
        }
    }

    async loadUserData() {
        try {
            const response = await fetch(`${this.apiBase}/user/${this.userId}`);
            this.userData = await response.json();
            return this.userData;
        } catch (error) {
            console.error('Failed to load user data:', error);
            return null;
        }
    }

    async registerUser(name, phone, address, postcode) {
        try {
            const response = await fetch(`${this.apiBase}/user/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone, address, postcode })
            });
            const data = await response.json();
            this.setUserId(data.user_id);
            await this.loadUserData();
            return data;
        } catch (error) {
            console.error('Failed to register user:', error);
            return null;
        }
    }

    displayGamificationUI() {
        if (!this.userData) return;

        const container = document.getElementById('gamification-container');
        if (!container) return;

        const html = `
            <div class="gamification-panel">
                <div class="user-stats">
                    <div class="stat-item">
                        <span class="stat-icon">🔥</span>
                        <span class="stat-value">${this.userData.current_streak}</span>
                        <span class="stat-label">Day Streak</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-icon">⭐</span>
                        <span class="stat-value">${this.userData.loyalty_points}</span>
                        <span class="stat-label">Points</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-icon">🎯</span>
                        <span class="stat-value">${this.userData.total_orders}</span>
                        <span class="stat-label">Orders</span>
                    </div>
                </div>

                <div class="streak-progress">
                    ${this.getStreakMessage()}
                </div>

                <div class="active-challenges">
                    ${this.renderChallenges()}
                </div>

                <div class="rewards-available">
                    ${this.renderRewards()}
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    getStreakMessage() {
        const streak = this.userData.current_streak;
        
        if (streak === 0) {
            return `<p>🌱 Start your streak! Order today to begin.</p>`;
        } else if (streak < 3) {
            return `<p>🔥 Keep it up! ${3 - streak} more day${3 - streak > 1 ? 's' : ''} to unlock a bonus!</p>`;
        } else if (streak < 7) {
            return `<p>🌟 Amazing! ${7 - streak} more day${7 - streak > 1 ? 's' : ''} to reach 7-day milestone!</p>`;
        } else {
            return `<p>🏆 Legendary ${streak}-day streak! You're a Glengala champion!</p>`;
        }
    }

    renderChallenges() {
        if (!this.userData.challenges || this.userData.challenges.length === 0) {
            return `<p class="no-challenges">No active challenges. Check back soon!</p>`;
        }

        return `
            <h4>🎯 Active Challenges</h4>
            ${this.userData.challenges.map(c => `
                <div class="challenge-card">
                    <div class="challenge-info">
                        <strong>${c.description}</strong>
                        <div class="challenge-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${(c.progress / c.target) * 100}%"></div>
                            </div>
                            <span>${c.progress}/${c.target}</span>
                        </div>
                    </div>
                    <div class="challenge-reward">
                        +${c.reward_points} pts
                    </div>
                </div>
            `).join('')}
        `;
    }

    renderRewards() {
        const points = this.userData.loyalty_points;
        const rewards = [
            { points: 100, reward: 'Free Bunch of Herbs', available: points >= 100 },
            { points: 250, reward: '$5 Off Next Order', available: points >= 250 },
            { points: 500, reward: 'Free Premium Produce', available: points >= 500 },
            { points: 1000, reward: 'Mystery Box', available: points >= 1000 }
        ];

        return `
            <h4>🎁 Rewards</h4>
            <div class="rewards-grid">
                ${rewards.map(r => `
                    <div class="reward-card ${r.available ? 'available' : 'locked'}">
                        <div class="reward-cost">${r.points} pts</div>
                        <div class="reward-name">${r.reward}</div>
                        ${r.available ? 
                            `<button class="redeem-btn" onclick="gamification.redeemReward(${r.points})">Redeem</button>` : 
                            `<span class="locked-label">🔒 Locked</span>`
                        }
                    </div>
                `).join('')}
            </div>
        `;
    }

    async redeemReward(pointCost) {
        if (!confirm(`Redeem reward for ${pointCost} points?`)) return;

        try {
            // Implement redemption logic
            alert('Reward redeemed! We\'ll add it to your next order.');
            await this.loadUserData();
            this.displayGamificationUI();
        } catch (error) {
            alert('Failed to redeem reward. Please try again.');
        }
    }

    // Streak bonus calculations
    getStreakBonus(streak) {
        if (streak >= 7) return 0.15; // 15% discount
        if (streak >= 3) return 0.10; // 10% discount
        return 0;
    }

    // Challenge system
    async createChallenge(userId, type, description, target, rewardPoints, expiryDays = 7) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + expiryDays);

        try {
            const response = await fetch(`${this.apiBase}/challenges`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    challenge_type: type,
                    description: description,
                    target: target,
                    reward_points: rewardPoints,
                    expires_at: expiryDate.toISOString()
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Failed to create challenge:', error);
        }
    }

    // Mystery box system
    generateMysteryBox() {
        const boxes = [
            { name: 'Veggie Surprise', items: ['Random vegetables', '3-5 items'], value: 15 },
            { name: 'Fruit Feast', items: ['Seasonal fruits', '4-6 items'], value: 20 },
            { name: 'Premium Box', items: ['Organic selection', 'Mixed produce'], value: 30 }
        ];
        return boxes[Math.floor(Math.random() * boxes.length)];
    }

    // Social sharing
    async shareOrder(orderDetails) {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Glengala Fresh Order',
                    text: `I just ordered fresh produce from Glengala Fresh! 🥬🍎`,
                    url: window.location.href
                });
                // Award bonus points for sharing
                this.userData.loyalty_points += 10;
                alert('Thanks for sharing! +10 bonus points!');
            } catch (error) {
                console.log('Share cancelled');
            }
        }
    }

    // Trending products
    async getTrendingProducts() {
        try {
            const response = await fetch(`${this.apiBase}/trending`);
            return await response.json();
        } catch (error) {
            console.error('Failed to load trending products:', error);
            return { trending: [] };
        }
    }

    // Daily special notification
    async checkDailySpecials() {
        try {
            const response = await fetch(`${this.apiBase}/daily-specials`);
            const data = await response.json();
            
            if (data.specials && data.specials.length > 0) {
                this.showSpecialsNotification(data.specials);
            }
        } catch (error) {
            console.error('Failed to check specials:', error);
        }
    }

    showSpecialsNotification(specials) {
        const specialsText = specials.map(s => s.name).slice(0, 3).join(', ');
        
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('🌟 Daily Specials Available!', {
                body: `Today's specials: ${specialsText} and more!`,
                icon: '/icon-192.png',
                badge: '/badge-72.png'
            });
        }
    }

    // Add to favorites
    async toggleFavorite(productId) {
        if (!this.userId) {
            alert('Please create an account to save favorites');
            return;
        }

        const isFavorite = this.userData.favorites.some(f => f.id === productId);

        try {
            if (isFavorite) {
                await fetch(`${this.apiBase}/favorites/${this.userId}/${productId}`, {
                    method: 'DELETE'
                });
            } else {
                await fetch(`${this.apiBase}/favorites`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: this.userId, product_id: productId })
                });
            }
            
            await this.loadUserData();
            return !isFavorite;
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
        }
    }

    isFavorite(productId) {
        return this.userData?.favorites?.some(f => f.id === productId) || false;
    }
}

// Initialize gamification system
const gamification = new GamificationSystem();

// Request notification permission on load
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}
