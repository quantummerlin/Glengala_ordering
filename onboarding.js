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
                title: 'Browse Categories',
                text: 'Tap a category to explore our fresh vegetables, fruits, herbs and more.',
                position: 'bottom'
            },
            {
                target: '.product-list-item, .product-card',
                fallbackSelector: '.products-container',
                title: 'Add to Cart',
                text: 'Use + and − to select your quantity, then tap Add to put it in your basket.',
                position: 'bottom'
            },
            {
                target: '#cartButton, .cart-button, [onclick*="toggleCart"]',
                fallbackSelector: 'header',
                title: 'Your Basket',
                text: 'View your items here. Choose pickup or delivery at checkout!',
                position: 'left'
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

                    <div class="welcome-steps">
                        <div class="welcome-step">
                            <div class="step-number">1</div>
                            <div class="step-text">Browse categories</div>
                        </div>
                        <div class="welcome-step">
                            <div class="step-number">2</div>
                            <div class="step-text">Add items to cart</div>
                        </div>
                        <div class="welcome-step">
                            <div class="step-number">3</div>
                            <div class="step-text">Pickup or delivery</div>
                        </div>
                    </div>

                    <div class="welcome-buttons">
                        <button class="welcome-btn-primary" onclick="glengalaOnboarding.closeWelcome(false)">
                            👋 Show Me Around
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
        ['tourOverlay', 'tourHighlight', 'tourTooltip'].forEach(id => {
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
