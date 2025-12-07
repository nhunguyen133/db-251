// ========================================
// APP.JS - NAVIGATION & UTILITIES
// ========================================
// Chức năng:
// - Tab switching (chuyển đổi giữa các panel)
// - Helper functions cho các module khác sử dụng
//
// Logic nghiệp vụ của từng panel được xử lý ở:
// - Panel Feedback: feedback.js
// - Panel Top Courses: top-courses.js
// - Panel Teacher: teacher-courses-rank.js
// - Panel Student: student-rank.js
// ========================================

console.log('App.js initialized - Navigation module loaded');

// ========================================
// 1. TAB SWITCHING / NAVIGATION
// ========================================
document.querySelectorAll('.menu-item').forEach(btn => {
  btn.addEventListener('click', () => {
    // Remove active class from all buttons and panels
    document.querySelectorAll('.menu-item').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));

    // Add active class to clicked button and target panel
    btn.classList.add('active');
    const target = btn.dataset.target;
    const targetPanel = document.getElementById(target);
    
    if (targetPanel) {
      targetPanel.classList.add('active');
      console.log(`Switched to panel: ${target}`);

      if (target === 'panel-feedback' && typeof window.loadFeedbackData === 'function') {
        console.log('Auto-reloading feedback data...');
        window.loadFeedbackData();
      }
    } else {
      console.warn(`Panel not found: ${target}`);
    }
  });
});

// ========================================
// 2. HELPER FUNCTIONS (UTILITIES)
// ========================================

/**
 * Helper function for API calls
 * @param {string} url - API endpoint URL
 * @param {object} options - Fetch options (method, headers, body, etc.)
 * @returns {object} { ok, status, data }
 */
async function callApi(url, options = {}) {
  try {
    const res = await fetch(url, options);
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    console.error('API call error:', err);
    return { ok: false, status: 0, data: { error: 'Network error' } };
  }
}

// Export for other modules (if needed)
window.callApi = callApi;

// ========================================
// 3. TOAST NOTIFICATION SYSTEM
// ========================================

/**
 * Show toast notification
 * @param {string} message - Main message to display
 * @param {string} type - Type of toast: 'success', 'error', 'warning', 'info'
 * @param {string} title - Optional title (default based on type)
 * @param {number} duration - Duration in milliseconds (default 4000)
 */
function showToast(message, type = 'info', title = null, duration = 4000) {
  // Remove existing toasts
  document.querySelectorAll('.toast').forEach(t => t.remove());
  
  // Default titles
  const titles = {
    success: 'Thành công',
    error: 'Lỗi',
    warning: 'Cảnh báo',
    info: 'Thông báo'
  };
  
  // Default icons
  const icons = {
    success: 'check_circle',
    error: 'error',
    warning: 'warning',
    info: 'info'
  };
  
  const toastTitle = title || titles[type] || titles.info;
  const toastIcon = icons[type] || icons.info;
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast ${type} fade-in`;
  toast.innerHTML = `
    <span class="material-icons toast-icon">${toastIcon}</span>
    <div class="toast-content">
      <div class="toast-title">${toastTitle}</div>
      <div class="toast-message">${message}</div>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  // Auto remove after duration
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(400px)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
  
  // Click to dismiss
  toast.addEventListener('click', () => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(400px)';
    setTimeout(() => toast.remove(), 300);
  });
}

window.showToast = showToast;

// ========================================
// 4. CONFIRMATION MODAL SYSTEM
// ========================================

/**
 * Show confirmation modal
 * @param {string} message - Confirmation message
 * @param {string} title - Modal title (default: 'Xác nhận')
 * @param {string} confirmText - Confirm button text (default: 'Xác nhận')
 * @param {string} cancelText - Cancel button text (default: 'Hủy')
 * @returns {Promise<boolean>} - Resolves to true if confirmed, false if cancelled
 */
function showConfirm(message, title = 'Xác nhận', confirmText = 'Xác nhận', cancelText = 'Hủy') {
  return new Promise((resolve) => {
    // Remove existing confirm modals
    document.querySelectorAll('.confirm-modal').forEach(m => m.remove());
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'confirm-modal';
    modal.innerHTML = `
      <div class="confirm-modal-content">
        <div class="confirm-modal-icon">
          <span class="material-icons">help_outline</span>
        </div>
        <h3 class="confirm-modal-title">${title}</h3>
        <p class="confirm-modal-message">${message}</p>
        <div class="confirm-modal-buttons">
          <button class="btn-secondary" data-action="cancel">
            <span class="material-icons" style="font-size: 16px; vertical-align: middle;">close</span>
            ${cancelText}
          </button>
          <button class="btn-primary" data-action="confirm">
            <span class="material-icons" style="font-size: 16px; vertical-align: middle;">check</span>
            ${confirmText}
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show modal with animation
    setTimeout(() => modal.classList.add('active'), 10);
    
    // Handle button clicks
    modal.addEventListener('click', (e) => {
      const action = e.target.closest('[data-action]')?.dataset.action;
      
      if (action === 'confirm') {
        modal.classList.remove('active');
        setTimeout(() => {
          modal.remove();
          resolve(true);
        }, 300);
      } else if (action === 'cancel') {
        modal.classList.remove('active');
        setTimeout(() => {
          modal.remove();
          resolve(false);
        }, 300);
      }
    });
    
    // ESC key to cancel
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        modal.classList.remove('active');
        setTimeout(() => {
          modal.remove();
          resolve(false);
        }, 300);
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  });
}

window.showConfirm = showConfirm;

// ========================================
// 5. INPUT VALIDATION HELPERS
// ========================================

/**
 * Validate and show error/success state on input
 * @param {HTMLElement} input - Input element
 * @param {boolean} isValid - Whether input is valid
 * @param {string} errorMessage - Error message to display (if invalid)
 */
function setInputValidation(input, isValid, errorMessage = '') {
  if (!input) return;
  
  // Remove existing validation classes and messages
  input.classList.remove('error', 'success');
  const existingError = input.parentElement.querySelector('.form-error-message');
  if (existingError) existingError.remove();
  
  if (isValid) {
    input.classList.add('success');
  } else {
    input.classList.add('error');
    
    // Add error message
    if (errorMessage) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'form-error-message';
      errorDiv.innerHTML = `
        <span class="material-icons">error</span>
        ${errorMessage}
      `;
      input.parentElement.appendChild(errorDiv);
    }
  }
}

window.setInputValidation = setInputValidation;

/**
 * Validate Vietnamese phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid
 */
function isValidPhone(phone) {
  // Vietnamese phone: 10 digits, starts with 0
  const phoneRegex = /^0[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

window.isValidPhone = isValidPhone;

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

window.isValidEmail = isValidEmail;

/**
 * Validate date (not in future)
 * @param {string} dateString - Date string to validate
 * @returns {boolean} - True if valid
 */
function isValidPastDate(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today
  return date <= today;
}

window.isValidPastDate = isValidPastDate;
