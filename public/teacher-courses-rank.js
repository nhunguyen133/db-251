// ========================================
// PANEL 3: TEACHER DASHBOARD
// ========================================
// Chức năng: 
// 1. Hiển thị thống kê khóa học của giảng viên
// 2. Hiển thị xếp hạng giảng viên
// API: 
// - GET /api/teacher/:teacherId/course-stats (Stored Procedure: usp_GetTeacherCourseStats)
// - GET /api/teacher/:teacherId/rank (Function: fn_RankTeacher)
// 
// Output Fields (9 trường):
// 1. Course_id, 2. Cour_name, 3. TotalFeedbacks, 4. AvgRating,
// 5. NumRegisteredStudents, 6. AvgFinalScore, 7. NumCertificatesReceived, 8. TotalRevenue
// ========================================

console.log('Panel Teacher loaded');

// API Base URL
const API_BASE_TEACHER = 'http://localhost:3000/api';

// ========================================
// 1. KHỞI TẠO
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    setupTeacherStatsForm();
});

// ========================================
// 2. SETUP FORM HANDLER
// ========================================
function setupTeacherStatsForm() {
    const form = document.getElementById('form-teacher');
    if (!form) {
        console.warn('Form form-teacher not found');
        return;
    }
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const teacherId = document.getElementById('teacherId').value.trim();
        const teacherName = document.getElementById('teacherName')?.value?.trim();

        if (!teacherId && !teacherName) {
            alert('Vui lòng nhập mã hoặc tên giảng viên!');
            return;
        }
        
        await loadTeacherStats(teacherId || teacherName);
    });
}

// ========================================
// 3. LOAD TEACHER STATS
// ========================================
async function loadTeacherStats(teacherId) {
    try {
        showTableLoadingTeacher('table-teacher-courses', 8);  // Cập nhật từ 6 → 8 cột
        
        // Load course statistics
        const response = await fetch(`${API_BASE_TEACHER}/teacher/${teacherId}/course-stats`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Không thể tải dữ liệu');
        }
        
        displayTeacherStats(data.data);
        
        // Load teacher rank (fn_RankTeacher)
        try {
            const rankResponse = await fetch(`${API_BASE_TEACHER}/teacher/${teacherId}/rank`);
            const rankResult = await rankResponse.json();
            
            const rankDiv = document.getElementById('teacher-rank');
            if (rankDiv) {
                if (rankResult.success) {
                    rankDiv.textContent = rankResult.rank || 'Chưa xếp hạng';
                } else {
                    rankDiv.textContent = 'Không có dữ liệu';
                }
            }
        } catch (rankError) {
            console.error('Error loading teacher rank:', rankError);
            const rankDiv = document.getElementById('teacher-rank');
            if (rankDiv) {
                rankDiv.textContent = 'Lỗi tải rank';
            }
        }
        
    } catch (error) {
        console.error('Error loading teacher stats:', error);
        showTableErrorTeacher('table-teacher-courses', error.message, 8);  // Cập nhật từ 6 → 8 cột
    }
}

// ========================================
// 4. DISPLAY TEACHER STATS
// ========================================
function displayTeacherStats(courses) {
    const tbody = document.querySelector('#table-teacher-courses tbody');
    
    if (!tbody) {
        console.warn('Table table-teacher-courses tbody not found');
        return;
    }
    
    if (!courses || courses.length === 0) {
        tbody.innerHTML = '<tr class="placeholder-row"><td colspan="8">Giảng viên chưa có khóa học nào hoặc không tồn tại.</td></tr>';
        return;
    }
    
    tbody.innerHTML = courses.map(course => `
        <tr>
            <td>${course.Course_id}</td>
            <td><strong>${course.Cour_name}</strong></td>
            <td style="text-align: center;">
                <span class="badge" style="background: #8b5cf6; color: white; padding: 0.25rem 0.5rem; border-radius: 8px;">
                    ${course.TotalFeedbacks || course.NumFeedbacks || 0}
                </span>
            </td>
            <td style="text-align: center;">
                <span style="color: #fbbf24; font-weight: 600;">
                    ${course.AvgRating ? course.AvgRating.toFixed(1) : '-'}
                </span>
            </td>
            <td style="text-align: center;">
                <span class="badge" style="background: #10b981; color: white; padding: 0.25rem 0.5rem; border-radius: 8px;">
                    ${course.NumRegisteredStudents || 0}
                </span>
            </td>
            <td style="text-align: center;">
                <span style="color: #3b82f6; font-weight: 600;">
                    ${course.AvgFinalScore ? course.AvgFinalScore.toFixed(2) : '-'}
                </span>
            </td>
            <td style="text-align: center;">
                <span class="badge" style="background: #f59e0b; color: white; padding: 0.25rem 0.5rem; border-radius: 8px;">
                    ${course.NumCertificatesReceived || 0}
                </span>
            </td>
            <td style="text-align: right; padding-right: 1rem;">
                <span style="color: #10b981; font-weight: 700; font-size: 0.95rem;">
                    ${formatCurrency(course.TotalRevenue || 0)} ₫
                </span>
            </td>
        </tr>
    `).join('');
}

// ========================================
// 5. HELPER FUNCTIONS
// ========================================

/**
 * Format số thành định dạng tiền tệ Việt Nam
 * @param {number} amount - Số tiền cần format
 * @returns {string} Chuỗi đã format (VD: "75,000,000")
 */
function formatCurrency(amount) {
    if (!amount || amount === 0) return '0';
    return new Intl.NumberFormat('vi-VN').format(amount);
}
function showTableLoadingTeacher(tableId, colspan) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    if (!tbody) return;
    
    tbody.innerHTML = `
        <tr class="placeholder-row">
            <td colspan="${colspan}" style="text-align: center; padding: 2rem;">
                <span class="material-icons spin" style="font-size: 32px; color: #3b82f6;">refresh</span>
                <p style="margin-top: 0.5rem;">Đang tải dữ liệu...</p>
            </td>
        </tr>
    `;
}

function showTableErrorTeacher(tableId, message, colspan) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    if (!tbody) return;
    
    tbody.innerHTML = `
        <tr class="placeholder-row">
            <td colspan="${colspan}" style="text-align: center; padding: 2rem; color: #ef4444;">
                <span class="material-icons" style="font-size: 32px;">error</span>
                <p style="margin-top: 0.5rem;"><strong>Lỗi:</strong> ${message}</p>
            </td>
        </tr>
    `;
}
