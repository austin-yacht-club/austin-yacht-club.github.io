// W017 Sensor Dashboard JavaScript

// Global variables
let imageLoaded = false;
let lastUpdateTime = null;
let retryCount = 0;
const maxRetries = 3;

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

// Initialize dashboard
function initializeDashboard() {
    setupImageHandlers();
    updateLastModified();
    updateStatistics();
    startAutoRefresh();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    console.log('W017 Dashboard initialized');
}

// Setup image loading handlers
function setupImageHandlers() {
    const image = document.getElementById('latest-image');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    
    if (!image) return;
    
    // Show loading state initially
    showLoading();
    
    // Handle successful image load
    image.addEventListener('load', function() {
        hideLoading();
        imageLoaded = true;
        retryCount = 0;
        updateImageInfo();
        console.log('Image loaded successfully');
    });
    
    // Handle image load error
    image.addEventListener('error', function() {
        hideLoading();
        showError();
        retryCount++;
        console.error('Failed to load image, retry count:', retryCount);
        
        // Auto-retry up to max retries
        if (retryCount < maxRetries) {
            setTimeout(function() {
                refreshImage();
            }, 5000); // Retry after 5 seconds
        }
    });
    
    // Force reload image to trigger events
    const currentSrc = image.src;
    image.src = '';
    image.src = currentSrc;
}

// Show loading state
function showLoading() {
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    
    if (loading) loading.style.display = 'block';
    if (error) error.style.display = 'none';
}

// Hide loading state
function hideLoading() {
    const loading = document.getElementById('loading');
    const overlay = document.querySelector('.image-overlay');
    
    if (loading) loading.style.display = 'none';
    if (overlay) overlay.style.display = 'none';
}

// Show error state
function showError() {
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const overlay = document.querySelector('.image-overlay');
    
    if (loading) loading.style.display = 'none';
    if (error) error.style.display = 'block';
    if (overlay) overlay.style.display = 'flex';
}

// Update image information
function updateImageInfo() {
    const image = document.getElementById('latest-image');
    const sizeElement = document.getElementById('image-size');
    
    if (!image || !sizeElement) return;
    
    // Get image file size (approximate)
    fetch(image.src, { method: 'HEAD' })
        .then(response => {
            const contentLength = response.headers.get('content-length');
            if (contentLength) {
                const sizeInBytes = parseInt(contentLength);
                const sizeFormatted = formatFileSize(sizeInBytes);
                sizeElement.textContent = sizeFormatted;
            } else {
                sizeElement.textContent = 'Unknown';
            }
        })
        .catch(() => {
            sizeElement.textContent = 'Unknown';
        });
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Update last modified time
function updateLastModified() {
    const lastUpdatedElement = document.getElementById('last-updated');
    if (!lastUpdatedElement) return;
    
    fetch('w017.png', { method: 'HEAD' })
        .then(response => {
            const lastModified = response.headers.get('last-modified');
            if (lastModified) {
                const date = new Date(lastModified);
                lastUpdatedElement.textContent = formatRelativeTime(date);
                lastUpdateTime = date;
            } else {
                lastUpdatedElement.textContent = 'Unknown';
            }
        })
        .catch(() => {
            lastUpdatedElement.textContent = 'Unknown';
        });
}

// Format relative time
function formatRelativeTime(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return 'Just now';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    }
}

// Update statistics
function updateStatistics() {
    updateTotalImages();
    updateUptime();
    updateStatus();
}

// Update total images count (estimated)
function updateTotalImages() {
    const totalImagesElement = document.getElementById('total-images');
    if (!totalImagesElement) return;
    
    // Estimate based on hourly updates since project start
    const startDate = new Date('2025-07-04'); // Approximate start date
    const now = new Date();
    const hoursSinceStart = Math.floor((now - startDate) / (1000 * 60 * 60));
    
    totalImagesElement.textContent = hoursSinceStart.toLocaleString();
}

// Update uptime
function updateUptime() {
    const uptimeElement = document.getElementById('uptime');
    if (!uptimeElement) return;
    
    const startDate = new Date('2025-07-04');
    const now = new Date();
    const daysSinceStart = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
    
    uptimeElement.textContent = daysSinceStart.toLocaleString();
}

// Update status
function updateStatus() {
    const statusElement = document.getElementById('update-status');
    if (!statusElement) return;
    
    // Check if image is recent (within last 2 hours)
    if (lastUpdateTime) {
        const now = new Date();
        const hoursSinceUpdate = (now - lastUpdateTime) / (1000 * 60 * 60);
        
        if (hoursSinceUpdate < 2) {
            statusElement.textContent = '🟢';
            statusElement.title = 'Online - Recent update';
        } else if (hoursSinceUpdate < 6) {
            statusElement.textContent = '🟡';
            statusElement.title = 'Warning - Update delayed';
        } else {
            statusElement.textContent = '🔴';
            statusElement.title = 'Offline - No recent updates';
        }
    } else {
        statusElement.textContent = '🟡';
        statusElement.title = 'Status unknown';
    }
}

// Refresh image
function refreshImage() {
    const image = document.getElementById('latest-image');
    if (!image) return;
    
    showLoading();
    
    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    const newSrc = `w017.png?t=${timestamp}`;
    
    image.src = newSrc;
    
    // Update statistics
    updateLastModified();
    updateStatistics();
    
    console.log('Image refresh triggered');
}

// Download image
function downloadImage() {
    const image = document.getElementById('latest-image');
    if (!image) return;
    
    const link = document.createElement('a');
    link.href = image.src;
    link.download = `w017-sensor-${new Date().toISOString().split('T')[0]}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('Image download triggered');
}

// View fullscreen
function viewFullscreen() {
    const modal = document.getElementById('fullscreen-modal');
    const modalImage = document.getElementById('fullscreen-image');
    const image = document.getElementById('latest-image');
    
    if (!modal || !modalImage || !image) return;
    
    modalImage.src = image.src;
    modal.style.display = 'block';
    
    // Focus on modal for keyboard navigation
    modal.focus();
    
    console.log('Fullscreen view opened');
}

// Close fullscreen
function closeFullscreen() {
    const modal = document.getElementById('fullscreen-modal');
    if (modal) {
        modal.style.display = 'none';
        console.log('Fullscreen view closed');
    }
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(event) {
    switch(event.key) {
        case 'r':
        case 'R':
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                refreshImage();
            }
            break;
        case 'f':
        case 'F':
            if (!event.ctrlKey && !event.metaKey) {
                viewFullscreen();
            }
            break;
        case 'd':
        case 'D':
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                downloadImage();
            }
            break;
        case 'Escape':
            closeFullscreen();
            break;
    }
}

// Start auto refresh
function startAutoRefresh() {
    // Refresh every 5 minutes
    setInterval(function() {
        refreshImage();
    }, 5 * 60 * 1000);
    
    // Update relative times every minute
    setInterval(function() {
        updateLastModified();
        updateStatistics();
    }, 60 * 1000);
    
    console.log('Auto-refresh started');
}

// Handle modal clicks
document.addEventListener('click', function(event) {
    const modal = document.getElementById('fullscreen-modal');
    if (event.target === modal) {
        closeFullscreen();
    }
});

// Handle window resize
window.addEventListener('resize', function() {
    // Update layout if needed
    updateImageInfo();
});

// Handle visibility change (tab focus/blur)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // Page became visible, refresh data
        updateLastModified();
        updateStatistics();
    }
});

// Handle online/offline events
window.addEventListener('online', function() {
    console.log('Connection restored');
    refreshImage();
});

window.addEventListener('offline', function() {
    console.log('Connection lost');
    const statusElement = document.getElementById('update-status');
    if (statusElement) {
        statusElement.textContent = '🔴';
        statusElement.title = 'Offline - No internet connection';
    }
});

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatFileSize,
        formatRelativeTime,
        refreshImage,
        downloadImage,
        viewFullscreen,
        closeFullscreen
    };
}
