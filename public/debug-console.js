console.log("🔧 DEBUG: Dashboard page loaded");
console.log("🔧 Current URL:", window.location.href);
console.log("🔧 Document title:", document.title);

// Check if React is loaded
if (window.React) {
  console.log("✅ React is loaded");
} else {
  console.log("❌ React not found");
}

// Check for any errors in console
window.addEventListener('error', (e) => {
  console.error("🔥 JavaScript Error:", e.error);
});

// Check for unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
  console.error("🔥 Unhandled Promise Rejection:", e.reason);
});

// Add visual indicator to verify script is running
document.addEventListener('DOMContentLoaded', () => {
  const indicator = document.createElement('div');
  indicator.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: #10b981;
    color: white;
    padding: 8px 16px;
    border-radius: 8px;
    font-family: monospace;
    font-size: 12px;
    z-index: 9999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  `;
  indicator.textContent = '🔧 Debug Script Active';
  document.body.appendChild(indicator);
  
  setTimeout(() => {
    if (indicator.parentNode) {
      indicator.parentNode.removeChild(indicator);
    }
  }, 3000);
});
