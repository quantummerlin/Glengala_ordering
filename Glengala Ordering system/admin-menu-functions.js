// Admin Menu System and Shop Customization
class AdminMenuManager {
    constructor() {
        this.customizations = this.loadCustomizations();
        this.init();
    }

    init() {
        this.setupMenuToggle();
        this.setupCustomizationControls();
        this.loadSavedValues();
    }

    setupMenuToggle() {
        // Setup color picker synchronization
        const colorPickers = ['primaryColor', 'secondaryColor', 'backgroundColor', 'textColor'];
        colorPickers.forEach(pickerId => {
            const colorPicker = document.getElementById(pickerId);
            const hexInput = document.getElementById(pickerId + 'Hex');
            
            if (colorPicker && hexInput) {
                colorPicker.addEventListener('change', (e) => {
                    hexInput.value = e.target.value;
                });
                
                hexInput.addEventListener('change', (e) => {
                    if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                        colorPicker.value = e.target.value;
                    }
                });
            }
        });

        // Setup font size slider
        const fontSize = document.getElementById('fontSize');
        const fontSizeValue = document.getElementById('fontSizeValue');
        if (fontSize && fontSizeValue) {
            fontSize.addEventListener('input', (e) => {
                fontSizeValue.textContent = e.target.value + 'px';
            });
        }

        // Setup image uploads
        this.setupImageUploads();
    }

    setupImageUploads() {
        const imageInputs = [
            { id: 'categoryBackground', preview: 'categoryPreview' },
            { id: 'productBackground', preview: 'productPreview' },
            { id: 'headerBackground', preview: 'headerPreview' }
        ];

        imageInputs.forEach(input => {
            const fileInput = document.getElementById(input.id);
            const preview = document.getElementById(input.preview);
            
            if (fileInput && preview) {
                fileInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file && file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                            this.customizations[input.id] = e.target.result;
                        };
                        reader.readAsDataURL(file);
                    }
                });
            }
        });
    }

    setupCustomizationControls() {
        // Settings controls
        const shopName = document.getElementById('shopName');
        const shopDescription = document.getElementById('shopDescription');
        const contactPhone = document.getElementById('contactPhone');
        const contactEmail = document.getElementById('contactEmail');

        if (shopName) shopName.addEventListener('input', (e) => this.customizations.shopName = e.target.value);
        if (shopDescription) shopDescription.addEventListener('input', (e) => this.customizations.shopDescription = e.target.value);
        if (contactPhone) contactPhone.addEventListener('input', (e) => this.customizations.contactPhone = e.target.value);
        if (contactEmail) contactEmail.addEventListener('input', (e) => this.customizations.contactEmail = e.target.value);
    }

    loadSavedValues() {
        // Load saved values into form controls
        const colorPickers = ['primaryColor', 'secondaryColor', 'backgroundColor', 'textColor'];
        colorPickers.forEach(pickerId => {
            const colorPicker = document.getElementById(pickerId);
            const hexInput = document.getElementById(pickerId + 'Hex');
            if (colorPicker && hexInput && this.customizations[pickerId]) {
                colorPicker.value = this.customizations[pickerId];
                hexInput.value = this.customizations[pickerId];
            }
        });

        const fontSize = document.getElementById('fontSize');
        const fontSizeValue = document.getElementById('fontSizeValue');
        if (fontSize && fontSizeValue && this.customizations.fontSize) {
            fontSize.value = this.customizations.fontSize;
            fontSizeValue.textContent = this.customizations.fontSize + 'px';
        }

        const fontFamily = document.getElementById('fontFamily');
        if (fontFamily && this.customizations.fontFamily) {
            fontFamily.value = this.customizations.fontFamily;
        }

        // Load settings
        const settings = ['shopName', 'shopDescription', 'contactPhone', 'contactEmail'];
        settings.forEach(setting => {
            const element = document.getElementById(setting);
            if (element && this.customizations[setting]) {
                element.value = this.customizations[setting];
            }
        });
    }

    loadCustomizations() {
        const saved = localStorage.getItem('glengalaCustomizations');
        return saved ? JSON.parse(saved) : this.getDefaultCustomizations();
    }

    getDefaultCustomizations() {
        return {
            primaryColor: '#2FA44F',
            secondaryColor: '#3A6FD8',
            backgroundColor: '#F7FAF7',
            textColor: '#1F2937',
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            fontSize: '16',
            shopName: 'Glengala Fresh',
            shopDescription: 'Next day pickup or delivery • $8 delivery across 3020 • Free for orders over $50',
            contactPhone: '',
            contactEmail: '',
            categoryBackground: null,
            productBackground: null,
            headerBackground: null
        };
    }

    saveCustomizations() {
        localStorage.setItem('glengalaCustomizations', JSON.stringify(this.customizations));
    }
}

// Global functions
function toggleMenuSection(sectionId) {
    const content = document.getElementById(sectionId + '-content');
    const header = content.previousElementSibling;
    const toggle = header.querySelector('.menu-toggle');
    
    if (content.classList.contains('expanded')) {
        content.classList.remove('expanded');
        header.classList.remove('active');
        toggle.textContent = '▼';
    } else {
        // Close other sections
        document.querySelectorAll('.menu-content.expanded').forEach(otherContent => {
            otherContent.classList.remove('expanded');
            otherContent.previousElementSibling.classList.remove('active');
            otherContent.previousElementSibling.querySelector('.menu-toggle').textContent = '▼';
        });
        
        // Open this section
        content.classList.add('expanded');
        header.classList.add('active');
        toggle.textContent = '▲';
    }
}

function applyCustomizations() {
    const manager = window.adminMenuManager;
    if (!manager) return;

    // Get current values
    const colorPickers = ['primaryColor', 'secondaryColor', 'backgroundColor', 'textColor'];
    colorPickers.forEach(pickerId => {
        const colorPicker = document.getElementById(pickerId);
        if (colorPicker) {
            manager.customizations[pickerId] = colorPicker.value;
        }
    });

    const fontSize = document.getElementById('fontSize');
    if (fontSize) {
        manager.customizations.fontSize = fontSize.value;
    }

    const fontFamily = document.getElementById('fontFamily');
    if (fontFamily) {
        manager.customizations.fontFamily = fontFamily.value;
    }

    // Save to localStorage
    manager.saveCustomizations();

    // Create custom CSS
    const customCSS = `
        :root {
            --primary-600: ${manager.customizations.primaryColor};
            --secondary-600: ${manager.customizations.secondaryColor};
            --bg: ${manager.customizations.backgroundColor};
            --text: ${manager.customizations.textColor};
        }

        body {
            font-family: ${manager.customizations.fontFamily};
            font-size: ${manager.customizations.fontSize}px;
        }

        .header {
            background: ${manager.customizations.headerBackground ? 
                `url(${manager.customizations.headerBackground}) center/cover` : 
                `var(--primary-600)`};
        }

        .category-header {
            background: ${manager.customizations.categoryBackground ? 
                `url(${manager.customizations.categoryBackground}) center/cover` : 
                `var(--surface)`};
        }

        .product-card {
            background: ${manager.customizations.productBackground ? 
                `url(${manager.customizations.productBackground}) center/cover` : 
                `var(--surface)`};
        }

        .shop-details {
            color: ${manager.customizations.shopDescription} || inherit;
        }
    `;

    // Save custom CSS to localStorage
    localStorage.setItem('glengalaCustomCSS', customCSS);

    // Apply to current page
    let existingStyle = document.getElementById('custom-admin-style');
    if (!existingStyle) {
        existingStyle = document.createElement('style');
        existingStyle.id = 'custom-admin-style';
        document.head.appendChild(existingStyle);
    }
    existingStyle.textContent = customCSS;

    alert('✨ Customizations applied successfully! They will appear on the shop page.');
}

function previewCustomizations() {
    // Open shop in new tab with preview mode
    const shopURL = window.location.origin.replace(':8086', ':8086') + '/shop.html?preview=true';
    window.open(shopURL, '_blank');
}

function resetCustomizations() {
    if (confirm('Are you sure you want to reset all customizations to default?')) {
        localStorage.removeItem('glengalaCustomizations');
        localStorage.removeItem('glengalaCustomCSS');
        
        // Reset form values
        const manager = window.adminMenuManager;
        manager.customizations = manager.getDefaultCustomizations();
        manager.loadSavedValues();
        
        // Remove custom style
        const customStyle = document.getElementById('custom-admin-style');
        if (customStyle) {
            customStyle.remove();
        }
        
        alert('🔄 Customizations reset to default successfully!');
    }
}

// Product management functions
function showAddProductForm() {
    const form = document.getElementById('addProductForm');
    const content = document.getElementById('productManagementContent');
    
    if (form) {
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
    }
}

function showProductList() {
    // This would show a list of all products
    alert('Product list feature coming soon!');
}

function exportProducts() {
    const products = JSON.stringify(products, null, 2);
    const blob = new Blob([products], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'glengala-products.json';
    a.click();
}

// Initialize menu manager
let adminMenuManager;
document.addEventListener('DOMContentLoaded', function() {
    adminMenuManager = new AdminMenuManager();
    window.adminMenuManager = adminMenuManager;
});
