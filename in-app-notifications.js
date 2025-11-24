// In-App Notification System
// Shows price changes when user opens the app (even if push notifications disabled)

class InAppNotificationManager {
    constructor() {
        this.lastCheckKey = 'glengala_last_price_check';
        this.seenChangesKey = 'glengala_seen_changes';
        this.apiBase = window.location.origin + '/api';
        this.notificationContainer = null;
        this.priceChanges = [];
    }

    async init() {
        // Check for price changes when app opens
        await this.checkForPriceChanges();
        
        // Create notification UI container
        this.createNotificationUI();
        
        // Show any unseen changes
        this.showPendingNotifications();
    }

    async checkForPriceChanges() {
        try {
            // Get last check timestamp from localStorage
            let lastCheck = localStorage.getItem(this.lastCheckKey);
            
            // First time user - set to now so they only see future changes
            if (!lastCheck) {
                lastCheck = new Date().toISOString();
                localStorage.setItem(this.lastCheckKey, lastCheck);
                console.log('🆕 First time user - will track price changes from now on');
                this.priceChanges = [];
                return;
            }
            
            // Fetch price changes since last check
            const response = await fetch(`${this.apiBase}/price-changes?since=${lastCheck}`);
            if (!response.ok) throw new Error('Failed to fetch price changes');
            
            const data = await response.json();
            const changes = Array.isArray(data) ? data : (data.changes || []);
            
            // Filter out already seen changes
            const seenChanges = JSON.parse(localStorage.getItem(this.seenChangesKey) || '[]');
            this.priceChanges = changes.filter(change => !seenChanges.includes(change.id));
            
            // Update last check time
            localStorage.setItem(this.lastCheckKey, new Date().toISOString());
            
            console.log(`📊 Found ${this.priceChanges.length} new price changes`);
        } catch (error) {
            console.error('Error checking price changes:', error);
            this.priceChanges = [];
        }
    }

    createNotificationUI() {
        // Create floating notification container
        this.notificationContainer = document.createElement('div');
        this.notificationContainer.className = 'in-app-notifications';
        this.notificationContainer.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 10000;
            max-width: 350px;
            max-height: 80vh;
            overflow-y: auto;
            pointer-events: none;
        `;
        document.body.appendChild(this.notificationContainer);
    }

    showPendingNotifications() {
        if (this.priceChanges.length === 0) return;

        // Mark all as seen immediately to prevent showing again on refresh
        this.markAllAsSeen();

        // Group by increase/decrease
        const increases = this.priceChanges.filter(c => c.new_price > c.old_price);
        const decreases = this.priceChanges.filter(c => c.new_price < c.old_price);

        // Show summary notification
        if (this.priceChanges.length > 3) {
            this.showSummaryNotification(increases.length, decreases.length);
        } else {
            // Show individual notifications
            this.priceChanges.forEach((change, index) => {
                setTimeout(() => this.showNotification(change), index * 300);
            });
        }
    }

    showSummaryNotification(increases, decreases) {
        const notification = document.createElement('div');
        notification.className = 'in-app-notification summary';
        notification.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px;
            margin-bottom: 10px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            pointer-events: auto;
            cursor: pointer;
            animation: slideIn 0.3s ease-out;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        `;

        const priceIcon = decreases > 0 ? '📉' : '📈';
        const message = decreases > 0 
            ? `${decreases} price drop${decreases > 1 ? 's' : ''}!`
            : `${increases} price update${increases > 1 ? 's' : ''}`;

        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="font-size: 32px;">${priceIcon}</div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; font-size: 16px; margin-bottom: 4px;">
                        ${this.priceChanges.length} Price Changes
                    </div>
                    <div style="font-size: 14px; opacity: 0.9;">
                        ${message} • Tap to view
                    </div>
                </div>
                <button class="close-notification" style="
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 16px;
                    line-height: 1;
                ">×</button>
            </div>
        `;

        // Click to show details
        notification.addEventListener('click', (e) => {
            if (!e.target.classList.contains('close-notification')) {
                this.showDetailedNotifications();
            }
        });

        // Close button
        notification.querySelector('.close-notification').addEventListener('click', (e) => {
            e.stopPropagation();
            this.dismissNotification(notification);
        });

        
        this.notificationContainer.appendChild(notification);
    }    showDetailedNotifications() {
        // Clear summary
        this.notificationContainer.innerHTML = '';
        
        // Show individual notifications
        this.priceChanges.forEach((change, index) => {
            setTimeout(() => this.showNotification(change), index * 200);
        });
    }

    showNotification(change) {
        const priceChange = change.new_price - change.old_price;
        const isIncrease = priceChange > 0;
        const percentage = ((Math.abs(priceChange) / change.old_price) * 100).toFixed(0);

        const notification = document.createElement('div');
        notification.className = 'in-app-notification';
        notification.style.cssText = `
            background: white;
            padding: 14px;
            margin-bottom: 10px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            pointer-events: auto;
            cursor: pointer;
            animation: slideIn 0.3s ease-out;
            border-left: 4px solid ${isIncrease ? '#f59e0b' : '#10b981'};
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        `;

        const icon = isIncrease ? '📈' : '📉';
        const arrow = isIncrease ? '↑' : '↓';

        notification.innerHTML = `
            <div style="display: flex; gap: 10px; align-items: start;">
                <div style="font-size: 24px; line-height: 1;">${icon}</div>
                <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 600; font-size: 14px; color: #1f2937; margin-bottom: 4px;">
                        ${change.product_name}
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px; font-size: 13px;">
                        <span style="color: #6b7280; text-decoration: line-through;">
                            $${change.old_price.toFixed(2)}
                        </span>
                        <span style="color: ${isIncrease ? '#f59e0b' : '#10b981'}; font-weight: 600;">
                            ${arrow} $${change.new_price.toFixed(2)}
                        </span>
                        <span style="
                            background: ${isIncrease ? '#fef3c7' : '#d1fae5'};
                            color: ${isIncrease ? '#92400e' : '#065f46'};
                            padding: 2px 6px;
                            border-radius: 4px;
                            font-size: 11px;
                            font-weight: 600;
                        ">
                            ${percentage}%
                        </span>
                    </div>
                </div>
                <button class="close-notification" style="
                    background: none;
                    border: none;
                    color: #9ca3af;
                    cursor: pointer;
                    font-size: 20px;
                    line-height: 1;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                ">×</button>
            </div>
        `;

        // Click to scroll to product
        notification.addEventListener('click', (e) => {
            if (!e.target.classList.contains('close-notification')) {
                this.scrollToProduct(change.product_id);
                this.dismissNotification(notification);
            }
        });

        // Close button
        notification.querySelector('.close-notification').addEventListener('click', (e) => {
            e.stopPropagation();
            this.dismissNotification(notification);
        });

        this.notificationContainer.appendChild(notification);
    }

    dismissNotification(notification) {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }

    scrollToProduct(productId) {
        const productCard = document.querySelector(`[data-product-id="${productId}"]`);
        if (productCard) {
            productCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            productCard.style.animation = 'pulse 1s ease-in-out 2';
        }
    }

    markAllAsSeen() {
        const seenChanges = JSON.parse(localStorage.getItem(this.seenChangesKey) || '[]');
        const newSeenIds = this.priceChanges.map(c => c.id);
        const allSeen = [...new Set([...seenChanges, ...newSeenIds])];
        
        // Keep only last 1000 IDs to prevent localStorage bloat
        const recentSeen = allSeen.slice(-1000);
        localStorage.setItem(this.seenChangesKey, JSON.stringify(recentSeen));
        
        console.log(`✅ Marked ${newSeenIds.length} price changes as seen`);
    }
}

// Add CSS animations
const inAppNotificationStyle = document.createElement('style');
inAppNotificationStyle.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        50% {
            transform: scale(1.05);
            box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
        }
    }

    .in-app-notifications::-webkit-scrollbar {
        width: 6px;
    }

    .in-app-notifications::-webkit-scrollbar-track {
        background: transparent;
    }

    .in-app-notifications::-webkit-scrollbar-thumb {
        background: rgba(0,0,0,0.2);
        border-radius: 3px;
    }

    @media (max-width: 768px) {
        .in-app-notifications {
            right: 10px !important;
            left: 10px !important;
            max-width: none !important;
        }
    }
`;
document.head.appendChild(inAppNotificationStyle);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.inAppNotifications = new InAppNotificationManager();
        window.inAppNotifications.init();
    });
} else {
    window.inAppNotifications = new InAppNotificationManager();
    window.inAppNotifications.init();
}
