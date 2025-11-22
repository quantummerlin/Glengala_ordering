// Simple Admin Functions for Glengala Fresh

// Save products to localStorage
function saveProducts() {
    localStorage.setItem('glengalaProducts', JSON.stringify(products));
}

// Load products from localStorage
function loadProducts() {
    const saved = localStorage.getItem('glengalaProducts');
    if (saved) {
        products = JSON.parse(saved);
    }
}

// Apply color customizations
function applyColors() {
    const primaryColor = document.getElementById('primaryColor').value;
    const secondaryColor = document.getElementById('secondaryColor').value;
    
    const css = `
        :root {
            --primary-color: ${primaryColor};
            --secondary-color: ${secondaryColor};
        }
    `;
    
    localStorage.setItem('glengalaCustomCSS', css);
    
    // Update hex inputs
    document.getElementById('primaryColorHex').value = primaryColor;
    document.getElementById('secondaryColorHex').value = secondaryColor;
    
    alert('✅ Colors saved! They will apply on the shop page.');
}

// Apply text customizations
function applyCustomizations() {
    const shopName = document.getElementById('shopName').value;
    const shopDescription = document.getElementById('shopDescription').value;
    
    const customizations = {
        shopName: shopName,
        shopDescription: shopDescription
    };
    
    localStorage.setItem('glengalaCustomizations', JSON.stringify(customizations));
    alert('✅ Shop text saved!');
}

// Upload banner
function uploadBanner() {
    const fileInput = document.getElementById('bannerUpload');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Please select an image file first.');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        localStorage.setItem('glengalaBanner', e.target.result);
        alert('✅ Banner uploaded successfully!');
    };
    reader.readAsDataURL(file);
}

// Remove banner
function removeBanner() {
    if (confirm('Remove the banner image?')) {
        localStorage.removeItem('glengalaBanner');
        alert('✅ Banner removed!');
    }
}

// Export all data
function exportAllData() {
    const data = {
        products: products,
        customizations: localStorage.getItem('glengalaCustomizations'),
        customCSS: localStorage.getItem('glengalaCustomCSS'),
        banner: localStorage.getItem('glengalaBanner')
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'glengala-fresh-data.json';
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
                const data = JSON.parse(event.target.result);
                
                if (data.products) {
                    products = data.products;
                    localStorage.setItem('glengalaProducts', JSON.stringify(products));
                }
                if (data.customizations) {
                    localStorage.setItem('glengalaCustomizations', data.customizations);
                }
                if (data.customCSS) {
                    localStorage.setItem('glengalaCustomCSS', data.customCSS);
                }
                if (data.banner) {
                    localStorage.setItem('glengalaBanner', data.banner);
                }
                
                alert('✅ Data imported successfully!');
                location.reload();
            } catch (error) {
                alert('❌ Error importing data. Please check the file format.');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// Clear all data
function clearAllData() {
    if (confirm('⚠️ WARNING: This will delete ALL data including products, customizations, and cart data. Are you absolutely sure?')) {
        if (confirm('⚠️ FINAL WARNING: This action cannot be undone. Continue?')) {
            localStorage.clear();
            alert('✅ All data cleared!');
            location.reload();
        }
    }
}

// Sync color inputs
document.addEventListener('DOMContentLoaded', function() {
    const primaryColor = document.getElementById('primaryColor');
    const primaryColorHex = document.getElementById('primaryColorHex');
    const secondaryColor = document.getElementById('secondaryColor');
    const secondaryColorHex = document.getElementById('secondaryColorHex');
    
    if (primaryColor && primaryColorHex) {
        primaryColor.addEventListener('input', function() {
            primaryColorHex.value = this.value;
        });
        
        primaryColorHex.addEventListener('input', function() {
            primaryColor.value = this.value;
        });
    }
    
    if (secondaryColor && secondaryColorHex) {
        secondaryColor.addEventListener('input', function() {
            secondaryColorHex.value = this.value;
        });
        
        secondaryColorHex.addEventListener('input', function() {
            secondaryColor.value = this.value;
        });
    }
});