// Glengala Fresh Admin - Simple Product Management
let allProducts = [];
const apiBase = window.location.origin + '/api';

// Check login on page load
document.addEventListener('DOMContentLoaded', function() {
    
    // Small delay to ensure all scripts are loaded
    setTimeout(() => {
        checkLoginStatus();
        
        // Add Enter key support for password input
        const passwordInput = document.getElementById('adminPassword');
        if (passwordInput) {
            passwordInput.addEventListener('keypress', function(event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    checkLogin();
                }
            });
        }
    }, 100);
});

let isCheckingLogin = false; // Prevent multiple simultaneous checks
let adminPanelShown = false; // Track if admin panel is already shown

function checkLoginStatus() {
    if (isCheckingLogin) return; // Prevent multiple calls
    isCheckingLogin = true;
    
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    
    if (isLoggedIn === 'true') {
        showAdminPanel();
    } else {
        showLoginScreen();
    }
    
    isCheckingLogin = false;
}

function checkLogin() {
    const password = document.getElementById('adminPassword').value;
    const correctPassword = getStoredPassword(); // Use stored password
    

    
    if (password === correctPassword) {
        
        // Set login status immediately
        sessionStorage.setItem('adminLoggedIn', 'true');
        
        // Show success message briefly
        const errorElement = document.getElementById('loginError');
        if (errorElement) {
            errorElement.style.display = 'block';
            errorElement.style.color = '#28a745';
            errorElement.textContent = '✅ Login successful! Loading admin panel...';
        }
        
        // Clear the password field for security
        const passwordField = document.getElementById('adminPassword');
        if (passwordField) {
            passwordField.value = '';
        }
        
        // Show admin panel immediately

        showAdminPanel();
    } else {
        const errorElement = document.getElementById('loginError');
        if (errorElement) {
            errorElement.style.display = 'block';
            errorElement.style.color = '#e74c3c'; // Reset to red for errors
            errorElement.textContent = '❌ Incorrect password. Please try again.';
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 4000);
        }
        // Clear the password field
        document.getElementById('adminPassword').value = '';
    }
}

function showLoginScreen() {
    adminPanelShown = false; // Reset the flag when showing login
    document.getElementById('loginScreen').style.display = 'block';
    document.getElementById('adminContent').style.display = 'none';
    
    // Focus the password input
    setTimeout(() => {
        const passwordInput = document.getElementById('adminPassword');
        if (passwordInput) {
            passwordInput.focus();
        }
    }, 100);
}

function showAdminPanel() {
    adminPanelShown = true; // Mark as shown
    
    // Add visual feedback for successful login
    const loginScreen = document.getElementById('loginScreen');
    const adminContent = document.getElementById('adminContent');
    
    // Hide login screen immediately
    if (loginScreen) {
        loginScreen.classList.add('admin-hidden');
    }
    
    // Show admin content immediately
    if (adminContent) {
        adminContent.classList.remove('admin-hidden');
        // Force a style recalculation to ensure it shows
        adminContent.offsetHeight;
        adminContent.style.display = 'block';
        adminContent.style.visibility = 'visible';
    }
    
    // Load dark mode preference
    loadDarkMode();
    
    // Initialize admin functionality
    // Auto-open emoji picker if requested
    setTimeout(() => {
        const overlay = document.getElementById('emojiPickerOverlay');
        if (overlay && overlay.classList.contains('show')) {
            console.warn('Emoji picker is showing automatically! This should not happen.');
        }
    }, 500);
    loadProducts();
    
    // Initialize customization system with longer delay to ensure DOM is ready
    setTimeout(() => {
        initializeCustomization();
        // Apply saved gradient to admin header
        loadAndApplyAdminGradient();
        // Load categories
        loadCategories();
    }, 500);
}

function logout() {
    sessionStorage.removeItem('adminLoggedIn');
    adminPanelShown = false; // Reset the flag
    showLoginScreen();
}

// Dark mode functionality - Always dark mode
function loadDarkMode() {
    // Always use dark mode
    document.body.classList.add('dark-mode');
    document.body.classList.remove('light-mode');
}

// Dark mode functions removed - admin is always in dark mode

// Password Management
function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const statusEl = document.getElementById('passwordStatus');
    
    // Get the current stored password
    const storedPassword = localStorage.getItem('adminPassword') || 'glengala2025';
    
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
        showPasswordStatus('Please fill in all fields.', 'error');
        return;
    }
    
    if (currentPassword !== storedPassword) {
        showPasswordStatus('Current password is incorrect.', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showPasswordStatus('New password must be at least 6 characters long.', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showPasswordStatus('New password and confirmation do not match.', 'error');
        return;
    }
    
    // Save new password
    localStorage.setItem('adminPassword', newPassword);
    
    // Clear form
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    
    showPasswordStatus('Password updated successfully!', 'success');
}

function showPasswordStatus(message, type) {
    const statusEl = document.getElementById('passwordStatus');
    if (statusEl) {
        statusEl.textContent = message;
        statusEl.className = `status-message ${type}`;
        statusEl.style.display = 'block';
        
        setTimeout(() => {
            statusEl.style.display = 'none';
        }, 4000);
    }
}

// Update the checkLogin function to use stored password
function getStoredPassword() {
    return localStorage.getItem('adminPassword') || 'glengala2025';
}

// Customization System
const customizationSystem = {
    // Default settings
    defaults: {
        trustRibbon: {
            enabled: true,
            text: "🥬 We hand-pick the freshest produce from Melbourne's Epping Market. Wayne reviews every order and confirms the best options for you.",
            backgroundColor: "#f6fdf7",
            textColor: "#1f4d2c"
        },
        shopHeader: {
            shopName: "Glengala Fresh",
            shopDetails: "Next day pickup or delivery • $8 delivery across 3020 • Free for orders over $50",
            backgroundType: "gradient",
            backgroundColor: "#000000",
            gradientStartColor: "#000000",
            gradientEndColor: "#333333",
            gradientDirection: "135deg"
        },
        categories: {
            vegetables: "Fresh Vegetables",
            fruits: "Fresh Fruits", 
            herbs: "Herbs, Salads & Greens",
            juices: "Fresh Juices & Beverages",
            nuts: "Nuts, Dried Fruit & Legumes",
            flowers: "Fresh Flowers"
        },
        cartStyling: {
            bannerBackground: "#2E7D32",
            bannerTextColor: "#FFFFFF",
            itemTextColor: "#333333",
            priceTextColor: "#2E7D32",
            totalBackground: "#F8F9FA"
        }
    },

    // Load settings from localStorage
    loadSettings() {
        const saved = localStorage.getItem('glengala_customization');
        return saved ? JSON.parse(saved) : this.defaults;
    },

    // Save settings to localStorage
    saveSettings(settings) {
        localStorage.setItem('glengala_customization', JSON.stringify(settings));
        return true;
    },

    // Get current form values
    getCurrentSettings() {
        // Get gradient angle as number (remove 'deg' suffix)
        const gradientDir = document.getElementById('gradientDirectionSelect')?.value || '135deg';
        const gradientAngle = parseInt(gradientDir.replace('deg', ''));
        
        return {
            // For API compatibility
            primaryColor: document.getElementById('gradientStartColor')?.value || '#4CAF50',
            secondaryColor: document.getElementById('gradientEndColor')?.value || '#45a049',
            color1: document.getElementById('gradientStartColor')?.value || '#4CAF50',
            color2: document.getElementById('gradientEndColor')?.value || '#45a049',
            angle: gradientAngle,
            
            // Legacy structure for backward compatibility
            trustRibbon: {
                enabled: document.getElementById('trustRibbonEnabled')?.checked || false,
                text: document.getElementById('trustRibbonText')?.value || '',
                backgroundColor: document.getElementById('trustRibbonBg')?.value || '#f6fdf7',
                textColor: document.getElementById('trustRibbonColor')?.value || '#1f4d2c'
            },
            shopHeader: {
                shopName: document.getElementById('shopName')?.value || '',
                shopDetails: document.getElementById('shopDetails')?.value || '',
                backgroundType: document.getElementById('headerBgType')?.value || 'gradient',
                backgroundColor: document.getElementById('headerBgColor')?.value || '#000000',
                gradientStartColor: document.getElementById('gradientStartColor')?.value || '#000000',
                gradientEndColor: document.getElementById('gradientEndColor')?.value || '#3A6FD8',
                gradientDirection: gradientDir
            },
            cartStyling: {
                bannerBackground: document.getElementById('cartBannerBg')?.value || '#2E7D32',
                bannerTextColor: document.getElementById('cartBannerText')?.value || '#FFFFFF',
                itemTextColor: document.getElementById('cartItemText')?.value || '#333333',
                priceTextColor: document.getElementById('cartPriceText')?.value || '#2E7D32',
                totalBackground: document.getElementById('cartTotalBg')?.value || '#F8F9FA'
            },
            categories: {
                vegetables: document.getElementById('categoryVegetables')?.value || '',
                fruits: document.getElementById('categoryFruits')?.value || '',
                herbs: document.getElementById('categoryHerbs')?.value || '',
                juices: document.getElementById('categoryJuices')?.value || '',
                nuts: document.getElementById('categoryNuts')?.value || '',
                flowers: document.getElementById('categoryFlowers')?.value || ''
            },
            // Add shop metadata fields
            shopName: document.getElementById('shopName')?.value || 'Glengala Fresh',
            shopDescription: 'Fresh local produce delivered to your door',
            contactPhone: '0434694141',
            contactEmail: 'info@glenglafresh.com.au'
        };
    },

    // Load settings into form
    loadSettingsIntoForm(settings) {
        if (document.getElementById('trustRibbonEnabled')) {
            document.getElementById('trustRibbonEnabled').checked = settings.trustRibbon?.enabled || false;
        }
        if (document.getElementById('trustRibbonText')) {
            document.getElementById('trustRibbonText').value = settings.trustRibbon?.text || '';
        }
        if (document.getElementById('trustRibbonBg')) {
            document.getElementById('trustRibbonBg').value = settings.trustRibbon?.backgroundColor || '#f6fdf7';
        }
        if (document.getElementById('trustRibbonColor')) {
            document.getElementById('trustRibbonColor').value = settings.trustRibbon?.textColor || '#1f4d2c';
        }

        if (document.getElementById('shopName')) {
            document.getElementById('shopName').value = settings.shopHeader?.shopName || '';
        }
        if (document.getElementById('shopDetails')) {
            document.getElementById('shopDetails').value = settings.shopHeader?.shopDetails || '';
        }
        if (document.getElementById('headerBgType')) {
            document.getElementById('headerBgType').value = settings.shopHeader?.backgroundType || 'gradient';
        }
        if (document.getElementById('headerBgColor')) {
            document.getElementById('headerBgColor').value = settings.shopHeader?.backgroundColor || '#000000';
        }
        if (document.getElementById('gradientStartColor')) {
            document.getElementById('gradientStartColor').value = settings.shopHeader?.gradientStartColor || '#000000';
        }
        if (document.getElementById('gradientEndColor')) {
            document.getElementById('gradientEndColor').value = settings.shopHeader?.gradientEndColor || '#3A6FD8';
        }
        if (document.getElementById('gradientDirectionSelect')) {
            document.getElementById('gradientDirectionSelect').value = settings.shopHeader?.gradientDirection || '135deg';
        }

        // Load category names
        Object.keys(settings.categories || {}).forEach(key => {
            const element = document.getElementById(`category${key.charAt(0).toUpperCase() + key.slice(1)}`);
            if (element) {
                element.value = settings.categories[key] || '';
            }
        });

        // Load cart styling settings
        if (document.getElementById('cartBannerBg')) {
            document.getElementById('cartBannerBg').value = settings.cartStyling?.bannerBackground || '#2E7D32';
        }
        if (document.getElementById('cartBannerText')) {
            document.getElementById('cartBannerText').value = settings.cartStyling?.bannerTextColor || '#FFFFFF';
        }
        if (document.getElementById('cartItemText')) {
            document.getElementById('cartItemText').value = settings.cartStyling?.itemTextColor || '#333333';
        }
        if (document.getElementById('cartPriceText')) {
            document.getElementById('cartPriceText').value = settings.cartStyling?.priceTextColor || '#2E7D32';
        }
        if (document.getElementById('cartTotalBg')) {
            document.getElementById('cartTotalBg').value = settings.cartStyling?.totalBackground || '#F8F9FA';
        }

        // Update header background visibility
        this.updateHeaderBackground();
    },

    // Update header background type visibility
    updateHeaderBackground() {
        const bgType = document.getElementById('headerBgType')?.value;
        const colorPicker = document.getElementById('headerColorPicker');
        const gradientPickers = document.getElementById('gradientColorPickers');
        const gradientDirection = document.getElementById('gradientDirection');
        

        
        if (colorPicker) {
            colorPicker.style.display = bgType === 'solid' ? 'block' : 'none';
        }
        if (gradientPickers) {
            gradientPickers.style.display = bgType === 'gradient' ? 'block' : 'none';
        }
        if (gradientDirection) {
            gradientDirection.style.display = bgType === 'gradient' ? 'block' : 'none';
        }
        
        // Update gradient preview
        this.updateGradientPreview();
    },

    // Update the gradient preview in real-time
    updateGradientPreview() {
        const preview = document.getElementById('gradientPreview');
        if (!preview) return;

        const bgType = document.getElementById('headerBgType')?.value;
        const startColor = document.getElementById('gradientStartColor')?.value || '#000000';
        const endColor = document.getElementById('gradientEndColor')?.value || '#3A6FD8';
        const direction = document.getElementById('gradientDirectionSelect')?.value || '135deg';

        if (bgType === 'gradient') {
            preview.style.background = `linear-gradient(${direction}, ${startColor}, ${endColor})`;
        } else if (bgType === 'default') {
            preview.style.background = 'linear-gradient(135deg, #000000, #333333)';
        } else {
            preview.style.background = '#f8f9fa';
        }
    },

    // Apply the same gradient to admin header
    applyGradientToAdminHeader(settings) {
        const adminHeader = document.querySelector('.admin-header');
        if (!adminHeader) {
            return;
        }

        // Fallback for missing shopHeader
        const shopHeader = settings.shopHeader || {
            backgroundType: 'default',
            backgroundColor: '#000000',
            gradientStartColor: '#000000',
            gradientEndColor: '#333333',
            gradientDirection: '135deg'
        };

        // Clear previous styles
        adminHeader.style.background = '';
        adminHeader.style.backgroundImage = '';

        if (shopHeader.backgroundType === 'solid' && shopHeader.backgroundColor) {
            adminHeader.style.background = shopHeader.backgroundColor;
        } else if (shopHeader.backgroundType === 'gradient') {
            const startColor = shopHeader.gradientStartColor || '#000000';
            const endColor = shopHeader.gradientEndColor || '#3A6FD8';
            const direction = shopHeader.gradientDirection || '135deg';
            const gradientStyle = `linear-gradient(${direction}, ${startColor}, ${endColor})`;
            adminHeader.style.background = gradientStyle;
            adminHeader.style.backgroundImage = gradientStyle;
        } else if (shopHeader.backgroundType === 'default') {
            adminHeader.style.background = 'linear-gradient(135deg, #000000, #333333)';
        }
    }
};

// Load and apply gradient to admin header on page load
async function loadAndApplyAdminGradient() {
    try {
        const response = await fetch(`${apiBase}/settings`);
        if (!response.ok) {
            throw new Error('Failed to load settings');
        }
        
        const apiSettings = await response.json();
        console.log('Admin: Loaded settings from API:', apiSettings);
        
        // Load values into form fields
        if (document.getElementById('gradientStartColor')) {
            document.getElementById('gradientStartColor').value = apiSettings.gradient_start || '#4CAF50';
        }
        if (document.getElementById('gradientEndColor')) {
            document.getElementById('gradientEndColor').value = apiSettings.gradient_end || '#45a049';
        }
        if (document.getElementById('gradientDirectionSelect')) {
            // Convert angle to degrees string (e.g., 135 -> "135deg")
            const angle = apiSettings.gradient_angle || 135;
            document.getElementById('gradientDirectionSelect').value = angle + 'deg';
        }
        
        customizationSystem.updateGradientPreview();
        customizationSystem.applyGradientToAdminHeader(apiSettings);
        console.log('Admin: Applied API gradient to header and updated form');
    } catch (error) {
        console.error('Admin: Error loading gradient from API:', error);
        customizationSystem.applyGradientToAdminHeader({shopHeader: {backgroundType: 'default'}});
        console.log('Admin: Applied default gradient to header');
    }
}

// Global functions for customization
async function saveCustomization() {
    try {
        const settings = customizationSystem.getCurrentSettings();
        console.log('Saving customization to API:', settings);
        
        // Send the full settings object to the API
        const response = await fetch(`${apiBase}/settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(settings)
        });
        
        if (!response.ok) {
            throw new Error('Failed to save settings');
        }
        
        const result = await response.json();
        console.log('Settings saved to API:', result);
        
        // Also save to localStorage for faster local access
        customizationSystem.saveSettings(settings);
        
        customizationSystem.updateGradientPreview();
        customizationSystem.applyGradientToAdminHeader(settings);
        
        const statusEl = document.getElementById('customizationStatus');
        if (statusEl) {
            statusEl.className = 'status-message success';
            statusEl.textContent = '✓ Customization saved! All users will see changes on next refresh.';
            statusEl.style.display = 'block';
            
            setTimeout(() => {
                statusEl.style.display = 'none';
            }, 3000);
        }
        
        return true;
    } catch (error) {
        console.error('Error saving customization:', error);
        
        const statusEl = document.getElementById('customizationStatus');
        if (statusEl) {
            statusEl.className = 'status-message error';
            statusEl.textContent = '✗ Error saving customization. Please try again.';
            statusEl.style.display = 'block';
        }
        return false;
    }
}

function resetCustomization() {
    if (confirm('Are you sure you want to reset all customization to defaults? This cannot be undone.')) {
        customizationSystem.loadSettingsIntoForm(customizationSystem.defaults);
        saveCustomization();
    }
}

function updateHeaderBackground() {
    customizationSystem.updateHeaderBackground();
    saveCustomization();
}

function previewChanges() {
    // Save current changes first
    saveCustomization();
    
    // Open shop in new tab for preview
    const shopWindow = window.open('shop.html', '_blank');
    
    // Try to reload shop customization if window is accessible
    setTimeout(() => {
        try {
            if (shopWindow && shopWindow.shop && shopWindow.shop.loadCustomization) {
                shopWindow.shop.loadCustomization();
            }
        } catch (e) {
            // Cross-origin or other access issues, ignore
        }
    }, 1000);
}

function testSave() {
    // Force save a test gradient
    const testSettings = {
        shopHeader: {
            shopName: "Test Shop",
            shopDetails: "Test Details",
            backgroundType: "gradient",
            gradientStartColor: "#ff0000",
            gradientEndColor: "#0000ff",
            gradientDirection: "90deg"
        },
        trustRibbon: {
            enabled: true,
            text: "Test Ribbon",
            backgroundColor: "#fff3cd",
            textColor: "#856404"
        }
    };
    
    localStorage.setItem('glengala_customization', JSON.stringify(testSettings));
    console.log('Test: Saved test settings to localStorage');
    
    // Verify
    const verification = localStorage.getItem('glengala_customization');
    console.log('Test: Verification:', verification);
    
    alert('Test settings saved! Check console for details. Now switch to shop tab to see if it applies.');
}

// Track if customization has been initialized
let customizationInitialized = false;

// Initialize customization when admin panel loads
function initializeCustomization() {
    if (customizationInitialized) {
        return;
    }
    
    const settings = customizationSystem.loadSettings();
    customizationSystem.loadSettingsIntoForm(settings);
    
    // Set up gradient preview update on color changes
    const startColorInput = document.getElementById('gradientStartColor');
    const endColorInput = document.getElementById('gradientEndColor');
    const directionSelect = document.getElementById('gradientDirectionSelect');
    const headerBgType = document.getElementById('headerBgType');
    const headerBgColor = document.getElementById('headerBgColor');
    
    if (startColorInput) {
        startColorInput.addEventListener('input', () => {
            customizationSystem.updateGradientPreview();
            // Also update admin header in real-time
            const settings = customizationSystem.getCurrentSettings();
            customizationSystem.applyGradientToAdminHeader(settings);
            // Save the settings so they apply to the shop
            saveCustomization();
        });
    }
    if (endColorInput) {
        endColorInput.addEventListener('input', () => {
            customizationSystem.updateGradientPreview();
            // Also update admin header in real-time
            const settings = customizationSystem.getCurrentSettings();
            customizationSystem.applyGradientToAdminHeader(settings);
            // Save the settings so they apply to the shop
            saveCustomization();
        });
    }
    if (directionSelect) {
        directionSelect.addEventListener('change', () => {
            customizationSystem.updateGradientPreview();
            // Also update admin header in real-time
            const settings = customizationSystem.getCurrentSettings();
            customizationSystem.applyGradientToAdminHeader(settings);
            // Save the settings so they apply to the shop
            saveCustomization();
        });
    }
    
    // Add listener for header background type changes
    if (headerBgType) {
        headerBgType.addEventListener('change', () => {
            customizationSystem.updateGradientPreview();
            // Update admin header when switching between solid/gradient/default
            const settings = customizationSystem.getCurrentSettings();
            customizationSystem.applyGradientToAdminHeader(settings);
        });
    }
    
    // Add listener for solid background color changes
    if (headerBgColor) {
        headerBgColor.addEventListener('input', () => {
            // Update admin header in real-time for solid colors
            const settings = customizationSystem.getCurrentSettings();
            customizationSystem.applyGradientToAdminHeader(settings);
        });
    }
    
    // Initial preview update and visibility setup
    setTimeout(() => {
        customizationSystem.updateHeaderBackground();
        customizationSystem.updateGradientPreview();
        customizationInitialized = true;
    }, 100);
}

// Initialize (kept for backward compatibility)
document.addEventListener('DOMContentLoaded', function() {
    // This is now handled by checkLoginStatus()
});

// Load products from products-data.js
async function loadProducts() {
    console.log('loadProducts called - fetching from API');
    try {
        const response = await fetch(`${apiBase}/products`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        allProducts = data.products || [];
        
        // Add increment field to existing products if missing
        allProducts.forEach(product => {
            if (!product.increment) {
                // Set default increment based on unit
                if (product.unit === 'kg') {
                    product.increment = '100g';
                } else {
                    product.increment = '1';
                }
            }
            // Ensure active is boolean
            product.active = product.active === 1 || product.active === true;
        });
        
        // Sort all products alphabetically before displaying, with blank names at the bottom
        sortProductsAlphabetically(allProducts);
        
        displayProducts(allProducts);
        console.log(`Loaded ${allProducts.length} products from API`);
    } catch (error) {
        console.error('Error loading products from API:', error);
        
        // Fallback to products-data.js if available
        if (typeof products !== 'undefined') {
            console.log('Falling back to products-data.js');
            allProducts = [...products];
            sortProductsAlphabetically(allProducts);
            displayProducts(allProducts);
        } else {
            alert('Error loading products. Please ensure the Flask server is running.');
        }
    }
}

// Helper function to sort products alphabetically with blank names at bottom
function sortProductsAlphabetically(products) {
    return products.sort((a, b) => {
        const aName = a.name.trim();
        const bName = b.name.trim();
        
        // If both names are empty, sort by ID
        if (!aName && !bName) return a.id - b.id;
        
        // If one name is empty, put it at the bottom
        if (!aName) return 1;
        if (!bName) return -1;
        
        // Both names have content, sort alphabetically
        return aName.toLowerCase().localeCompare(bName.toLowerCase());
    });
}

// Display products in table
function displayProducts(productsToShow) {
    console.log('displayProducts called with', productsToShow.length, 'products');
    const list = document.getElementById('productList');
    if (!list) {
        console.error('productList element not found!');
        return;
    }
    list.innerHTML = '';
    const sortedProducts = sortProductsAlphabetically([...productsToShow]);
    sortedProducts.forEach(product => {
        const item = document.createElement('li');
        item.className = 'product-item';
        item.innerHTML = `
            <div class="product-row">
                <div class="product-photo">
                    ${product.photo ? `<img src="${product.photo}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">` : '📷'}
                    <input type="file" id="photo-${product.id}" accept="image/*" style="display: none;" onchange="uploadPhoto(${product.id}, this)">
                    <button class="btn" style="padding: 5px 10px; font-size: 0.8rem;" onclick="document.getElementById('photo-${product.id}').click()">Upload</button>
                </div>
                <div class="product-fields">
                    <input type="text" value="${product.name}" onchange="updateProduct(${product.id}, 'name', this.value)" placeholder="Name">
                    <select onchange="updateProduct(${product.id}, 'category', this.value)">
                        ${shopCategories.map(category => 
                            `<option value="${category.id}" ${product.category === category.id ? 'selected' : ''}>${category.emoji} ${category.name}</option>`
                        ).join('')}
                    </select>
                    <input type="number" value="${product.price}" step="0.01" onchange="updateProduct(${product.id}, 'price', parseFloat(this.value))" placeholder="Price">
                    <select onchange="updateProduct(${product.id}, 'unit', this.value)">
                        <option value="kg" ${product.unit === 'kg' ? 'selected' : ''}>per kg</option>
                        <option value="each" ${product.unit === 'each' ? 'selected' : ''}>each</option>
                        <option value="punnet" ${product.unit === 'punnet' ? 'selected' : ''}>punnet</option>
                        <option value="bunch" ${product.unit === 'bunch' ? 'selected' : ''}>bunch</option>
                    </select>
                    <select onchange="updateProduct(${product.id}, 'increment', this.value)">
                        <option value="100g" ${(product.increment || '100g') === '100g' ? 'selected' : ''}>100g +</option>
                        <option value="500g" ${(product.increment || '100g') === '500g' ? 'selected' : ''}>500g +</option>
                        <option value="1" ${(product.increment || '100g') === '1' ? 'selected' : ''}>1 +</option>
                    </select>
                    <label><input type="checkbox" ${product.active ? 'checked' : ''} onchange="updateProduct(${product.id}, 'active', this.checked)"> Active</label>
                    <button class="btn danger" onclick="deleteProduct(${product.id})">🗑️</button>
                </div>
            </div>
        `;
        list.appendChild(item);
    });
}

// Update product
function updateProduct(id, field, value) {
    const product = allProducts.find(p => p.id === id);
    if (product) {
        product[field] = value;
        console.log(`✏️ Updated product ${id}: ${field} = ${value}`);
        console.log(`📤 Sending PUT to ${apiBase}/products/${id}`);
        
        // Send update to API
        fetch(`${apiBase}/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(product)
        }).then(response => {
            if (!response.ok) {
                console.error('❌ Failed to update product on server:', response.status, response.statusText);
                alert(`Failed to update product: ${response.statusText}`);
                return;
            }
            console.log(`✅ Product ${id} updated successfully on server`);
            return response.json();
        }).then(data => {
            if (data) {
                console.log('Server response:', data);
            }
        }).catch(error => {
            console.error('❌ Error updating product:', error);
            alert(`Error updating product: ${error.message}`);
        });
        
        // If the name was updated, re-sort and refresh display to maintain alphabetical order
        if (field === 'name') {
            displayProducts(allProducts);
        }
    }
}

// Upload photo
function uploadPhoto(id, input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        // Check file size (limit to 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('⚠️ Image too large! Please use an image smaller than 5MB.');
            input.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                // Resize image to max 400x400
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const maxSize = 400;
                
                if (width > height) {
                    if (width > maxSize) {
                        height *= maxSize / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width *= maxSize / height;
                        height = maxSize;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to base64 with reduced quality
                const resizedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                console.log('📷 Resized image from', file.size, 'bytes to', resizedBase64.length, 'chars');
                
                updateProduct(id, 'photo', resizedBase64);
                displayProducts(allProducts);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// Add new product
async function addProduct() {
    try {
        const response = await fetch(`${apiBase}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: "New Product",
                category: "vegetables",
                price: 0.00,
                unit: "kg",
                active: 1,
                photo: ""
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('Product created:', result);
        
        // Reload products to show the new one
        await loadProducts();
    } catch (error) {
        console.error('Error adding product:', error);
        alert(`❌ Error adding product: ${error.message}`);
    }
}

// Delete product
async function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            const response = await fetch(`${apiBase}/products/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('Product deleted:', result);
            
            // Reload products
            await loadProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            alert(`❌ Error deleting product: ${error.message}`);
        }
    }
}

// Search products
function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    
    let filtered = allProducts;
    
    if (searchTerm) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm));
    }
    
    if (categoryFilter !== 'all') {
        filtered = filtered.filter(p => p.category === categoryFilter);
    }
    
    displayProducts(filtered);
}

// Filter by category
function filterByCategory() {
    searchProducts();
}

// Save all products
async function saveProducts() {
    try {
        const response = await fetch(`${apiBase}/products/bulk`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ products: allProducts })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        alert(`✅ Success! ${result.updated_count} products saved to database.`);
        
        // Reload to confirm changes
        await loadProducts();
    } catch (error) {
        console.error('Error saving products:', error);
        alert(`❌ Error saving products: ${error.message}\n\nMake sure Flask server is running.`);
    }
}

// Export data
function exportData() {
    const dataStr = JSON.stringify(allProducts, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'glengala-products-' + new Date().toISOString().split('T')[0] + '.json';
    link.click();
    URL.revokeObjectURL(url);
}

// Import data
function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const imported = JSON.parse(event.target.result);
                if (Array.isArray(imported)) {
                    allProducts = imported;
                    displayProducts(allProducts);
                    alert('✅ Products imported successfully!');
                } else {
                    alert('❌ Invalid file format');
                }
            } catch (error) {
                alert('❌ Error reading file: ' + error.message);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// Clear all
function clearAll() {
    if (confirm('⚠️ Are you sure you want to clear ALL products? This cannot be undone!')) {
        if (confirm('⚠️ FINAL WARNING: This will delete all products. Are you absolutely sure?')) {
            allProducts = [];
            displayProducts(allProducts);
            localStorage.removeItem('glengalaProducts');
            alert('✅ All products cleared');
        }
    }
}

// Export/Import for data management section
function exportToJSON() {
    exportData();
}

function exportToCSV() {
    let csv = 'ID,Name,Category,Price,Unit,Active,Photo\n';
    allProducts.forEach(p => {
        csv += `${p.id},"${p.name}",${p.category},${p.price},${p.unit},${p.active},"${p.photo || ''}"\n`;
    });
    
    const blob = new Blob([csv], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'glengala-products-' + new Date().toISOString().split('T')[0] + '.csv';
    link.click();
    URL.revokeObjectURL(url);
}

function clearAllData() {
    clearAll();
}

// Category Management System
let shopCategories = [
    { id: 'vegetables', name: 'Fresh Vegetables', emoji: '🥕', active: true },
    { id: 'fruits', name: 'Fresh Fruits', emoji: '🍎', active: true },
    { id: 'herbs', name: 'Herbs & Salads', emoji: '🌿', active: true },
    { id: 'juices', name: 'Juices & Beverages', emoji: '🧃', active: true },
    { id: 'nuts', name: 'Nuts & Dried Goods', emoji: '🥜', active: true },
    { id: 'flowers', name: 'Fresh Flowers', emoji: '🌸', active: true },
    { id: 'specials', name: 'Weekly Specials', emoji: '⭐', active: true }
];

function loadCategories() {
    const saved = localStorage.getItem('glengala_categories');
    if (saved) {
        try {
            shopCategories = JSON.parse(saved);

        } catch (error) {

        }
    }
    displayCategories();
    updateProductCategoryDropdowns();
}

function displayCategories() {
    const container = document.getElementById('categoryList');
    if (!container) return;
    
    container.innerHTML = shopCategories.map(category => `
        <div class="category-item" data-category-id="${category.id}">
            <div class="category-info">
                <input type="text" value="${category.emoji}" class="category-emoji" onclick="openEmojiPicker('${category.id}')" readonly title="Click to choose emoji">
                <input type="text" value="${category.name}" class="category-name" onchange="updateCategoryField('${category.id}', 'name', this.value)">
                <span class="category-id">(ID: ${category.id})</span>
            </div>
            <div class="category-controls">
                <input type="checkbox" ${category.active ? 'checked' : ''} onchange="updateCategoryField('${category.id}', 'active', this.checked)">
                <label>Active</label>
                <button class="btn danger" onclick="deleteCategory('${category.id}')" ${shopCategories.length <= 1 ? 'disabled' : ''}>🗑️</button>
            </div>
        </div>
    `).join('');
}

function updateCategoryField(categoryId, field, value) {
    const category = shopCategories.find(c => c.id === categoryId);
    if (category) {
        category[field] = value;
        console.log(`Updated category ${categoryId}: ${field} = ${value}`);
        
        // Save to localStorage immediately so changes are available to the shop
        localStorage.setItem('glengala_categories', JSON.stringify(shopCategories));
    }
}

function addNewCategory() {
    const categoryName = prompt('Enter category name:');
    if (!categoryName || !categoryName.trim()) return;
    
    // Generate ID from name
    const categoryId = categoryName.toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 15);
    
    // Check if ID already exists
    if (shopCategories.find(c => c.id === categoryId)) {
        alert('A category with this name already exists!');
        return;
    }
    
    const newCategory = {
        id: categoryId,
        name: categoryName.trim(),
        emoji: '📦',
        active: true
    };
    
    shopCategories.push(newCategory);
    displayCategories();
    updateProductCategoryDropdowns();
}

function deleteCategory(categoryId) {
    if (shopCategories.length <= 1) {
        alert('Cannot delete the last category!');
        return;
    }
    
    if (confirm(`Are you sure you want to delete the "${shopCategories.find(c => c.id === categoryId)?.name}" category?`)) {
        shopCategories = shopCategories.filter(c => c.id !== categoryId);
        
        // Update any products that were in this category to the first available category
        const firstCategory = shopCategories[0];
        allProducts.forEach(product => {
            if (product.category === categoryId) {
                product.category = firstCategory.id;
            }
        });
        
        displayCategories();
        displayProducts(allProducts);
        updateProductCategoryDropdowns();
    }
}

function saveCategories() {
    try {
        localStorage.setItem('glengala_categories', JSON.stringify(shopCategories));
        
        const statusEl = document.getElementById('categoryStatus');
        if (statusEl) {
            statusEl.className = 'status-message success';
            statusEl.textContent = '✓ Categories saved successfully!';
            statusEl.style.display = 'block';
            
            setTimeout(() => {
                statusEl.style.display = 'none';
            }, 3000);
        }
        
        console.log('Categories saved to localStorage');
        return true;
    } catch (error) {
        console.error('Error saving categories:', error);
        
        const statusEl = document.getElementById('categoryStatus');
        if (statusEl) {
            statusEl.className = 'status-message error';
            statusEl.textContent = '✗ Error saving categories. Please try again.';
            statusEl.style.display = 'block';
        }
        return false;
    }
}

function resetCategoriesToDefaults() {
    if (confirm('Are you sure you want to reset categories to defaults? This will remove any custom categories.')) {
        shopCategories = [
            { id: 'vegetables', name: 'Fresh Vegetables', emoji: '🥕', active: true },
            { id: 'fruits', name: 'Fresh Fruits', emoji: '🍎', active: true },
            { id: 'herbs', name: 'Herbs & Salads', emoji: '🌿', active: true },
            { id: 'juices', name: 'Juices & Beverages', emoji: '🧃', active: true },
            { id: 'nuts', name: 'Nuts & Dried Goods', emoji: '🥜', active: true },
            { id: 'flowers', name: 'Fresh Flowers', emoji: '🌸', active: true },
            { id: 'specials', name: 'Weekly Specials', emoji: '⭐', active: true }
        ];
        
        displayCategories();
        updateProductCategoryDropdowns();
        saveCategories();
    }
}

function updateProductCategoryDropdowns() {
    // Update the category dropdown in product table
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        const currentValue = categoryFilter.value;
        categoryFilter.innerHTML = `
            <option value="">All Categories</option>
            ${shopCategories.map(category => 
                `<option value="${category.id}">${category.emoji} ${category.name}</option>`
            ).join('')}
        `;
        categoryFilter.value = currentValue;
    }
    
    // This will be called to update product creation dropdowns as well
    displayProducts(allProducts);
}

// Emoji Picker Functionality
let currentEmojiCategoryId = null;
const emojiCategories = {
    all: [],
    food: ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🌭', '🍔', '🍟', '🍕', '🫓', '🥙', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '🫖', '☕', '🍵', '🧃', '🥤', '🧋', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉', '🍾'],
    nature: ['🌿', '🍀', '🌱', '🌲', '🌳', '🌴', '🌵', '🌶️', '🌷', '🌸', '🌹', '🥀', '🌺', '🌻', '🌼', '🌽', '💐', '🌾', '🌱', '☘️', '🍃', '🌿', '🌱', '🌲', '🌳', '🌴', '🎋', '🎍', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃', '🌿', '🌱'],
    objects: ['🛒', '🛍️', '🎁', '🎀', '🎊', '🎉', '🎈', '🎂', '🎪', '🎨', '🎭', '🎬', '🎤', '🎧', '🎼', '🎵', '🎶', '🎯', '🎲', '🎮', '🎳', '🎸', '🎺', '🎻', '🎹', '🥁', '📱', '📞', '📟', '📠', '📡', '⏰', '📺', '📻', '📽️', '🎥', '📷', '📸', '📹', '📼', '💾', '💿', '📀', '💽', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '💡', '🔦', '🏮', '🪔', '📔', '📕', '📖', '📗', '📘', '📙', '📚', '📓', '📒', '📃', '📜', '📄', '📰', '🗞️', '📑', '🔖', '📦', '📫', '📪', '📬', '📭', '📮'],
    symbols: ['⭐', '🌟', '💫', '⚡', '☀️', '🌙', '🌛', '🌜', '🌚', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌠', '🌈', '☁️', '⛅', '⛈️', '🌤️', '🌦️', '🌧️', '⛆', '❄️', '☃️', '⛄', '🌬️', '💨', '🌪️', '🌫️', '☂️', '☔', '⚡', '🔥', '💧', '🌊', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲']
};

// Populate all emojis
emojiCategories.all = [...new Set([
    ...emojiCategories.food,
    ...emojiCategories.nature,
    ...emojiCategories.objects,
    ...emojiCategories.symbols
])];

function openEmojiPicker(categoryId) {
    console.log('Opening emoji picker for category:', categoryId);
    console.trace('openEmojiPicker called from:');
    currentEmojiCategoryId = categoryId;
    const overlay = document.getElementById('emojiPickerOverlay');
    console.log('Overlay element found:', !!overlay);
    
    if (overlay) {
        console.log('Showing emoji picker');
        overlay.classList.add('show');
        
        showEmojiCategory('all');
        
        const searchInput = document.getElementById('emojiSearch');
        if (searchInput) {
            searchInput.value = '';
        }
        
        // Set focus to search after a small delay
        setTimeout(() => {
            if (searchInput) {
                searchInput.focus();
            }
        }, 100);
    } else {
        console.error('Emoji picker overlay not found in DOM');
    }
}

function closeEmojiPicker() {
    console.log('Closing emoji picker');
    const overlay = document.getElementById('emojiPickerOverlay');
    if (overlay) {
        overlay.classList.remove('show');
    }
    currentEmojiCategoryId = null;
    
    // Clear search
    const searchInput = document.getElementById('emojiSearch');
    if (searchInput) {
        searchInput.value = '';
    }
}

function showEmojiCategory(category) {
    // Update active button
    document.querySelectorAll('.emoji-cat-btn').forEach(btn => btn.classList.remove('active'));
    
    // Find and activate the clicked button
    const clickedBtn = event ? event.target : document.querySelector('.emoji-cat-btn');
    if (clickedBtn) clickedBtn.classList.add('active');
    
    // Show emojis for category
    const emojis = emojiCategories[category] || emojiCategories.all;
    const grid = document.getElementById('emojiGrid');
    
    grid.innerHTML = emojis.map(emoji => 
        `<div class="emoji-item" data-emoji="${emoji}" title="${emoji}">${emoji}</div>`
    ).join('');
    
    // Add click event listeners to emoji items
    grid.querySelectorAll('.emoji-item').forEach(item => {
        item.addEventListener('click', () => {
            const emoji = item.getAttribute('data-emoji');
            selectEmoji(emoji);
        });
    });
}

function filterEmojis() {
    const searchTerm = document.getElementById('emojiSearch').value.toLowerCase();
    if (!searchTerm) {
        showEmojiCategory('all');
        return;
    }
    
    // Simple search - you could enhance this with emoji names/descriptions
    const allEmojis = emojiCategories.all;
    const filteredEmojis = allEmojis.filter(emoji => {
        // You could add emoji name matching here
        return emoji.includes(searchTerm);
    });
    
    const grid = document.getElementById('emojiGrid');
    grid.innerHTML = filteredEmojis.map(emoji => 
        `<div class="emoji-item" onclick="selectEmoji('${emoji}')">${emoji}</div>`
    ).join('');
}

function selectEmoji(emoji) {
    console.log('Selecting emoji:', emoji, 'for category:', currentEmojiCategoryId);
    if (!currentEmojiCategoryId) {
        console.error('No category ID set');
        return;
    }
    
    // Update the data
    updateCategoryField(currentEmojiCategoryId, 'emoji', emoji);
    
    // Immediately update the visual display in the admin interface
    const categoryItem = document.querySelector(`[data-category-id="${currentEmojiCategoryId}"]`);
    if (categoryItem) {
        const emojiInput = categoryItem.querySelector('.category-emoji');
        if (emojiInput) {
            emojiInput.value = emoji;
            console.log('Updated emoji display for category:', currentEmojiCategoryId);
        }
    }
    
    // Also refresh the entire category display to ensure consistency
    displayCategories();
    
    closeEmojiPicker();
}

// Close emoji picker when clicking outside
document.addEventListener('click', function(event) {
    const overlay = document.getElementById('emojiPickerOverlay');
    const popup = document.querySelector('.emoji-popup');
    
    if (overlay && overlay.style.display === 'flex' && event.target === overlay) {
        closeEmojiPicker();
    }
});

// Test function for header sync
function testAdminHeaderSync() {
    const settings = {
        shopHeader: {
            backgroundType: document.getElementById('headerBgType')?.value || 'gradient',
            backgroundColor: document.getElementById('headerBgColor')?.value || '#000000',
            gradientStartColor: document.getElementById('gradientStartColor')?.value || '#000000',
            gradientEndColor: document.getElementById('gradientEndColor')?.value || '#333333',
            gradientDirection: document.getElementById('gradientDirectionSelect')?.value || '135deg'
        }
    };
    customizationSystem.applyGradientToAdminHeader(settings);
    console.log('Test: Header sync applied');
}

// Close emoji picker with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeEmojiPicker();
    }
});

// ===== Push Notifications Functions =====

// Load pending price changes for notification panel
async function loadPendingPriceChanges() {
    const container = document.getElementById('pendingChanges');
    if (!container) return;
    
    try {
        const response = await fetch(`${apiBase}/price-changes?since=1970-01-01`);
        if (!response.ok) throw new Error('Failed to fetch price changes');
        
        const data = await response.json();
        const allChanges = data.changes || data || [];
        
        // Filter to unnotified changes only from last 24 hours
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const recentChanges = allChanges.filter(c => c.changed_at > yesterday);
        
        if (recentChanges.length === 0) {
            container.innerHTML = '<p style="margin: 0; color: #999;">✓ No pending price changes to notify</p>';
        } else {
            const increases = recentChanges.filter(c => c.new_price > c.old_price).length;
            const decreases = recentChanges.filter(c => c.new_price < c.old_price).length;
            
            container.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong style="font-size: 24px; color: #667eea;">${recentChanges.length}</strong>
                        <span style="color: #666;"> price changes in last 24h</span>
                    </div>
                    <div style="text-align: right; font-size: 14px;">
                        ${decreases > 0 ? `<div style="color: #10b981;">📉 ${decreases} price drop${decreases > 1 ? 's' : ''}</div>` : ''}
                        ${increases > 0 ? `<div style="color: #f59e0b;">📈 ${increases} price increase${increases > 1 ? 's' : ''}</div>` : ''}
                    </div>
                </div>
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e5e7eb;">
                    <small style="color: #999;">Last checked: ${new Date().toLocaleTimeString()}</small>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading price changes:', error);
        container.innerHTML = '<p style="margin: 0; color: #e74c3c;">⚠️ Could not load price changes. Is the API running?</p>';
    }
}

// Send price notifications to all subscribers
async function sendPriceNotifications() {
    const button = event.target;
    const resultDiv = document.getElementById('notificationResult');
    
    // Disable button and show loading
    button.disabled = true;
    button.innerHTML = '⏳ Sending...';
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = '<p style="color: #666;">Sending notifications to subscribers...</p>';
    
    try {
        const response = await fetch(`${apiBase}/send-price-notifications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) throw new Error('Failed to send notifications');
        
        const result = await response.json();
        
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
            <div style="background: #d1fae5; color: #065f46; padding: 15px; border-radius: 8px; border: 1px solid #10b981;">
                <strong>✓ Success!</strong><br>
                ${result.message}<br>
                <small>Sent at ${new Date().toLocaleTimeString()}</small>
            </div>
        `;
        
        // Reload pending changes after a delay
        setTimeout(() => {
            loadPendingPriceChanges();
            resultDiv.style.display = 'none';
        }, 3000);
        
    } catch (error) {
        console.error('Error sending notifications:', error);
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
            <div style="background: #fee2e2; color: #991b1b; padding: 15px; border-radius: 8px; border: 1px solid #ef4444;">
                <strong>✗ Error</strong><br>
                Failed to send notifications. Please check the API connection.
            </div>
        `;
    } finally {
        button.disabled = false;
        button.innerHTML = '📢 Send Notifications Now';
    }
}