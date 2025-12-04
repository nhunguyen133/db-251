// ========================================
// PANEL 4: STUDENT LOYALTY RANK
// ========================================
// Chức năng: Hiển thị hạng thành viên của học viên
// API: GET /api/student/:studentId/loyalty
// Function: fn_CalcStudentLoyaltyRank
// ========================================

console.log('Panel Student loaded');

// API Base URL
const API_BASE_STUDENT = 'http://localhost:3000/api';

// ========================================
// 1. KHỞI TẠO
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    setupStudentLoyaltyForm();
});

// ========================================
// 2. SETUP FORM HANDLER
// ========================================
function setupStudentLoyaltyForm() {
    const form = document.getElementById('form-student');
    if (!form) {
        console.warn('Form form-student not found');
        return;
    }
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const studentId = document.getElementById('stuId').value.trim();

        if (!studentId) {
            alert('Vui lòng nhập mã học viên!');
            return;
        }
        
        await loadStudentLoyalty(studentId);
    });
}

// ========================================
// 3. LOAD STUDENT LOYALTY
// ========================================
async function loadStudentLoyalty(studentId) {
    try {
        // Show loading state
        const loyaltyDiv = document.getElementById('student-loyalty');
        if (!loyaltyDiv) {
            console.warn('Element student-loyalty not found');
            return;
        }
        
        loyaltyDiv.innerHTML = '<span class="material-icons spin" style="font-size: 32px; color: #3b82f6;">refresh</span>';
        
        const response = await fetch(`${API_BASE_STUDENT}/student/${studentId}/loyalty`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Không thể tải dữ liệu');
        }
        
        // Display loyalty rank
        displayStudentLoyalty(data.data);
        
    } catch (error) {
        console.error('Error loading student loyalty:', error);
        const loyaltyDiv = document.getElementById('student-loyalty');
        if (loyaltyDiv) {
            loyaltyDiv.innerHTML = `<span style="color: #ef4444;">Lỗi: ${error.message}</span>`;
        }
    }
}

// ========================================
// 4. DISPLAY STUDENT LOYALTY
// ========================================
function displayStudentLoyalty(loyaltyData) {
    const loyaltyDiv = document.getElementById('student-loyalty');
    
    if (!loyaltyDiv) {
        console.warn('Element student-loyalty not found');
        return;
    }
    
    if (!loyaltyData || !loyaltyData.Loyalty) {
        loyaltyDiv.textContent = 'Không có dữ liệu loyalty';
        return;
    }
    
    // Display the loyalty rank string from fn_CalcStudentLoyaltyRank
    loyaltyDiv.textContent = loyaltyData.Loyalty;
}
