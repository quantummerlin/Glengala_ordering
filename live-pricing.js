// Glengala Fresh - Live Pricing System
// Fetches prices from API and updates in real-time

class LivePricingSystem {
    constructor() {
        this.apiBase = window.location.origin + '/api';
        this.products = [];
        this.lastUpdate = null;
        this.updateInterval = 900000; // 15 minutes in milliseconds
        this.init();
    }

    async init() {
        // Check localStorage cache first for instant display
        this.loadFromCache();
        
        // Then fetch fresh data in background
        this.fetchProducts();
        
        // Set up periodic updates
        this.startPeriodicUpdates();
        
        // Listen for service worker messages
        this.listenForUpdates();
        
        // Update on page visibility change
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.checkForUpdates();
            }
        });
    }
    
    loadFromCache() {
        try {
            const cached = localStorage.getItem('glengala_products');
            if (cached) {
                const data = JSON.parse(cached);
                // Only use cache if less than 15 minutes old
                const cacheAge = Date.now() - new Date(data.updated_at).getTime();
                if (cacheAge < this.updateInterval) {
                    this.products = data.products;
                    window.products = data.products;
                    this.lastUpdate = new Date(data.updated_at);
                    console.log('⚡ Loaded', this.products.length, 'products from cache');
                    return true;
                }
            }
        } catch (e) {
            console.log('Cache load failed:', e);
        }
        return false;
    }

    async fetchProducts() {
        console.log('📥 Fetching products from API:', `${this.apiBase}/products`);
        try {
            const response = await fetch(`${this.apiBase}/products`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            
            this.products = data.products;
            this.lastUpdate = new Date(data.updated_at);
            
            console.log('✅ Fetched', this.products.length, 'products from API');
            
            // Update UI
            this.updateProductDisplay();
            this.updateLastUpdateTime();
            
            // Store in localStorage as backup
            localStorage.setItem('glengala_products', JSON.stringify({
                products: this.products,
                updated_at: this.lastUpdate.toISOString()
            }));
            
            return this.products;
        } catch (error) {
            console.error('Failed to fetch products:', error);
            
            // Fallback to localStorage
            const cached = localStorage.getItem('glengala_products');
            if (cached) {
                const data = JSON.parse(cached);
                this.products = data.products;
                this.lastUpdate = new Date(data.updated_at);
                this.showOfflineMessage();
            }
            
            return this.products;
        }
    }

    startPeriodicUpdates() {
        console.log(`⏰ Starting periodic price updates every ${this.updateInterval / 60000} minutes`);
        setInterval(() => {
            this.checkForUpdates();
        }, this.updateInterval);
    }

    async checkForUpdates() {
        console.log('🔍 Checking for price updates...');
        try {
            await this.fetchProducts();
            console.log('✅ Price update check complete');
        } catch (error) {
            console.error('❌ Error checking for updates:', error);
        }
    }

    listenForUpdates() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', event => {
                if (event.data.type === 'PRICES_UPDATED') {
                    this.products = event.data.data.products;
                    this.updateProductDisplay();
                    this.showUpdateNotification();
                }
            });
        }
    }

    updateProductDisplay() {
        // Update the global products array
        if (this.products && this.products.length > 0) {
            window.products = this.products;
            console.log('🔄 Updated products array with', this.products.length, 'products');
            
            // Trigger full shop re-render if shop instance exists
            if (window.shop && typeof window.shop.loadProductsIntoCategories === 'function') {
                console.log('🔄 Refreshing shop display with updated products');
                window.shop.loadProductsIntoCategories();
            } else {
                // Fallback: Update prices in the DOM manually
                this.products.forEach(product => {
                    const priceElements = document.querySelectorAll(`[data-product-id="${product.id}"]`);
                    priceElements.forEach(el => {
                        const priceDisplay = el.querySelector('.product-price');
                        if (priceDisplay) {
                            priceDisplay.textContent = this.formatPrice(product);
                        }
                        
                        // Update special prices
                        if (product.hasSpecial) {
                            this.displaySpecial(el, product);
                        }
                        
                        // Update stock status
                        this.updateStockStatus(el, product);
                    });
                });
            }
        }
    }

    formatPrice(product) {
        if (product.hasSpecial) {
            return `$${product.specialPrice.toFixed(2)} (${product.specialQuantity} ${product.specialUnit})`;
        }
        const unitDisplay = this.getUnitDisplay(product.unit);
        return `$${product.price.toFixed(2)} ${unitDisplay}`;
    }

    getUnitDisplay(unit) {
        switch (unit) {
            case 'kg':
                return 'per kg';
            case 'each':
                return 'each';
            case 'bunch':
                return 'per bunch';
            case 'punnet':
                return 'per punnet';
            default:
                return unit;
        }
    }

    displaySpecial(element, product) {
        let specialBadge = element.querySelector('.special-badge');
        if (!specialBadge) {
            specialBadge = document.createElement('div');
            specialBadge.className = 'special-badge';
            element.appendChild(specialBadge);
        }
        specialBadge.innerHTML = `
            <span class="special-icon">🌟</span>
            <span class="special-text">Special: ${product.specialQuantity} for $${product.specialPrice.toFixed(2)}</span>
        `;
    }

    updateStockStatus(element, product) {
        let stockBadge = element.querySelector('.stock-badge');
        
        if (product.stock < 10 && product.stock > 0) {
            if (!stockBadge) {
                stockBadge = document.createElement('div');
                stockBadge.className = 'stock-badge low-stock';
                element.appendChild(stockBadge);
            }
            stockBadge.textContent = `Only ${product.stock} left!`;
        } else if (product.stock === 0) {
            if (!stockBadge) {
                stockBadge = document.createElement('div');
                stockBadge.className = 'stock-badge out-of-stock';
                element.appendChild(stockBadge);
            }
            stockBadge.textContent = 'Out of Stock';
            
            // Disable add to cart button
            const addButton = element.querySelector('.add-to-cart-btn');
            if (addButton) {
                addButton.disabled = true;
                addButton.textContent = 'Out of Stock';
            }
        } else if (stockBadge) {
            stockBadge.remove();
        }
    }

    updateLastUpdateTime() {
        // Timestamp display hidden per user request
        const updateElement = document.getElementById('last-price-update');
        if (updateElement) {
            updateElement.style.display = 'none';
        }
    }

    getTimeAgo(date) {
        const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
        
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        return `${Math.floor(seconds / 86400)} days ago`;
    }

    showOfflineMessage() {
        const message = document.createElement('div');
        message.className = 'offline-message';
        message.innerHTML = `
            <span class="offline-icon">📡</span>
            <span>You're offline. Showing cached prices from ${this.getTimeAgo(this.lastUpdate)}.</span>
        `;
        document.body.insertBefore(message, document.body.firstChild);
    }

    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <span class="update-icon">✨</span>
            <span>Prices updated!</span>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    getProductById(id) {
        return this.products.find(p => p.id === id);
    }

    getProductsByCategory(category) {
        return this.products.filter(p => p.category === category && p.active);
    }

    getDailySpecials() {
        return this.products.filter(p => p.hasSpecial && p.active);
    }

    getPremiumProducts() {
        return this.products.filter(p => p.isPremium && p.active);
    }

    getOrganicProducts() {
        return this.products.filter(p => p.isOrganic && p.active);
    }

    // Manual refresh button
    async refreshPrices() {
        const refreshBtn = document.getElementById('refresh-prices-btn');
        if (refreshBtn) {
            refreshBtn.disabled = true;
            refreshBtn.innerHTML = '<span class="spinner">⟳</span> Refreshing...';
        }

        await this.fetchProducts();

        if (refreshBtn) {
            refreshBtn.disabled = false;
            refreshBtn.innerHTML = '🔄 Refresh Prices';
        }
    }

    // Search products
    searchProducts(query) {
        const lowerQuery = query.toLowerCase();
        return this.products.filter(p => 
            p.active && (
                p.name.toLowerCase().includes(lowerQuery) ||
                p.category.toLowerCase().includes(lowerQuery)
            )
        );
    }
}

// Initialize live pricing system
const livePricing = new LivePricingSystem();

// Expose globally for backward compatibility
window.livePricing = livePricing;
