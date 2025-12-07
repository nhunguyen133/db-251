// ========================================
// FEEDBACK MANAGEMENT - FRONTEND LOGIC
// ========================================

// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// Current Student ID (hardcoded for demo)
const CURRENT_STUDENT_ID = 'U000000007';

// Global state
let currentCourses = [];
let currentFeedbackHistory = [];
let selectedCourse = null;

// ========================================
// 1. KHỞI TẠO KHI TRANG LOAD
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('Feedback Management initialized');
    
    // Set student ID
    document.getElementById('current-student-id').textContent = CURRENT_STUDENT_ID;
    document.getElementById('fb-stu-id').value = CURRENT_STUDENT_ID;
    
    // Load student info (name)
    loadStudentInfo();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load initial data (chỉ khi panel feedback được active)
    const feedbackPanel = document.getElementById('panel-feedback');
    if (feedbackPanel.classList.contains('active')) {
        loadFeedbackData();
    }
});

// ========================================
// 2. SETUP EVENT LISTENERS
// ========================================
function setupEventListeners() {
    // Search courses
    const searchInput = document.getElementById('search-my-courses');
    if (searchInput) {
        searchInput.addEventListener('input', filterCourses);
    }
    
    // Star rating - hover and click
    const stars = document.querySelectorAll('.star-rating');
    stars.forEach((star, index) => {
        // Hover effect
        star.addEventListener('mouseenter', function() {
            highlightStars(index + 1, false);
        });
        
        // Click to select
        star.addEventListener('click', function() {
            const rating = parseInt(this.dataset.rating);
            selectRating(rating);
        });
    });
    
    // Reset stars on mouse leave
    const ratingContainer = document.getElementById('rating-stars');
    if (ratingContainer) {
        ratingContainer.addEventListener('mouseleave', function() {
            const currentRating = parseInt(document.getElementById('fb-rating').value);
            if (currentRating > 0) {
                highlightStars(currentRating, true);
            } else {
                highlightStars(0, false);
            }
        });
    }
    
    // Comment textarea - character count
    const commentTextarea = document.getElementById('fb-comment');
    if (commentTextarea) {
        commentTextarea.addEventListener('input', updateCharCount);
    }
    
    // Course combobox - change event
    const courseSelect = document.getElementById('fb-course-select');
    if (courseSelect) {
        courseSelect.addEventListener('change', handleCourseSelectChange);
    }
    
    // Form submit
    const feedbackForm = document.getElementById('form-feedback');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Cancel button
    const cancelBtn = document.getElementById('btn-cancel-fb');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', resetForm);
    }
    
    // Delete button
    const deleteBtn = document.getElementById('btn-delete-fb');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', handleDeleteFeedback);
    }
}

// ========================================
// 3. LOAD DỮ LIỆU BAN ĐẦU
// ========================================

// Load thông tin học viên
async function loadStudentInfo() {
    try {
        const response = await fetch(`${API_BASE_URL}/student/${CURRENT_STUDENT_ID}/info`);
        const result = await response.json();
        
        if (result.success && result.data) {
            const studentName = result.data.Full_name || result.data.F_name + ' ' + result.data.L_name;
            const greetingElement = document.getElementById('student-greeting');
            if (greetingElement) {
                greetingElement.textContent = `Xin chào, ${studentName}!`;
            }
        } else {
            console.warn('Không tìm thấy thông tin học viên');
        }
    } catch (error) {
        console.error('Lỗi khi load thông tin học viên:', error);
        // Không hiển thị lỗi cho user, giữ nguyên "Học viên!"
    }
}

async function loadFeedbackData() {
    try {
        showStatus('Đang tải dữ liệu...', 'info');
        
        // Load danh sách khóa học
        await loadMyCourses();
        
        // Load lịch sử feedback
        await loadFeedbackHistory();
        
        // Load thống kê
        await loadFeedbackStats();
        
        showStatus('Tải dữ liệu thành công!', 'success');
    } catch (error) {
        console.error('Error loading data:', error);
        showStatus('Lỗi khi tải dữ liệu: ' + error.message, 'error');
    }
}

// ========================================
// 4. LOAD DANH SÁCH KHÓA HỌC
// ========================================
async function loadMyCourses() {
    try {
        // TODO: Gọi API GET /api/student/:studentId/courses
        const response = await fetch(`${API_BASE_URL}/student/${CURRENT_STUDENT_ID}/courses`);
        
        if (!response.ok) {
            throw new Error('Không thể tải danh sách khóa học');
        }
        
        const data = await response.json();
        currentCourses = data.data || [];
        
        // Render table
        renderCoursesTable(currentCourses);
        
        // Hide loading, show table
        document.getElementById('course-list-loading').style.display = 'none';
        document.getElementById('table-my-courses').style.display = 'table';
        
    } catch (error) {
        console.error('Error loading courses:', error);
        document.getElementById('course-list-loading').innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #ef4444;">
                <div style="font-size: 2rem;">X</div>
                <p>Không thể tải danh sách khóa học</p>
                <p style="font-size: 0.9rem;">${error.message}</p>
                <button onclick="loadMyCourses()" class="btn-primary" style="margin-top: 1rem;">
                    Thử lại
                </button>
            </div>
        `;
    }
}

// ========================================
// 5. RENDER BẢNG KHÓA HỌC
// ========================================
function renderCoursesTable(courses) {
    const tbody = document.querySelector('#table-my-courses tbody');
    
    if (!courses || courses.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 2rem; color: #94a3b8;">
                    Không có khóa học nào đã đăng ký.
                </td>
            </tr>
        `;
        return;
    }
    
    // Populate combobox với danh sách khóa học
    populateCourseCombobox(courses);
    
    tbody.innerHTML = courses.map(course => {
        const rating = course.rating || course.Rating;
        const status = course.status || course.Status || '';
        const daysAgo = course.daysAgo || course.DaysAgo;
        
        // Hiển thị rating hoặc "Chưa đánh giá"
        const ratingDisplay = rating ? 
            generateStarDisplay(rating) : 
            '<span style="color: #9ca3af; font-style: italic;">Chưa đánh giá</span>';
        
        // Xác định nút hiển thị
        let actionButtons = '';
        if (rating) {
            // Đã đánh giá → Hiển thị nút Sửa và Xóa
            const canEdit = daysAgo <= 30;
            actionButtons = `
                <div style="display: flex; gap: 0.25rem; flex-wrap: wrap;">
                    <button class="btn-outline" style="font-size: 0.85rem; padding: 0.4rem 0.8rem; ${!canEdit ? 'opacity: 0.5; cursor: not-allowed;' : ''}" 
                            onclick='editFeedback(${JSON.stringify(course)})' ${!canEdit ? 'disabled' : ''}>
                        <span class="material-icons" style="font-size: 14px; vertical-align: middle;">edit</span>
                        Sửa
                    </button>
                    <button class="btn-danger" style="font-size: 0.85rem; padding: 0.4rem 0.8rem; ${!canEdit ? 'opacity: 0.5; cursor: not-allowed;' : ''}" 
                            onclick='handleDeleteFeedback("${course.courseId || course.Cour_id}")' ${!canEdit ? 'disabled' : ''}>
                        <span class="material-icons" style="font-size: 14px; vertical-align: middle;">delete</span>
                        Xóa
                    </button>
                </div>
                ${!canEdit ? '<div style="font-size: 0.75rem; color: #ef4444; margin-top: 0.25rem; display: inline-flex; align-items: center; gap: 0.25rem;"><span class="material-icons" style="font-size: 14px;">lock</span> Quá 30 ngày</div>' : ''}
            `;
        } else {
            // Chưa đánh giá → Hiển thị nút Thêm
            actionButtons = `
                <button class="btn-primary" style="font-size: 0.85rem; padding: 0.4rem 0.8rem;"
                        onclick='addNewFeedback(${JSON.stringify(course)})'>
                    <span class="material-icons" style="font-size: 14px; vertical-align: middle;">add</span>
                    Thêm
                </button>
            `;
        }
        
        return `
            <tr style="${!rating ? 'background: #fefce8;' : ''}">
                <!-- <td><strong>${course.courseId || course.Cour_id}</strong></td> -->
                <td>
                    <strong>${course.courseName || course.Cour_name}</strong>
                </td>
                <td>
                    <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                        <span style="color: ${(course.progress || course.Learning_progress) >= 100 ? '#16a34a' : '#f59e0b'}; font-weight: 600;">
                            ${course.progress || course.Learning_progress}%
                        </span>
                        <div style="width: 100%; height: 4px; background: #e5e7eb; border-radius: 2px; overflow: hidden;">
                            <div style="width: ${course.progress || course.Learning_progress}%; height: 100%; background: ${(course.progress || course.Learning_progress) >= 100 ? '#16a34a' : '#f59e0b'}; transition: width 0.3s;"></div>
                        </div>
                    </div>
                </td>
                <td>${ratingDisplay}</td>
                <td>${actionButtons}</td>
            </tr>
        `;
    }).join('');
}

// Helper function to generate star display
function generateStarDisplay(rating) {
    const fullStars = Math.floor(rating);
    let starsHtml = '';
    
    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            starsHtml += '<span class="material-icons" style="font-size: 16px; color: #fbbf24; vertical-align: middle;">star</span>';
        } else {
            starsHtml += '<span class="material-icons" style="font-size: 16px; color: #e5e7eb; vertical-align: middle;">star_border</span>';
        }
    }
    
    return `<span style="white-space: nowrap;">${starsHtml} <span style="font-weight: 600; color: #f59e0b;">${rating}</span></span>`;
}

// ========================================
// 5B. POPULATE COURSE COMBOBOX
// ========================================
function populateCourseCombobox(courses) {
    const select = document.getElementById('fb-course-select');
    if (!select) return;
    
    // Lưu lại giá trị đang chọn (nếu có)
    const currentValue = select.value;
    
    // Xóa tất cả options cũ trừ option đầu tiên
    select.innerHTML = '<option value="">-- Chọn khóa học để đánh giá --</option>';
    
    // Thêm tất cả khóa học vào combobox
    courses.forEach(course => {
        const option = document.createElement('option');
        option.value = course.courseId || course.Cour_id;
        option.textContent = course.courseName || course.Cour_name;
        
        // Lưu thêm thông tin vào dataset để dùng sau
        option.dataset.courseData = JSON.stringify(course);
        
        select.appendChild(option);
    });
    
    // Khôi phục giá trị đã chọn (nếu có)
    if (currentValue) {
        select.value = currentValue;
    }
}

// ========================================
// 6. FILTER / SEARCH KHÓA HỌC
// ========================================
function filterCourses() {
    const searchTerm = document.getElementById('search-my-courses').value.toLowerCase();
    
    const filteredCourses = currentCourses.filter(course => {
        const courseId = (course.courseId || course.Cour_id || '').toLowerCase();
        const courseName = (course.courseName || course.Course_name || '').toLowerCase();
        return courseId.includes(searchTerm) || courseName.includes(searchTerm);
    });
    
    renderCoursesTable(filteredCourses);
}

// ========================================
// 6B. HANDLE COURSE COMBOBOX CHANGE
// ========================================
function handleCourseSelectChange(event) {
    const selectedOption = event.target.options[event.target.selectedIndex];
    const courseId = event.target.value;
    
    if (!courseId) {
        // Không chọn khóa học nào
        document.getElementById('fb-cour-id').value = '';
        document.getElementById('fb-cour-id-display').textContent = '-';
        resetForm();
        showStatus('Vui lòng chọn khóa học để bắt đầu đánh giá.', 'info');
        return;
    }
    
    // Lấy thông tin khóa học từ dataset
    const courseData = JSON.parse(selectedOption.dataset.courseData);
    
    // Cập nhật hidden input và display
    document.getElementById('fb-cour-id').value = courseId;
    document.getElementById('fb-cour-id-display').textContent = courseId;
    
    // Kiểm tra xem đã đánh giá chưa
    if (courseData.rating) {
        // Đã đánh giá → Load form ở chế độ sửa
        editFeedback(courseData);
    } else {
        // Chưa đánh giá → Load form ở chế độ thêm mới
        addNewFeedback(courseData);
    }
}

// ========================================
// 7. THÊM FEEDBACK MỚI
// ========================================
function addNewFeedback(course) {
    selectedCourse = course;
    
    // Reset form
    resetForm();
    
    // Set mode to 'add'
    document.getElementById('fb-mode').value = 'add';
    const titleIcon = '<span class="material-icons" style="vertical-align: middle; margin-right: 8px;">add_circle</span>';
    document.getElementById('form-feedback-title').innerHTML = titleIcon + 'Thêm đánh giá mới';
    
    // Fill course info
    const courseId = course.courseId || course.Cour_id;
    const courseName = course.courseName || course.Cour_name;
    
    // Update combobox selection
    const courseSelect = document.getElementById('fb-course-select');
    if (courseSelect) {
        courseSelect.value = courseId;
    }
    
    // Update hidden field and display
    document.getElementById('fb-cour-id').value = courseId;
    document.getElementById('fb-cour-id-display').textContent = courseId;
    
    // Hide delete button
    document.getElementById('btn-delete-fb').style.display = 'none';
    
    // Update status
    showStatus('Vui lòng nhập đánh giá và nhận xét của bạn.', 'info');
    
    // Scroll to form
    document.getElementById('form-feedback').scrollIntoView({ behavior: 'smooth' });
}

// ========================================
// 8. SỬA FEEDBACK ĐÃ CÓ
// ========================================
function editFeedback(course) {
    selectedCourse = course;
    
    // Set mode to 'edit'
    document.getElementById('fb-mode').value = 'edit';
    const titleIcon = '<span class="material-icons" style="vertical-align: middle; margin-right: 8px;">edit</span>';
    document.getElementById('form-feedback-title').innerHTML = titleIcon + 'Chỉnh sửa đánh giá';
    
    // Fill course info
    const courseId = course.courseId || course.Cour_id;
    const courseName = course.courseName || course.Cour_name;
    const rating = course.rating || course.Rating;
    const comment = course.comment || course.Comment;
    
    // Update combobox selection
    const courseSelect = document.getElementById('fb-course-select');
    if (courseSelect) {
        courseSelect.value = courseId;
    }
    
    // Update hidden field and display
    document.getElementById('fb-cour-id').value = courseId;
    document.getElementById('fb-cour-id-display').textContent = courseId;
    
    // Set rating
    selectRating(rating);
    
    // Set comment
    document.getElementById('fb-comment').value = comment || '';
    updateCharCount();
    
    // Show delete button if within 30 days
    const status = course.status || course.Status || '';
    if (status.includes('Có thể sửa') || course.daysAgo <= 30) {
        document.getElementById('btn-delete-fb').style.display = 'block';
    } else {
        document.getElementById('btn-delete-fb').style.display = 'none';
    }
    
    // Update status
    showStatus('Bạn đang chỉnh sửa đánh giá đã có. Lưu ý: chỉ sửa được trong vòng 30 ngày.', 'warning');
    
    // Scroll to form
    document.getElementById('form-feedback').scrollIntoView({ behavior: 'smooth' });
}

// ========================================
// 9. HIGHLIGHT STARS (for hover effect)
// ========================================
function highlightStars(rating, filled) {
    const stars = document.querySelectorAll('.star-rating');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.textContent = 'star';
            star.style.color = '#fbbf24';
        } else {
            star.textContent = 'star_border';
            star.style.color = '#e2e8f0';
        }
    });
}

// ========================================
// 10. SELECT RATING
// ========================================
function selectRating(rating) {
    // Update hidden input
    document.getElementById('fb-rating').value = rating;
    
    // Update stars
    highlightStars(rating, true);
    
    // Update text
    const ratingTexts = {
        1: 'Rất không hài lòng',
        2: 'Không hài lòng',
        3: 'Bình thường',
        4: 'Hài lòng',
        5: 'Rất hài lòng'
    };
    
    document.getElementById('rating-text').textContent = rating > 0 ? ratingTexts[rating] : 'Chưa chọn đánh giá';
}

// ========================================
// 10. CẬP NHẬT SỐ KÝ TỰ
// ========================================
function updateCharCount() {
    const textarea = document.getElementById('fb-comment');
    const count = textarea.value.length;
    const charCountSpan = document.getElementById('char-count');
    
    charCountSpan.textContent = count;
    
    if (count < 20) {
        charCountSpan.style.color = '#ef4444';
    } else if (count > 3000) {
        charCountSpan.style.color = '#ef4444';
    } else {
        charCountSpan.style.color = '#16a34a';
    }
}

// ========================================
// 11. XỬ LÝ SUBMIT FORM
// ========================================
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const mode = document.getElementById('fb-mode').value;
    const studentId = document.getElementById('fb-stu-id').value;
    const courseId = document.getElementById('fb-cour-id').value;
    const rating = parseInt(document.getElementById('fb-rating').value);
    const comment = document.getElementById('fb-comment').value.trim();
    
    // Validation
    if (!courseId) {
        showStatus('Vui lòng chọn khóa học từ danh sách bên trái!', 'error');
        return;
    }
    
    if (rating < 1 || rating > 5) {
        showStatus('Vui lòng chọn đánh giá từ 1-5 sao!', 'error');
        return;
    }
    
    if (comment.length < 20) {
        showStatus('Nhận xét phải có ít nhất 20 ký tự!', 'error');
        return;
    }
    
    if (comment.length > 3000) {
        showStatus('Nhận xét không được quá 3000 ký tự!', 'error');
        return;
    }
    
    try {
        showStatus('Đang xử lý...', 'info');
        
        if (mode === 'add') {
            await addFeedback(studentId, courseId, rating, comment);
        } else if (mode === 'edit') {
            await updateFeedback(studentId, courseId, rating, comment);
        }
        
    } catch (error) {
        console.error('Error submitting feedback:', error);
        showStatus('Lỗi: ' + error.message, 'error');
    }
}

// ========================================
// 12. GỌI API THÊM FEEDBACK
// ========================================
async function addFeedback(studentId, courseId, rating, comment) {
    try {
        // TODO: Gọi API POST /api/feedback/add
        const response = await fetch(`${API_BASE_URL}/feedback/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                studentId: studentId,
                courseId: courseId,
                rating: rating,
                comment: comment
            })
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Không thể thêm đánh giá');
        }
        
        showStatus(data.message, 'success');
        
        // Reload data
        await loadFeedbackData();
        
        // Reset form
        resetForm();
        
    } catch (error) {
        throw error;
    }
}

// ========================================
// 13. GỌI API CẬP NHẬT FEEDBACK
// ========================================
async function updateFeedback(studentId, courseId, newRating, newComment) {
    try {
        // TODO: Gọi API PUT /api/feedback/update
        const response = await fetch(`${API_BASE_URL}/feedback/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                studentId: studentId,
                courseId: courseId,
                newRating: newRating,
                newComment: newComment
            })
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Không thể cập nhật đánh giá');
        }
        
        showStatus(data.message, 'success');
        
        // Reload data
        await loadFeedbackData();
        
        // Reset form
        resetForm();
        
    } catch (error) {
        throw error;
    }
}

// ========================================
// 14. XÓA FEEDBACK
// ========================================
async function handleDeleteFeedback() {
    const studentId = document.getElementById('fb-stu-id').value;
    const courseId = document.getElementById('fb-cour-id').value;
    
    if (!courseId) {
        showStatus('Không có đánh giá nào được chọn!', 'error');
        return;
    }
    
    // Confirm dialog
    if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
        return;
    }
    
    try {
        showStatus('Đang xóa...', 'info');
        
        // TODO: Gọi API DELETE /api/feedback/delete
        const response = await fetch(`${API_BASE_URL}/feedback/delete`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                studentId: studentId,
                courseId: courseId
            })
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Không thể xóa đánh giá');
        }
        
        showStatus(data.message, 'success');
        
        // Reload data
        await loadFeedbackData();
        
        // Reset form
        resetForm();
        
    } catch (error) {
        console.error('Error deleting feedback:', error);
        showStatus('Lỗi: ' + error.message, 'error');
    }
}

// ========================================
// 15. RESET FORM
// ========================================
function resetForm() {
    selectedCourse = null;
    
    document.getElementById('fb-mode').value = 'add';
    const titleIcon = '<span class="material-icons" style="vertical-align: middle; margin-right: 8px;">add_circle</span>';
    document.getElementById('form-feedback-title').innerHTML = titleIcon + 'Thêm đánh giá mới';
    
    // Reset combobox
    const courseSelect = document.getElementById('fb-course-select');
    if (courseSelect) {
        courseSelect.value = '';
    }
    
    // Reset hidden fields and display
    document.getElementById('fb-cour-id').value = '';
    document.getElementById('fb-cour-id-display').textContent = '-';
    document.getElementById('fb-comment').value = '';
    
    selectRating(0);
    updateCharCount();
    
    document.getElementById('btn-delete-fb').style.display = 'none';
    
    showStatus('Vui lòng chọn khóa học từ danh sách bên trái để bắt đầu đánh giá.', 'muted');
}

// ========================================
// 16. LOAD LỊCH SỬ FEEDBACK
// ========================================
async function loadFeedbackHistory() {
    try {
        // TODO: Gọi API GET /api/student/:studentId/feedback-history
        const response = await fetch(`${API_BASE_URL}/student/${CURRENT_STUDENT_ID}/feedback-history`);
        
        if (!response.ok) {
            throw new Error('Không thể tải lịch sử feedback');
        }
        
        const data = await response.json();
        currentFeedbackHistory = data.data || [];
        
        // Render table
        renderFeedbackHistoryTable(currentFeedbackHistory);
        
    } catch (error) {
        console.error('Error loading feedback history:', error);
        const tbody = document.querySelector('#table-feedback-history tbody');
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem; color: #ef4444;">
                    Không thể tải lịch sử đánh giá: ${error.message}
                </td>
            </tr>
        `;
    }
}

// ========================================
// 17. RENDER BẢNG LỊCH SỬ
// ========================================
function renderFeedbackHistoryTable(feedbacks) {
    const tbody = document.querySelector('#table-feedback-history tbody');
    
    if (!feedbacks || feedbacks.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem; color: #94a3b8;">
                    Bạn chưa có đánh giá nào.
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = feedbacks.map(fb => {
        const daysAgo = fb.daysAgo || fb.DaysAgo || 0;
        const canEdit = daysAgo <= 30;
        const rating = fb.rating || fb.Rating;
        const ratingStars = generateStarDisplay(rating);
        
        return `
            <tr>
                <td>${formatDate(fb.dateRated || fb.Date_rat)}</td>
                <!-- <td><strong>${fb.courseId || fb.Cour_id}</strong></td> -->
                <td style="max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${fb.Cour_name || fb.Cour_name}
                </td>
                <td>${ratingStars}</td>
                <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding-left: 1rem;">
                    ${fb.comment || fb.Comment}
                </td>
                <td>
                    <span style="padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.85rem; 
                                 background: ${canEdit ? '#dcfce7' : '#fee2e2'}; 
                                 color: ${canEdit ? '#15803d' : '#991b1b'}; display: inline-flex; align-items: center; gap: 4px;">
                        <span class="material-icons" style="font-size: 14px;">${canEdit ? 'edit' : 'lock'}</span>
                        ${canEdit ? 'Có thể sửa' : 'Đã khóa'}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
}

// ========================================
// 18. LOAD THỐNG KÊ
// ========================================
async function loadFeedbackStats() {
    try {
        // TODO: Gọi API GET /api/student/:studentId/feedback-stats
        const response = await fetch(`${API_BASE_URL}/student/${CURRENT_STUDENT_ID}/feedback-stats`);
        
        if (!response.ok) {
            throw new Error('Không thể tải thống kê');
        }
        
        const data = await response.json();
        const stats = data.stats || {};
        
        // Update stats display
        document.getElementById('stat-total-feedback').textContent = stats.totalFeedback || 0;
        document.getElementById('stat-avg-rating').textContent = 
            stats.avgRating ? stats.avgRating.toFixed(1) : '0.0';
        document.getElementById('stat-pending-courses').textContent = stats.pendingCourses || 0;
        
    } catch (error) {
        console.error('Error loading stats:', error);
        document.getElementById('stat-total-feedback').textContent = '-';
        document.getElementById('stat-avg-rating').textContent = '-';
        document.getElementById('stat-pending-courses').textContent = '-';
    }
}

// ========================================
// 19. HIỂN THỊ STATUS MESSAGE
// ========================================
function showStatus(message, type = 'info') {
    const statusDiv = document.getElementById('fb-status');
    
    // Colors based on type
    const colors = {
        success: { bg: '#dcfce7', text: '#15803d', border: '#86efac' },
        error: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
        warning: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
        info: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
        muted: { bg: '#f1f5f9', text: '#64748b', border: '#cbd5e1' }
    };
    
    const color = colors[type] || colors.info;
    
    statusDiv.style.background = color.bg;
    statusDiv.style.color = color.text;
    statusDiv.style.borderLeft = `4px solid ${color.border}`;
    statusDiv.textContent = message;
}

// ========================================
// 20. HELPER FUNCTIONS
// ========================================
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

// ========================================
// EXPORT FUNCTIONS FOR INLINE ONCLICK
// ========================================
window.addNewFeedback = addNewFeedback;
window.editFeedback = editFeedback;
window.loadMyCourses = loadMyCourses;
