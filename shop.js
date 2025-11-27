// Glengala Fresh Shop Functions - Original 6 Tab System with Collapsible Menus
const shop = {
    cart: [],
    currentLanguage: 'en',
    collapsedCategories: new Set(['vegetables', 'fruits', 'herbs', 'juices', 'nuts', 'flowers']),

    // Language translations
    translations: {
        en: {
            shopName: "Glengala Fresh",
            shopSlogan: "Your local fresh produce market",
            bannerTitle: "Fresh Produce Delivered",
            bannerSubtitle: "Order online for next day pickup or delivery",
            searchPlaceholder: "🔍 Search for fresh produce...",
            categories: {
                vegetables: "Fresh Vegetables",
                fruits: "Fresh Fruits", 
                herbs: "Herbs, Salads & Greens",
                juices: "Fresh Juices & Beverages",
                nuts: "Nuts, Dried Fruit & Legumes",
                flowers: "Fresh Flowers"
            },
            addToCart: "Add to Cart",
            confirmOrder: "Confirm Order"
        },
        zh: {
            shopName: "格林加拉生鲜",
            shopSlogan: "您本地的生鲜市场",
            bannerTitle: "新鲜农产品配送",
            bannerSubtitle: "在线订购，次日自提或配送",
            searchPlaceholder: "🔍 搜索新鲜农产品...",
            categories: {
                vegetables: "新鲜蔬菜",
                fruits: "新鲜水果",
                herbs: "香草沙拉蔬菜",
                juices: "新鲜果汁饮料",
                nuts: "坚果干果豆类",
                flowers: "鲜花"
            },
            addToCart: "加入购物车",
            confirmOrder: "确认订单"
        },
        vi: {
            shopName: "Glengala Tươi",
            shopSlogan: "Chợ nông sản địa phương của bạn",
            bannerTitle: "Nông Sản Tươi Giao Tận Nơi",
            bannerSubtitle: "Đặt hàng online để nhận hàng ngày mai",
            searchPlaceholder: "🔍 Tìm kiếm nông sản tươi...",
            categories: {
                vegetables: "Rau Củ Tươi",
                fruits: "Trái Cây Tươi",
                herbs: "Rau Thơm Salad",
                juices: "Nước Ép Tươi & Đồ Uống",
                nuts: "Hạt & Hạt Dầu",
                flowers: "Hoa Tươi"
            },
            addToCart: "Thêm Vào Giỏ",
            confirmOrder: "Xác Nhận Đơn Hàng"
        },
        ar: {
            shopName: "جلينجالا الطازج",
            shopSlogan: "سوق المنتجات الطازجة المحلي الخاص بك",
            bannerTitle: "توصيل المنتجات الطازجة",
            bannerSubtitle: "اطلب عبر الإنترنت للتسليم أو الاستلام في اليوم التالي",
            searchPlaceholder: "🔍 ابحث عن المنتجات الطازجة...",
            categories: {
                vegetables: "خضروات طازجة",
                fruits: "فواكه طازجة",
                herbs: "أعشاب وسلطات",
                juices: "عصائر ومشروبات طازجة",
                nuts: "مكسرات ومنتجات مجففة",
                flowers: "زهور طازجة"
            },
            addToCart: "أضف إلى السلة",
            confirmOrder: "تأكيد الطلب"
        }
    },

    // Load customization from backend API
    async loadCustomization() {
        try {
            const response = await fetch('/api/settings');
            if (response.ok) {
                const settings = await response.json();
                console.log('Shop: Loaded customization from API:', settings);
                this.applyCustomization(settings);
            } else {
                console.error('Shop: Failed to fetch customization from API');
            }
        } catch (error) {
            console.error('Shop: Error loading customization from API:', error);
        }
    },

    // Apply customization settings to the shop
    applyCustomization(settings) {
        console.log('Shop: Applying customization settings:', settings);
        
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
            console.log('Shop: Found header element:', !!header);
            console.log('Shop: Header background settings:', settings.shopHeader);
            
            if (header && settings.shopHeader) {
                if (settings.shopHeader.backgroundType === 'solid' && settings.shopHeader.backgroundColor) {
                    console.log('Shop: Applying solid background:', settings.shopHeader.backgroundColor);
                    header.style.background = settings.shopHeader.backgroundColor;
                } else if (settings.shopHeader.backgroundType === 'gradient') {
                    const startColor = settings.shopHeader.gradientStartColor || '#000000';
                    const endColor = settings.shopHeader.gradientEndColor || '#333333';
                    const direction = settings.shopHeader.gradientDirection || '135deg';
                    const gradientStyle = `linear-gradient(${direction}, ${startColor}, ${endColor})`;
                    console.log('Shop: Applying gradient background:', gradientStyle);
                    header.style.background = gradientStyle;
                } else if (settings.shopHeader.backgroundType === 'default') {
                    console.log('Shop: Applying default gradient');
                    header.style.background = 'linear-gradient(135deg, #000000, #333333)';
                }
                console.log('Shop: Final header background:', header.style.background);
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

        // Apply cart styling
        if (settings.cartStyling) {
            this.applyCartStyling(settings.cartStyling);
        }
    },

    // Apply cart styling settings
    applyCartStyling(cartStyling) {
        console.log('Shop: Applying cart styling:', cartStyling);
        
        // Create or update cart styling in CSS
        let styleElement = document.getElementById('cart-custom-styles');
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'cart-custom-styles';
            document.head.appendChild(styleElement);
        }
        
        const css = `
            /* Cart Banner Styling */
            .cart-banner, .cart-header {
                background: ${cartStyling.bannerBackground || '#2E7D32'} !important;
                color: ${cartStyling.bannerTextColor || '#FFFFFF'} !important;
            }
            
            /* Cart Item Text Styling */
            .cart-item, .cart-item-name, .cart-item-details {
                color: ${cartStyling.itemTextColor || '#333333'} !important;
            }
            
            /* Cart Price Styling */
            .cart-item-price, .price, .product-price, .cart-total-price {
                color: ${cartStyling.priceTextColor || '#2E7D32'} !important;
            }
            
            /* Cart Total Background */
            .cart-total, .cart-summary {
                background: ${cartStyling.totalBackground || '#F8F9FA'} !important;
            }
            
            /* Checkout button styling to match banner */
            .checkout-btn, .cart-checkout-btn {
                background: ${cartStyling.bannerBackground || '#2E7D32'} !important;
                color: ${cartStyling.bannerTextColor || '#FFFFFF'} !important;
            }
        `;
        
        styleElement.textContent = css;
        console.log('Shop: Applied cart styling CSS');
    },

    // Load products into categories
    loadProducts() {
        const categories = ['vegetables', 'fruits', 'herbs', 'juices', 'nuts', 'flowers'];
        
        categories.forEach(category => {
            const container = document.getElementById(`${category}Products`);
            if (container) {
                container.innerHTML = '';
                
                const categoryProducts = products.filter(p => 
                    p.category === category && p.active
                );
                
                categoryProducts.forEach(product => {
                    container.innerHTML += this.createProductHTML(product);
                });
            }
        });
    },

    // Create product HTML
    createProductHTML(product) {
        const specialText = product.hasSpecial ? 
            `<div class="special-badge">Special: ${product.specialQuantity} ${product.specialUnit} for $${product.specialPrice}</div>` : '';
            
        return `
            <div class="product-card">
                <div class="product-emoji">🥬</div>
                <h4 class="product-name">${product.name}</h4>
                <p class="product-price">$${product.price.toFixed(2)} / ${product.unit}</p>
                ${specialText}
                <div class="quantity-control">
                    <input type="number" id="qty-${product.id}" value="1" min="1" step="1">
                    <button onclick="shop.addToCart(${product.id})" class="add-to-cart-btn">Add to Cart</button>
                </div>
            </div>
        `;
    },

    // Collapsible category functions
    toggleCategory(categoryId) {
        const content = document.getElementById(`${categoryId}Content`);
        const toggle = document.querySelector(`[onclick="toggleCategory('${categoryId}')"] .category-toggle`);
        
        if (this.collapsedCategories.has(categoryId)) {
            this.collapsedCategories.delete(categoryId);
            content.classList.add('active');
            if (toggle) {
                toggle.textContent = '▼';
                toggle.style.transform = 'rotate(0deg)';
            }
        } else {
            this.collapsedCategories.add(categoryId);
            content.classList.remove('active');
            if (toggle) {
                toggle.textContent = '▶';
                toggle.style.transform = 'rotate(-90deg)';
            }
        }
    },

    collapseCategory(categoryId) {
        const content = document.getElementById(`${categoryId}Content`);
        const toggle = document.querySelector(`[onclick="toggleCategory('${categoryId}')"] .category-toggle`);
        
        if (content) {
            content.classList.remove('active');
        }
        if (toggle) {
            toggle.textContent = '▶';
            toggle.style.transform = 'rotate(-90deg)';
        }
    },

    // Cart functions
    addToCart(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        
        const quantity = parseFloat(document.getElementById(`qty-${productId}`).value);
        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                unit: product.unit,
                quantity: quantity
            });
        }
        
        this.updateCart();
        this.saveCart();
        
        // Reset quantity
        document.getElementById(`qty-${productId}`).value = '1';
    },

    updateCart() {
        const cartItems = document.getElementById('cartItems');
        const cartCount = document.getElementById('cartCount');
        const cartTotal = document.getElementById('cartTotal');
        
        if (!cartItems || !cartCount || !cartTotal) return;
        
        if (this.cart.length === 0) {
            cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
            cartCount.textContent = '0';
            cartTotal.textContent = 'Total: $0.00';
            return;
        }
        
        let html = '';
        let total = 0;
        let itemCount = 0;
        
        this.cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            itemCount += item.quantity;
            
            html += `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <h5>${item.name}</h5>
                        <p>$${item.price.toFixed(2)} / ${item.unit} × ${item.quantity}</p>
                    </div>
                    <div class="cart-item-price">
                        $${itemTotal.toFixed(2)}
                        <button onclick="shop.removeFromCart(${item.id})" class="remove-btn">×</button>
                    </div>
                </div>
            `;
        });
        
        cartItems.innerHTML = html;
        cartCount.textContent = itemCount.toFixed(0);
        cartTotal.textContent = `Total: $${total.toFixed(2)}`;
    },

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.updateCart();
        this.saveCart();
    },

    toggleCart() {
        const cartContent = document.getElementById('cartContent');
        const toggleIcon = document.getElementById('cartToggleIcon');
        
        if (cartContent) {
            const isActive = cartContent.classList.toggle('active');
            if (toggleIcon) {
                toggleIcon.textContent = isActive ? '▼' : '▲';
            }
        }
    },

    checkout() {
        if (this.cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        let orderText = 'Glengala Fresh Order:\n\n';
        let total = 0;
        this.cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            orderText += `${item.name} - ${item.quantity} ${item.unit} @ $${item.price.toFixed(2)} each = $${itemTotal.toFixed(2)}\n`;

           // Calculate delivery fee based on subtotal
           let deliveryFee = 0;
           if (subtotal >= 50) {
               deliveryFee = 0; // Free delivery over $50
           } else if (subtotal >= 30) {
               deliveryFee = 5; // $5 delivery for $30-$50
           } else {
               deliveryFee = 10; // $10 delivery under $30
           }
           
           const total = subtotal + deliveryFee;
        });
        orderText += `\nTotal: $${total.toFixed(2)}`;

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'order-summary-overlay';
        modal.innerHTML = `
            <div class='order-summary-container'>
                <div class='order-summary-header'>
                    <h2>🌱 Glengala Fresh - Order Summary</h2>
                    <button class='close-btn' onclick='this.parentElement.parentElement.parentElement.remove()'>✕</button>
                </div>
                <div class='order-items'>
                    <pre style='white-space:pre-wrap;'>${orderText}</pre>
                </div>
                <div class='order-actions'>
                    <button onclick="navigator.clipboard.writeText(orderText);alert('Order copied to clipboard!')">📋 Copy Order</button>
                    <button onclick="(function(){window.location.href='sms:0434694141?body='+encodeURIComponent(orderText);setTimeout(function(){alert('If your SMS app did not open, copy your order and paste it into a text message to 0434694141.');}, 1200);})()">📱 Send via Text</button>
                </div>
                <div style='margin-top:10px;color:#888;font-size:0.95em;'>Send your order before 8pm for next-day review and payment link.</div>
            </div>
        `;
        Object.assign(modal.style, {
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 9999,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
        });
        document.body.appendChild(modal);
    },

    // Search functionality
    setupSearch() {
        const searchInput = document.getElementById('shopSearch');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.searchProducts());
        }
    },

    searchProducts() {
        const searchTerm = document.getElementById('shopSearch').value.toLowerCase();
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach(card => {
            const productName = card.querySelector('.product-name').textContent.toLowerCase();
            if (productName.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    },

    // Language functions
    changeLanguage(lang) {
        this.currentLanguage = lang;
        localStorage.setItem('glengala_language', lang);
        this.applyLanguage();
    },

    loadLanguage() {
        const saved = localStorage.getItem('glengala_language');
        if (saved && this.translations[saved]) {
            this.currentLanguage = saved;
        }
        
        const langSelector = document.getElementById('languageSelector');
        if (langSelector) {
            langSelector.value = this.currentLanguage;
        }
        
        this.applyLanguage();
    },

    applyLanguage() {
        const t = this.translations[this.currentLanguage];
        
        // Update text elements
        const shopName = document.querySelector('.shop-name');
        const shopSlogan = document.querySelector('.shop-slogan');
        const bannerTitle = document.querySelector('.banner-title');
        const bannerSubtitle = document.querySelector('.banner-subtitle');
        const searchInput = document.getElementById('shopSearch');
        
        if (shopName) shopName.textContent = t.shopName;
        if (shopSlogan) shopSlogan.textContent = t.shopSlogan;
        if (bannerTitle) bannerTitle.textContent = t.bannerTitle;
        if (bannerSubtitle) bannerSubtitle.textContent = t.bannerSubtitle;
        if (searchInput) searchInput.placeholder = t.searchPlaceholder;
        
        // Update category headers
        Object.keys(t.categories).forEach(category => {
            const elements = document.querySelectorAll(`[data-translate="${category}"]`);
            elements.forEach(el => {
                el.textContent = t.categories[category];
            });
        });
    },

    // Storage functions
    saveCart() {
        localStorage.setItem('glengala_cart', JSON.stringify(this.cart));
    },

    loadCart() {
        const saved = localStorage.getItem('glengala_cart');
        if (saved) {
            this.cart = JSON.parse(saved);
        }
    },

    setupAutoSave() {
        // Auto-save every 30 seconds
        setInterval(() => {
            this.saveCart();
        }, 30000);
        
        // Save on page unload
        window.addEventListener('beforeunload', () => {
            this.saveCart();
        });
    }
};

// Global function for category toggle
function toggleCategory(categoryId) {
    shop.toggleCategory(categoryId);
}

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

// Show/Hide modals for new footer tabs
function showPricingInfo() {
    document.getElementById('pricingInfoModal').style.display = 'block';
}
function closePricingInfo() {
    document.getElementById('pricingInfoModal').style.display = 'none';
}
function showContactInfo() {
    document.getElementById('contactInfoModal').style.display = 'block';
}
function closeContactInfo() {
    document.getElementById('contactInfoModal').style.display = 'none';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    shop.init();
    shop.updateCart();

    // Modal close on Escape and click outside
    function setupModal(modalId, closeFn) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        window.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                closeFn();
            }
        });
        modal.addEventListener('click', function(e) {
            if (e.target === modal) closeFn();
        });
    }
    setupModal('ourStoryModal', closeOurStory);
    setupModal('pricingInfoModal', closePricingInfo);
    setupModal('contactInfoModal', closeContactInfo);
});
