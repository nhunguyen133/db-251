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

let globalTopCourses = [];

let currentSort = {
    key: null,
    direction: 'asc'
}

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
        showTableLoading('table-top-courses', 6);
        
        const response = await fetch(`${API_BASE_TOP_COURSES}/courses/top-rated?publishedYear=${publishedYear}&minReview=${minReview}`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Không thể tải dữ liệu');
        }

        globalTopCourses = data.data || [];

        currentSort = {key: null, direction: 'asc'};
        updateSortIcons();
        
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
            <td style="text-align: center";>${course.CourseID}</td>
            <td>
                <strong>${course.CourseName}</strong>
            </td>
            <td>${course['F_name + \' \' + L_name'] || course.TeacherName || '-'}</td>
            <td style="text-align: center;">
                <span class="badge" style="background: #3b82f6; color: white; padding: 0.25rem 0.75rem; border-radius: 12px;">
                    ${course.TotalFeedbacks} reviews
                </span>
            </td>

            <td style="text-align: left; width: 100px; border-left: none; padding-left: 0;">
                <div style="display: flex; align-items: center;">
                    ${generateStarRating(course.AvgRating)}
                </div>
            </td>

            <td style="text-align: center; width: 50px; border-right: none;">
                <span style="font-weight: 700; color: #f59e0b; font-size: 1rem;">
                    ${course.AvgRating}
                </span>
            </td>
        </tr>
    `).join('');
}

// ========================================
// 5. HELPER FUNCTIONS
// ========================================
function generateStarRating(rating) {
    if (rating === undefined || rating === null) return '';
    
    const score = parseFloat(rating);
    let starsHtml = '';

    for (let i = 1; i <= 5; i++) {
        if (score >= i) {
            starsHtml += '<span class="material-icons" style="color: #fbbf24; font-size: 18px; vertical-align: middle;">star</span>';
        } 
        else if (score > i - 1) {
            const percent = (score - (i - 1)) * 100;
            
            starsHtml += `
            <div style="position: relative; display: inline-block; width: 18px; height: 18px; vertical-align: middle;">
                <span class="material-icons" style="color: #e2e8f0; font-size: 18px; position: absolute; left: 0; top: 0; z-index: 1;">star_border</span>
                
                <div style="width: ${percent}%; height: 100%; overflow: hidden; position: absolute; left: 0; top: 0; z-index: 2;">
                    <span class="material-icons" style="color: #fbbf24; font-size: 18px;">star</span>
                </div>
            </div>
            `;
        } 
        else {
            starsHtml += '<span class="material-icons" style="color: #e2e8f0; font-size: 18px; vertical-align: middle;">star_border</span>';
        }
    }

    return starsHtml;
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

function handleSort(key) {
    if (globalTopCourses.length == 0) return;

    if (currentSort.key == key) currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    else {
        currentSort.key = key;
        currentSort.direction = 'desc';
    }

    globalTopCourses.sort((a, b) => {
        let valA = a[key];
        let valB = b[key];

        if (valA === null || valA === undefined) valA = '';
        if (valB === null || valB === undefined) valB = '';

        const isNumber = typeof valA === 'number' && typeof valB === 'number';

        if (isNumber) return currentSort.direction === 'asc' ? valA - valB : valB - valA;
        else {
            valA = valA.toString().toLowerCase();
            valB = valB.toString().toLowerCase();
            if (valA < valB) return currentSort.direction === 'asc' ? -1 : 1;
            if (valA > valB) return currentSort.direction === 'asc' ? 1 : -1;
            return 0;
        }
    });
    
    updateSortIcons();
    displayTopCourses(globalTopCourses);
}

function updateSortIcons() {
    // Lấy tất cả các thẻ span chứa icon (đã thêm class sort-icon ở bước trước)
    const icons = document.querySelectorAll('.sort-icon');

    icons.forEach(span => {
        // Lấy tên cột từ ID của span
        const key = span.id.replace('icon-', '');
        const thElement = span.parentElement;

        // Cấu hình style chung
        span.style.verticalAlign = 'middle';
        span.style.fontSize = '16px';
        span.style.marginLeft = '4px';
        span.className = 'material-icons sort-icon';
        
        // LOGIC HIỂN THỊ ICON
        if (currentSort.key === key) {
            // --- TRƯỜNG HỢP 1: CỘT ĐANG ĐƯỢC CHỌN ---
            // Chỉ hiện mũi tên chỉ hướng (Lên hoặc Xuống)
            span.textContent = currentSort.direction === 'asc' ? 'arrow_upward' : 'arrow_downward';
            
            span.style.color = '#6366f1'; 
            span.style.opacity = '1';
            
            if (thElement) thElement.style.color = '#6366f1';

        } else {
            // --- TRƯỜNG HỢP 2: CỘT CHƯA ĐƯỢC CHỌN ---
            // Hiện icon mặc định (2 mũi tên) để người dùng biết có thể bấm vào
            span.textContent = 'unfold_more'; 
            
            span.style.color = '#94a3b8';
            span.style.opacity = '0.5';
            
            if (thElement) thElement.style.color = '#1e293b';
        }
    });
}

window.handleSort = handleSort;