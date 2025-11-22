// Push Notification Manager for Glengala Fresh
class PushNotificationManager {
    constructor() {
        this.vapidPublicKey = 'YOUR_VAPID_PUBLIC_KEY'; // Will be generated
        this.apiBase = 'http://127.0.0.1:5000/api';
        this.subscription = null;
        this.init();
    }

    async init() {
        // Check if notifications are supported
        if (!('Notification' in window)) {
            console.log('Notifications not supported');
            return;
        }

        // Check if service worker is supported
        if (!('serviceWorker' in navigator)) {
            console.log('Service Worker not supported');
            return;
        }

        // Wait for service worker to be ready
        const registration = await navigator.serviceWorker.ready;
        
        // Check if already subscribed
        const existingSubscription = await registration.pushManager.getSubscription();
        if (existingSubscription) {
            this.subscription = existingSubscription;
            console.log('Already subscribed to push notifications');
            return;
        }

        // Only prompt after 2 minutes of active browsing (less intrusive)
        if (Notification.permission === 'default') {
            setTimeout(() => {
                if (document.visibilityState === 'visible') {
                    this.showNotificationPrompt();
                }
            }, 120000); // 2 minutes
        }
    }

    async requestPermission() {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            console.log('✅ Notification permission granted');
            await this.subscribeToPush();
            return true;
        } else if (permission === 'denied') {
            console.log('❌ Notification permission denied');
            return false;
        } else {
            console.log('⏸️ Notification permission dismissed');
            return false;
        }
    }

    async subscribeToPush() {
        try {
            const registration = await navigator.serviceWorker.ready;
            
            // Subscribe to push notifications
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
            });

            this.subscription = subscription;
            
            // Send subscription to server
            await this.sendSubscriptionToServer(subscription);
            
            console.log('✅ Subscribed to push notifications');
            return subscription;
        } catch (error) {
            console.error('Failed to subscribe to push:', error);
            return null;
        }
    }

    async sendSubscriptionToServer(subscription) {
        try {
            const response = await fetch(`${this.apiBase}/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subscription: subscription,
                    user_id: localStorage.getItem('glengala_user_id')
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Failed to send subscription to server:', error);
        }
    }

    async unsubscribe() {
        if (!this.subscription) {
            console.log('Not subscribed');
            return;
        }

        try {
            await this.subscription.unsubscribe();
            
            // Notify server
            await fetch(`${this.apiBase}/unsubscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint: this.subscription.endpoint
                })
            });
            
            this.subscription = null;
            console.log('✅ Unsubscribed from push notifications');
        } catch (error) {
            console.error('Failed to unsubscribe:', error);
        }
    }

    // Helper function to convert VAPID key
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    // Show local notification (for testing)
    showLocalNotification(title, options) {
        if (Notification.permission === 'granted') {
            new Notification(title, options);
        }
    }

    // Check notification permission status
    getPermissionStatus() {
        if (!('Notification' in window)) {
            return 'unsupported';
        }
        return Notification.permission; // 'granted', 'denied', or 'default'
    }

    isSubscribed() {
        return this.subscription !== null;
    }
}

// Initialize notification manager
const notificationManager = new PushNotificationManager();

// Expose globally
window.notificationManager = notificationManager;

// Auto-request permission when app is installed to home screen
window.addEventListener('appinstalled', () => {
    console.log('App installed to home screen');
    setTimeout(() => {
        notificationManager.requestPermission();
    }, 3000); // Wait 3 seconds after install
});

// Show notification prompt after user creates account
window.addEventListener('userRegistered', () => {
    setTimeout(() => {
        if (notificationManager.getPermissionStatus() === 'default') {
            showNotificationPrompt();
        }
    }, 2000);
});

// Custom UI prompt for notifications
function showNotificationPrompt() {
    const prompt = document.createElement('div');
    prompt.className = 'notification-prompt';
    prompt.innerHTML = `
        <div class="notification-prompt-content">
            <div class="notification-prompt-icon">🔔</div>
            <h3>Stay Updated!</h3>
            <p>Get notified when we update prices on your favorite items</p>
            <div class="notification-prompt-buttons">
                <button class="btn-primary" onclick="enableNotifications()">Enable Notifications</button>
                <button class="btn-secondary" onclick="dismissNotificationPrompt()">Maybe Later</button>
            </div>
        </div>
    `;
    document.body.appendChild(prompt);
    
    setTimeout(() => {
        prompt.classList.add('show');
    }, 100);
}

async function enableNotifications() {
    const success = await notificationManager.requestPermission();
    if (success) {
        // Show success message
        notificationManager.showLocalNotification('🎉 Notifications Enabled!', {
            body: 'You\'ll get alerts when we update prices on items you love',
            icon: '/icon-192.png',
            badge: '/badge-72.png'
        });
    }
    dismissNotificationPrompt();
}

function dismissNotificationPrompt() {
    const prompt = document.querySelector('.notification-prompt');
    if (prompt) {
        prompt.classList.remove('show');
        setTimeout(() => prompt.remove(), 300);
    }
    // Remember dismissal
    localStorage.setItem('notificationPromptDismissed', Date.now());
}

// Auto-show prompt on first visit (if not dismissed recently)
window.addEventListener('load', () => {
    const lastDismissed = localStorage.getItem('notificationPromptDismissed');
    const daysSinceDismissed = lastDismissed ? 
        (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24) : 999;
    
    // Show if never dismissed or dismissed more than 7 days ago
    if (notificationManager.getPermissionStatus() === 'default' && daysSinceDismissed > 7) {
        setTimeout(() => {
            showNotificationPrompt();
        }, 10000); // Show after 10 seconds on site
    }
});
