// Modal flow functions for first-time users
function showFrequencyBenefits() {
    document.getElementById('immersiveWelcome').classList.remove('active');
    document.getElementById('frequencyBenefitsModal').classList.add('active');
}

function showHowToUse() {
    document.getElementById('frequencyBenefitsModal').classList.remove('active');
    document.getElementById('howToUseModal').classList.add('active');
}

function showPWATip() {
    document.getElementById('howToUseModal').classList.remove('active');
    document.getElementById('pwaTipModal').classList.add('active');
}

function showUpgradeBenefits() {
    document.getElementById('pwaTipModal')?.classList.remove('active');
    const benefits = document.getElementById('upgradeBenefitsModal');
    if (benefits) {
        // Hide any other active modals
        document.querySelectorAll('.info-modal.active').forEach(m => m.classList.remove('active'));
        benefits.classList.add('active');
    }
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
            if (typeof showToast === 'function') {
                showToast('Welcome back! Ready to explore sacred frequencies? 🌟');
            }
        }, 1000);
    }

    // Debug check after initialization
    setTimeout(() => {
        console.log('Modal state check:');
        const welcomeModal = document.getElementById('immersiveWelcome');
        if (welcomeModal) {
            console.log('- immersiveWelcome active:', welcomeModal.classList.contains('active'));
        }
    }, 100);
});