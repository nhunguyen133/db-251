// ========================================
// PANEL 2: TOP RATED COURSES
// ========================================
// Chức năng: Hiển thị top khóa học theo năm xuất bản và số lượng review
// API: GET /api/courses/top-rated?publishedYear=YYYY&minReview=N
// Stored Procedure: usp_GetTopRatedCourses
// ========================================

console.log('Panel Top Courses loaded');

// API Base URL
const API_BASE_TOP_COURSES = 'http://localhost:3000/api';

// ========================================
// 1. KHỞI TẠO
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    setupTopCoursesForm();
});

// ========================================
// 2. SETUP FORM HANDLER
// ========================================
function setupTopCoursesForm() {
    const form = document.getElementById('form-top-courses');
    if (!form) {
        console.warn('Form form-top-courses not found');
        return;
    }
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const year = document.getElementById('year').value;
        const minReview = document.getElementById('minReview').value;
        
        if (!year || !minReview) {
            alert('Vui lòng nhập đầy đủ năm xuất bản và số review tối thiểu!');
            return;
        }
        
        await loadTopRatedCourses(year, minReview);
    });
}

// ========================================
// 3. LOAD TOP RATED COURSES
// ========================================
async function loadTopRatedCourses(publishedYear, minReview) {
    try {
        showTableLoading('table-top-courses', 5);
        
        const response = await fetch(`${API_BASE_TOP_COURSES}/courses/top-rated?publishedYear=${publishedYear}&minReview=${minReview}`);
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

// ========================================
// 4. DISPLAY TOP COURSES
// ========================================
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
// 5. HELPER FUNCTIONS
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

function showTableError(tableId, message, colspan) {
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
