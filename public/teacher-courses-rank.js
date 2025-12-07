// ========================================
// PANEL 3: TEACHER DASHBOARD - FULL CRUD
// ========================================
// Chức năng: 
// 1. Hiển thị danh sách khóa học của giảng viên
// 2. Tìm kiếm khóa học theo tên
// 3. Thêm/Sửa/Xóa khóa học
// 4. Validate dữ liệu đầu vào
// 5. Sắp xếp theo các cột
// API: 
// - GET /api/teacher/:teacherId/course-stats (Stored Procedure: usp_GetTeacherCourseStats)
// - POST /api/course/add (Thêm khóa học)
// - PUT /api/course/update (Cập nhật khóa học)
// - DELETE /api/course/delete (Xóa khóa học)
// ========================================

console.log('Panel Teacher loaded - Full CRUD');

// API Base URL
const API_BASE_TEACHER = 'http://localhost:3000/api';

// Global state
let currentTeacherId = '';
let allCourses = [];
let filteredCourses = [];
let sortColumn = null;
let sortDirection = 'asc';
let activeFilters = {
    search: '',
    rating: '',
    revenue: '',
    students: ''
};

// ========================================
// 1. KHỞI TẠO
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    setupTeacherStatsForm();
    setupSearchFilter();
    setupAdvancedFilters();
    setupCourseFormHandlers();
    setupTableSorting();
});

// ========================================
// 1.1. TEACHER INFO DISPLAY
// ========================================
function displayTeacherInfo(teacherId, courseData) {
    const infoCard = document.getElementById('teacher-info-card');
    const nameDisplay = document.getElementById('teacher-name-display');
    const idDisplay = document.getElementById('teacher-id-display');
    const expertiseDisplay = document.getElementById('teacher-expertise-display');
    
    if (!infoCard || !nameDisplay || !idDisplay) return;
    
    // Giả sử courseData có thông tin giảng viên
    // Nếu backend trả về TeacherName, sử dụng nó
    const teacherName = courseData.TeacherName || 'Giảng viên';
    const expertise = courseData.Expertise || '';
    
    nameDisplay.textContent = teacherName;
    idDisplay.textContent = teacherId;
    
    if (expertise && expertiseDisplay) {
        expertiseDisplay.innerHTML = `• <span class="material-icons" style="font-size: 16px; vertical-align: middle;">school</span> ${expertise}`;
    } else if (expertiseDisplay) {
        expertiseDisplay.innerHTML = '';
    }
    
    infoCard.style.display = 'block';
}

function hideTeacherInfo() {
    const infoCard = document.getElementById('teacher-info-card');
    if (infoCard) {
        infoCard.style.display = 'none';
    }
}

// ========================================
// 2. SETUP FORM HANDLERS
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

        if (!teacherId) {
            alert('Vui lòng nhập mã giảng viên!');
            return;
        }
        
        currentTeacherId = teacherId;
        await loadTeacherStats(teacherId);
    });
}

// Setup tìm kiếm real-time
function setupSearchFilter() {
    const searchInput = document.getElementById('search-teacher-course');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        activeFilters.search = e.target.value.toLowerCase().trim();
        applyFilters();
    });
}

// Setup advanced filters
function setupAdvancedFilters() {
    // Rating filter - changed to input
    const ratingFilter = document.getElementById('filter-rating');
    if (ratingFilter) {
        ratingFilter.addEventListener('input', (e) => {
            const value = e.target.value.trim();
            activeFilters.rating = value ? parseFloat(value) : '';
            applyFilters();
        });
    }
    
    // Revenue filter - changed to input
    const revenueFilter = document.getElementById('filter-revenue');
    if (revenueFilter) {
        revenueFilter.addEventListener('input', (e) => {
            const value = e.target.value.trim();
            activeFilters.revenue = value ? parseFloat(value) : '';
            applyFilters();
        });
    }
    
    // Students filter - changed to input
    const studentsFilter = document.getElementById('filter-students');
    if (studentsFilter) {
        studentsFilter.addEventListener('input', (e) => {
            const value = e.target.value.trim();
            activeFilters.students = value ? parseInt(value) : '';
            applyFilters();
        });
    }
    
    // Reset button
    const resetBtn = document.getElementById('btn-reset-filters');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            resetFilters();
        });
    }
}

// Apply all filters
function applyFilters() {
    if (!allCourses || allCourses.length === 0) {
        filteredCourses = [];
        displayTeacherStats(filteredCourses);
        updateFilterStatus();
        return;
    }
    
    filteredCourses = allCourses.filter(course => {
        // Search filter
        if (activeFilters.search) {
            if (!course.Cour_name.toLowerCase().includes(activeFilters.search)) {
                return false;
            }
        }
        
        // Rating filter - numeric input
        if (activeFilters.rating !== '') {
            const minRating = parseFloat(activeFilters.rating);
            if (!isNaN(minRating)) {
                if (!course.AvgRating || course.AvgRating < minRating) return false;
            }
        }
        
        // Revenue filter - numeric input
        if (activeFilters.revenue !== '') {
            const minRevenue = parseFloat(activeFilters.revenue);
            if (!isNaN(minRevenue)) {
                const revenue = course.TotalRevenue || 0;
                if (revenue < minRevenue) return false;
            }
        }
        
        // Students filter - numeric input
        if (activeFilters.students !== '') {
            const minStudents = parseInt(activeFilters.students);
            if (!isNaN(minStudents)) {
                const students = course.NumRegisteredStudents || 0;
                if (students < minStudents) return false;
            }
        }
        
        return true;
    });
    
    displayTeacherStats(filteredCourses);
    updateFilterStatus();
}

// Reset all filters
function resetFilters() {
    activeFilters = {
        search: '',
        rating: '',
        revenue: '',
        students: ''
    };
    
    // Reset UI
    const searchInput = document.getElementById('search-teacher-course');
    if (searchInput) searchInput.value = '';
    
    const ratingFilter = document.getElementById('filter-rating');
    if (ratingFilter) ratingFilter.value = '';
    
    const revenueFilter = document.getElementById('filter-revenue');
    if (revenueFilter) revenueFilter.value = '';
    
    const studentsFilter = document.getElementById('filter-students');
    if (studentsFilter) studentsFilter.value = '';
    
    // Apply filters (will show all)
    applyFilters();
    
    showToast('Đã reset tất cả bộ lọc', 'info');
}

// Update filter status display
function updateFilterStatus() {
    const statusDiv = document.getElementById('filter-status');
    if (!statusDiv) return;
    
    const totalCourses = allCourses.length;
    const shownCourses = filteredCourses.length;
    
    if (totalCourses === 0) {
        statusDiv.innerHTML = '';
        return;
    }
    
    const activeFilterCount = Object.values(activeFilters).filter(v => v !== '').length;
    
    if (activeFilterCount === 0) {
        statusDiv.innerHTML = `<span style="color: #64748b;">Hiển thị <strong>${totalCourses}</strong> khóa học</span>`;
    } else {
        const filterLabels = [];
        if (activeFilters.search) filterLabels.push(`Tìm kiếm: "${activeFilters.search}"`);
        if (activeFilters.rating !== '') {
            filterLabels.push(`Rating ≥ ${activeFilters.rating}`);
        }
        if (activeFilters.revenue !== '') {
            const revenueValue = parseFloat(activeFilters.revenue);
            if (revenueValue >= 1000000) {
                filterLabels.push(`Doanh thu ≥ ${(revenueValue / 1000000).toFixed(1)} triệu`);
            } else {
                filterLabels.push(`Doanh thu ≥ ${revenueValue.toLocaleString('vi-VN')} VNĐ`);
            }
        }
        if (activeFilters.students !== '') {
            filterLabels.push(`Học viên ≥ ${activeFilters.students}`);
        }
        
        const filterText = filterLabels.join(', ');
        
        statusDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                <span class="material-icons" style="font-size: 16px; color: #3b82f6;">filter_alt</span>
                <span style="color: #1e293b;">
                    Hiển thị <strong style="color: #3b82f6;">${shownCourses}</strong> / ${totalCourses} khóa học
                </span>
                <span style="color: #64748b;">•</span>
                <span style="color: #64748b; font-size: 0.875rem;">${filterText}</span>
            </div>
        `;
    }
}

// Setup form thêm/sửa khóa học
function setupCourseFormHandlers() {
    // Nút thêm khóa học
    const btnAdd = document.getElementById('btn-add-course');
    if (btnAdd) {
        btnAdd.addEventListener('click', () => {
            if (!currentTeacherId) {
                showToast('Vui lòng chọn giảng viên trước!', 'warning');
                return;
            }
            showCourseForm('add');
        });
    }
    
    // Form submit
    const form = document.getElementById('form-course-edit');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleSaveCourse();
        });
    }
    
    // Click outside modal to close
    const modal = document.getElementById('modal-course-form');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModalCourseForm();
            }
        });
    }
    
    // ESC key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideModalCourseForm();
            hideModalCourseDetail();
        }
    });
}

// Setup table sorting
function setupTableSorting() {
    const table = document.getElementById('table-teacher-courses');
    if (!table) return;
    
    // Add sortable class and click handlers to headers
    const headers = table.querySelectorAll('thead th');
    const sortableColumns = [
        { index: 1, key: 'Cour_name', type: 'string' },
        { index: 2, key: 'TotalFeedbacks', type: 'number' },
        { index: 3, key: 'AvgRating', type: 'number' },
        { index: 4, key: 'NumRegisteredStudents', type: 'number' },
        { index: 5, key: 'AvgFinalScore', type: 'number' },
        { index: 6, key: 'NumCertificatesReceived', type: 'number' },
        { index: 7, key: 'TotalRevenue', type: 'number' }
    ];
    
    sortableColumns.forEach(col => {
        const header = headers[col.index];
        if (header) {
            header.classList.add('sortable');
            header.style.cursor = 'pointer';
            header.dataset.sortKey = col.key;
            header.dataset.sortType = col.type;
            
            header.addEventListener('click', () => {
                handleSort(col.key, col.type, header);
            });
        }
    });
}

// Handle sorting
function handleSort(key, type, headerElement) {
    // Toggle direction if same column
    if (sortColumn === key) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn = key;
        sortDirection = 'asc';
    }
    
    // Update header classes
    const headers = document.querySelectorAll('#table-teacher-courses thead th');
    headers.forEach(h => {
        h.classList.remove('sort-asc', 'sort-desc');
    });
    headerElement.classList.add(sortDirection === 'asc' ? 'sort-asc' : 'sort-desc');
    
    // Sort data
    filteredCourses.sort((a, b) => {
        let aVal = a[key];
        let bVal = b[key];
        
        // Handle null/undefined
        if (aVal == null) aVal = type === 'number' ? 0 : '';
        if (bVal == null) bVal = type === 'number' ? 0 : '';
        
        // Compare based on type
        let comparison = 0;
        if (type === 'number') {
            comparison = aVal - bVal;
        } else {
            comparison = String(aVal).localeCompare(String(bVal), 'vi');
        }
        
        return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    // Re-display
    displayTeacherStats(filteredCourses);
}

// ========================================
// 3. LOAD TEACHER STATS
// ========================================
async function loadTeacherStats(teacherId) {
    try {
        showTableLoadingTeacher('table-teacher-courses', 9);
        
        // Load teacher info first
        const infoResponse = await fetch(`${API_BASE_TEACHER}/teacher/${teacherId}/info`);
        const infoData = await infoResponse.json();
        
        if (infoData.success && infoData.data) {
            displayTeacherInfo(teacherId, infoData.data);
        }
        
        // Load course statistics
        const response = await fetch(`${API_BASE_TEACHER}/teacher/${teacherId}/course-stats`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Không thể tải dữ liệu');
        }
        
        allCourses = data.data || [];
        
        // If no teacher info from first API, try from course data
        if (!infoData.success && allCourses.length > 0) {
            displayTeacherInfo(teacherId, allCourses[0]);
        }
        
        // Reset filters when loading new teacher
        resetFilters();
        
    } catch (error) {
        console.error('Error loading teacher stats:', error);
        hideTeacherInfo();
        showTableErrorTeacher('table-teacher-courses', error.message, 9);
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
        tbody.innerHTML = '<tr class="placeholder-row"><td colspan="9" style="text-align: center; padding: 2rem;">Không có khóa học nào.</td></tr>';
        return;
    }
    
    tbody.innerHTML = courses.map((course, index) => `
        <tr>
            <td style="text-align: center;">${index + 1}</td>
            <td><strong>${course.Cour_name}</strong></td>
            <td style="text-align: center;">
                <span class="badge" style="background: #8b5cf6; color: white; padding: 0.25rem 0.5rem; border-radius: 8px;">
                    ${course.TotalFeedbacks || course.NumFeedbacks || 0}
                </span>
            </td>
            <td style="text-align: center;">
                <span style="color: #fbbf24; font-weight: 600; display: inline-flex; align-items: center; gap: 0.25rem;">
                    ${course.AvgRating ? course.AvgRating.toFixed(1) : '-'}
                    ${course.AvgRating ? '<span class="material-icons" style="font-size: 18px; color: #fbbf24;">star</span>' : ''}
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
                <span class="badge" style="background: #f59e0b; color: white; padding: 0.25rem 0.5rem; border-radius: 8px; display: inline-flex; align-items: center; gap: 0.25rem;">
                    <span class="material-icons" style="font-size: 16px;">emoji_events</span>
                    ${course.NumCertificatesReceived || 0}
                </span>
            </td>
            <td style="text-align: right; padding-right: 1rem;">
                <span style="color: #10b981; font-weight: 700; font-size: 0.95rem;">
                    ${formatCurrency(course.TotalRevenue || 0)} ₫
                </span>
            </td>
            <td style="text-align: center;">
                <div style="display: flex; gap: 0.25rem; justify-content: center;">
                    <button 
                        class="btn-icon btn-view" 
                        onclick="handleViewCourse('${course.Course_id}')"
                        title="Xem chi tiết"
                        style="background: #10b981; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 6px; cursor: pointer; align-items: center; display: inline-flex;">
                        <span class="material-icons" style="font-size: 16px;">visibility</span>
                    </button>
                    <button 
                        class="btn-icon btn-edit" 
                        onclick="handleEditCourse('${course.Course_id}')"
                        title="Chỉnh sửa"
                        style="background: #3b82f6; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 6px; cursor: pointer; align-items: center; display: inline-flex;">
                        <span class="material-icons" style="font-size: 16px;">edit</span>
                    </button>
                    <button 
                        class="btn-icon btn-delete" 
                        onclick="handleDeleteCourse('${course.Course_id}', '${course.Cour_name}')"
                        title="Xóa"
                        style="background: #ef4444; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 6px; cursor: pointer; align-items: center; display: inline-flex;">
                        <span class="material-icons" style="font-size: 16px;">delete</span>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// ========================================
// 5. CRUD OPERATIONS
// ========================================

// Hiển thị modal form thêm/sửa
function showCourseForm(mode, courseData = null) {
    const modal = document.getElementById('modal-course-form');
    const title = document.getElementById('course-form-title');
    const form = document.getElementById('form-course-edit');
    
    if (!modal || !title || !form) return;
    
    // Reset form
    form.reset();
    
    // Clear all validation states
    form.querySelectorAll('input, textarea, select').forEach(input => {
        input.classList.remove('error', 'success');
        const errorMsg = input.parentElement.querySelector('.form-error-message');
        if (errorMsg) errorMsg.remove();
    });
    
    // Set ngày mặc định là hôm nay
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('edit-course-date').value = today;
    document.getElementById('edit-min-avg-score').value = 5.0;
    
    // Add real-time validation on input
    const inputs = {
        'edit-course-name': (val) => val.length >= 5 && val.length <= 200,
        'edit-course-price': (val) => val >= 0,
        'edit-min-avg-score': (val) => val >= 0 && val <= 10,
        'edit-course-date': (val) => val && isValidPastDate(val)
    };
    
    Object.keys(inputs).forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', () => {
                const isValid = inputs[inputId](input.value);
                input.classList.remove('error', 'success');
                if (input.value) {
                    input.classList.add(isValid ? 'success' : 'error');
                }
                // Remove error message when typing
                const errorMsg = input.parentElement.querySelector('.form-error-message');
                if (errorMsg) errorMsg.remove();
            });
        }
    });
    
    if (mode === 'add') {
        title.innerHTML = '<span class="material-icons" style="vertical-align: middle; margin-right: 8px;">add</span>Thêm khóa học mới';
        document.getElementById('edit-course-id').value = '';
        document.getElementById('edit-teacher-id').value = currentTeacherId;
    } else if (mode === 'edit' && courseData) {
        title.innerHTML = '<span class="material-icons" style="vertical-align: middle; margin-right: 8px;">edit</span>Chỉnh sửa khóa học';
        document.getElementById('edit-course-id').value = courseData.Course_id;
        document.getElementById('edit-teacher-id').value = currentTeacherId;
        document.getElementById('edit-course-name').value = courseData.Cour_name;
        // Load các trường khác từ database nếu có
    }
    
    modal.style.display = 'flex';
    
    // Focus vào trường đầu tiên
    setTimeout(() => {
        document.getElementById('edit-course-name').focus();
    }, 100);
}

// Ẩn modal
function hideModalCourseForm() {
    const modal = document.getElementById('modal-course-form');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Export để có thể gọi từ HTML
window.hideModalCourseForm = hideModalCourseForm;

// Xử lý View Detail
window.handleViewCourse = async function(courseId) {
    try {
        const response = await fetch(`${API_BASE_TEACHER}/course/${courseId}`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Không thể tải thông tin khóa học');
        }
        
        const course = data.data;
        showCourseDetail(course);
        
    } catch (error) {
        console.error('Error loading course detail:', error);
        showToast(error.message, 'error', 'Lỗi tải thông tin');
    }
}

// Hiển thị modal chi tiết khóa học
function showCourseDetail(course) {
    const modal = document.getElementById('modal-course-detail');
    const content = document.getElementById('course-detail-content');
    
    if (!modal || !content) return;
    
    // Format dữ liệu
    const formatDate = (date) => {
        if (!date) return '-';
        const d = new Date(date);
        return d.toLocaleDateString('vi-VN');
    };
    
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN').format(amount);
    };
    
    // Tạo HTML cho chi tiết
    content.innerHTML = `
        <div style="display: grid; gap: 1.5rem;">
            <!-- Thông tin cơ bản -->
            <div class="detail-section">
                <h4 style="color: #8b5cf6; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                    <span class="material-icons">school</span>
                    Thông tin cơ bản
                </h4>
                <div style="display: grid; grid-template-columns: 200px 1fr; gap: 0.75rem; background: #f8fafc; padding: 1rem; border-radius: 8px;">
                    <div style="font-weight: 600; color: #64748b;">Mã khóa học:</div>
                    <div>${course.Course_id}</div>
                    
                    <div style="font-weight: 600; color: #64748b;">Tên khóa học:</div>
                    <div style="font-weight: 600; color: #1e293b;">${course.Cour_name}</div>
                    
                    <div style="font-weight: 600; color: #64748b;">Giảng viên:</div>
                    <div>${course.TeacherName} (${course.Tea_id})</div>
                    
                    <div style="font-weight: 600; color: #64748b;">Ngôn ngữ:</div>
                    <div>
                        <span style="background: #dbeafe; color: #1e40af; padding: 0.25rem 0.75rem; border-radius: 6px; font-size: 0.875rem;">
                            ${course.Language || '-'}
                        </span>
                    </div>
                    
                    <div style="font-weight: 600; color: #64748b;">Ngày xuất bản:</div>
                    <div>${formatDate(course.Date_public)}</div>
                    
                    <div style="font-weight: 600; color: #64748b;">Giá khóa học:</div>
                    <div style="font-weight: 700; color: #10b981; font-size: 1.125rem;">
                        ${formatCurrency(course.Price)} ₫
                    </div>
                    
                    <div style="font-weight: 600; color: #64748b;">Điểm TB tối thiểu:</div>
                    <div>
                        <span style="background: #fef3c7; color: #92400e; padding: 0.25rem 0.75rem; border-radius: 6px; font-weight: 600;">
                            ${course.Min_avg_score ? course.Min_avg_score.toFixed(1) : '-'} / 10
                        </span>
                    </div>
                </div>
            </div>
            
            <!-- Mô tả -->
            ${course.Description ? `
            <div class="detail-section">
                <h4 style="color: #8b5cf6; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                    <span class="material-icons">description</span>
                    Mô tả khóa học
                </h4>
                <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; line-height: 1.6; color: #475569;">
                    ${course.Description}
                </div>
            </div>
            ` : ''}
            
            <!-- Thống kê -->
            <div class="detail-section">
                <h4 style="color: #8b5cf6; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                    <span class="material-icons">analytics</span>
                    Thống kê khóa học
                </h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                    <!-- Feedback -->
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1rem; border-radius: 12px; text-align: center;">
                        <div style="font-size: 2rem; font-weight: 700; margin-bottom: 0.25rem;">
                            ${course.TotalFeedbacks || 0}
                        </div>
                        <div style="font-size: 0.875rem; opacity: 0.9;">Feedback</div>
                    </div>
                    
                    <!-- Rating -->
                    <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 1rem; border-radius: 12px; text-align: center;">
                        <div style="font-size: 2rem; font-weight: 700; margin-bottom: 0.25rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                            ${course.AvgRating ? course.AvgRating.toFixed(1) : '-'}
                            ${course.AvgRating ? '<span class="material-icons" style="font-size: 32px;">star</span>' : ''}
                        </div>
                        <div style="font-size: 0.875rem; opacity: 0.9;">Rating TB</div>
                    </div>
                    
                    <!-- Học viên -->
                    <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 1rem; border-radius: 12px; text-align: center;">
                        <div style="font-size: 2rem; font-weight: 700; margin-bottom: 0.25rem;">
                            ${course.NumRegistered || 0}
                        </div>
                        <div style="font-size: 0.875rem; opacity: 0.9;">Học viên</div>
                    </div>
                    
                    <!-- Điểm TB -->
                    <div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; padding: 1rem; border-radius: 12px; text-align: center;">
                        <div style="font-size: 2rem; font-weight: 700; margin-bottom: 0.25rem;">
                            ${course.AvgFinalScore ? course.AvgFinalScore.toFixed(2) : '-'}
                        </div>
                        <div style="font-size: 0.875rem; opacity: 0.9;">Điểm TB</div>
                    </div>
                    
                    <!-- Chứng chỉ -->
                    <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; padding: 1rem; border-radius: 12px; text-align: center;">
                        <div style="font-size: 2rem; font-weight: 700; margin-bottom: 0.25rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                            <span class="material-icons" style="font-size: 32px;">emoji_events</span>
                            ${course.NumCertificates || 0}
                        </div>
                        <div style="font-size: 0.875rem; opacity: 0.9;">Chứng chỉ</div>
                    </div>
                    
                    <!-- Doanh thu -->
                    <div style="background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); color: white; padding: 1rem; border-radius: 12px; text-align: center;">
                        <div style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.25rem;">
                            ${formatCurrency(course.TotalRevenue || 0)} ₫
                        </div>
                        <div style="font-size: 0.875rem; opacity: 0.9;">Doanh thu</div>
                    </div>
                </div>
            </div>
            
            <!-- Thông tin kỹ thuật -->
            <div class="detail-section">
                <h4 style="color: #8b5cf6; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                    <span class="material-icons">settings</span>
                    Thông tin kỹ thuật
                </h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                    <div style="background: #f8fafc; padding: 1rem; border-radius: 8px;">
                        <div style="color: #64748b; font-size: 0.875rem; margin-bottom: 0.25rem;">Số bài giảng</div>
                        <div style="font-weight: 700; font-size: 1.25rem; color: #1e293b;">
                            ${course.Num_lecture || 0} bài
                        </div>
                    </div>
                    <div style="background: #f8fafc; padding: 1rem; border-radius: 8px;">
                        <div style="color: #64748b; font-size: 0.875rem; margin-bottom: 0.25rem;">Tổng thời lượng</div>
                        <div style="font-weight: 700; font-size: 1.25rem; color: #1e293b;">
                            ${course.Total_time ? Math.floor(course.Total_time / 60) + ' giờ ' + (course.Total_time % 60) + ' phút' : '-'}
                        </div>
                    </div>
                    <div style="background: #f8fafc; padding: 1rem; border-radius: 8px;">
                        <div style="color: #64748b; font-size: 0.875rem; margin-bottom: 0.25rem;">Học viên đã thanh toán</div>
                        <div style="font-weight: 700; font-size: 1.25rem; color: #10b981;">
                            ${course.NumPaid || 0} / ${course.NumRegistered || 0}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
}

// Ẩn modal chi tiết
function hideModalCourseDetail() {
    const modal = document.getElementById('modal-course-detail');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Export
window.hideModalCourseDetail = hideModalCourseDetail;

// Xử lý Edit
window.handleEditCourse = function(courseId) {
    const course = allCourses.find(c => c.Course_id === courseId);
    if (course) {
        showCourseForm('edit', course);
    }
}

// Xử lý Delete
window.handleDeleteCourse = async function(courseId, courseName) {
    const confirmed = await showConfirm(
        `Bạn có chắc chắn muốn xóa khóa học "${courseName}"?\n\nThao tác này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan!`,
        'Xác nhận xóa khóa học',
        'Xóa khóa học',
        'Hủy bỏ'
    );
    
    if (!confirmed) return;
    
    try {
        const response = await fetch(`${API_BASE_TEACHER}/course/delete`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                courseId: courseId,
                teacherId: currentTeacherId
            })
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Không thể xóa khóa học');
        }
        
        showToast('Xóa khóa học thành công!', 'success');
        await loadTeacherStats(currentTeacherId);
        
    } catch (error) {
        console.error('Error deleting course:', error);
        showToast(error.message, 'error', 'Lỗi xóa khóa học');
    }
}

// Xử lý Save (Add hoặc Update)
async function handleSaveCourse() {
    const courseId = document.getElementById('edit-course-id').value;
    const courseName = document.getElementById('edit-course-name').value.trim();
    const coursePrice = document.getElementById('edit-course-price').value;
    const courseDate = document.getElementById('edit-course-date').value;
    const courseDesc = document.getElementById('edit-course-description').value.trim();
    const language = document.getElementById('edit-course-language').value;
    const minAvgScore = document.getElementById('edit-min-avg-score').value;
    
    // Validate tên khóa học
    const nameInput = document.getElementById('edit-course-name');
    if (!courseName) {
        setInputValidation(nameInput, false, 'Vui lòng nhập tên khóa học');
        nameInput.focus();
        showToast('Vui lòng nhập tên khóa học!', 'warning');
        return;
    }
    
    if (courseName.length < 5) {
        setInputValidation(nameInput, false, 'Tên khóa học phải có ít nhất 5 ký tự');
        nameInput.focus();
        showToast('Tên khóa học quá ngắn (tối thiểu 5 ký tự)!', 'warning');
        return;
    }
    
    if (courseName.length > 200) {
        setInputValidation(nameInput, false, 'Tên khóa học không được vượt quá 200 ký tự');
        nameInput.focus();
        showToast('Tên khóa học quá dài (tối đa 200 ký tự)!', 'warning');
        return;
    }
    setInputValidation(nameInput, true);
    
    // Validate giá
    const priceInput = document.getElementById('edit-course-price');
    if (!coursePrice || coursePrice < 0) {
        setInputValidation(priceInput, false, 'Giá phải lớn hơn hoặc bằng 0');
        priceInput.focus();
        showToast('Vui lòng nhập giá khóa học hợp lệ (≥ 0)!', 'warning');
        return;
    }
    setInputValidation(priceInput, true);
    
    // Validate ngôn ngữ
    const langInput = document.getElementById('edit-course-language');
    if (!language) {
        setInputValidation(langInput, false, 'Vui lòng chọn ngôn ngữ');
        langInput.focus();
        showToast('Vui lòng chọn ngôn ngữ!', 'warning');
        return;
    }
    setInputValidation(langInput, true);
    
    // Validate điểm TB tối thiểu
    const scoreInput = document.getElementById('edit-min-avg-score');
    if (!minAvgScore || minAvgScore < 0 || minAvgScore > 10) {
        setInputValidation(scoreInput, false, 'Điểm TB phải từ 0 đến 10');
        scoreInput.focus();
        showToast('Điểm TB tối thiểu phải từ 0-10!', 'warning');
        return;
    }
    setInputValidation(scoreInput, true);
    
    // Validate ngày xuất bản
    const dateInput = document.getElementById('edit-course-date');
    if (!courseDate) {
        setInputValidation(dateInput, false, 'Vui lòng chọn ngày xuất bản');
        dateInput.focus();
        showToast('Vui lòng chọn ngày xuất bản!', 'warning');
        return;
    }
    
    // Check if date is not in future
    if (!isValidPastDate(courseDate)) {
        setInputValidation(dateInput, false, 'Ngày xuất bản không được ở tương lai');
        dateInput.focus();
        showToast('Ngày xuất bản không được ở tương lai!', 'warning');
        return;
    }
    setInputValidation(dateInput, true);
    
    // Validate mô tả (nếu có)
    const descInput = document.getElementById('edit-course-description');
    if (courseDesc && courseDesc.length > 1000) {
        setInputValidation(descInput, false, 'Mô tả không được vượt quá 1000 ký tự');
        descInput.focus();
        showToast('Mô tả quá dài (tối đa 1000 ký tự)!', 'warning');
        return;
    }
    setInputValidation(descInput, true);
    
    try {
        const isEdit = courseId ? true : false;
        const url = isEdit ? `${API_BASE_TEACHER}/course/update` : `${API_BASE_TEACHER}/course/add`;
        const method = isEdit ? 'PUT' : 'POST';
        
        const payload = {
            courseId: courseId,
            teacherId: currentTeacherId,
            courseName: courseName,
            price: parseFloat(coursePrice),
            datePublic: courseDate,
            description: courseDesc,
            language: language,
            minAvgScore: parseFloat(minAvgScore)
        };
        
        console.log('📤 Sending request:', method, url, payload);
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        console.log('Response:', data);
        
        if (!data.success) {
            throw new Error(data.message || 'Không thể lưu khóa học');
        }
        
        showToast(
            isEdit ? 'Cập nhật khóa học thành công!' : 'Thêm khóa học mới thành công!',
            'success'
        );
        hideModalCourseForm();
        
        console.log('🔄 Reloading teacher stats...');
        await loadTeacherStats(currentTeacherId);
        console.log('✅ Stats reloaded!');
        
    } catch (error) {
        console.error('Error saving course:', error);
        showToast(error.message, 'error', 'Lỗi lưu khóa học');
    }
}

// ========================================
// 6. HELPER FUNCTIONS
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
