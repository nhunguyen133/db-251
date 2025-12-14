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

    resetSortIconsOnLoad();
});

function resetSortIconsOnLoad() {
    const icons = document.querySelectorAll('#table-top-courses .sort-icon');
    icons.forEach(span => {
        span.textContent = 'unfold_more';
        span.style.color = '#94a3b8';
        span.style.opacity = '0.5';
        span.style.pointerEvents = 'none';
        
        // Đảm bảo có class material-icons
        if (!span.classList.contains('material-icons')) {
            span.classList.add('material-icons');
        }
    });
}

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
        showTableError('table-top-courses', error.message, 6);
    }
}

// ========================================
// 4. DISPLAY TOP COURSES
// ========================================
function displayTopCourses(courses) {
    const tbody = document.querySelector('#table-top-courses tbody');
    
    if (!courses || courses.length === 0) {
        tbody.innerHTML = '<tr class="placeholder-row"><td colspan="6">Không có dữ liệu phù hợp với điều kiện lọc.</td></tr>';
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

function handleSortTopCourses(key) {
    if (globalTopCourses.length == 0) return;

    if (currentSort.key === key) currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
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
    // Tìm các icon trong bảng Top Courses
    const icons = document.querySelectorAll('#table-top-courses .sort-icon');

    icons.forEach(span => {
        const key = span.id.replace('icon-', '');
        const thElement = span.parentElement;

        // Cấu hình style chung cho đẹp
        span.style.fontSize = '16px';
        span.style.verticalAlign = 'middle';
        span.style.marginLeft = '4px';
        span.style.pointerEvents = 'none'; // Click xuyên qua icon

        // Kiểm tra xem cột này có đang được sort không
        if (currentSort.key === key) {
            // --- TRƯỜNG HỢP 1: ĐANG SORT ---
            // Hiện mũi tên Lên/Xuống
            span.textContent = currentSort.direction === 'asc' ? 'arrow_upward' : 'arrow_downward';
            
            // Màu xanh nổi bật
            span.style.color = '#6366f1';
            span.style.opacity = '1';
            
            // Tô màu tiêu đề
            if (thElement) thElement.style.color = '#1e293b';

        } else {
            // --- TRƯỜNG HỢP 2: CHƯA SORT ---
            // Hiện lại nút 2 chiều (unfold_more) để người dùng biết chỗ này bấm được
            span.textContent = 'unfold_more'; 
            
            // Màu xám nhạt (mờ đi)
            span.style.color = '#94a3b8';
            span.style.opacity = '0.5';
            
            // Trả màu tiêu đề về mặc định
            if (thElement) thElement.style.color = '#1e293b';
        }
    });
}

window.handleSortTopCourses = handleSortTopCourses;