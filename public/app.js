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
