// Customer Shop JavaScript Functions - Enhanced with Persistent Storage
class GlengalaShop {
    constructor() {
        this.cart = [];
        this.filteredProducts = [];
        this.expandedCategories = new Set();
        this.productsLoaded = false;
        this.shopReady = false;
        this.init();
    }

    async init() {
        // Expose shop instance globally for live pricing updates
        window.shop = this;
        
        // CRITICAL: Load categories FIRST before fetching products
        this.loadCategories();
        
        // Mark as ready NOW so live pricing can update during product fetch
        this.shopReady = true;
        
        // Wait for live pricing to load products from database
        // This ensures we have photos and latest prices
        await this.waitForProducts();
        
        this.loadAllData();
        this.updateCartDisplay(); // Update cart count immediately after loading
        this.loadBanner();
        this.setupEventListeners();
        this.setupMobileOptimizations();
        this.setupDataManagement();
        
        // Load customization immediately (no delay needed)
        this.loadCustomization();
        
        // Mark products loaded and render
        this.productsLoaded = true;
        this.renderShop();
    }

    async waitForProducts() {
        // If livePricing has already loaded products, use them
        if (window.livePricing && window.livePricing.products && window.livePricing.products.length > 0) {
            window.products = window.livePricing.products;
            console.log('✅ Using', window.products.length, 'products from live pricing');
            return;
        }
        
        // Wait for live pricing to finish loading (max 3 seconds)
        let attempts = 0;
        while (attempts < 30) {
            await new Promise(r => setTimeout(r, 100));
            if (window.livePricing && !window.livePricing.isLoading && window.livePricing.products.length > 0) {
                window.products = window.livePricing.products;
                console.log('✅ Loaded', window.products.length, 'products from database');
                return;
            }
            attempts++;
        }
        
        // Fallback to static products if database not available
        if (!window.products || window.products.length === 0) {
            console.log('⚠️ Using static products data');
            loadProducts(); // From products-data.js
        }
    }

    setupEventListeners() {
        const searchEl = document.getElementById('shopSearch');
        if (searchEl) {
            searchEl.addEventListener('input', (e) => {
                this.searchProducts(e.target.value);
            });
        }

        // Touch-friendly cart interactions (only if cartSummary exists)
        const cartSummary = document.getElementById('cartSummary');
        let touchStartY = 0;
        if (cartSummary) {
            cartSummary.addEventListener('touchstart', (e) => {
                touchStartY = e.touches[0].clientY;
            });

            cartSummary.addEventListener('touchmove', (e) => {
                const touchY = e.touches[0].clientY;
                const deltaY = touchStartY - touchY;
                
                if (deltaY > 50) {
                    cartSummary.classList.add('expanded');
                } else if (deltaY < -50) {
                    cartSummary.classList.remove('expanded');
                }
            });
        }

        // Save data before page unload
        window.addEventListener('beforeunload', () => {
            this.saveAllData();
        });
    }

    setupDataManagement() {
        // Data management removed from shop page - only available in admin
    }

    setupMobileOptimizations() {
        // Prevent zoom on input focus for mobile
        const inputs = document.querySelectorAll('input[type="number"]');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.style.fontSize = '16px';
            });
            input.addEventListener('blur', () => {
                input.style.fontSize = '';
            });
        });
    }

    getActiveProducts() {
        // Always use window.products to get latest data from API
        const allProducts = window.products || products || [];
        return allProducts.filter(p => p.active && p.name.trim() !== "");
    }

    getProductsByCategory(category) {
        const activeProducts = this.getActiveProducts();
        
        const filtered = activeProducts.filter(p => {
            return p.category === category;
        });
        
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    loadCategories() {
        // Load categories from localStorage, fallback to defaults
        const saved = localStorage.getItem('glengala_categories');
        
        if (saved) {
            try {
                this.categories = JSON.parse(saved);
                // Ensure all categories have the required structure
                this.categories = this.categories.map(cat => ({
                    id: cat.id,
                    name: cat.name,
                    emoji: cat.emoji,
                    active: cat.active !== undefined ? cat.active : true
                }));
            } catch (e) {
                this.useDefaultCategories();
            }
        } else {
            // No saved categories, use defaults
            this.useDefaultCategories();
        }
        
        this.activeCategories = this.categories.filter(cat => cat.active);
    }

    loadDefaultCategories() {
        this.categories = [
            { id: 'vegetables', name: 'Fresh Vegetables', emoji: '🥕', active: true },
            { id: 'fruits', name: 'Fresh Fruits', emoji: '🍎', active: true },
            { id: 'herbs', name: 'Herbs & Salads', emoji: '🌿', active: true },
            { id: 'juices', name: 'Juices & Beverages', emoji: '🧃', active: true },
            { id: 'nuts', name: 'Nuts & Dried Goods', emoji: '🥜', active: true },
            { id: 'flowers', name: 'Fresh Flowers', emoji: '🌸', active: true },
            { id: 'specials', name: 'Weekly Specials', emoji: '⭐', active: true }
        ];
    }

    useDefaultCategories() {
        this.categories = [
            { id: 'vegetables', name: 'Fresh Vegetables', emoji: '🥕', active: true },
            { id: 'fruits', name: 'Fresh Fruits', emoji: '🍎', active: true },
            { id: 'herbs', name: 'Herbs & Salads', emoji: '🌿', active: true },
            { id: 'juices', name: 'Juices & Beverages', emoji: '🧃', active: true },
            { id: 'nuts', name: 'Nuts & Dried Goods', emoji: '🥜', active: true },
            { id: 'flowers', name: 'Fresh Flowers', emoji: '🌸', active: true },
            { id: 'specials', name: 'Weekly Specials', emoji: '⭐', active: true }
        ];
    }

    renderShop() {
        console.log('🏪 renderShop called');
        console.log('  - activeCategories:', this.activeCategories?.length || 0);
        console.log('  - window.products:', (window.products || []).length);
        
        if (!this.activeCategories || this.activeCategories.length === 0) {
            console.error('❌ No active categories to render');
            return;
        }
        
        // Generate category sections first
        this.generateCategorySections();
        
        // Update in-cart indicators for items already in cart
        this.updateProductCartIndicators();
        this.updateFloatingSubtotal();
    }



    generateCategorySections() {
        const categoriesContainer = document.getElementById('categoriesContainer');
        if (!categoriesContainer) {
            console.error('❌ categoriesContainer not found');
            return;
        }
        
        if (!this.activeCategories || this.activeCategories.length === 0) {
            console.error('❌ No active categories');
            return;
        }
        
        console.log('🏪 Generating category sections for', this.activeCategories.length, 'categories');
        
        try {
            const htmlContent = this.activeCategories.map(category => {
                // Check saved collapsed state - default to collapsed on first visit
                const savedState = localStorage.getItem(`glengala_category_${category.id}_collapsed`);
                const isCollapsed = savedState === null ? true : savedState === 'true';
                const displayStyle = isCollapsed ? 'none' : 'block';
                const arrowSymbol = isCollapsed ? '▼' : '▲';
                
                return `
                <div style="background: #1a1a1a; border: 1px solid #333; margin: 10px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.3); overflow: hidden;">
                    <div class="category-header-dynamic" style="background: linear-gradient(135deg, #222, #333); color: white; padding: 15px; cursor: pointer; position: relative; overflow: hidden; font-size: 1.2rem;" data-category="${category.id}">
                        <span style="font-size: 1.2em; margin-right: 10px;">${category.emoji}</span>
                        <span style="font-weight: bold;">${category.name}</span>
                        <span class="category-arrow" style="float: right; transition: transform 0.3s ease;">${arrowSymbol}</span>
                        <div class="gradient-line" style="position: absolute; bottom: 0; left: -100%; width: 100%; height: 3px; background: linear-gradient(90deg, #4ade80, #22c55e); transition: left 0.6s ease;"></div>
                    </div>
                    <div id="${category.id}Content" style="display: ${displayStyle}; padding: 10px; background: #1a1a1a;">
                        <ul id="${category.id}Products" class="products-list" style="list-style: none; padding: 0; margin: 0;">
                            <!-- Products will be loaded here as list items -->
                        </ul>
                    </div>
                </div>
            `;
            }).join('');
            
            categoriesContainer.innerHTML = htmlContent;
            console.log('✅ Category sections created');
            
            // Apply the same gradient as the header to category tabs
            this.applySavedGradientToCategories();
            
            // Add click handlers for category toggles
            this.addCategoryToggleHandlers();
            
            // Load products into each category immediately
            this.loadProductsIntoCategories();
            
        } catch (error) {
            console.error('❌ Error generating sections:', error);
        }
    }

    loadProductsIntoCategories() {
        if (!this.activeCategories || this.activeCategories.length === 0) {
            console.error('❌ No active categories found for product loading');
            return;
        }
        
        console.log('📦 Loading products into', this.activeCategories.length, 'categories');
        
        this.activeCategories.forEach(category => {

            const productsContainer = document.getElementById(`${category.id}Products`);
            if (!productsContainer) {
                console.error(`❌ Products container not found: ${category.id}Products`);
                return;
            }
            

            
            const categoryProducts = this.getProductsByCategory(category.id);
            console.log(`📂 Category ${category.id}:`, categoryProducts.length, 'products');
            
            if (categoryProducts.length > 0) {
            }
            
            if (categoryProducts.length === 0) {
                productsContainer.innerHTML = '<div class="no-products">No items available in this category</div>';
                return;
            }

            try {
                const productHTML = categoryProducts.map(product => this.createProductCard(product)).join('');
                productsContainer.innerHTML = productHTML;
                console.log(`✅ Rendered ${categoryProducts.length} products in ${category.id}`);
            } catch (error) {
                console.error('❌ Error rendering products:', error);
            }
        });
    }

    addCategoryToggleHandlers() {
        // Add click handlers to category headers with data-category attribute
        document.querySelectorAll('[data-category]').forEach(header => {
            const category = header.getAttribute('data-category');
            if (category) {
                header.addEventListener('click', () => {
                    const content = document.getElementById(`${category}Content`);
                    const arrow = header.querySelector('.category-arrow');
                    
                    if (content) {
                        if (content.style.display === 'none' || content.style.display === '') {
                            content.style.display = 'block';
                            if (arrow) arrow.textContent = '▲';
                            localStorage.removeItem(`glengala_category_${category}_collapsed`);
                        } else {
                            content.style.display = 'none';
                            if (arrow) arrow.textContent = '▼';
                            localStorage.setItem(`glengala_category_${category}_collapsed`, 'true');
                        }
                    }
                });
            }
        });
        console.log('Category toggle handlers added:', document.querySelectorAll('[data-category]').length);
    }

    applySavedGradientToCategories() {
        // Will be called after API settings are loaded
        // Settings are now in window.shopSettings
        try {
            if (window.shopSettings) {
                const settings = window.shopSettings;
                const categoryHeaders = document.querySelectorAll('.category-header-dynamic');
                
                categoryHeaders.forEach(header => {
                    const gradientLine = header.querySelector('.gradient-line');
                    
                    const startColor = settings.gradient_start || '#4CAF50';
                    const endColor = settings.gradient_end || '#45a049';
                    
                    // Update the gradient line with saved colors
                    if (gradientLine) {
                        gradientLine.style.background = `linear-gradient(90deg, ${startColor}, ${endColor})`;
                    }
                    
                    console.log('Applied gradient to bottom line');
                    
                    // Add hover animation effects
                    header.addEventListener('mouseenter', () => {
                        if (gradientLine) {
                            gradientLine.style.left = '0%';
                        }
                    });
                    
                    header.addEventListener('mouseleave', () => {
                        if (gradientLine) {
                            gradientLine.style.left = '-100%';
                        }
                    });
                });
            }
        } catch (error) {
            console.error('Error applying gradient to categories:', error);
        }
    }

    showCategory(categoryId) {
        // This function can be used to programmatically show a specific category
        this.expandCategory(categoryId);
        console.log(`Showing category: ${categoryId}`);
    }

    applyCustomizationToCategoryTabs() {
        // Apply saved gradient to category tabs to match header
        try {
            if (window.shopSettings) {
                const settings = window.shopSettings;
                const categoryTabs = document.querySelectorAll('.category-tab');
                
                const startColor = settings.gradient_start || '#4CAF50';
                const endColor = settings.gradient_end || '#45a049';
                const angle = settings.gradient_angle || 135;
                const gradientStyle = `linear-gradient(${angle}deg, ${startColor}, ${endColor})`;
                
                categoryTabs.forEach(tab => {
                    tab.style.background = gradientStyle;
                });
            } else {
                // Apply default if no settings
                const categoryTabs = document.querySelectorAll('.category-tab');
                categoryTabs.forEach(tab => {
                    tab.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
                });
            }
        } catch (error) {
            console.error('Error applying customization to category tabs:', error);
        }
    }

    renderCategory(category) {
        const container = document.getElementById(`${category}Products`);
        console.log(`Rendering category: ${category}, container found:`, !!container);
        
        if (!container) {
            console.error(`Container not found for category: ${category}Products`);
            return; // Guard: skip if container not present in DOM
        }
        
        const categoryProducts = this.getProductsByCategory(category);
        console.log(`Products for ${category}:`, categoryProducts.length);
        
        if (categoryProducts.length === 0) {
            container.innerHTML = '<div class="no-products">No items available in this category</div>';
            return;
        }

        container.innerHTML = categoryProducts.map(product => this.createProductCard(product)).join('');
        console.log(`Rendered ${categoryProducts.length} products for ${category}`);
    }

    createProductCard(product) {
        const quantityOptions = this.getQuantityOptions(product);
        const emoji = this.getProductEmoji(product);
        const unitInfo = this.getUnitInfo(product);
        const initialDisplay = this.formatQuantityDisplay(quantityOptions.min, quantityOptions.increment, product.unit);
        
        // Check if already in cart
        const cartItem = this.cart.find(item => item.id === product.id);
        const inCartDisplay = cartItem ? this.formatCartQuantity(cartItem) : '';
        const inCartTotal = cartItem ? `$${cartItem.total.toFixed(2)}` : '';
        
        // Two-line list item format for mobile
        return `
            <li class="product-list-item" data-product-id="${product.id}" style="
                background: #222;
                border-radius: 10px;
                margin-bottom: 10px;
                padding: 12px;
                display: flex;
                align-items: center;
                gap: 12px;
                box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                ${cartItem ? 'border-left: 3px solid #22c55e;' : ''}
            ">
                <div class="product-photo-list" style="
                    width: 55px;
                    height: 55px;
                    flex-shrink: 0;
                    border-radius: 8px;
                    overflow: hidden;
                    background: #333;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.8em;
                    position: relative;
                ">
                    ${product.photo ? `<img src="${product.photo}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">` : emoji}
                    ${cartItem ? `<div style="position:absolute;top:-4px;right:-4px;background:#22c55e;color:#fff;font-size:0.65em;font-weight:700;padding:2px 5px;border-radius:8px;">✓</div>` : ''}
                </div>
                
                <div class="product-details" style="flex: 1; min-width: 0;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
                        <div class="product-name-list" style="font-weight: 600; color: #fff; font-size: 0.95em; line-height: 1.2; flex:1;">
                            ${product.name}
                        </div>
                        ${cartItem ? `<div id="in-cart-${product.id}" style="background:rgba(34,197,94,0.15); color:#22c55e; font-size:0.75em; font-weight:600; padding:3px 8px; border-radius:10px; white-space:nowrap; margin-left:8px;">${inCartDisplay} = ${inCartTotal}</div>` : `<div id="in-cart-${product.id}" style="display:none;"></div>`}
                    </div>
                    <div class="product-row" style="display: flex; flex-direction: column; gap: 6px;">
                        <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                            <div class="product-price-list" style="color: #4ade80; font-weight: bold; font-size: 0.95em; white-space: nowrap;">
                                $${product.price.toFixed(2)}<span style="color: #666; font-size: 0.75em; font-weight: normal;">/${unitInfo.display}</span>
                            </div>
                            <div class="product-controls-list" style="display: flex; align-items: center; gap: 4px; flex-shrink: 0;">
                                <div class="quantity-compact" style="display: flex; align-items: center; background: #333; border-radius: 6px; overflow: hidden;">
                                    <button onclick="shop.updateQuantity(${product.id}, -1)" style="width: 26px; height: 26px; border: none; background: #444; color: #fff; font-size: 1em; cursor: pointer;">−</button>
                                    <input type="hidden" id="qty-${product.id}" value="${quantityOptions.min}" min="${quantityOptions.min}" max="${quantityOptions.max}" step="${quantityOptions.step}">
                                    <span id="qty-display-${product.id}" style="min-width: 38px; height: 26px; background: #333; color: #fff; text-align: center; font-size: 0.8em; display: flex; align-items: center; justify-content: center; padding: 0 2px;">${initialDisplay}</span>
                                    <button onclick="shop.updateQuantity(${product.id}, 1)" style="width: 26px; height: 26px; border: none; background: #444; color: #fff; font-size: 1em; cursor: pointer;">+</button>
                                </div>
                                <button onclick="shop.addToCart(${product.id})" style="background: #22c55e; color: #fff; border: none; border-radius: 6px; padding: 5px 8px; font-weight: 600; font-size: 0.8em; cursor: pointer;">${cartItem ? '+' : 'Add'}</button>
                            </div>
                        </div>
                        <div id="preview-total-${product.id}" style="background: rgba(251,191,36,0.1); border-radius: 6px; padding: 4px 8px; display: flex; align-items: center; justify-content: center; gap: 6px;">
                            <span style="color: #fbbf24; font-size: 0.8em; font-weight: 600;">${initialDisplay} = $${this.calculateItemTotal(product, quantityOptions.min).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </li>
        `;
    }

    getProductEmoji(product) {
        const emojis = {
            'vegetables': ['🥬', '🥒', '🥕', '🍅', '🥔', '🌽', '🥦', '🍆', '🌶️', '🍄', '🚀', '🥜', '🥖'],
            'fruits': ['🍎', '🍌', '🍊', '🍇', '🍓', '🥝', '🍑', '🍒', '🥭', '🍍', '🍉', '🍈'],
            'herbs': ['🌿', '🌱', '🥬', '🍃', '🌾', '🥒', '🌿'],
            'juices': ['🥤', '🍹', '🍊', '🍎', '🥬', '🥒', '🍋', '🥥'],
            'nuts': ['🥜', '🌰', '🌻', '🥥', '🌰', '🥨']
        };
        
        const categoryEmojis = emojis[product.category] || ['🥒'];
        return categoryEmojis[Math.floor(Math.random() * categoryEmojis.length)];
    }

    getQuantityOptions(product) {
        // Get increment setting from either increment field or unit field
        const increment = product.increment || '1';
        const unit = product.unit || 'each';
        
        // Check unit for weight-based products (hundredg, halfkg)
        if (unit === 'hundredg') {
            return { step: 1, min: 1, max: 50, increment: '100g' };  // 1 = 100g
        }
        if (unit === 'halfkg') {
            return { step: 1, min: 1, max: 20, increment: '500g' };  // 1 = 500g
        }
        
        // Check increment field for products with kg unit
        switch (increment) {
            case '100g':
                return { step: 0.1, min: 0.1, max: 5, increment: '100g' };  // 100g = 0.1kg increments
            case '500g':
                return { step: 0.5, min: 0.5, max: 10, increment: '500g' }; // 500g = 0.5kg increments
            case '1':
            default:
                // Whole number increments
                return { step: 1, min: 1, max: 20, increment: '1' };
        }
    }

    formatQuantityDisplay(value, increment, unit) {
        // Handle unit-based products (hundredg, halfkg)
        if (unit === 'hundredg') {
            const grams = value * 100;
            if (grams >= 1000) {
                return `${grams / 1000}kg`;
            }
            return `${grams}g`;
        }
        if (unit === 'halfkg') {
            const grams = value * 500;
            if (grams >= 1000) {
                return `${grams / 1000}kg`;
            }
            return `${grams}g`;
        }
        
        // Handle increment-based products (kg with 100g/500g increments)
        if (increment === '100g' || increment === '500g') {
            const grams = Math.round(value * 1000);
            if (grams >= 1000) {
                return `${grams / 1000}kg`;
            }
            return `${grams}g`;
        }
        
        // Whole numbers
        return value.toString();
    }

    getUnitInfo(product) {
        // Get unit and increment
        const unit = product.unit || 'each';
        const increment = product.increment || '1';
        
        // Generate description based on unit and increment
        let display = '';
        let description = '';
        
        switch (unit) {
            case 'kg':
                display = 'per kg';
                if (increment === '100g') {
                    description = 'Select in 100g increments';
                } else if (increment === '500g') {
                    description = 'Select in 500g increments';
                } else {
                    description = 'Select by weight';
                }
                break;
            case 'hundredg':
                display = 'per kg';  // Price is per kg, sold in 100g increments
                description = 'Sold in 100g increments';
                break;
            case 'halfkg':
                display = 'per kg';  // Price is per kg, sold in 500g increments
                description = 'Sold in 500g increments';
                break;
            case 'each':
                display = 'each';
                description = 'Sold individually';
                break;
            case 'bunch':
                display = 'per bunch';
                description = 'Sold by the bunch';
                break;
            case 'punnet':
                display = 'per punnet';
                description = 'Sold by the punnet';
                break;
            default:
                display = unit;
                description = `Sold by ${unit}`;
        }

        return {
            display: display,
            description: description
        };
    }

    calculateItemTotal(product, quantity) {
        const unit = product.unit || 'each';
        
        // For hundredg: quantity is number of 100g units, price is per kg
        // So 6 × 100g at $6.99/kg = 0.6kg × $6.99 = $4.19
        if (unit === 'hundredg') {
            return product.price * (quantity * 0.1); // quantity × 100g = quantity × 0.1kg
        }
        
        // For halfkg: quantity is number of 500g units, price is per kg
        // So 3 × 500g at $3.99/kg = 1.5kg × $3.99 = $5.99
        if (unit === 'halfkg') {
            return product.price * (quantity * 0.5); // quantity × 500g = quantity × 0.5kg
        }
        
        // For all other units, price is multiplied directly by quantity
        // - $10 per kg × 0.3kg = $3.00
        // - $5 per bunch × 2 bunches = $10.00
        // - $3 each × 4 items = $12.00
        return product.price * quantity;
    }

    formatCartQuantity(item) {
        const increment = item.increment || '1';
        const unit = item.unit || 'each';
        
        // Handle unit-based weight products (hundredg, halfkg)
        if (unit === 'hundredg') {
            const grams = item.quantity * 100;
            if (grams >= 1000) {
                return `${grams / 1000}kg`;
            }
            return `${grams}g`;
        }
        if (unit === 'halfkg') {
            const grams = item.quantity * 500;
            if (grams >= 1000) {
                return `${grams / 1000}kg`;
            }
            return `${grams}g`;
        }
        
        // Handle increment-based products (kg with 100g/500g increments)
        if (increment === '100g' || increment === '500g') {
            const grams = Math.round(item.quantity * 1000);
            if (grams >= 1000) {
                return `${grams / 1000}kg`;
            }
            return `${grams}g`;
        }
        
        // For whole numbers (bunches, each, punnets, kg)
        if (unit === 'kg') {
            return `${item.quantity}kg`;
        }
        return `${item.quantity} ${this.getUnitDisplayName(item.unit, item.quantity)}`;
    }

    formatPriceBreakdown(item) {
        const increment = item.increment || '1';
        const unit = item.unit || 'each';
        
        // Handle unit-based weight products - price is per kg, sold in increments
        if (unit === 'hundredg') {
            return `@ $${item.price.toFixed(2)}/kg (100g increments)`;
        }
        if (unit === 'halfkg') {
            return `@ $${item.price.toFixed(2)}/kg (500g increments)`;
        }
        
        if (increment === '100g' || increment === '500g') {
            // Weight-based pricing: show "@ $4.99/kg"
            return `@ $${item.price.toFixed(2)}/kg`;
        } else {
            // Unit-based pricing: show "@ $2.50 each" or "@ $3.00/bunch"
            if (unit === 'kg') {
                return `@ $${item.price.toFixed(2)}/kg`;
            }
            if (unit === 'each') {
                return `@ $${item.price.toFixed(2)} each`;
            }
            return `@ $${item.price.toFixed(2)}/${item.unit}`;
        }
    }

    getUnitDisplayName(unit, quantity) {
        const names = {
            'kg': 'per kg',
            'each': quantity === 1 ? 'item' : 'items',
            'bunch': quantity === 1 ? 'bunch' : 'bunches',
            'punnet': quantity === 1 ? 'punnet' : 'punnets',
            'hundredg': 'per 100g',
            'halfkg': 'per 500g'
        };
        return names[unit] || unit;
    }

    updateQuantity(productId, change) {
        const input = document.getElementById(`qty-${productId}`);
        const display = document.getElementById(`qty-display-${productId}`);
        const previewTotal = document.getElementById(`preview-total-${productId}`);
        if (!input) return;
        
        // Use window.products for latest data
        const allProducts = window.products || products || [];
        const product = allProducts.find(p => p.id === productId);
        if (!product) return;
        
        const options = this.getQuantityOptions(product);
        
        let newQuantity = parseFloat(input.value) + (change * options.step);
        newQuantity = Math.round(newQuantity * 10) / 10; // Round to 1 decimal
        
        if (newQuantity < options.min) newQuantity = options.min;
        if (newQuantity > options.max) newQuantity = options.max;
        
        input.value = newQuantity;
        
        // Update display to show human-readable format
        const displayText = this.formatQuantityDisplay(newQuantity, options.increment, product.unit);
        if (display) {
            display.textContent = displayText;
        }
        
        // Update live preview total
        if (previewTotal) {
            const total = this.calculateItemTotal(product, newQuantity);
            previewTotal.innerHTML = `<span style="color: #fbbf24; font-size: 0.8em; font-weight: 600;">${displayText} = $${total.toFixed(2)}</span>`;
        }
    }

    addToCart(productId) {
        // Use window.products to get latest API data
        const allProducts = window.products || products || [];
        const product = allProducts.find(p => p.id === productId);
        if (!product) return;
        
        const quantity = parseFloat(document.getElementById(`qty-${productId}`).value);
        console.log('Adding to cart:', product.name, 'quantity:', quantity);
        
        const cartItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            unit: product.unit,
            increment: product.increment || '1',
            quantity: quantity,
            total: this.calculateItemTotal(product, quantity)
        };
        
        // Check if item already in cart
        const existingIndex = this.cart.findIndex(item => item.id === productId);
        if (existingIndex > -1) {
            this.cart[existingIndex].quantity += quantity;
            this.cart[existingIndex].total = this.calculateItemTotal(product, this.cart[existingIndex].quantity);
            console.log('Updated existing item, new quantity:', this.cart[existingIndex].quantity);
        } else {
            this.cart.push(cartItem);
            console.log('Added new item to cart');
        }
        
        console.log('Cart now has', this.cart.length, 'items, total items:', this.cart.reduce((sum, item) => sum + item.quantity, 0));
        this.saveAllData();
        this.updateCartDisplay();
        this.updateProductCardInCart(productId);
        this.updateFloatingSubtotal();
        this.showAddedToCartNotification(product.name);
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveAllData();
        this.updateCartDisplay();
        this.updateProductCardInCart(productId);
        this.updateFloatingSubtotal();
    }
    
    // Update all product card in-cart indicators (used on page load and after cart changes)
    updateProductCartIndicators() {
        // Update indicators for all items in cart
        this.cart.forEach(item => {
            this.updateProductCardInCart(item.id);
        });
        console.log('🛒 Updated cart indicators for', this.cart.length, 'items');
    }
    
    // Update the in-cart indicator on a product card
    updateProductCardInCart(productId) {
        const cartItem = this.cart.find(item => item.id === productId);
        const inCartEl = document.getElementById(`in-cart-${productId}`);
        const productCard = document.querySelector(`[data-product-id="${productId}"]`);
        
        if (inCartEl) {
            if (cartItem) {
                const display = this.formatCartQuantity(cartItem);
                const total = `$${cartItem.total.toFixed(2)}`;
                inCartEl.innerHTML = `${display} = ${total}`;
                inCartEl.style.display = 'block';
                inCartEl.style.background = 'rgba(34,197,94,0.15)';
                inCartEl.style.color = '#22c55e';
                inCartEl.style.fontSize = '0.75em';
                inCartEl.style.fontWeight = '600';
                inCartEl.style.padding = '3px 8px';
                inCartEl.style.borderRadius = '10px';
                inCartEl.style.whiteSpace = 'nowrap';
                inCartEl.style.marginLeft = '8px';
            } else {
                inCartEl.style.display = 'none';
            }
        }
        
        // Update card border
        if (productCard) {
            productCard.style.borderLeft = cartItem ? '3px solid #22c55e' : 'none';
        }
        
        // Update Add button text
        const addBtn = productCard?.querySelector('button[onclick*="addToCart"]');
        if (addBtn) {
            addBtn.textContent = cartItem ? '+' : 'Add';
        }
    }
    
    // Create or update floating subtotal bar
    updateFloatingSubtotal() {
        let subtotalBar = document.getElementById('floatingSubtotal');
        const fixedCartBtn = document.querySelector('[onclick="openCart()"]')?.parentElement;
        const subtotal = this.cart.reduce((sum, item) => sum + item.total, 0);
        const itemCount = this.cart.length;
        
        if (itemCount === 0) {
            if (subtotalBar) subtotalBar.remove();
            // Show fixed cart button when cart is empty
            if (fixedCartBtn) fixedCartBtn.style.display = 'flex';
            return;
        }
        
        // Hide fixed cart button when floating subtotal is showing
        if (fixedCartBtn) fixedCartBtn.style.display = 'none';
        
        // Calculate delivery threshold progress
        const toFreeDelivery = Math.max(0, 50 - subtotal);
        const progressPercent = Math.min(100, (subtotal / 50) * 100);
        
        if (!subtotalBar) {
            subtotalBar = document.createElement('div');
            subtotalBar.id = 'floatingSubtotal';
            subtotalBar.style.cssText = `
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: linear-gradient(to top, #1a1a1a 0%, #222 100%);
                padding: 12px 16px;
                padding-bottom: calc(12px + env(safe-area-inset-bottom, 0));
                z-index: 1001;
                box-shadow: 0 -4px 20px rgba(0,0,0,0.4);
                border-top: 1px solid #333;
            `;
            document.body.appendChild(subtotalBar);
            
            // Add padding to body to prevent content being hidden
            document.body.style.paddingBottom = '100px';
        }
        
        subtotalBar.innerHTML = `
            <div style="max-width: 600px; margin: 0 auto;">
                ${toFreeDelivery > 0 ? `
                    <div style="margin-bottom: 8px;">
                        <div style="display: flex; justify-content: space-between; font-size: 0.8em; margin-bottom: 4px;">
                            <span style="color: #888;">Free delivery progress</span>
                            <span style="color: ${progressPercent >= 100 ? '#22c55e' : '#fbbf24'};">$${toFreeDelivery.toFixed(2)} to go</span>
                        </div>
                        <div style="height: 4px; background: #333; border-radius: 2px; overflow: hidden;">
                            <div style="height: 100%; width: ${progressPercent}%; background: linear-gradient(90deg, #22c55e, #16a34a); border-radius: 2px; transition: width 0.3s;"></div>
                        </div>
                    </div>
                ` : `
                    <div style="text-align: center; color: #22c55e; font-size: 0.8em; margin-bottom: 8px;">
                        🎉 FREE delivery unlocked!
                    </div>
                `}
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="color: #888; font-size: 0.8em;">${itemCount} item${itemCount > 1 ? 's' : ''} in basket</div>
                        <div style="color: #fff; font-size: 1.3em; font-weight: 700;">$${subtotal.toFixed(2)}</div>
                    </div>
                    <button onclick="openCart()" style="
                        background: linear-gradient(135deg, #22c55e, #16a34a);
                        color: #fff;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 10px;
                        font-weight: 600;
                        font-size: 1em;
                        cursor: pointer;
                        box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);
                    ">View Basket →</button>
                </div>
            </div>
        `;
    }

    updateCartDisplay() {
        // Update cart count badge first (always available)
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems.toString();
            // Hide badge if empty
            cartCount.style.display = totalItems > 0 ? 'inline-flex' : 'none';
        }
        
        // Update full cart display if elements exist
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        if (!cartItems || !cartTotal) return;
        
        if (this.cart.length === 0) {
            cartItems.innerHTML = `
                <div style="text-align:center; padding:40px 20px; color:#888;">
                    <div style="font-size:3rem; margin-bottom:16px;">🥬</div>
                    <div style="font-size:1.1rem; margin-bottom:8px; color:#ccc;">Your basket is empty</div>
                    <div style="font-size:0.9rem; color:#666;">Start adding some delicious fresh produce!</div>
                    <div style="font-size:0.8rem; color:#555; margin-top:12px;">🏆 Every order earns you rewards</div>
                </div>
            `;
            cartTotal.innerHTML = '';
            return;
        }
        
        cartItems.innerHTML = this.cart.map(item => {
            const quantityDisplay = this.formatCartQuantity(item);
            const priceBreakdown = this.formatPriceBreakdown(item);
            
            return `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid #333;">
                    <div style="flex:1;">
                        <div style="color:#fff; font-weight:600; font-size:1rem; margin-bottom:4px;">${item.name}</div>
                        <div style="color:#888; font-size:0.85rem;">${quantityDisplay}</div>
                        <div style="color:#666; font-size:0.8rem;">${priceBreakdown}</div>
                    </div>
                    <div style="display:flex; align-items:center; gap:12px;">
                        <div style="color:#4ade80; font-weight:bold; font-size:1.1rem;">$${item.total.toFixed(2)}</div>
                        <button onclick="shop.removeFromCart(${item.id})" style="background:#ff4444; border:none; color:#fff; width:28px; height:28px; border-radius:50%; cursor:pointer; font-size:1rem; display:flex; align-items:center; justify-content:center;">✕</button>
                    </div>
                </div>
            `;
        }).join('');
        
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = this.cart.reduce((sum, item) => sum + item.total, 0);
        
        cartTotal.innerHTML = `
            <div style="display:flex; justify-content:space-between; color:#888; font-size:0.95rem; margin-bottom:8px;">
                <span>${totalItems} item${totalItems !== 1 ? 's' : ''}</span>
                <span>Subtotal: $${subtotal.toFixed(2)}</span>
            </div>
            <div style="display:flex; justify-content:space-between; color:#fff; font-size:1.2rem; font-weight:bold;">
                <span>Total</span>
                <span style="color:#4ade80;">$${subtotal.toFixed(2)}</span>
            </div>
        `;
    }

    searchProducts(query) {
        if (!query.trim()) {
            this.renderShop();
            return;
        }

        const allActiveProducts = this.getActiveProducts();
        const searchResults = allActiveProducts.filter(product => 
            product.name.toLowerCase().includes(query.toLowerCase())
        );

        // Expand all categories that have search results
        const categoriesWithResults = new Set();
        searchResults.forEach(product => {
            categoriesWithResults.add(product.category);
        });

        // Expand relevant categories and collapse others
        ['vegetables', 'fruits', 'herbs', 'juices', 'nuts'].forEach(category => {
            if (categoriesWithResults.has(category)) {
                this.expandCategory(category);
                this.renderCategoryWithResults(category, searchResults);
            } else {
                this.collapseCategory(category);
            }
        });
    }

    renderCategoryWithResults(category, searchResults) {
        const container = document.getElementById(`${category}Products`);
        const categoryResults = searchResults.filter(p => p.category === category);

        if (categoryResults.length === 0) {
            container.innerHTML = '<div class="no-products">No items found in this category</div>';
            return;
        }

        container.innerHTML = categoryResults.map(product => this.createProductCard(product)).join('');
    }

    showAddedToCartNotification(productName) {
        // Check if close to a reward
        let rewardHint = '';
        if (typeof glengalaRewards !== 'undefined') {
            const stats = glengalaRewards.getStats();
            if (stats.ordersCount === 0) {
                rewardHint = '<br><span style="font-size:0.85em;opacity:0.9;">🏆 Complete your first order to earn a reward!</span>';
            }
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.innerHTML = `✨ ${productName} added!${rewardHint}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #22c55e, #16a34a);
            color: white;
            padding: 14px 24px;
            border-radius: 12px;
            font-weight: 600;
            z-index: 2000;
            animation: slideDown 0.3s ease;
            max-width: 90vw;
            text-align: center;
            box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(-50%) translateY(-10px)';
            notification.style.transition = 'all 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 2500);
    }

    saveCart() {
        localStorage.setItem('glengalaCart', JSON.stringify(this.cart));
        console.log('Cart saved to localStorage:', this.cart.length, 'items');
    }

    loadCart() {
        const saved = localStorage.getItem('glengalaCart');
        if (saved) {
            this.cart = JSON.parse(saved);
            console.log('Cart loaded from localStorage:', this.cart.length, 'items');
        }
    }

    // Enhanced persistent storage methods
    saveAllData() {
        const dataToSave = {
            cart: this.cart,
            expandedCategories: Array.from(this.expandedCategories),
            lastVisit: new Date().toISOString()
        };
        localStorage.setItem('glengalaShopData', JSON.stringify(dataToSave));
        console.log('All shop data saved to localStorage');
    }

    loadAllData() {
        const saved = localStorage.getItem('glengalaShopData');
        if (saved) {
            const data = JSON.parse(saved);
            this.cart = data.cart || [];
            this.expandedCategories = new Set(data.expandedCategories || []);
            console.log('Loaded cart from storage:', this.cart.length, 'items');
            return true;
        }
        return false;
    }

    clearAllData() {
        if (confirm('Are you sure you want to clear all data? This will remove your cart and all preferences.')) {
            localStorage.removeItem('glengalaCart');
            localStorage.removeItem('glengalaShopData');
            localStorage.removeItem('glengalaCustomizations');
            localStorage.removeItem('glengalaBanner');
            this.cart = [];
            this.expandedCategories = new Set();
            console.log('All shop data cleared from localStorage');
            this.updateCartDisplay();
            alert('All data has been cleared! Your cart and preferences have been reset.');
        }
    }

    exportData() {
        const data = {
            cart: this.cart,
            expandedCategories: Array.from(this.expandedCategories),
            customizations: JSON.parse(localStorage.getItem('glengalaCustomizations') || '{}'),
            banner: localStorage.getItem('glengalaBanner'),
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `glengala-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        console.log('Data exported to file');
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.cart) {
                    this.cart = data.cart;
                    localStorage.setItem('glengalaCart', JSON.stringify(this.cart));
                }
                
                if (data.expandedCategories) {
                    this.expandedCategories = new Set(data.expandedCategories);
                }
                
                if (data.customizations) {
                    localStorage.setItem('glengalaCustomizations', JSON.stringify(data.customizations));
                }
                
                if (data.banner) {
                    localStorage.setItem('glengalaBanner', data.banner);
                }
                
                this.saveAllData();
                this.renderShop();
                this.updateCartDisplay();
                this.loadBanner();
                
                console.log('Data imported successfully');
                alert('Data imported successfully! Your cart and preferences have been restored.');
            } catch (error) {
                console.error('Import failed:', error);
                alert('Import failed! Please check the file format.');
            }
        };
        
        reader.readAsText(file);
    }

    loadBanner() {
        const savedBanner = localStorage.getItem('glengalaBanner');
        if (savedBanner) {
            const bannerSection = document.getElementById('shopBanner');
            const bannerImage = document.getElementById('bannerImage');
            if (bannerSection && bannerImage) {
                bannerImage.src = savedBanner;
                bannerSection.style.display = 'block';
            }
        }
    }

    checkout() {
        if (this.cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }
        
        // Use new checkout system
        if (window.checkoutSystem && typeof window.checkoutSystem.showCheckout === 'function') {
            window.checkoutSystem.showCheckout();
        } else {
            this.showOrderSummary(); // Fallback
        }
    }

    showOrderSummary() {
        const totalPrice = this.cart.reduce((sum, item) => sum + item.total, 0);
        const orderDate = new Date().toLocaleDateString("en-AU", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });
        const orderNumber = "GF" + Date.now().toString().slice(-8);
        
        const orderSummaryHTML = `
            <div class="order-summary-overlay" id="orderSummaryOverlay">
                <div class="order-summary-container">
                    <div class="order-summary-header">
                        <h2>🌱 Glengala Fresh - Order Summary</h2>
                        <button class="close-btn" onclick="closeOrderSummary()">✕</button>
                    </div>
                    
                    <div class="order-info">
                        <div class="order-number">Order #${orderNumber}</div>
                        <div class="order-date">${orderDate}</div>
                    </div>
                    
                    <div class="order-items">
                        <h3>Itemised Order</h3>
                        ${this.cart.map(item => `
                            <div class="order-item">
                                <div class="item-name">${item.name}</div>
                                <div class="item-details">
                                    <span class="item-quantity">${item.quantity} ${unitDisplay[item.unit]}</span>
                                    <span class="item-price">$${item.total.toFixed(2)}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="order-total">
                        <div class="total-label">Total Amount:</div>
                        <div class="total-amount">$${totalPrice.toFixed(2)}</div>
                    </div>
                    
                    <div class="order-actions">
                        <button class="copy-order-btn" onclick="copyOrderToClipboard()">
                            📋 Copy Order
                        </button>
                        <button class="text-order-btn" onclick="proceedToTextOrder()">
                            📱 Proceed to Text
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', orderSummaryHTML);
        
        this.currentOrder = {
            orderNumber: orderNumber,
            orderDate: orderDate,
            items: this.cart,
            total: totalPrice,
            formattedText: this.formatOrderForText(orderNumber, orderDate, this.cart, totalPrice)
        };
    }
    
    formatOrderForText(orderNumber, orderDate, cart, total) {
        const orderItems = cart.map(item => 
            `• ${item.name} - ${item.quantity} ${unitDisplay[item.unit]} - $${item.total.toFixed(2)}`
        ).join("\n");
        
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        return `🌱 GLENGALA FRESH - ORDER
        
Order #${orderNumber}
Date: ${orderDate}

ITEMS (${totalItems}):
${orderItems}

TOTAL: $${total.toFixed(2)}

Please confirm delivery time and availability.
Thank you! 🌱`;
    }

    // Category management methods
    expandCategory(category) {
        const content = document.getElementById(`${category}Content`);
        const toggle = document.querySelector(`[data-category="${category}"] .category-toggle`);
        
        console.log(`Expanding category: ${category}`);
        console.log('Content element found:', !!content);
        console.log('Toggle element found:', !!toggle);
        
        if (content) {
            content.classList.add('active');
            this.expandedCategories.add(category);
            console.log(`Added 'active' class to ${category}Content`);
            console.log('Content classes:', content.className);
            console.log('Content display style:', getComputedStyle(content).display);
        }
        
        if (toggle) {
            toggle.textContent = '▲';
            console.log(`Updated toggle arrow for ${category}`);
        }
        
        // Apply customization when expanding
        this.applyCustomizationToCategoryTabs();
    }

    collapseCategory(category) {
        const content = document.getElementById(`${category}Content`);
        const toggle = document.querySelector(`[data-category="${category}"] .category-toggle`);
        
        if (content) {
            content.classList.remove('active');
            this.expandedCategories.delete(category);
        }
        
        if (toggle) {
            toggle.textContent = '▼';
        }
    }

    toggleCategory(category) {
        if (this.expandedCategories.has(category)) {
            this.collapseCategory(category);
            // Save collapsed state
            localStorage.setItem(`glengala_category_${category}_collapsed`, 'true');
        } else {
            this.expandCategory(category);
            // Remove collapsed state
            localStorage.removeItem(`glengala_category_${category}_collapsed`);
        }
    }

    // Load customization from admin settings
    async loadCustomization() {
        try {
            const response = await fetch(`${window.location.origin}/api/settings`);
            if (response.ok) {
                const settings = await response.json();
                window.shopSettings = settings; // Store globally
                this.applyCustomization(settings);
                console.log('Loaded customization from API:', settings);
            } else {
                console.warn('Failed to load settings from API');
            }
        } catch (error) {
            console.error('Error loading customization:', error);
        }
    }

    // Apply customization settings to the shop
    applyCustomization(settings) {
        
        // Update trust ribbon
        if (settings.trustRibbon) {
            const trustRibbon = document.querySelector('.trust-ribbon');
            if (trustRibbon) {
                if (!settings.trustRibbon.enabled) {
                    trustRibbon.style.display = 'none';
                } else {
                    trustRibbon.style.display = 'block';
                    trustRibbon.textContent = settings.trustRibbon.text || trustRibbon.textContent;
                    trustRibbon.style.backgroundColor = settings.trustRibbon.backgroundColor || '#f6fdf7';
                    trustRibbon.style.color = settings.trustRibbon.textColor || '#1f4d2c';
                }
            }
        }

        // Update shop header
        if (settings.shopHeader) {
            const shopTitle = document.querySelector('[data-translate="shopTitle"]');
            if (shopTitle && settings.shopHeader.shopName) {
                shopTitle.textContent = settings.shopHeader.shopName;
            }

            const shopDetails = document.querySelector('[data-translate="shopDetails"]');
            if (shopDetails && settings.shopHeader.shopDetails) {
                shopDetails.textContent = settings.shopHeader.shopDetails;
            }

            // Update header background
            const header = document.querySelector('.header');
            
            if (header && settings.shopHeader) {
                if (settings.shopHeader.backgroundType === 'solid' && settings.shopHeader.backgroundColor) {
                    header.style.setProperty('background', settings.shopHeader.backgroundColor, 'important');
                    header.style.setProperty('background-image', 'none', 'important');
                    
                    // Apply same solid color to category tabs
                    const categoryTabs = document.querySelectorAll('.category-tab');
                    categoryTabs.forEach(tab => {
                        tab.style.setProperty('background', settings.shopHeader.backgroundColor, 'important');
                    });
                } else if (settings.shopHeader.backgroundType === 'gradient') {
                    const startColor = settings.shopHeader.gradientStartColor || '#000000';
                    const endColor = settings.shopHeader.gradientEndColor || '#3A6FD8';
                    const direction = settings.shopHeader.gradientDirection || '135deg';
                    const gradientStyle = `linear-gradient(${direction}, ${startColor}, ${endColor})`;
                    header.style.setProperty('background', gradientStyle, 'important');
                    header.style.setProperty('background-image', gradientStyle, 'important');
                    
                    // Apply same gradient to category tabs
                    const categoryTabs = document.querySelectorAll('.category-tab');
                    categoryTabs.forEach((tab, index) => {
                        tab.style.setProperty('background', gradientStyle, 'important');
                        tab.style.setProperty('background-image', gradientStyle, 'important');
                    });
                } else if (settings.shopHeader.backgroundType === 'default') {
                    const defaultGradient = 'linear-gradient(135deg, #000000, #333333)';
                    header.style.setProperty('background', defaultGradient, 'important');
                    
                    // Apply same default gradient to category tabs
                    const categoryTabs = document.querySelectorAll('.category-tab');
                    categoryTabs.forEach(tab => {
                        tab.style.setProperty('background', defaultGradient, 'important');
                    });
                }
            }
        }

        // Update category names
        if (settings.categories) {
            Object.keys(settings.categories).forEach(categoryKey => {
                const categoryElement = document.querySelector(`[data-translate="${categoryKey}"]`);
                if (categoryElement && settings.categories[categoryKey]) {
                    categoryElement.textContent = settings.categories[categoryKey];
                }
            });
        }
    }
}

// Cart open/close functionality
function openCart() {
    const overlay = document.getElementById('cartOverlay');
    if (overlay) {
        overlay.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scroll
        if (shop) shop.updateCartDisplay();
    }
}

function closeCart(event) {
    // If event exists and target is not the overlay background, don't close
    if (event && event.target.id !== 'cartOverlay') return;
    
    const overlay = document.getElementById('cartOverlay');
    if (overlay) {
        overlay.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
    }
}

// Legacy toggle function for backwards compatibility
function toggleCart() {
    const overlay = document.getElementById('cartOverlay');
    if (overlay && overlay.style.display === 'block') {
        closeCart();
    } else {
        openCart();
    }
}

// Category toggle functionality

// Initialize shop
let shop;
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Create shop instance (init will handle rendering)
        shop = new GlengalaShop();
        window.shop = shop;
        
        // Ensure cart display is updated after shop is fully initialized
        setTimeout(() => {
            if (shop && shop.cart) {
                shop.updateCartDisplay();
                console.log('Cart display updated:', shop.cart.length, 'items');
            }
        }, 100);
        
        // Wait for shop to initialize before rendering
        // (renderShop is now called inside init())
    } catch (error) {
        // Silent error handling for production
    }
    // Initialize checkout system
    if (typeof CheckoutSystem !== 'undefined') {
        window.checkoutSystem = new CheckoutSystem(shop);
    }
    // Ensure cart placeholders exist so older code won't throw when elements are absent
    (function ensureCartPlaceholders() {
        if (!document.getElementById('cartItems')) {
            const div = document.createElement('div');
            div.id = 'cartItems';
            div.style.display = 'none';
            document.body.appendChild(div);
        }
        if (!document.getElementById('cartCount')) {
            const span = document.createElement('span');
            span.id = 'cartCount';
            span.style.display = 'none';
            document.body.appendChild(span);
        }
        if (!document.getElementById('cartTotal')) {
            const span = document.createElement('div');
            span.id = 'cartTotal';
            span.style.display = 'none';
            document.body.appendChild(span);
        }
    })();
});

// Reload customization when page gains focus (user switches back to shop tab)
window.addEventListener('focus', function() {
    if (shop && shop.loadCustomization) {
        shop.loadCustomization();
    }
});

// Also reload on storage events (when localStorage changes)
window.addEventListener('storage', function(e) {
    if (e.key === 'glengala_customization' && shop && shop.loadCustomization) {
        shop.loadCustomization();
    }
});

// Global functions for order summary
function closeOrderSummary() {
    const overlay = document.getElementById("orderSummaryOverlay");
    if (overlay) {
        overlay.remove();
    }
}

function copyOrderToClipboard() {
    const orderText = shop.currentOrder.formattedText;
    navigator.clipboard.writeText(orderText).then(() => {
        alert("📋 Order copied to clipboard! You can now paste it anywhere.");
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = orderText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        alert("📋 Order copied to clipboard! You can now paste it anywhere.");
    });
}

function proceedToTextOrder() {
    const orderText = shop.currentOrder.formattedText;
    const phoneNumber = "YOUR_PHONE_NUMBER_HERE"; // Replace with actual phone number
    
    // Create SMS link for mobile devices
    const smsLink = `sms:${phoneNumber}?body=${encodeURIComponent(orderText)}`;
    
    // Try to open SMS app
    window.location.href = smsLink;
    
    // Show instructions if SMS doesn't work
    setTimeout(() => {
        alert("📱 To send your order via text:\n\n1. The order has been copied to your clipboard\n2. Open your messages app\n3. Paste the order and send to Glengala Fresh\n\nOr call us directly to place your order!");
    }, 1000);
}
// Our Story Modal Functions
function showOurStory() {
    const modal = document.getElementById('ourStoryModal');
    if (modal) {
        modal.style.display = 'flex';
        
        // Load custom story content if available
        const customizations = localStorage.getItem('glengalaCustomizations');
        if (customizations) {
            const data = JSON.parse(customizations);
            if (data.ourStoryContent) {
                document.getElementById('ourStoryContent').innerHTML = data.ourStoryContent;
            }
        }
    }
}

function closeOurStory() {
    const modal = document.getElementById('ourStoryModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function closePricingInfo() {
    const modal = document.getElementById('pricingInfoModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function closeContactInfo() {
    const modal = document.getElementById('contactInfoModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const storyModal = document.getElementById('ourStoryModal');
    const pricingModal = document.getElementById('pricingInfoModal');
    const contactModal = document.getElementById('contactInfoModal');
    if (event.target === storyModal) {
        closeOurStory();
    }
    if (event.target === pricingModal) {
        closePricingInfo();
    }
    if (event.target === contactModal) {
        closeContactInfo();
    }
});

function showPricingInfo() {
    const modal = document.getElementById('pricingInfoModal');
    if (modal) {
        modal.style.display = 'flex';
        // Load custom content if available
        const customizations = localStorage.getItem('glengalaCustomizations');
        if (customizations) {
            const data = JSON.parse(customizations);
            if (data.pricingInfoContent) {
                document.getElementById('pricingInfoContent').innerHTML = data.pricingInfoContent;
            }
        }
    }
}

function showContactInfo() {
    const modal = document.getElementById('contactInfoModal');
    if (modal) {
        modal.style.display = 'flex';
        // Load custom content if available
        const customizations = localStorage.getItem('glengalaCustomizations');
        if (customizations) {
            const data = JSON.parse(customizations);
            if (data.contactInfoContent) {
                document.getElementById('contactInfoContent').innerHTML = data.contactInfoContent;
            }
        }
    }
}
