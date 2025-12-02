// ========================================
// TASK 2.3 - TOP COURSES & TEACHER STATS
// ========================================

// API Base URL
const API_BASE = 'http://localhost:3000/api';

// ========================================
// 1. KHỞI TẠO
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('Task 2.3 procedures initialized');
    
    // Setup form handlers
    setupTopCoursesForm();
    setupTeacherStatsForm();
});

// ========================================
// 2. TOP RATED COURSES (Thủ tục 1)
// ========================================
function setupTopCoursesForm() {
    const form = document.getElementById('form-top-courses');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const year = document.getElementById('year').value;
        const minReview = document.getElementById('minReview').value;
        
        await loadTopRatedCourses(year, minReview);
    });
}

async function loadTopRatedCourses(publishedYear, minReview) {
    try {
        showTableLoading('table-top-courses', 5);
        
        const response = await fetch(`${API_BASE}/courses/top-rated?publishedYear=${publishedYear}&minReview=${minReview}`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Không thể tải dữ liệu');
        }
        
        displayTopCourses(data.data);
        
    } catch (error) {
        console.error('Error loading top courses:', error);
        showTableError('table-top-courses', error.message, 5);
    }
}

function displayTopCourses(courses) {
    const tbody = document.querySelector('#table-top-courses tbody');
    
    if (!courses || courses.length === 0) {
        tbody.innerHTML = '<tr class="placeholder-row"><td colspan="5">Không có dữ liệu phù hợp với điều kiện lọc.</td></tr>';
        return;
    }
    
    tbody.innerHTML = courses.map((course, index) => `
        <tr>
            <td>${course.Course_id}</td>
            <td>
                <strong>${course.Cour_name}</strong>
            </td>
            <td>${course['F_name + \' \' + L_name'] || course.TeacherName || '-'}</td>
            <td style="text-align: center;">
                <span class="badge" style="background: #3b82f6; color: white; padding: 0.25rem 0.75rem; border-radius: 12px;">
                    ${course.Total_Reviews} reviews
                </span>
            </td>
            <td style="text-align: center;">
                <span style="color: #fbbf24; font-weight: 600; font-size: 1.1rem;">
                    ${generateStarRating(course.Avg_Rating)} ${course.Avg_Rating}
                </span>
            </td>
        </tr>
    `).join('');
}

// ========================================
// 3. TEACHER COURSE STATS (Thủ tục 2)
// ========================================
function setupTeacherStatsForm() {
    const form = document.getElementById('form-teacher');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const teacherId = document.getElementById('teacherId').value.trim();
        
        if (!teacherId) {
            alert('Vui lòng nhập mã giảng viên!');
            return;
        }
        
        await loadTeacherStats(teacherId);
    });
}

async function loadTeacherStats(teacherId) {
    try {
        showTableLoading('table-teacher', 6);
        
        const response = await fetch(`${API_BASE}/teacher/${teacherId}/course-stats`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Không thể tải dữ liệu');
        }
        
        displayTeacherStats(data.data);
        
    } catch (error) {
        console.error('Error loading teacher stats:', error);
        showTableError('table-teacher', error.message, 6);
    }
}

function displayTeacherStats(courses) {
    const tbody = document.querySelector('#table-teacher tbody');
    
    if (!courses || courses.length === 0) {
        tbody.innerHTML = '<tr class="placeholder-row"><td colspan="6">Giảng viên chưa có khóa học nào hoặc không tồn tại.</td></tr>';
        return;
    }
    
    tbody.innerHTML = courses.map(course => `
        <tr>
            <td>${course.Course_id}</td>
            <td><strong>${course.Cour_name}</strong></td>
            <td style="text-align: center;">
                <span class="badge" style="background: #8b5cf6;">
                    ${course.NumFeedbacks || 0}
                </span>
            </td>
            <td style="text-align: center;">
                <span style="color: #fbbf24; font-weight: 600;">
                    ${course.AvgRating ? course.AvgRating.toFixed(1) : '-'}
                </span>
            </td>
            <td style="text-align: center;">
                <span class="badge" style="background: #10b981;">
                    ${course.NumRegisteredStudents || 0}
                </span>
            </td>
            <td style="text-align: center;">
                <span style="color: #3b82f6; font-weight: 600;">
                    ${course.AvgFinalScore ? course.AvgFinalScore.toFixed(1) : '-'}
                </span>
            </td>
        </tr>
    `).join('');
}

// ========================================
// 4. HELPER FUNCTIONS
// ========================================
function generateStarRating(rating) {
    if (!rating) return '';
    const fullStars = Math.floor(rating);
    const halfStar = (rating % 1) >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    
    let stars = '';
    for (let i = 0; i < fullStars; i++) {
        stars += '⭐';
    }
    if (halfStar) {
        stars += '⭐';
    }
    
    return stars;
}

function showTableLoading(tableId, colspan) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    tbody.innerHTML = `
        <tr class="placeholder-row">
            <td colspan="${colspan}" style="text-align: center; padding: 2rem;">
                <span class="material-icons spin" style="font-size: 32px; color: #3b82f6;">refresh</span>
                <p style="margin-top: 0.5rem;">Đang tải dữ liệu...</p>
            </td>
        </tr>
    `;
}

function showTableError(tableId, message, colspan) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    tbody.innerHTML = `
        <tr class="placeholder-row">
            <td colspan="${colspan}" style="text-align: center; padding: 2rem; color: #ef4444;">
                <span class="material-icons" style="font-size: 32px;">error</span>
                <p style="margin-top: 0.5rem;"><strong>Lỗi:</strong> ${message}</p>
            </td>
        </tr>
    `;
}
