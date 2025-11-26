// Modal flow functions for first-time users
function showFrequencyBenefits() {
    document.getElementById('immersiveWelcome').classList.remove('active');
    // Add frequency benefits modal logic here
}

function showHowToUse() {
    // Add how to use modal logic here
}

function showPWATip() {
    // Add PWA tip modal logic here
}

function showUpgradeBenefits() {
    // Add upgrade benefits modal logic here
}

function skipToApp() {
    // Hide all modals and mark onboarding as complete
    document.querySelectorAll('.info-modal').forEach(modal => {
        modal.classList.remove('active');
    });
    localStorage.setItem('onboardingComplete', 'true');
}

function showUpgradeModal() {
    document.getElementById('upgradeModal').style.display = 'flex';
}

function closeUpgradeModal() {
    document.getElementById('upgradeModal').style.display = 'none';
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Show immersive welcome on first visit, welcome back toast for return visits
    const onboardingComplete = localStorage.getItem('onboardingComplete') === 'true';
    console.log('Modal initialization - onboardingComplete:', onboardingComplete);

    if (!onboardingComplete) {
        // First time user - show welcome sequence
        console.log('New user - showing welcome modal');
        document.getElementById('immersiveWelcome').classList.add('active'); // Start with welcome
    } else {
        // Returning user - show welcome back toast after a brief delay
        console.log('Returning user - showing welcome toast');
        setTimeout(() => {
            showToast('Welcome back! Ready to explore sacred frequencies? 🌟');
        }, 1000);
    }

    // Debug check after initialization
    setTimeout(() => {
        console.log('Modal state check:');
        console.log('- immersiveWelcome active:', document.getElementById('immersiveWelcome').classList.contains('active'));
    }, 100);
});

// Toast notification function
function showToast(message, type = 'info') {
    // Simple toast implementation
    console.log('Toast:', message);
}