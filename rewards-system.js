// Glengala Fresh - Rewards & Achievements System
// Client-side achievement tracking with localStorage

class GlengalaRewards {
    constructor() {
        this.storageKeys = {
            stats: 'glengala_rewards_stats',
            achievements: 'glengala_achievements',
            rewards: 'glengala_active_rewards'
        };
        
        // Achievement definitions
        this.achievementDefs = [
            // === EARLY WINS (Easy to achieve) ===
            {
                id: 'first_order',
                name: 'First Harvest',
                description: 'Place your first order',
                icon: '🌱',
                condition: stats => stats.ordersCount >= 1,
                reward: { type: 'free_delivery', uses: 1 }
            },
            {
                id: 'getting_started',
                name: 'Getting Started',
                description: 'Spend $30 total',
                icon: '🚀',
                condition: stats => stats.totalSpent >= 30,
                reward: { type: 'bonus', description: 'You\'re on your way!' }
            },
            {
                id: 'try_three',
                name: 'Explorer',
                description: 'Order from 3 different categories',
                icon: '🧭',
                condition: stats => stats.categoriesOrdered >= 3,
                reward: { type: 'free_delivery', uses: 1 }
            },
            
            // === ORDER MILESTONES ===
            {
                id: 'third_order',
                name: 'Coming Back',
                description: 'Complete 3 orders',
                icon: '🔄',
                condition: stats => stats.ordersCount >= 3,
                reward: { type: 'free_delivery', uses: 1 }
            },
            {
                id: 'local_supporter',
                name: 'Local Supporter',
                description: 'Complete 5 orders',
                icon: '🏠',
                condition: stats => stats.ordersCount >= 5,
                reward: { type: 'free_delivery', uses: 1 }
            },
            {
                id: 'glengala_regular',
                name: 'Glengala Regular',
                description: 'Complete 10 orders',
                icon: '⭐',
                condition: stats => stats.ordersCount >= 10,
                reward: { type: 'free_delivery', uses: 2 }
            },
            {
                id: 'glengala_champion',
                name: 'Glengala Champion',
                description: 'Complete 20 orders',
                icon: '🏆',
                condition: stats => stats.ordersCount >= 20,
                reward: { type: 'vip', description: 'VIP Status unlocked!' }
            },
            
            // === SPENDING MILESTONES ===
            {
                id: 'centurion',
                name: 'Centurion',
                description: 'Spend $100 total',
                icon: '💯',
                condition: stats => stats.totalSpent >= 100,
                reward: { type: 'free_delivery', uses: 1 }
            },
            {
                id: 'super_shopper',
                name: 'Super Shopper',
                description: 'Spend $250 total',
                icon: '💎',
                condition: stats => stats.totalSpent >= 250,
                reward: { type: 'free_delivery', uses: 2 }
            },
            {
                id: 'big_spender',
                name: 'Big Spender',
                description: 'Spend $500 total',
                icon: '👑',
                condition: stats => stats.totalSpent >= 500,
                reward: { type: 'free_delivery', uses: 3 }
            },
            
            // === ORDER SIZE ===
            {
                id: 'nice_haul',
                name: 'Nice Haul',
                description: 'Place an order over $40',
                icon: '🛍️',
                condition: stats => stats.largestOrder >= 40,
                reward: { type: 'bonus', description: 'Great shopping!' }
            },
            {
                id: 'big_basket',
                name: 'Big Basket',
                description: 'Place an order over $60',
                icon: '🧺',
                condition: stats => stats.largestOrder >= 60,
                reward: { type: 'free_delivery', uses: 1 }
            },
            {
                id: 'mega_order',
                name: 'Mega Order',
                description: 'Place an order over $100',
                icon: '🎉',
                condition: stats => stats.largestOrder >= 100,
                reward: { type: 'free_delivery', uses: 1 }
            },
            
            // === CATEGORY ACHIEVEMENTS ===
            {
                id: 'veggie_starter',
                name: 'Veggie Starter',
                description: 'Buy 5 vegetable items',
                icon: '🥕',
                condition: stats => stats.veggiesBought >= 5,
                reward: { type: 'bonus', description: 'Eating your greens!' }
            },
            {
                id: 'veggie_lover',
                name: 'Veggie Lover',
                description: 'Buy 20 vegetable items',
                icon: '🥬',
                condition: stats => stats.veggiesBought >= 20,
                reward: { type: 'free_delivery', uses: 1 }
            },
            {
                id: 'fruit_starter',
                name: 'Fruit Starter',
                description: 'Buy 5 fruit items',
                icon: '🍊',
                condition: stats => stats.fruitsBought >= 5,
                reward: { type: 'bonus', description: 'Fruity!' }
            },
            {
                id: 'fruit_fan',
                name: 'Fruit Fan',
                description: 'Buy 15 fruit items',
                icon: '🍎',
                condition: stats => stats.fruitsBought >= 15,
                reward: { type: 'free_delivery', uses: 1 }
            },
            {
                id: 'herb_enthusiast',
                name: 'Herb Enthusiast',
                description: 'Buy 10 herb items',
                icon: '🌿',
                condition: stats => stats.herbsBought >= 10,
                reward: { type: 'free_delivery', uses: 1 }
            },
            {
                id: 'nutty',
                name: 'Going Nutty',
                description: 'Buy 5 nut items',
                icon: '🥜',
                condition: stats => stats.nutsBought >= 5,
                reward: { type: 'bonus', description: 'Nutty for nuts!' }
            },
            {
                id: 'variety_seeker',
                name: 'Variety Seeker',
                description: 'Order from all 5 categories',
                icon: '🌈',
                condition: stats => stats.categoriesOrdered >= 5,
                reward: { type: 'free_delivery', uses: 1 }
            },
            
            // === STREAKS ===
            {
                id: 'two_week_streak',
                name: 'Twice in a Row',
                description: 'Order 2 weeks in a row',
                icon: '📆',
                condition: stats => stats.weeklyStreak >= 2,
                reward: { type: 'bonus', description: 'Keep it up!' }
            },
            {
                id: 'weekly_regular',
                name: 'Weekly Regular',
                description: 'Order 4 weeks in a row',
                icon: '📅',
                condition: stats => stats.weeklyStreak >= 4,
                reward: { type: 'free_delivery', uses: 1 }
            },
            {
                id: 'monthly_legend',
                name: 'Monthly Legend',
                description: 'Order 8 weeks in a row',
                icon: '🗓️',
                condition: stats => stats.weeklyStreak >= 8,
                reward: { type: 'free_delivery', uses: 2 }
            },
            
            // === SPECIAL ===
            {
                id: 'early_bird',
                name: 'Early Bird',
                description: 'Place an order before 10am',
                icon: '🐦',
                condition: stats => stats.earlyOrders >= 1,
                reward: { type: 'bonus', description: 'Early shopper!' }
            },
            {
                id: 'night_owl',
                name: 'Night Owl',
                description: 'Place an order after 7pm',
                icon: '🦉',
                condition: stats => stats.lateOrders >= 1,
                reward: { type: 'bonus', description: 'Last minute shopper!' }
            }
        ];

        this.init();
    }

    init() {
        // Ensure stats exist
        if (!this.getStats()) {
            this.saveStats(this.getDefaultStats());
        }
        if (!this.getAchievements()) {
            this.saveAchievements([]);
        }
        if (!this.getActiveRewards()) {
            this.saveActiveRewards([]);
        }
    }

    getDefaultStats() {
        return {
            ordersCount: 0,
            totalSpent: 0,
            itemsBought: 0,
            largestOrder: 0,
            veggiesBought: 0,
            fruitsBought: 0,
            herbsBought: 0,
            nutsBought: 0,
            juicesBought: 0,
            categoriesOrdered: 0,
            categoriesSet: [],
            weeklyStreak: 0,
            lastOrderWeek: null,
            earlyOrders: 0,
            lateOrders: 0,
            orderHistory: []
        };
    }

    // Storage methods
    getStats() {
        const data = localStorage.getItem(this.storageKeys.stats);
        return data ? JSON.parse(data) : null;
    }

    saveStats(stats) {
        localStorage.setItem(this.storageKeys.stats, JSON.stringify(stats));
    }

    getAchievements() {
        const data = localStorage.getItem(this.storageKeys.achievements);
        return data ? JSON.parse(data) : null;
    }

    saveAchievements(achievements) {
        localStorage.setItem(this.storageKeys.achievements, JSON.stringify(achievements));
    }

    getActiveRewards() {
        const data = localStorage.getItem(this.storageKeys.rewards);
        return data ? JSON.parse(data) : null;
    }

    saveActiveRewards(rewards) {
        localStorage.setItem(this.storageKeys.rewards, JSON.stringify(rewards));
    }

    // Update stats after an order
    updateStats(order) {
        const stats = this.getStats();
        const now = new Date();
        const currentWeek = this.getWeekNumber(now);

        // Basic counts
        stats.ordersCount++;
        stats.totalSpent += order.total || 0;
        stats.itemsBought += order.items?.length || 0;
        
        // Largest order
        if ((order.total || 0) > stats.largestOrder) {
            stats.largestOrder = order.total;
        }

        // Category counts
        const categoriesSeen = new Set();
        (order.items || []).forEach(item => {
            const category = item.category || 'other';
            categoriesSeen.add(category);
            
            switch(category) {
                case 'vegetables':
                    stats.veggiesBought += item.quantity || 1;
                    break;
                case 'fruits':
                    stats.fruitsBought += item.quantity || 1;
                    break;
                case 'herbs':
                    stats.herbsBought += item.quantity || 1;
                    break;
                case 'nuts':
                    stats.nutsBought += item.quantity || 1;
                    break;
            }
        });
        
        stats.categoriesOrdered = Math.max(stats.categoriesOrdered, categoriesSeen.size);

        // Weekly streak
        if (stats.lastOrderWeek === null) {
            stats.weeklyStreak = 1;
        } else if (currentWeek === stats.lastOrderWeek + 1) {
            stats.weeklyStreak++;
        } else if (currentWeek !== stats.lastOrderWeek) {
            stats.weeklyStreak = 1; // Reset if missed a week
        }
        stats.lastOrderWeek = currentWeek;

        // Order history
        stats.orderHistory.push({
            date: now.toISOString(),
            total: order.total,
            items: order.items?.length || 0
        });

        this.saveStats(stats);
        
        // Check for new achievements
        return this.checkAchievements();
    }

    getWeekNumber(date) {
        const start = new Date(date.getFullYear(), 0, 1);
        const days = Math.floor((date - start) / (24 * 60 * 60 * 1000));
        return Math.ceil((days + 1) / 7);
    }

    // Check for newly unlocked achievements
    checkAchievements() {
        const stats = this.getStats();
        const earnedAchievements = this.getAchievements();
        const earnedIds = new Set(earnedAchievements.map(a => a.id));
        const newlyUnlocked = [];

        for (const achievement of this.achievementDefs) {
            if (!earnedIds.has(achievement.id) && achievement.condition(stats)) {
                const earned = {
                    id: achievement.id,
                    earnedAt: new Date().toISOString()
                };
                earnedAchievements.push(earned);
                newlyUnlocked.push(achievement);

                // Grant reward
                if (achievement.reward.type === 'free_delivery') {
                    this.grantFreeDelivery(achievement.reward.uses);
                }
            }
        }

        this.saveAchievements(earnedAchievements);
        return newlyUnlocked;
    }

    // Grant free delivery reward
    grantFreeDelivery(uses = 1) {
        const rewards = this.getActiveRewards();
        rewards.push({
            type: 'free_delivery',
            uses: uses,
            grantedAt: new Date().toISOString()
        });
        this.saveActiveRewards(rewards);
    }

    // Check if free delivery is available
    hasFreeDelivery() {
        const rewards = this.getActiveRewards();
        return rewards.some(r => r.type === 'free_delivery' && r.uses > 0);
    }

    // Use a free delivery reward
    useFreeDelivery() {
        const rewards = this.getActiveRewards();
        const freeDelivery = rewards.find(r => r.type === 'free_delivery' && r.uses > 0);
        
        if (freeDelivery) {
            freeDelivery.uses--;
            if (freeDelivery.uses <= 0) {
                const index = rewards.indexOf(freeDelivery);
                rewards.splice(index, 1);
            }
            this.saveActiveRewards(rewards);
            return true;
        }
        return false;
    }

    // Get count of free deliveries available
    getFreeDeliveryCount() {
        const rewards = this.getActiveRewards();
        return rewards
            .filter(r => r.type === 'free_delivery')
            .reduce((sum, r) => sum + r.uses, 0);
    }

    // Get achievement progress for display
    getAchievementProgress() {
        const stats = this.getStats();
        const earnedAchievements = this.getAchievements();
        const earnedIds = new Set(earnedAchievements.map(a => a.id));

        return this.achievementDefs.map(def => {
            const earned = earnedIds.has(def.id);
            const earnedData = earnedAchievements.find(a => a.id === def.id);
            
            // Calculate progress percentage based on achievement type
            let progress = 0;
            if (earned) {
                progress = 100;
            } else {
                // Order count achievements
                if (['first_order', 'third_order', 'local_supporter', 'glengala_regular', 'glengala_champion'].includes(def.id)) {
                    const targets = { first_order: 1, third_order: 3, local_supporter: 5, glengala_regular: 10, glengala_champion: 20 };
                    progress = Math.min(100, (stats.ordersCount / targets[def.id]) * 100);
                }
                // Spending achievements
                else if (['getting_started', 'centurion', 'super_shopper', 'big_spender'].includes(def.id)) {
                    const targets = { getting_started: 30, centurion: 100, super_shopper: 250, big_spender: 500 };
                    progress = Math.min(100, (stats.totalSpent / targets[def.id]) * 100);
                }
                // Order size achievements
                else if (['nice_haul', 'big_basket', 'mega_order'].includes(def.id)) {
                    const targets = { nice_haul: 40, big_basket: 60, mega_order: 100 };
                    progress = Math.min(100, (stats.largestOrder / targets[def.id]) * 100);
                }
                // Category achievements
                else if (['try_three', 'variety_seeker'].includes(def.id)) {
                    const targets = { try_three: 3, variety_seeker: 5 };
                    progress = Math.min(100, (stats.categoriesOrdered / targets[def.id]) * 100);
                }
                // Veggie achievements
                else if (['veggie_starter', 'veggie_lover'].includes(def.id)) {
                    const targets = { veggie_starter: 5, veggie_lover: 20 };
                    progress = Math.min(100, (stats.veggiesBought / targets[def.id]) * 100);
                }
                // Fruit achievements
                else if (['fruit_starter', 'fruit_fan'].includes(def.id)) {
                    const targets = { fruit_starter: 5, fruit_fan: 15 };
                    progress = Math.min(100, (stats.fruitsBought / targets[def.id]) * 100);
                }
                // Herb achievement
                else if (def.id === 'herb_enthusiast') {
                    progress = Math.min(100, (stats.herbsBought / 10) * 100);
                }
                // Nut achievement
                else if (def.id === 'nutty') {
                    progress = Math.min(100, (stats.nutsBought / 5) * 100);
                }
                // Streak achievements
                else if (['two_week_streak', 'weekly_regular', 'monthly_legend'].includes(def.id)) {
                    const targets = { two_week_streak: 2, weekly_regular: 4, monthly_legend: 8 };
                    progress = Math.min(100, (stats.weeklyStreak / targets[def.id]) * 100);
                }
                // Time-based achievements
                else if (def.id === 'early_bird') {
                    progress = stats.earlyOrders >= 1 ? 100 : 0;
                }
                else if (def.id === 'night_owl') {
                    progress = stats.lateOrders >= 1 ? 100 : 0;
                }
            }

            return {
                ...def,
                earned,
                earnedAt: earnedData?.earnedAt,
                progress: Math.round(progress)
            };
        });
    }

    // Show achievement unlocked popup
    showAchievementPopup(achievement) {
        const popup = document.createElement('div');
        popup.className = 'achievement-popup';
        popup.innerHTML = `
            <div class="achievement-popup-content">
                <div class="achievement-popup-icon">${achievement.icon}</div>
                <div class="achievement-popup-text">
                    <div class="achievement-popup-title">Achievement Unlocked!</div>
                    <div class="achievement-popup-name">${achievement.name}</div>
                    <div class="achievement-popup-desc">${achievement.description}</div>
                    ${achievement.reward.type === 'free_delivery' ? 
                        `<div class="achievement-popup-reward">🎉 +${achievement.reward.uses} Free Delivery!</div>` : 
                        `<div class="achievement-popup-reward">${achievement.reward.description || ''}</div>`
                    }
                </div>
            </div>
        `;
        document.body.appendChild(popup);

        // Animate in
        requestAnimationFrame(() => popup.classList.add('visible'));

        // Auto dismiss
        setTimeout(() => {
            popup.classList.remove('visible');
            setTimeout(() => popup.remove(), 500);
        }, 4000);

        // Click to dismiss
        popup.addEventListener('click', () => {
            popup.classList.remove('visible');
            setTimeout(() => popup.remove(), 500);
        });
    }

    // Show multiple achievements
    showNewAchievements(achievements) {
        achievements.forEach((achievement, index) => {
            setTimeout(() => this.showAchievementPopup(achievement), index * 1500);
        });
    }

    // Render rewards panel UI
    renderRewardsPanel() {
        const stats = this.getStats();
        const achievements = this.getAchievementProgress();
        const freeDeliveries = this.getFreeDeliveryCount();
        const earned = achievements.filter(a => a.earned);
        const locked = achievements.filter(a => !a.earned);

        return `
            <div class="rewards-panel">
                <div class="rewards-header">
                    <h2>🏆 Your Rewards</h2>
                    <button class="rewards-close" onclick="glengalaRewards.closeRewardsPanel()">✕</button>
                </div>

                <div class="rewards-summary">
                    <div class="rewards-stat">
                        <span class="rewards-stat-value">${stats.ordersCount}</span>
                        <span class="rewards-stat-label">Orders</span>
                    </div>
                    <div class="rewards-stat">
                        <span class="rewards-stat-value">$${stats.totalSpent.toFixed(0)}</span>
                        <span class="rewards-stat-label">Total Spent</span>
                    </div>
                    <div class="rewards-stat highlight">
                        <span class="rewards-stat-value">${freeDeliveries}</span>
                        <span class="rewards-stat-label">Free Deliveries</span>
                    </div>
                </div>

                ${freeDeliveries > 0 ? `
                    <div class="rewards-notice">
                        <span>🚚</span>
                        <span>You have ${freeDeliveries} free deliver${freeDeliveries > 1 ? 'ies' : 'y'} available!</span>
                    </div>
                ` : ''}

                <div class="achievements-section">
                    <h3>Achievements (${earned.length}/${achievements.length})</h3>
                    
                    <div class="achievements-list">
                        ${earned.map(a => `
                            <div class="achievement-card earned">
                                <div class="achievement-icon">${a.icon}</div>
                                <div class="achievement-info">
                                    <div class="achievement-name">${a.name}</div>
                                    <div class="achievement-desc">${a.description}</div>
                                </div>
                                <div class="achievement-check">✓</div>
                            </div>
                        `).join('')}

                        ${locked.map(a => `
                            <div class="achievement-card locked">
                                <div class="achievement-icon">${a.icon}</div>
                                <div class="achievement-info">
                                    <div class="achievement-name">${a.name}</div>
                                    <div class="achievement-desc">${a.description}</div>
                                    <div class="achievement-progress-bar">
                                        <div class="achievement-progress-fill" style="width: ${a.progress}%"></div>
                                    </div>
                                </div>
                                <div class="achievement-lock">🔒</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // Open rewards panel
    openRewardsPanel() {
        // Remove existing
        this.closeRewardsPanel();

        const overlay = document.createElement('div');
        overlay.id = 'rewardsPanelOverlay';
        overlay.className = 'rewards-panel-overlay';
        overlay.innerHTML = this.renderRewardsPanel();
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.closeRewardsPanel();
        });
        document.body.appendChild(overlay);

        requestAnimationFrame(() => overlay.classList.add('visible'));
    }

    // Close rewards panel
    closeRewardsPanel() {
        const overlay = document.getElementById('rewardsPanelOverlay');
        if (overlay) {
            overlay.classList.remove('visible');
            setTimeout(() => overlay.remove(), 300);
        }
    }

    // Reset for testing
    reset() {
        Object.values(this.storageKeys).forEach(key => {
            localStorage.removeItem(key);
        });
        this.init();
        console.log('Rewards system reset.');
    }

    // Demo: simulate an order for testing
    simulateOrder(total = 45) {
        const order = {
            total: total,
            items: [
                { name: 'Carrots', category: 'vegetables', quantity: 2 },
                { name: 'Apples', category: 'fruits', quantity: 3 },
                { name: 'Basil', category: 'herbs', quantity: 1 }
            ]
        };
        const newAchievements = this.updateStats(order);
        if (newAchievements.length > 0) {
            this.showNewAchievements(newAchievements);
        }
        console.log('Order simulated. New achievements:', newAchievements.map(a => a.name));
        return newAchievements;
    }
}

// Initialize
const glengalaRewards = new GlengalaRewards();
