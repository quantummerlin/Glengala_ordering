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
        
        // Load products from API, fallback to static data
        await this.loadProductsFromAPI();
        loadProducts();
        this.loadAllData();
        this.updateCartDisplay(); // Update cart count immediately after loading
        this.loadBanner();
        // Don't auto-render here, let it be called explicitly
        this.setupEventListeners();
        this.setupMobileOptimizations();
        this.setupDataManagement();
        
        // Load customization immediately (no delay needed)
        this.loadCustomization();
        
        // Mark products loaded and render
        this.productsLoaded = true;
        this.renderShop();
    }

    async loadProductsFromAPI() {
        // Try to load products from live pricing API
        if (window.livePricing) {
            try {
                const apiProducts = await livePricing.fetchProducts();
                if (apiProducts && apiProducts.length > 0) {
                    // Replace global products array with API data
                    window.products = apiProducts;
                    this.productsLoaded = true;
                    console.log('✅ Loaded', apiProducts.length, 'products from API');
                    return;
                }
            } catch (error) {
                console.log('⚠️ API unavailable, using static products');
            }
        }
        // If API fails, products-data.js is already loaded
        console.log('📦 Using static products data');
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
        if (!this.activeCategories) {
            return;
        }
        
        // Generate category sections first
        this.generateCategorySections();
    }



    generateCategorySections() {
        const categoriesContainer = document.getElementById('categoriesContainer');
        if (!categoriesContainer) {
            return;
        }
        
        if (!this.activeCategories || this.activeCategories.length === 0) {
            return;
        }
        
        try {
            const htmlContent = this.activeCategories.map(category => {
                // Check saved collapsed state - default to collapsed on first visit
                const savedState = localStorage.getItem(`glengala_category_${category.id}_collapsed`);
                const isCollapsed = savedState === null ? true : savedState === 'true';
                const displayStyle = isCollapsed ? 'none' : 'block';
                const arrowSymbol = isCollapsed ? '▼' : '▲';
                
                return `
                <div style="background: white; border: 1px solid #e0e0e0; margin: 10px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
                    <div class="category-header-dynamic" style="background: #333; color: white; padding: 15px; cursor: pointer; position: relative; overflow: hidden; font-size: 1.2rem;" data-category="${category.id}">
                        <span style="font-size: 1.2em; margin-right: 10px;">${category.emoji}</span>
                        <span style="font-weight: bold;">${category.name}</span>
                        <span class="category-arrow" style="float: right; transition: transform 0.3s ease;">${arrowSymbol}</span>
                        <div class="gradient-line" style="position: absolute; bottom: 0; left: -100%; width: 100%; height: 3px; background: linear-gradient(90deg, #f40606, #47018e); transition: left 0.6s ease;"></div>
                    </div>
                    <div id="${category.id}Content" style="display: ${displayStyle}; padding: 20px; background: white;">
                        <div id="${category.id}Products" class="products-grid">
                            <!-- Products will be loaded here -->
                        </div>
                    </div>
                </div>
            `;
            }).join('');
            
            categoriesContainer.innerHTML = htmlContent;

            
            // Apply the same gradient as the header to category tabs
            this.applySavedGradientToCategories();
            
            // Add click handlers for category toggles
            this.addCategoryToggleHandlers();
            
            // Load products into each category after DOM is ready
            setTimeout(() => {
                this.loadProductsIntoCategories();
            }, 100);
            
        } catch (error) {
            // Silent error handling for production
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
        
        return `
            <div class="product-card fade-in" data-product-id="${product.id}">
                ${product.mostPopular ? '<div class="special-badge">🔥 Popular</div>' : ''}
                <div class="product-photo">
                    ${product.photo ? `<img src="${product.photo}" alt="${product.name}">` : emoji}
                </div>
                <div class="product-name">${product.name}</div>
                <div class="product-price">$${product.price.toFixed(2)} ${unitInfo.display}</div>
                
                <div class="quantity-info">
                    <div class="quantity-selector">
                        <div class="quantity-wrapper">
                            <input type="number" id="qty-${product.id}" class="quantity-input" value="${quantityOptions.min}" min="${quantityOptions.min}" max="${quantityOptions.max}" step="${quantityOptions.step}">
                            <div class="quantity-controls">
                                <button class="quantity-btn up-btn" onclick="shop.updateQuantity(${product.id}, 1)">▲</button>
                                <button class="quantity-btn down-btn" onclick="shop.updateQuantity(${product.id}, -1)">▼</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <button class="add-to-cart" onclick="shop.addToCart(${product.id})">
                    <span data-translate="addToCart">🛒 Add</span>
                </button>
            </div>
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
        // Get increment setting (default to '1' if not specified)
        const increment = product.increment || '1';
        
        // Set step, min, and max based on increment type
        switch (increment) {
            case '100g':
                return { step: 0.1, min: 0.1, max: 5 };  // 100g = 0.1kg increments
            case '500g':
                return { step: 0.5, min: 0.5, max: 10 }; // 500g = 0.5kg increments
            case '1':
                return { step: 1, min: 1, max: 20 };     // whole number increments
            default:
                return { step: 1, min: 1, max: 10 };     // fallback
        }
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
        // For all units, the price is multiplied by the quantity
        // This works whether it's:
        // - $10 per kg × 0.3kg = $3.00
        // - $5 per bunch × 2 bunches = $10.00
        // - $3 each × 4 items = $12.00
        return product.price * quantity;
    }

    formatCartQuantity(item) {
        const increment = item.increment || '1';
        
        if (increment === '100g' || increment === '500g') {
            // Convert decimal back to grams for display
            const grams = Math.round(item.quantity * 1000);
            if (grams >= 1000) {
                const kg = grams / 1000;
                return `${kg}kg`;
            } else {
                return `${grams}g`;
            }
        } else {
            // For whole numbers (bunches, each, punnets)
            return `${item.quantity} ${this.getUnitDisplayName(item.unit, item.quantity)}`;
        }
    }

    formatPriceBreakdown(item) {
        const unitName = this.getUnitDisplayName(item.unit, 1);
        return `$${item.price.toFixed(2)} ${unitName}`;
    }

    getUnitDisplayName(unit, quantity) {
        const names = {
            'kg': 'per kg',
            'each': quantity === 1 ? 'item' : 'items',
            'bunch': quantity === 1 ? 'bunch' : 'bunches',
            'punnet': quantity === 1 ? 'punnet' : 'punnets'
        };
        return names[unit] || unit;
    }

    updateQuantity(productId, change) {
        const input = document.getElementById(`qty-${productId}`);
        if (!input) return;
        
        const product = products.find(p => p.id === productId);
        const options = this.getQuantityOptions(product);
        
        let newQuantity = parseFloat(input.value) + (change * options.step);
        newQuantity = Math.round(newQuantity * 10) / 10; // Round to 1 decimal
        
        if (newQuantity < options.min) newQuantity = options.min;
        if (newQuantity > options.max) newQuantity = options.max;
        
        input.value = newQuantity;
    }

    addToCart(productId) {
        const product = products.find(p => p.id === productId);
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
        this.showAddedToCartNotification(product.name);
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveAllData();
        this.updateCartDisplay();
    }

    updateCartDisplay() {
        // Update cart count badge first (always available)
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            console.log('Updating cart count. Cart array:', this.cart.length, 'Total items (sum of quantities):', totalItems);
            cartCount.textContent = totalItems.toString();
        }
        
        // Update full cart display if elements exist
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        if (!cartItems || !cartTotal) return;
        
        if (this.cart.length === 0) {
            cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
            cartTotal.textContent = 'Total: $0.00';
            return;
        }
        cartItems.innerHTML = this.cart.map(item => {
            const quantityDisplay = this.formatCartQuantity(item);
            const priceBreakdown = this.formatPriceBreakdown(item);
            
            return `
                <div class="cart-item">
                    <div>
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-quantity">${quantityDisplay}</div>
                        <div class="cart-item-breakdown">${priceBreakdown}</div>
                    </div>
                    <div>
                        <div class="cart-item-price">$${item.total.toFixed(2)}</div>
                        <button onclick="shop.removeFromCart(${item.id})" style="background: none; border: none; color: #e53e3e; cursor: pointer; font-size: 1.2em;">✕</button>
                    </div>
                </div>
            `;
        }).join('');
        
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = this.cart.reduce((sum, item) => sum + item.total, 0);
        
        // Calculate delivery fee if checkout system is available
        let deliveryFee = 0;
        let deliveryInfo = '';
        if (window.checkoutSystem && window.checkoutSystem.customerInfo) {
            const { fulfilment, postcode } = window.checkoutSystem.customerInfo;
            if (fulfilment === 'delivery' && postcode) {
                const fee = window.checkoutSystem.calculateDeliveryFee(subtotal, postcode);
                if (fee !== null) {
                    deliveryFee = fee;
                    if (fee === 0) {
                        deliveryInfo = '<div class="delivery-info free">🚚 Free Delivery!</div>';
                    } else {
                        deliveryInfo = `<div class="delivery-info">🚚 Delivery: $${fee.toFixed(2)}</div>`;
                    }
                } else {
                    deliveryInfo = '<div class="delivery-info unavailable">🚚 Delivery not available to this postcode</div>';
                }
            } else if (fulfilment === 'pickup') {
                deliveryInfo = '<div class="delivery-info pickup">🏪 Pickup (Free)</div>';
            }
        }
        
        const totalPrice = subtotal + deliveryFee;
        
        cartCount.textContent = totalItems;
        cartTotal.innerHTML = `
            <div class="cart-subtotal">Subtotal: $${subtotal.toFixed(2)}</div>
            ${deliveryInfo}
            <div class="cart-final-total">Total: $${totalPrice.toFixed(2)}</div>
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
        // Create notification element
        const notification = document.createElement('div');
        notification.innerHTML = `✅ ${productName} added to cart!`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #38a169;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            font-weight: bold;
            z-index: 2000;
            animation: slideDown 0.3s ease;
            max-width: 90vw;
            text-align: center;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
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

// Cart toggle functionality
function toggleCart() {
    const cartContent = document.getElementById('cartContent');
    if (!cartContent) return;
    cartContent.style.display = cartContent.style.display === 'block' ? 'none' : 'block';
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
