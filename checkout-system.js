// Glengala Fresh - Complete Checkout System
// Implements: Customer info, Pickup/Delivery, Postcode validation, Delivery fees, 8pm cutoff, SMS ordering

const CHECKOUT_CONFIG = {
    OWNER_SMS_NUMBER: '0434694141',
    ELIGIBLE_POSTCODES: new Set(['3020', '3022']),
    NEXT_DAY_CUTOFF_HOUR: 20, // 8pm
    NEXT_DAY_ELIGIBLE_DAYS: [0, 1, 2, 3, 4], // Sun=0 to Thu=4
    DELIVERY_FEES: {
        UNDER_30: 10,
        UNDER_50: 5,
        OVER_50: 0
    }
};

const AUD = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' });

class CheckoutSystem {
    constructor(shop) {
        this.shop = shop;
        // Load saved info from localStorage
        const savedInfo = JSON.parse(localStorage.getItem('glengala_customer_info') || '{}');
        this.customerInfo = {
            name: savedInfo.name || '',
            phone: savedInfo.phone || '',
            address: savedInfo.address || '',
            postcode: savedInfo.postcode || '',
            fulfilment: savedInfo.fulfilment || 'pickup',
            timeWindow: savedInfo.timeWindow || 'morning',
            notes: ''
        };
    }
    saveCustomerInfo() {
        localStorage.setItem('glengala_customer_info', JSON.stringify({
            name: this.customerInfo.name,
            phone: this.customerInfo.phone,
            address: this.customerInfo.address,
            postcode: this.customerInfo.postcode,
            fulfilment: this.customerInfo.fulfilment,
            timeWindow: this.customerInfo.timeWindow
        }));
    }

    clearCustomerInfo() {
        if (confirm('Clear all saved customer information? You will need to re-enter your details next time.')) {
            localStorage.removeItem('glengala_customer_info');
            // Reset form
            this.customerInfo = {
                name: '',
                phone: '',
                address: '',
                postcode: '',
                fulfilment: 'pickup',
                timeWindow: 'morning',
                notes: ''
            };
            // Close and reopen checkout to refresh form
            this.closeCheckout();
            setTimeout(() => this.shop.checkout(), 100);
        }
    }

    // Calculate delivery fee based on subtotal and postcode
    calculateDeliveryFee(subtotal, postcode, applyReward = false) {
        if (!CHECKOUT_CONFIG.ELIGIBLE_POSTCODES.has(String(postcode))) {
            return null; // Delivery not available
        }
        
        // Check for free delivery reward
        if (applyReward && typeof glengalaRewards !== 'undefined' && glengalaRewards.hasFreeDelivery()) {
            return 0; // Free delivery from reward
        }
        
        if (subtotal >= 50) return CHECKOUT_CONFIG.DELIVERY_FEES.OVER_50;
        if (subtotal >= 30) return CHECKOUT_CONFIG.DELIVERY_FEES.UNDER_50;
        return CHECKOUT_CONFIG.DELIVERY_FEES.UNDER_30;
    }
    
    // Check if free delivery reward is available
    hasFreeDeliveryReward() {
        return typeof glengalaRewards !== 'undefined' && glengalaRewards.hasFreeDelivery();
    }
    
    // Apply free delivery reward
    applyFreeDeliveryReward() {
        if (typeof glengalaRewards !== 'undefined') {
            return glengalaRewards.useFreeDelivery();
        }
        return false;
    }

    // Get cutoff status for next-day delivery
    getCutoffStatus(now = new Date()) {
        const day = now.getDay();
        const hours = now.getHours();
        const isEligibleDay = CHECKOUT_CONFIG.NEXT_DAY_ELIGIBLE_DAYS.includes(day);
        const beforeCutoff = hours < CHECKOUT_CONFIG.NEXT_DAY_CUTOFF_HOUR;
        const eligibleNow = isEligibleDay && beforeCutoff;

        let secsToCutoff = 0;
        if (isEligibleDay) {
            const cutoff = new Date(now);
            cutoff.setHours(CHECKOUT_CONFIG.NEXT_DAY_CUTOFF_HOUR, 0, 0, 0);
            secsToCutoff = Math.max(0, Math.floor((cutoff - now) / 1000));
        }

        return { eligibleNow, isEligibleDay, secsToCutoff };
    }

    // Format countdown timer
    formatCountdown(secs) {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} hrs`;
    }

    // Get earliest fulfilment label
    getEarliestFulfilment() {
        const { eligibleNow } = this.getCutoffStatus();
        return eligibleNow ? 'Next day' : 'Next available day (we\'ll confirm)';
    }

    // Build complete SMS order text
    buildOrderText() {
        const { name, phone, address, postcode, fulfilment, timeWindow, notes } = this.customerInfo;
        const items = this.shop.cart;
        const subtotal = this.shop.cart.reduce((sum, item) => sum + item.total, 0);
        
        const deliveryFee = (fulfilment === 'delivery') 
            ? this.calculateDeliveryFee(subtotal, postcode) || 0 
            : 0;
        
        const total = subtotal + deliveryFee;

        // Unit display mapping
        const unitDisplayMap = {
            'kg': 'kg',
            'each': 'each',
            'hundredg': '100g',
            'bunch': 'bunch',
            'punnet': 'punnet',
            'halfkg': '500g',
            'ml300': '300ml',
            'ml500': '500ml'
        };

        const itemLines = items.map(item => {
            const unitText = unitDisplayMap[item.unit] || item.unit;
            return `• ${item.name} — ${item.quantity} ${unitText} @ ${AUD.format(item.price)} = ${AUD.format(item.total)}`;
        }).join('\n');

        const fulfilLine = fulfilment === 'delivery'
            ? `🚚 Delivery to ${postcode || '(postcode not provided)'}`
            : '🏬 Pick up';

        const timeWindowText = {
            'morning': 'Morning (8am-12pm)',
            'afternoon': 'Afternoon (12pm-5pm)',
            'evening': 'Evening (5pm-8pm)',
            'anytime': 'Anytime'
        }[timeWindow] || 'Anytime';

        const totalItems = this.shop.cart.reduce((sum, item) => sum + item.quantity, 0);
        
        return [
            '🛒 GLENGALA FRESH ORDER',
            '━━━━━━━━━━━━━━━━━━━━',
            `👤 ${name || '(not provided)'}`,
            `📱 ${phone || '(not provided)'}`,
            `📍 ${address || '(not provided)'}`,
            `${fulfilLine} • ${timeWindowText}`,
            '',
            `📦 ITEMS (${totalItems}):`,
            itemLines || '• (No items)',
            '━━━━━━━━━━━━━━━━━━━━',
            `Subtotal: ${AUD.format(subtotal)}`,
            deliveryFee > 0 ? `Delivery: ${AUD.format(deliveryFee)}` : '',
            `💰 TOTAL: ${AUD.format(total)}`,
            '',
            notes ? `📝 ${notes}` : ''
        ].filter(Boolean).join('\n');
    }

    // Open SMS app with pre-filled order
    textWayne() {
        const body = encodeURIComponent(this.buildOrderText());
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent || '');
        const sep = isIOS ? '&' : '?';
        
        // Track order for achievements
        this.trackOrderForRewards();
        
        // Use free delivery reward if applicable
        if (this.customerInfo.fulfilment === 'delivery' && this.hasFreeDeliveryReward()) {
            this.applyFreeDeliveryReward();
        }
        
        window.location.href = `sms:${CHECKOUT_CONFIG.OWNER_SMS_NUMBER}${sep}body=${body}`;
    }
    
    // Track order for rewards system
    trackOrderForRewards() {
        if (typeof glengalaRewards === 'undefined') return;
        
        const subtotal = this.shop.cart.reduce((sum, item) => sum + item.total, 0);
        const deliveryFee = (this.customerInfo.fulfilment === 'delivery') 
            ? (this.calculateDeliveryFee(subtotal, this.customerInfo.postcode) || 0) 
            : 0;
        
        const order = {
            total: subtotal + deliveryFee,
            items: this.shop.cart.map(item => ({
                name: item.name,
                category: item.category || 'other',
                quantity: item.quantity,
                total: item.total
            }))
        };
        
        const newAchievements = glengalaRewards.updateStats(order);
        
        // Show achievement popups after a delay (let SMS open first)
        if (newAchievements.length > 0) {
            setTimeout(() => {
                glengalaRewards.showNewAchievements(newAchievements);
                // Update badge
                const freeDeliveries = glengalaRewards.getFreeDeliveryCount();
                const badge = document.getElementById('rewardsBadge');
                if (badge && freeDeliveries > 0) {
                    badge.textContent = freeDeliveries;
                    badge.style.display = 'inline-block';
                }
            }, 2000);
        }
    }

    // Copy order to clipboard
    async copyOrder() {
        try {
            await navigator.clipboard.writeText(this.buildOrderText());
            this.showToast('Order copied to clipboard! 📋');
            
            // Also track for rewards
            this.trackOrderForRewards();
        } catch {
            const ta = document.createElement('textarea');
            ta.value = this.buildOrderText();
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            ta.remove();
            this.showToast('Order copied to clipboard! 📋');
            
            // Also track for rewards
            this.trackOrderForRewards();
        }
    }

    // Show toast notification
    showToast(message) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#2e7d32;color:#fff;padding:12px 20px;border-radius:10px;z-index:9999;font-size:0.95rem;box-shadow:0 4px 12px rgba(0,0,0,0.3);';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    }

    // Update delivery UI (fees, progress, cutoff)
    updateDeliveryUI() {
        const subtotal = this.shop.cart.reduce((sum, item) => sum + item.total, 0);
        const { postcode, fulfilment } = this.customerInfo;
        const hasFreeReward = this.hasFreeDeliveryReward();
        const fee = this.calculateDeliveryFee(subtotal, postcode, hasFreeReward);
        
        // Update cart display with new delivery info
        if (this.shop && typeof this.shop.updateCart === 'function') {
            this.shop.updateCart();
        }
        
        // Update delivery message
        const deliveryMsgEl = document.getElementById('delivery-msg');
        if (deliveryMsgEl) {
            if (fulfilment === 'delivery') {
                if (fee === null) {
                    deliveryMsgEl.textContent = 'Delivery is currently available to 3020 and 3022 only.';
                    deliveryMsgEl.style.color = '#d32f2f';
                } else if (hasFreeReward) {
                    deliveryMsgEl.innerHTML = '🏆 <strong>FREE delivery</strong> — Reward applied! 🎉';
                    deliveryMsgEl.style.color = '#22c55e';
                } else {
                    const toFree = Math.max(0, 50 - subtotal);
                    const tierText = fee === 0 ? 'FREE delivery unlocked 🎉' :
                        fee === 5 ? '$5 delivery (orders $30+)' : '$10 delivery (<$30)';
                    const progressText = (fee === 0) ? '' : ` • Only ${AUD.format(toFree)} to free delivery`;
                    deliveryMsgEl.textContent = `${tierText}${progressText}`;
                    deliveryMsgEl.style.color = fee === 0 ? '#2e7d32' : '#666';
                }
            } else {
                deliveryMsgEl.textContent = 'Pick up at Glengala Fresh (choose your time below).';
                deliveryMsgEl.style.color = '#666';
            }
        }

        // Update totals
        const deliveryFee = (fulfilment === 'delivery' && fee !== null) ? fee : 0;
        const total = subtotal + deliveryFee;
        
        const subtotalEl = document.getElementById('checkout-subtotal');
        const deliveryFeeEl = document.getElementById('checkout-delivery-fee');
        const totalEl = document.getElementById('checkout-total');
        
        if (subtotalEl) subtotalEl.textContent = AUD.format(subtotal);
        if (deliveryFeeEl) deliveryFeeEl.textContent = AUD.format(deliveryFee);
        if (totalEl) totalEl.textContent = AUD.format(total);

        // Update cutoff banner
        const cutoffEl = document.getElementById('cutoff-banner');
        if (cutoffEl) {
            const { eligibleNow, isEligibleDay, secsToCutoff } = this.getCutoffStatus();
            if (isEligibleDay) {
                if (eligibleNow) {
                    cutoffEl.innerHTML = `⏰ Order by 8pm for next-day ${fulfilment}. <strong>${this.formatCountdown(secsToCutoff)}</strong> left`;
                    cutoffEl.style.background = '#fff3e0';
                    cutoffEl.style.color = '#e65100';
                } else {
                    cutoffEl.textContent = `Next-day ${fulfilment} is available for orders placed by 8pm (Sun–Thu).`;
                    cutoffEl.style.background = '#f5f5f5';
                    cutoffEl.style.color = '#666';
                }
            } else {
                cutoffEl.textContent = 'Next-day service runs Sunday–Thursday (order by 8pm).';
                cutoffEl.style.background = '#f5f5f5';
                cutoffEl.style.color = '#666';
            }
        }

        // Update earliest fulfilment
        const earliestEl = document.getElementById('earliest-label');
        if (earliestEl) {
            earliestEl.textContent = this.getEarliestFulfilment();
        }
    }

    // Show checkout modal
    showCheckout() {
        if (this.shop.cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        const modal = this.createCheckoutModal();
        document.body.insertAdjacentHTML('beforeend', modal);
        this.updateDeliveryUI();
        
        // Scroll to top when opening cart
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Auto-update every minute for countdown
        this.countdownInterval = setInterval(() => this.updateDeliveryUI(), 60000);
    }

    // Create checkout modal HTML
    createCheckoutModal() {
        return `
            <div class="checkout-overlay" id="checkoutOverlay">
                <div class="checkout-modal" style="background: white; border-radius: 16px; max-width: 600px; width: 100%; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);">
                    <div class="checkout-header">
                        <h2>🛒 Complete Your Order</h2>
                        <button class="close-btn" onclick="window.checkoutSystem.closeCheckout()">✕</button>
                    </div>

                    <div class="checkout-content">
                        <!-- Trust Message -->
                        <div class="trust-message">
                            🌿 Wayne hand-picks the freshest produce and will confirm if today's market affects any item.
                        </div>

                        <!-- Customer Info -->
                        <div class="form-section">
                            <h3>Your Information ${this.customerInfo.name ? '<small style="color: #666; font-weight: normal;">📝 (remembered from last order)</small>' : ''}</h3>
                <input type="text" id="cust-name" placeholder="Your name *" required 
                    value="${this.customerInfo.name || ''}"
                    onchange="window.checkoutSystem.customerInfo.name = this.value; window.checkoutSystem.saveCustomerInfo(); window.checkoutSystem.updateDeliveryUI()">
                <input type="tel" id="cust-phone" placeholder="Phone number *" required
                    value="${this.customerInfo.phone || ''}"
                    onchange="window.checkoutSystem.customerInfo.phone = this.value; window.checkoutSystem.saveCustomerInfo(); window.checkoutSystem.updateDeliveryUI()">
                            ${this.customerInfo.name || this.customerInfo.phone || this.customerInfo.address ? 
                                '<button type="button" style="background: #f44336; color: white; border: none; padding: 8px 12px; border-radius: 6px; margin-top: 10px; font-size: 0.9em;" onclick="window.checkoutSystem.clearCustomerInfo()">🗑️ Clear Saved Info</button>' : ''}
                        </div>

                        <!-- Fulfilment Method -->
                        <div class="form-section">
                            <h3>Fulfilment Method</h3>
                            <div class="radio-group">
                                <label class="radio-label">
                     <input type="radio" name="fulfilment" value="pickup" ${this.customerInfo.fulfilment === 'pickup' ? 'checked' : ''}
                         onchange="window.checkoutSystem.customerInfo.fulfilment = 'pickup'; window.checkoutSystem.saveCustomerInfo(); window.checkoutSystem.updateDeliveryUI()">
                                    <span>🏬 Pick Up (Free)</span>
                                </label>
                                <label class="radio-label">
                     <input type="radio" name="fulfilment" value="delivery" ${this.customerInfo.fulfilment === 'delivery' ? 'checked' : ''}
                         onchange="window.checkoutSystem.customerInfo.fulfilment = 'delivery'; window.checkoutSystem.saveCustomerInfo(); window.checkoutSystem.updateDeliveryUI()">
                                    <span>🚚 Delivery (3020/3022)</span>
                                </label>
                            </div>
                        </div>

                        <!-- Delivery Details -->
                        <div class="form-section" id="delivery-section">
                <input type="text" id="cust-address" placeholder="Delivery address"
                    value="${this.customerInfo.address || ''}"
                    onchange="window.checkoutSystem.customerInfo.address = this.value; window.checkoutSystem.saveCustomerInfo()">
                <input type="text" id="postcode" placeholder="Postcode (3020 or 3022)" inputmode="numeric" maxlength="4"
                    value="${this.customerInfo.postcode || ''}"
                    onchange="window.checkoutSystem.customerInfo.postcode = this.value; window.checkoutSystem.saveCustomerInfo(); window.checkoutSystem.updateDeliveryUI()">
                            <div id="delivery-msg" class="delivery-msg"></div>
                        </div>

                        <!-- Time Window -->
                        <div class="form-section">
                            <h3>Preferred Time</h3>
                            <select id="cust-window" onchange="window.checkoutSystem.customerInfo.timeWindow = this.value; window.checkoutSystem.saveCustomerInfo()">
                                <option value="morning" ${this.customerInfo.timeWindow === 'morning' ? 'selected' : ''}>Morning (8am-12pm)</option>
                                <option value="afternoon" ${this.customerInfo.timeWindow === 'afternoon' ? 'selected' : ''}>Afternoon (12pm-5pm)</option>
                                <option value="evening" ${this.customerInfo.timeWindow === 'evening' ? 'selected' : ''}>Evening (5pm-8pm)</option>
                                <option value="anytime" ${this.customerInfo.timeWindow === 'anytime' ? 'selected' : ''}>Anytime</option>
                            </select>
                        </div>

                        <!-- Notes -->
                        <div class="form-section">
                            <textarea id="cust-notes" placeholder="Special instructions (optional)" rows="2"
                                      onchange="window.checkoutSystem.customerInfo.notes = this.value"></textarea>
                        </div>

                        <!-- Cutoff Banner -->
                        <div id="cutoff-banner" class="cutoff-banner"></div>

                        <!-- Order Summary -->
                        <div class="order-summary-box">
                            <h3>Order Summary</h3>
                            <div class="summary-line">
                                <span>Subtotal:</span>
                                <strong id="checkout-subtotal">$0.00</strong>
                            </div>
                            <div class="summary-line">
                                <span>Delivery:</span>
                                <strong id="checkout-delivery-fee">$0.00</strong>
                            </div>
                            <div class="summary-line total-line">
                                <span>Total:</span>
                                <strong id="checkout-total">$0.00</strong>
                            </div>
                            <div class="earliest-info">
                                Earliest: <span id="earliest-label">Next day</span>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="checkout-actions">
                            <button class="btn-secondary" onclick="window.checkoutSystem.copyOrder()">
                                📋 Copy Order
                            </button>
                            <button class="btn-primary btn-large" onclick="window.checkoutSystem.textWayne()">
                                💬 Text Wayne
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Close checkout modal
    closeCheckout() {
        const overlay = document.getElementById('checkoutOverlay');
        if (overlay) overlay.remove();
        if (this.countdownInterval) clearInterval(this.countdownInterval);
    }
}

// Global instance (will be initialized by shop)
let checkoutSystem;