// ========================================
// FEEDBACK MANAGEMENT - FRONTEND LOGIC
// ========================================

// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// Current Student ID (hardcoded for demo)
const CURRENT_STUDENT_ID = 'U000000014';

// Global state
let currentCourses = [];
const feedbackModal = document.getElementById('feedback-modal');

// ========================================
// 1. KHỞI TẠO KHI TRANG LOAD
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('Feedback Management initialized');
    
    // Set student ID
    const stuIdEl = document.getElementById('current-student-id');
    const fbStuIdEl = document.getElementById('fb-stu-id');
    if(stuIdEl) stuIdEl.textContent = CURRENT_STUDENT_ID;
    if(fbStuIdEl) fbStuIdEl.value = CURRENT_STUDENT_ID;
    
    // Load student info (name)
    loadStudentInfo();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load initial data (chỉ khi panel feedback được active)
    const feedbackPanel = document.getElementById('panel-feedback');
    if (feedbackPanel && feedbackPanel.classList.contains('active')) {
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
    
    const filterSelect = document.getElementById('filter-feedback-status');
    if (filterSelect) {
        filterSelect.addEventListener('change', filterCourses);
        filterSelect.addEventListener('change', updateFilterColor);
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
    
    // Form submit
    const feedbackForm = document.getElementById('form-feedback');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Delete button
    const deleteBtn = document.getElementById('btn-delete-fb');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', handleDeleteFeedback);
    }

    // Modal Close Logic (Click outside)
    window.onclick = function(event) {
        if (event.target === feedbackModal) {
            closeModal();
        }
    }
}

// ========================================
// 3. LOAD DỮ LIỆU BAN ĐẦU
// ========================================

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
        }
    } catch (error) {
        console.error('Lỗi khi load thông tin học viên:', error);
    }
}

async function loadFeedbackData() {
    try {
        // Load danh sách khóa học
        await loadMyCourses();
        
        // Load thống kê
        await loadFeedbackStats();
        
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// ========================================
// 4. LOAD DANH SÁCH KHÓA HỌC
// ========================================
async function loadMyCourses() {
    try {
        const loadingEl = document.getElementById('course-list-loading');
        const tableEl = document.getElementById('table-my-courses');
        
        if(loadingEl) loadingEl.style.display = 'block';
        if(tableEl) tableEl.style.display = 'none';

        const response = await fetch(`${API_BASE_URL}/student/${CURRENT_STUDENT_ID}/courses`);
        
        if (!response.ok) throw new Error('Không thể tải danh sách khóa học');
        
        const data = await response.json();
        currentCourses = data.data || [];
        
        // Render table
        renderCoursesTable(currentCourses);
        
        if(loadingEl) loadingEl.style.display = 'none';
        if(tableEl) tableEl.style.display = 'table';
        
    } catch (error) {
        console.error('Error loading courses:', error);
        const loadingEl = document.getElementById('course-list-loading');
        if(loadingEl) {
            loadingEl.innerHTML = `<p style="color: #ef4444;">Lỗi: ${error.message}</p>`;
        }
    }
}

// ========================================
// 5. RENDER BẢNG KHÓA HỌC (GIAO DIỆN MỚI)
// ========================================
function renderCoursesTable(courses) {
    const tbody = document.querySelector('#table-my-courses tbody');
    if (!tbody) return;

    if (!courses || courses.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 2rem; color: #94a3b8;">Không có khóa học nào.</td></tr>`;
        return;
    }
    
    tbody.innerHTML = courses.map(course => {
        const rating = course.rating || course.Rating;
        const progress = course.progress || course.Learning_progress;
        
        // Hiển thị ngày đánh giá
        let dateDisplay = '<span style="color: #94a3b8; font-style: italic; font-size: 0.85rem;">-</span>';
        if (course.dateRated || course.Date_rat) {
            dateDisplay = formatDate(course.dateRated || course.Date_rat);
        }

        // Hiển thị Rating
        const ratingDisplay = rating ? 
            generateStarDisplay(rating) : 
            '<span style="color: #94a3b8; font-style: italic; font-size: 0.85rem;">-</span>';

        // Escape JSON để truyền vào hàm onclick an toàn
        const courseJson = JSON.stringify(course).replace(/'/g, "&#39;").replace(/"/g, "&quot;");
        
        return `
            <tr class="course-row" onclick='handleCourseRowClick(this, ${courseJson})' style="cursor: pointer; transition: background 0.2s;">
                <td>
                    <div style="font-weight: 600; color: #1e293b;">${course.courseName || course.Cour_name}</div>
                </td>
                <td>
                    <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <span style="color: ${progress >= 100 ? '#10b981' : '#f59e0b'}; font-weight: 600; font-size: 0.85rem;">${progress}%</span>
                        <div style="flex: 1; height: 4px; background: #e2e8f0; border-radius: 2px; max-width: 60px;">
                            <div style="width: ${progress}%; height: 100%; background: ${progress >= 100 ? '#10b981' : '#f59e0b'}; border-radius: 2px;"></div>
                        </div>
                    </div>
                </td>
                <td style="text-align: center; vertical-align: middle; padding: 12px 10px;">
                    ${ratingDisplay}
                </td>
                <td style="text-align: center; vertical-align: middle; color: #64748b; font-size: 0.85rem; padding: 12px 10px;">
                    ${dateDisplay}
                </td>
            </tr>
        `;
    }).join('');
}

// Helper: Highlight dòng và Mở Popup
function handleCourseRowClick(rowElement, course) {
    const rating = course.rating || course.Rating;
    const progress = course.progress || course.Learning_progress || 0;

    // Nếu chưa đánh giá (rating = 0 hoặc null) MÀ tiến độ < 50% thì báo lỗi và DỪNG LUÔN.
    if ((!rating || rating === 0) && progress < 50) {
        alert(`Bạn cần hoàn thành ít nhất 50% khóa học để viết đánh giá.\n(Tiến độ hiện tại: ${progress}%)`);
        return;
    }

    // 1. Highlight UI
    document.querySelectorAll('.course-row').forEach(row => row.style.backgroundColor = '');
    if(rowElement) rowElement.style.backgroundColor = '#f1f5f9';

    // 2. Điền dữ liệu vào Form Popup
    const courseId = course.courseId || course.Cour_id;
    const courseName = course.courseName || course.Cour_name;
    const comment = course.comment || course.Comment;
    const daysAgo = course.daysAgo || course.DaysAgo || 0;

    // Reset form trước khi điền
    resetForm();

    // Điền thông tin tĩnh (Mã & Tên môn)
    document.getElementById('fb-cour-id').value = courseId;
    const idDisplay = document.getElementById('fb-cour-id-display');
    const nameDisplay = document.getElementById('fb-cour-name-display');
    if(idDisplay) idDisplay.textContent = courseId;
    if(nameDisplay) nameDisplay.textContent = courseName;

    // Các element cần thao tác
    const deleteBtn = document.getElementById('btn-delete-fb');
    const submitBtn = document.getElementById('btn-submit-fb');
    const commentInput = document.getElementById('fb-comment');
    const ratingContainer = document.getElementById('rating-stars');
    const titleText = document.getElementById('form-feedback-title-text');

    // Mặc định cho phép sửa
    let isEditable = true;

    // 3. Logic Add/Edit
    if (rating) {
        // Chế độ EDIT
        document.getElementById('fb-mode').value = 'edit';
        // document.getElementById('form-feedback-title-text').textContent = 'Chỉnh sửa đánh giá';
        
        selectRating(rating);
        commentInput.value = comment || '';
        updateCharCount();

        // Kiểm tra thời gian
        if (daysAgo > 30) {
            // Quá hạn
            isEditable = false;
            titleText.textContent = 'Chi tiết đánh giá (Chỉ xem)';
            
            // Ẩn nút Xóa và nút Lưu
            deleteBtn.style.display = 'none';
            submitBtn.style.display = 'none';

            // Disable nhập liệu
            commentInput.disabled = true;
            ratingContainer.style.pointerEvents = 'none'; // Không cho click sao
            ratingContainer.style.opacity = '0.7';
        } else {
            // Còn hạn
            isEditable = true;
            titleText.textContent = 'Chỉnh sửa đánh giá';
            
            deleteBtn.style.display = 'inline-flex';
            submitBtn.style.display = 'inline-flex';
            submitBtn.innerHTML = '<span class="material-icons" style="font-size: 18px; margin-right: 4px;">save</span> Cập nhật';

            commentInput.disabled = false;
            ratingContainer.style.pointerEvents = 'auto';
            ratingContainer.style.opacity = '1';
        }
    } else {
        // Thêm đánh giá
        isEditable = true;
        document.getElementById('fb-mode').value = 'add';
        titleText.textContent = 'Thêm đánh giá';
        
        deleteBtn.style.display = 'none';
        submitBtn.style.display = 'inline-flex';
        submitBtn.innerHTML = '<span class="material-icons" style="font-size: 18px; margin-right: 4px;">save</span> Lưu đánh giá';
        
        commentInput.disabled = false;
        ratingContainer.style.pointerEvents = 'auto';
        ratingContainer.style.opacity = '1';
    }

    // 4. Mở Popup
    openModal();
}

// ========================================
// 6. POPUP / MODAL FUNCTIONS
// ========================================
function openModal() {
    if(feedbackModal) feedbackModal.classList.add('open');
}

function closeModal() {
    if(feedbackModal) feedbackModal.classList.remove('open');
    // Bỏ highlight dòng khi đóng
    document.querySelectorAll('.course-row').forEach(row => row.style.backgroundColor = '');
}

function resetForm() {
    document.getElementById('fb-mode').value = 'add';
    document.getElementById('fb-comment').value = '';
    selectRating(0);
    updateCharCount();
    document.getElementById('btn-delete-fb').style.display = 'none';
}

// ========================================
// 7. CÁC HÀM XỬ LÝ FORM (SUBMIT, RATING...)
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

function selectRating(rating) {
    document.getElementById('fb-rating').value = rating;
    highlightStars(rating, true);
    
    const ratingTexts = {
        1: 'Rất không hài lòng', 2: 'Không hài lòng', 3: 'Bình thường', 4: 'Hài lòng', 5: 'Rất hài lòng'
    };
    const textEl = document.getElementById('rating-text');
    if(textEl) textEl.textContent = rating > 0 ? ratingTexts[rating] : 'Chưa chọn';
}

function updateCharCount() {
    const textarea = document.getElementById('fb-comment');
    const count = textarea.value.length;
    const charCountSpan = document.getElementById('char-count');
    
    if(charCountSpan) {
        charCountSpan.textContent = count;
        charCountSpan.style.color = (count < 20 || count > 3000) ? '#ef4444' : '#10b981';
    }
}

async function handleFormSubmit(event) {
    event.preventDefault();
    const mode = document.getElementById('fb-mode').value;
    const studentId = document.getElementById('fb-stu-id').value;
    const courseId = document.getElementById('fb-cour-id').value;
    const rating = parseInt(document.getElementById('fb-rating').value);
    const comment = document.getElementById('fb-comment').value.trim();
    
    if (rating < 1) { alert('Vui lòng chọn số sao!'); return; }
    
    // Validate comment: không bắt buộc, nhưng nếu có thì phải >= 20 ký tự
    if (comment.length > 0 && comment.length < 20) { 
        alert('Nhận xét phải có ít nhất 20 ký tự hoặc để trống!'); 
        return; 
    }

    try {
        const endpoint = mode === 'add' ? '/feedback/add' : '/feedback/update';
        const method = mode === 'add' ? 'POST' : 'PUT';
        
        // Nếu comment rỗng, gửi null thay vì chuỗi rỗng để phù hợp với CHECK constraint
        const finalComment = comment.length === 0 ? null : comment;
        
        const body = { 
            studentId, courseId, 
            rating: rating, comment: finalComment,
            // Với update API, backend có thể yêu cầu tên biến khác, ta map cả 2 cho chắc
            newRating: rating, newComment: finalComment 
        };

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        
        const data = await response.json();
        
        if (!data.success) throw new Error(data.message);
        
        alert(data.message);
        closeModal();
        loadFeedbackData(); // Reload lại bảng
        
    } catch (error) {
        alert('Lỗi: ' + error.message);
    }
}

async function handleDeleteFeedback() {
    if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;
    
    const studentId = document.getElementById('fb-stu-id').value;
    const courseId = document.getElementById('fb-cour-id').value;

    try {
        const response = await fetch(`${API_BASE_URL}/feedback/delete`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId, courseId })
        });
        
        const data = await response.json();
        if (!data.success) throw new Error(data.message);
        
        alert(data.message);
        closeModal();
        loadFeedbackData();
        
    } catch (error) {
        alert('Lỗi khi xóa: ' + error.message);
    }
}

// ========================================
// 8. CÁC HÀM HELPERS KHÁC
// ========================================
function filterCourses() {
    // Lấy từ khóa
    const searchInput = document.getElementById('search-my-courses');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

    // Lấy trạng thái 
    const filterSelect = document.getElementById('filter-feedback-status');
    const filterStatus = filterSelect ? filterSelect.value : 'all';
    
    // Lọc
    const filtered = currentCourses.filter(c => {
        const name = c.courseName || c.Cour_name || '';
        const matchesName = name.toLowerCase().includes(searchTerm);
    
        const rating = c.rating || c.Rating;

        let matchesStatus = true;
        if (filterStatus === 'rated') {
            matchesStatus = (rating && rating > 0); 
        } else if (filterStatus === 'unrated') {
            matchesStatus = (!rating || rating === 0);
        }

        return matchesName && matchesStatus;
    });
    renderCoursesTable(filtered);
}

function generateStarDisplay(rating) {
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
        starsHtml += `<span class="material-icons" style="font-size: 16px; color: ${i <= rating ? '#fbbf24' : '#e2e8f0'}; vertical-align: middle;">star</span>`;
    }
    return `<span style="white-space: nowrap;">${starsHtml} <span style="font-weight: 600; color: #f59e0b; margin-left:4px;">${rating}</span></span>`;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN');
}

async function loadFeedbackStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/student/${CURRENT_STUDENT_ID}/feedback-stats`);
        const data = await response.json();
        if (data.success && data.stats) {
            document.getElementById('stat-total-feedback').textContent = data.stats.totalFeedback || 0;
            document.getElementById('stat-avg-rating').textContent = data.stats.avgRating ? data.stats.avgRating.toFixed(1) : '0.0';
            const totalCoursesEl = document.getElementById('stat-total-courses');
            if (totalCoursesEl) {
                totalCoursesEl.textContent = data.stats.totalCourses || 0;
            }
        }
    } catch (e) { console.error(e); }
}

function updateFilterColor() {
    const filterSelect = document.getElementById('filter-feedback-status');
    if (!filterSelect) return;

    filterSelect.classList.remove('status-rated', 'status-unrated');

    const value = filterSelect.value;
    
    if (value === 'rated') {
        filterSelect.classList.add('status-rated');
    } else if (value === 'unrated') {
        filterSelect.classList.add('status-unrated');
    }
}

// Export functions for global access
window.handleCourseRowClick = handleCourseRowClick;
window.closeModal = closeModal;
window.loadFeedbackData = loadFeedbackData;