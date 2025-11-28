// Glengala Fresh - Onboarding System
// Welcome flow and guided tour for first-time visitors

class GlengalaOnboarding {
    constructor() {
        this.storageKeys = {
            welcomeSeen: 'glengala_welcome_seen',
            tourCompleted: 'glengala_tour_completed',
            visitCount: 'glengala_visit_count'
        };
        this.tourStep = 0;
        this.tourSteps = [
            {
                target: '.category-nav, .category-tabs, [class*="category"]',
                fallbackSelector: 'header',
                title: '📂 STEP 1: Category Tabs',
                text: '👆 This is the CATEGORY bar! Tap any category (Vegetables, Fruits, Herbs, etc.) to see products in that section.',
                position: 'bottom',
                highlightLabel: 'CATEGORIES'
            },
            {
                target: '.product-list-item, .product-card',
                fallbackSelector: '.products-container',
                title: '🛒 STEP 2: Product Card',
                text: '👆 This is a PRODUCT! Use the + and − buttons to select quantity. The yellow price shows your total BEFORE adding. Tap "Add" when ready!',
                position: 'bottom',
                highlightLabel: 'PRODUCT'
            },
            {
                target: '#cartButton, .cart-button, [onclick*="toggleCart"]',
                fallbackSelector: 'header',
                title: '🧺 STEP 3: Your Cart',
                text: '👆 This is your CART button! Tap here to view everything you\'ve added, then choose pickup or delivery at checkout.',
                position: 'left',
                highlightLabel: 'CART'
            }
        ];
    }

    init() {
        // Track visit count
        const visitCount = parseInt(localStorage.getItem(this.storageKeys.visitCount) || '0') + 1;
        localStorage.setItem(this.storageKeys.visitCount, visitCount.toString());

        // Check if first time visitor
        const welcomeSeen = localStorage.getItem(this.storageKeys.welcomeSeen);
        
        if (!welcomeSeen) {
            // Delay slightly to let shop load
            setTimeout(() => this.showWelcomeModal(), 800);
        }
    }

    showWelcomeModal() {
        const modal = document.createElement('div');
        modal.id = 'welcomeModal';
        modal.className = 'onboarding-modal-overlay';
        modal.innerHTML = `
            <div class="onboarding-modal">
                <div class="onboarding-modal-content">
                    <div class="welcome-icon">🥬</div>
                    <h1>Welcome to Glengala Fresh</h1>
                    <p class="welcome-subtitle">Fresh produce, delivered to your door</p>
                    
                    <div class="welcome-features">
                        <div class="welcome-feature">
                            <span class="feature-icon">🌿</span>
                            <span>Farm-fresh quality</span>
                        </div>
                        <div class="welcome-feature">
                            <span class="feature-icon">🚚</span>
                            <span>Free delivery over $50</span>
                        </div>
                        <div class="welcome-feature">
                            <span class="feature-icon">🏆</span>
                            <span>Earn rewards as you shop</span>
                        </div>
                    </div>

                    <div class="welcome-buttons">
                        <button class="welcome-btn-primary" onclick="glengalaOnboarding.closeWelcome(false)">
                            👋 Show Me Around
                        </button>
                        <button class="welcome-btn-info" onclick="glengalaOnboarding.showHowItWorks()">
                            ❓ How Does It Work?
                        </button>
                        <button class="welcome-btn-secondary" onclick="glengalaOnboarding.closeWelcome(true)">
                            Start Shopping
                        </button>
                    </div>
                    
                    <p class="welcome-footer">Prices update throughout the day based on fresh arrivals</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Animate in
        requestAnimationFrame(() => {
            modal.classList.add('visible');
        });
    }

    closeWelcome(skipTour = false) {
        const modal = document.getElementById('welcomeModal');
        if (modal) {
            modal.classList.remove('visible');
            setTimeout(() => modal.remove(), 300);
        }
        
        localStorage.setItem(this.storageKeys.welcomeSeen, 'true');
        
        if (!skipTour) {
            setTimeout(() => this.startTour(), 400);
        }
    }

    showHowItWorks(fromMenu = false) {
        // Close welcome modal if open
        const welcomeModal = document.getElementById('welcomeModal');
        if (welcomeModal && !fromMenu) {
            welcomeModal.style.display = 'none';
        }
        
        const modal = document.createElement('div');
        modal.id = 'howItWorksModal';
        modal.className = 'onboarding-modal-overlay';
        modal.innerHTML = `
            <div class="onboarding-modal how-it-works-modal">
                <div class="onboarding-modal-content">
                    <button class="modal-close-btn" onclick="glengalaOnboarding.closeHowItWorks(${!fromMenu})">&times;</button>
                    
                    <div class="welcome-icon">📋</div>
                    <h1>How It Works</h1>
                    <p class="welcome-subtitle">Fresh from Epping Market to your door</p>
                    
                    <div class="how-it-works-steps">
                        <div class="hiw-step">
                            <div class="hiw-icon">📅</div>
                            <div class="hiw-content">
                                <h3>Order Sunday – Thursday</h3>
                                <p>Build your order throughout the day. Submit by <strong>8pm</strong> for next-day pickup or delivery.</p>
                            </div>
                        </div>
                        
                        <div class="hiw-step">
                            <div class="hiw-icon">👨‍💼</div>
                            <div class="hiw-content">
                                <h3>Wayne Reviews Your Order</h3>
                                <p>Your order goes directly to Wayne who will personally review it and send you an invoice to confirm.</p>
                            </div>
                        </div>
                        
                        <div class="hiw-step">
                            <div class="hiw-icon">💳</div>
                            <div class="hiw-content">
                                <h3>Pay Your Invoice</h3>
                                <p>Once you pay, we head to the market early next morning to get your produce fresh!</p>
                            </div>
                        </div>
                        
                        <div class="hiw-step">
                            <div class="hiw-icon">⭐</div>
                            <div class="hiw-content">
                                <h3>You Get The Best First</h3>
                                <p>All orders are picked from the best produce in our cool room — you get premium quality <strong>BEFORE</strong> it hits the shelves!</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="hiw-highlight">
                        <span class="hiw-highlight-icon">🕗</span>
                        <span>Order by 8pm for next-day fulfillment</span>
                    </div>
                    
                    <div class="welcome-buttons">
                        <button class="welcome-btn-primary" onclick="glengalaOnboarding.closeHowItWorks(${!fromMenu})">
                            Got It!
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Animate in
        requestAnimationFrame(() => {
            modal.classList.add('visible');
        });
    }

    closeHowItWorks(returnToWelcome = false) {
        const modal = document.getElementById('howItWorksModal');
        if (modal) {
            modal.classList.remove('visible');
            setTimeout(() => modal.remove(), 300);
        }
        
        // Show welcome modal again if needed
        if (returnToWelcome) {
            const welcomeModal = document.getElementById('welcomeModal');
            if (welcomeModal) {
                welcomeModal.style.display = '';
            }
        }
    }

    startTour() {
        const tourCompleted = localStorage.getItem(this.storageKeys.tourCompleted);
        if (tourCompleted) return;
        
        this.tourStep = 0;
        this.showTourStep();
    }

    showTourStep() {
        // Remove any existing tour elements
        this.removeTourElements();
        
        if (this.tourStep >= this.tourSteps.length) {
            this.completeTour();
            return;
        }

        const step = this.tourSteps[this.tourStep];
        
        // Find target element
        let target = document.querySelector(step.target);
        if (!target && step.fallbackSelector) {
            target = document.querySelector(step.fallbackSelector);
        }
        
        if (!target) {
            // Skip this step if target not found
            this.tourStep++;
            this.showTourStep();
            return;
        }

        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'tour-overlay';
        overlay.id = 'tourOverlay';
        document.body.appendChild(overlay);

        // Highlight target
        const rect = target.getBoundingClientRect();
        const highlight = document.createElement('div');
        highlight.className = 'tour-highlight';
        highlight.id = 'tourHighlight';
        highlight.style.cssText = `
            top: ${rect.top + window.scrollY - 8}px;
            left: ${rect.left - 8}px;
            width: ${rect.width + 16}px;
            height: ${rect.height + 16}px;
        `;
        document.body.appendChild(highlight);
        
        // Add floating label above the highlight
        if (step.highlightLabel) {
            const label = document.createElement('div');
            label.className = 'tour-highlight-label';
            label.id = 'tourHighlightLabel';
            label.textContent = step.highlightLabel;
            label.style.cssText = `
                position: absolute;
                top: ${rect.top + window.scrollY - 40}px;
                left: ${rect.left + (rect.width / 2)}px;
                transform: translateX(-50%);
                background: #22c55e;
                color: #fff;
                font-weight: 700;
                font-size: 0.9em;
                padding: 6px 16px;
                border-radius: 20px;
                z-index: 10002;
                box-shadow: 0 4px 15px rgba(34, 197, 94, 0.5);
                animation: bounce-label 1s ease-in-out infinite;
            `;
            document.body.appendChild(label);
        }

        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'tour-tooltip';
        tooltip.id = 'tourTooltip';
        tooltip.innerHTML = `
            <div class="tour-tooltip-content">
                <div class="tour-step-indicator">${this.tourStep + 1} of ${this.tourSteps.length}</div>
                <h3>${step.title}</h3>
                <p>${step.text}</p>
                <div class="tour-buttons">
                    <button class="tour-btn-skip" onclick="glengalaOnboarding.skipTour()">Skip</button>
                    <button class="tour-btn-next" onclick="glengalaOnboarding.nextTourStep()">
                        ${this.tourStep < this.tourSteps.length - 1 ? 'Next' : 'Got it!'}
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(tooltip);

        // Position tooltip
        this.positionTooltip(tooltip, rect, step.position);

        // Animate in
        requestAnimationFrame(() => {
            overlay.classList.add('visible');
            highlight.classList.add('visible');
            tooltip.classList.add('visible');
        });

        // Scroll target into view if needed
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    positionTooltip(tooltip, targetRect, position) {
        const tooltipRect = tooltip.getBoundingClientRect();
        const padding = 20;
        let top, left;

        switch (position) {
            case 'bottom':
                top = targetRect.bottom + window.scrollY + padding;
                left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'top':
                top = targetRect.top + window.scrollY - tooltipRect.height - padding;
                left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'left':
                top = targetRect.top + window.scrollY + (targetRect.height / 2) - (tooltipRect.height / 2);
                left = targetRect.left - tooltipRect.width - padding;
                break;
            case 'right':
                top = targetRect.top + window.scrollY + (targetRect.height / 2) - (tooltipRect.height / 2);
                left = targetRect.right + padding;
                break;
            default:
                top = targetRect.bottom + window.scrollY + padding;
                left = targetRect.left;
        }

        // Keep tooltip on screen
        left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding));
        top = Math.max(padding, top);

        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
    }

    nextTourStep() {
        this.tourStep++;
        this.showTourStep();
    }

    skipTour() {
        this.completeTour();
    }

    completeTour() {
        this.removeTourElements();
        localStorage.setItem(this.storageKeys.tourCompleted, 'true');
        
        // Show completion message
        this.showToast('You\'re all set! Happy shopping 🛒');
    }

    removeTourElements() {
        ['tourOverlay', 'tourHighlight', 'tourTooltip', 'tourHighlightLabel'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.remove();
        });
    }

    showToast(message, duration = 3000) {
        const toast = document.createElement('div');
        toast.className = 'onboarding-toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        requestAnimationFrame(() => toast.classList.add('visible'));
        
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    // Method to reset onboarding (for testing)
    reset() {
        Object.values(this.storageKeys).forEach(key => {
            localStorage.removeItem(key);
        });
        console.log('Onboarding reset. Refresh the page to see welcome flow.');
    }
}

// Initialize
const glengalaOnboarding = new GlengalaOnboarding();
document.addEventListener('DOMContentLoaded', () => {
    // Delay init to let shop render first
    setTimeout(() => glengalaOnboarding.init(), 500);
});
