// Admin Panel JavaScript Functions
class AdminPanel {
    constructor() {
        this.originalProducts = [];
        this.hasChanges = false;
        this.init();
    }

    init() {
        loadProducts();
        this.originalProducts = JSON.parse(JSON.stringify(products));
        this.renderProducts();
        this.updateStats();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filterProducts();
        });

        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.filterProducts();
        });

        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.filterProducts();
        });

        // Auto-save every 30 seconds
        setInterval(() => {
            if (this.hasChanges) {
                this.saveAllChanges();
            }
        }, 30000);
    }

    renderProducts(filteredProducts = null) {
        const tbody = document.getElementById('productsTableBody');
        const productsToRender = filteredProducts || this.getSortedProducts();
        
        tbody.innerHTML = '';

        productsToRender.forEach(product => {
            const row = this.createProductRow(product);
            tbody.appendChild(row);
        });
    }

    getSortedProducts() {
        // Show empty slots at the end for easy adding
        const activeProducts = products.filter(p => p.name.trim() !== "");
        const emptySlots = products.filter(p => p.name.trim() === "");
        
        // Sort active products alphabetically
        activeProducts.sort((a, b) => a.name.localeCompare(b.name));
        
        return [...activeProducts, ...emptySlots];
    }

    createProductRow(product) {
        const row = document.createElement('tr');
        row.className = `product-row ${!product.active ? 'inactive' : ''}`;
        row.dataset.productId = product.id;

        row.innerHTML = `
            <td>
                <input type="text" value="${product.name}" 
                       onchange="adminPanel.updateProduct(${product.id}, 'name', this.value)"
                       class="form-input" placeholder="Enter product name...">
            </td>
            <td>
                <select onchange="adminPanel.updateProduct(${product.id}, 'category', this.value)" 
                        class="form-input">
                    <option value="vegetables" ${product.category === 'vegetables' ? 'selected' : ''}>Vegetables</option>
                    <option value="fruits" ${product.category === 'fruits' ? 'selected' : ''}>Fruits</option>
                    <option value="herbs" ${product.category === 'herbs' ? 'selected' : ''}>Herbs & Spices</option>
                    <option value="specialty" ${product.category === 'specialty' ? 'selected' : ''}>Specialty Items</option>
                </select>
            </td>
            <td>
                <input type="number" value="${product.price}" step="0.01" min="0"
                       onchange="adminPanel.updateProduct(${product.id}, 'price', parseFloat(this.value))"
                       class="form-input" style="width: 100px;">
            </td>
            <td>
                <select onchange="adminPanel.updateProduct(${product.id}, 'unit', this.value)"
                        class="form-input">
                    <option value="kg" ${product.unit === 'kg' ? 'selected' : ''}>kg</option>
                    <option value="halfkg" ${product.unit === 'halfkg' ? 'selected' : ''}>1/2 kg</option>
                    <option value="tenthkg" ${product.unit === 'tenthkg' ? 'selected' : ''}>0.1 kg</option>
                    <option value="each" ${product.unit === 'each' ? 'selected' : ''}>Each</option>
                    <option value="bunch" ${product.unit === 'bunch' ? 'selected' : ''}>Bunch</option>
                    <option value="punnet" ${product.unit === 'punnet' ? 'selected' : ''}>Punnet</option>
                </select>
            </td>
            <td>
                <div class="toggle-switch ${product.mostPopular ? 'active' : ''}" 
                     onclick="adminPanel.toggleMostPopular(${product.id})">
                    <div class="toggle-slider"></div>
                </div>
            </td>
            <td>
                <div class="toggle-switch ${product.active ? 'active' : ''}" 
                     onclick="adminPanel.toggleActive(${product.id})">
                    <div class="toggle-slider"></div>
                </div>
            </td>
            <td>
                <div class="photo-upload" onclick="adminPanel.uploadPhoto(${product.id})">
                    ${product.photo ? `<img src="${product.photo}" alt="${product.name}">` : '+'}
                </div>
            </td>
            <td>
                <input type="number" value="${product.popularOrder}" min="0"
                       onchange="adminPanel.updateProduct(${product.id}, 'popularOrder', parseInt(this.value))"
                       class="order-input" placeholder="0">
            </td>
            <td>
                <button class="btn btn-danger" onclick="adminPanel.deleteProduct(${product.id})">Delete</button>
            </td>
        `;

        return row;
    }

    updateProduct(id, field, value) {
        const product = products.find(p => p.id === id);
        if (product) {
            product[field] = value;
            this.hasChanges = true;
            this.updateStats();
            
            // If product was empty and now has a name, automatically activate it
            if (field === 'name' && value.trim() !== "" && !product.active) {
                product.active = true;
                this.renderProducts();
            }
        }
    }

    toggleActive(id) {
        const product = products.find(p => p.id === id);
        if (product && product.name.trim() !== "") {
            product.active = !product.active;
            this.hasChanges = true;
            this.renderProducts();
            this.updateStats();
        }
    }

    toggleMostPopular(id) {
        const product = products.find(p => p.id === id);
        if (product && product.name.trim() !== "") {
            product.mostPopular = !product.mostPopular;
            this.hasChanges = true;
            this.renderProducts();
            this.updateStats();
        }
    }

    uploadPhoto(id) {
        // Simulate photo upload - in real implementation, this would open file picker
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                // In real implementation, upload to server and get URL
                const product = products.find(p => p.id === id);
                if (product) {
                    product.photo = URL.createObjectURL(file);
                    this.hasChanges = true;
                    this.renderProducts();
                }
            }
        };
        input.click();
    }

    deleteProduct(id) {
        if (confirm('Are you sure you want to delete this product?')) {
            const index = products.findIndex(p => p.id === id);
            if (index > -1) {
                products.splice(index, 1);
                this.hasChanges = true;
                this.renderProducts();
                this.updateStats();
            }
        }
    }

    filterProducts() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const category = document.getElementById('categoryFilter').value;
        const status = document.getElementById('statusFilter').value;

        let filtered = this.getSortedProducts();

        if (searchTerm) {
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(searchTerm)
            );
        }

        if (category) {
            filtered = filtered.filter(p => p.category === category);
        }

        if (status) {
            if (status === 'active') {
                filtered = filtered.filter(p => p.active);
            } else if (status === 'inactive') {
                filtered = filtered.filter(p => !p.active);
            } else if (status === 'popular') {
                filtered = filtered.filter(p => p.mostPopular);
            }
        }

        this.renderProducts(filtered);
    }

    updateStats() {
        const total = products.filter(p => p.name.trim() !== "").length;
        const active = products.filter(p => p.active && p.name.trim() !== "").length;
        const popular = products.filter(p => p.mostPopular && p.name.trim() !== "").length;
        const hidden = products.filter(p => !p.active && p.name.trim() !== "").length;

        document.getElementById('totalProducts').textContent = total;
        document.getElementById('activeProducts').textContent = active;
        document.getElementById('popularProducts').textContent = popular;
        document.getElementById('hiddenProducts').textContent = hidden;
    }

    saveAllChanges() {
        saveProducts();
        this.hasChanges = false;
        this.originalProducts = JSON.parse(JSON.stringify(products));
        
        // Show save indicator
        const indicator = document.createElement('div');
        indicator.className = 'save-indicator show';
        indicator.textContent = '✓ All changes saved';
        indicator.style.position = 'fixed';
        indicator.style.top = '20px';
        indicator.style.right = '20px';
        indicator.style.background = '#38a169';
        indicator.style.color = 'white';
        indicator.style.padding = '10px 20px';
        indicator.style.borderRadius = '6px';
        indicator.style.zIndex = '1000';
        
        document.body.appendChild(indicator);
        
        setTimeout(() => {
            indicator.remove();
        }, 3000);
    }
}

// Global functions for inline event handlers
function addNewProduct() {
    document.getElementById('addProductForm').style.display = 'block';
}

function confirmAddProduct() {
    const name = document.getElementById('newProductName').value.trim();
    const category = document.getElementById('newProductCategory').value;
    const price = parseFloat(document.getElementById('newProductPrice').value) || 0;
    const unit = document.getElementById('newProductUnit').value;

    if (name) {
        // Find first empty slot or create new ID
        const emptySlot = products.find(p => p.name.trim() === "");
        const newId = emptySlot ? emptySlot.id : Math.max(...products.map(p => p.id)) + 1;

        const newProduct = {
            id: newId,
            name: name,
            category: category,
            price: price,
            unit: unit,
            active: true,
            mostPopular: false,
            popularOrder: 0,
            photo: ""
        };

        if (emptySlot) {
            Object.assign(emptySlot, newProduct);
        } else {
            products.push(newProduct);
        }

        adminPanel.hasChanges = true;
        adminPanel.renderProducts();
        adminPanel.updateStats();
        cancelAddProduct();
    }
}

function cancelAddProduct() {
    document.getElementById('addProductForm').style.display = 'none';
    document.getElementById('newProductName').value = '';
    document.getElementById('newProductPrice').value = '';
}

function saveAllChanges() {
    adminPanel.saveAllChanges();
}

// Initialize admin panel
let adminPanel;
document.addEventListener('DOMContentLoaded', function() {
    adminPanel = new AdminPanel();

    // Sync admin header color with shop header
    try {
        const saved = localStorage.getItem('glengala_customization_v2');
        if (saved) {
            const settings = JSON.parse(saved);
            if (settings.shopHeader && settings.shopHeader.backgroundColor) {
                var adminHeader = document.querySelector('.header');

                if (adminHeader) {
                    var bg = settings.shopHeader.backgroundColor;
                    if (bg.startsWith('linear-gradient')) {
                        adminHeader.style.backgroundImage = bg;
                        adminHeader.style.backgroundColor = '';
                    } else {
                        adminHeader.style.backgroundImage = '';
                        adminHeader.style.backgroundColor = bg;
                    }
                } else {
                    console.error('Admin header element not found');
                }
            } else {
                console.error('No shopHeader.backgroundColor found in settings:', settings);
            }
        } else {
            console.error('No customization settings found in localStorage');
        }
    } catch (e) {
        console.error('Could not sync admin header color:', e);
    }
});
// Banner Management Functions
class BannerManager {
    constructor() {
        this.currentBanner = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadCurrentBanner();
    }

    setupEventListeners() {
        const bannerUpload = document.getElementById('bannerUpload');
        if (bannerUpload) {
            bannerUpload.addEventListener('change', (e) => this.handleBannerUpload(e));
        }
    }

    handleBannerUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file (JPG, PNG, GIF)');
            return;
        }

        // Validate file size (2MB max)
        if (file.size > 2 * 1024 * 1024) {
            alert('Image must be smaller than 2MB');
            return;
        }

        // Read and display the image
        const reader = new FileReader();
        reader.onload = (e) => {
            this.currentBanner = e.target.result;
            this.updateBannerPreview();
            this.saveBanner();
        };
        reader.readAsDataURL(file);
    }

    updateBannerPreview() {
        const preview = document.getElementById('currentBannerPreview');
        if (this.currentBanner) {
            preview.innerHTML = `<img src="${this.currentBanner}" alt="Shop Banner">`;
        } else {
            preview.innerHTML = '<div class="banner-placeholder">No custom banner set (using default header)</div>';
        }
    }

    saveBanner() {
        // Save to localStorage (in production, this would go to a server)
        localStorage.setItem('glengalaBanner', this.currentBanner);
        alert('Banner saved successfully! It will appear on the shop page.');
    }

    loadCurrentBanner() {
        // Load from localStorage
        this.currentBanner = localStorage.getItem('glengalaBanner');
        this.updateBannerPreview();
    }

    removeBanner() {
        if (confirm('Are you sure you want to remove the custom banner?')) {
            this.currentBanner = null;
            localStorage.removeItem('glengalaBanner');
            this.updateBannerPreview();
            alert('Banner removed successfully!');
        }
    }
}

// Global banner management functions
function removeBanner() {
    if (bannerManager) {
        bannerManager.removeBanner();
    }
}

// Initialize banner manager
let bannerManager;
document.addEventListener('DOMContentLoaded', function() {
    bannerManager = new BannerManager();
    loadPendingPriceChanges();
});

// Push Notification Functions
async function loadPendingPriceChanges() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/price-changes?since=1970-01-01');
        if (!response.ok) throw new Error('Failed to fetch price changes');
        
        const allChanges = await response.json();
        
        // Filter to unnotified changes only (we'd need to track this in the API)
        // For now, show recent changes from last 24 hours
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const recentChanges = allChanges.filter(c => c.changed_at > yesterday);
        
        const container = document.getElementById('pendingChanges');
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
        document.getElementById('pendingChanges').innerHTML = 
            '<p style="margin: 0; color: #e74c3c;">⚠️ Could not load price changes. Is the API running?</p>';
    }
}

async function sendPriceNotifications() {
    const button = event.target;
    const resultDiv = document.getElementById('notificationResult');
    
    // Disable button and show loading
    button.disabled = true;
    button.innerHTML = '⏳ Sending...';
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = '<p style="color: #666;">Sending notifications to subscribers...</p>';
    
    try {
        const response = await fetch('http://127.0.0.1:5000/api/send-price-notifications', {
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
        
        // Reload pending changes
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
