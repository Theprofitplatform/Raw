// Exit Intent Popup Module
export function initializeExitIntent() {
    let exitPopupShown = false;
    const exitPopup = document.getElementById('exitPopup');
    const exitClose = document.getElementById('exitClose');
    const exitDecline = document.getElementById('exitDecline');

    // Early return if popup elements don't exist
    if (!exitPopup || !exitClose || !exitDecline) {
        console.warn('Exit popup elements not found');
        return;
    }

    // Show popup when mouse leaves viewport at top
    document.addEventListener('mouseleave', function(e) {
        if (e.clientY <= 0 && !exitPopupShown && !localStorage.getItem('exitPopupShown')) {
            showExitPopup();
        }
    });

    // Show popup after 60 seconds if not already shown
    setTimeout(() => {
        if (!exitPopupShown && !localStorage.getItem('exitPopupShown')) {
            showExitPopup();
        }
    }, 60000);

    // Show popup function
    function showExitPopup() {
        if (exitPopupShown) return;

        exitPopupShown = true;
        exitPopup.classList.add('show');
        document.body.style.overflow = 'hidden';

        // Track that popup was shown
        localStorage.setItem('exitPopupShown', 'true');

        // Auto-hide after 30 seconds
        setTimeout(() => {
            hideExitPopup();
        }, 30000);
    }

    // Hide popup function
    function hideExitPopup() {
        exitPopup.classList.remove('show');
        document.body.style.overflow = '';
    }

    // Close button events
    exitClose.addEventListener('click', hideExitPopup);
    exitDecline.addEventListener('click', hideExitPopup);

    // Close on overlay click
    const overlay = document.querySelector('.exit-popup-overlay');
    if (overlay) {
        overlay.addEventListener('click', hideExitPopup);
    }

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && exitPopup.classList.contains('show')) {
            hideExitPopup();
        }
    });

    // Reset popup availability after 24 hours
    if (localStorage.getItem('exitPopupShown')) {
        setTimeout(() => {
            localStorage.removeItem('exitPopupShown');
        }, 24 * 60 * 60 * 1000); // 24 hours
    }
}