// Function to detect the device type
function detectDevice() {
    const userAgent = navigator.userAgent;
    
    if (/iPhone|iPad|iPod/i.test(userAgent)) {
        window.location.href = "game_iphone.js"; // Redirect to iPhone game script
    } else if (/Android/i.test(userAgent)) {
        window.location.href = "game_android.js"; // Redirect to Android game script
    } else {
        window.location.href = "game_desktop.js"; // Redirect to desktop game script
    }
}

// Call the detectDevice function when the page loads
window.onload = function() {
    detectDevice();
}
