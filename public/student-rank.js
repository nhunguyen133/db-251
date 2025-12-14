console.log('Panel Student/Functions loaded - Teacher Rank & Student Loyalty');

// API Base URL
const API_BASE_FUNCTIONS = 'http://localhost:3000/api';

// ========================================
// 1. KHỞI TẠO
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    setupFunctionTabs();
    setupTeacherRankForm();
    setupStudentLoyaltyForm();
    setupAllTeachersRankingTable();
    setupAllStudentsLoyaltyTable();
});``

// ========================================
// TAB SWITCHING SYSTEM
// ========================================
function setupFunctionTabs() {
    const tabButtons = document.querySelectorAll('.function-tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            switchFunctionTab(targetTab);
        });
    });
}

function switchFunctionTab(tabName) {
    // Remove active class from all buttons
    document.querySelectorAll('.function-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to clicked button
    const activeButton = document.querySelector(`.function-tab-btn[data-tab="${tabName}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    // Hide all tab contents
    document.querySelectorAll('.function-tab-content').forEach(content => {
        content.style.display = 'none';
    });
    
    // Show selected tab content
    const activeContent = document.getElementById(`tab-${tabName}`);
    if (activeContent) {
        activeContent.style.display = 'block';
    }
}

// ========================================
// 2. FUNCTION 1: TEACHER RANKING
// ========================================
function setupTeacherRankForm() {
    const form = document.getElementById('form-teacher-rank');
    if (!form) {
        console.warn('Form form-teacher-rank not found');
        return;
    }
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const teacherId = document.getElementById('teacherRankId').value.trim();

        if (!teacherId) {
            showToast('Vui lòng nhập mã giảng viên!', 'warning');
            return;
        }
        
        await loadTeacherRank(teacherId);
    });
}

async function loadTeacherRank(teacherId) {
    try {
        // Show loading state
        const resultDiv = document.getElementById('teacher-rank-result');
        if (!resultDiv) {
            console.warn('Element teacher-rank-result not found');
            return;
        }
        
        resultDiv.innerHTML = '<span class="material-icons spin" style="font-size: 32px; color: #6366f1;">refresh</span>';
        
        const response = await fetch(`${API_BASE_FUNCTIONS}/teacher/${teacherId}/rank`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Không thể tải dữ liệu');
        }
        
        // Display teacher rank
        displayTeacherRank(data.data);
        
    } catch (error) {
        console.error('Error loading teacher rank:', error);
        const resultDiv = document.getElementById('teacher-rank-result');
        if (resultDiv) {
            resultDiv.innerHTML = `<span style="color: #ef4444; font-size: 1rem;">Lỗi: ${error.message}</span>`;
        }
        showToast(error.message, 'error', 'Lỗi tải xếp loại');
    }
}

function displayTeacherRank(rankData) {
    const resultDiv = document.getElementById('teacher-rank-result');
    
    if (!resultDiv) {
        console.warn('Element teacher-rank-result not found');
        return;
    }
    
    if (!rankData || !rankData.Rank) {
        resultDiv.innerHTML = '<span style="color: #64748b;">Không có dữ liệu</span>';
        return;
    }
    
    const rank = rankData.Rank;
    const teacherName = rankData.TeacherName || 'N/A';
    const expertise = rankData.Expertise || '';
    
    // Define rank colors and icons
    const rankStyles = {
        'Excellent': { 
            color: '#10b981', 
            bgGradient: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
            icon: 'emoji_events',
            borderColor: '#86efac'
        },
        'Good': { 
            color: '#3b82f6', 
            bgGradient: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
            icon: 'thumb_up',
            borderColor: '#93c5fd'
        },
        'Average': { 
            color: '#f59e0b', 
            bgGradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            icon: 'remove_circle',
            borderColor: '#fcd34d'
        },
        'Poor': { 
            color: '#ef4444', 
            bgGradient: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
            icon: 'thumb_down',
            borderColor: '#fca5a5'
        },
        'New Teacher': { 
            color: '#94a3b8', 
            bgGradient: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
            icon: 'fiber_new',
            borderColor: '#cbd5e1'
        },
        'N/A': { 
            color: '#64748b', 
            bgGradient: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            icon: 'help_outline',
            borderColor: '#cbd5e1'
        }
    };
    
    const style = rankStyles[rank] || rankStyles['N/A'];
    
    // Update background gradient
    const container = resultDiv.parentElement;
    if (container) {
        container.style.background = style.bgGradient;
        container.style.borderColor = style.borderColor;
    }
    
    // Update icon
    const iconElement = container.querySelector('.material-icons');
    if (iconElement) {
        iconElement.textContent = style.icon;
        iconElement.style.color = style.color;
    }
    
    // Display rank with teacher name and styled text
    resultDiv.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 0.75rem;">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span style="color: ${style.color}; font-size: 2rem; font-weight: 700;">${rank}</span>
            </div>
            <div style="text-align: center; color: #1e293b;">
                <div style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.25rem;">${teacherName}</div>
                ${expertise ? `<div style="font-size: 0.9rem; color: #64748b;">Chuyên môn: ${expertise}</div>` : ''}
            </div>
        </div>
    `;
    
    showToast(`Xếp loại ${rank}: ${teacherName}`, 'success', 'Thành công');
}

// ========================================
// 3. FUNCTION 2: STUDENT LOYALTY
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
            showToast('Vui lòng nhập mã học viên!', 'warning');
            return;
        }
        
        await loadStudentLoyalty(studentId);
    });
}

async function loadStudentLoyalty(studentId) {
    try {
        // Show loading state
        const loyaltyDiv = document.getElementById('student-loyalty');
        if (!loyaltyDiv) {
            console.warn('Element student-loyalty not found');
            return;
        }
        
        loyaltyDiv.innerHTML = '<span class="material-icons spin" style="font-size: 32px; color: #f59e0b;">refresh</span>';
        
        const response = await fetch(`${API_BASE_FUNCTIONS}/student/${studentId}/loyalty`);
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
            loyaltyDiv.innerHTML = `<span style="color: #ef4444; font-size: 1rem;">Lỗi: ${error.message}</span>`;
        }
        showToast(error.message, 'error', 'Lỗi tải loyalty');
    }
}

function displayStudentLoyalty(loyaltyData) {
    const loyaltyDiv = document.getElementById('student-loyalty');
    
    if (!loyaltyDiv) {
        console.warn('Element student-loyalty not found');
        return;
    }
    
    if (!loyaltyData || !loyaltyData.Loyalty) {
        loyaltyDiv.innerHTML = '<span style="color: #64748b;">Không có dữ liệu loyalty</span>';
        return;
    }
    
    // Parse loyalty string: "Diamond (Points: 550)" or "New Member (Points: 50)"
    const loyaltyText = loyaltyData.Loyalty;
    const studentName = loyaltyData.StudentName || 'N/A';
    const rankMatch = loyaltyText.match(/^(.+?)\s*\(Points:\s*(\d+)\)$/);
    
    if (!rankMatch) {
        // Fallback if format doesn't match
        loyaltyDiv.textContent = loyaltyText;
        return;
    }
    
    const rank = rankMatch[1].trim();
    const points = parseInt(rankMatch[2]);
    
    // Define rank styles
    const rankStyles = {
        'Diamond': { 
            color: '#a855f7', 
            bgGradient: 'linear-gradient(135deg, #fae8ff 0%, #f3e8ff 100%)',
            icon: 'diamond',
            borderColor: '#e9d5ff'
        },
        'Gold': { 
            color: '#f59e0b', 
            bgGradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            icon: 'workspace_premium',
            borderColor: '#fcd34d'
        },
        'Silver': { 
            color: '#94a3b8', 
            bgGradient: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
            icon: 'military_tech',
            borderColor: '#cbd5e1'
        },
        'New Member': { 
            color: '#64748b', 
            bgGradient: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            icon: 'person_add',
            borderColor: '#cbd5e1'
        }
    };
    
    const style = rankStyles[rank] || rankStyles['New Member'];
    
    // Update background gradient
    const container = loyaltyDiv.parentElement;
    if (container) {
        container.style.background = style.bgGradient;
        container.style.borderColor = style.borderColor;
    }
    
    // Update icon
    const iconElement = container.querySelector('.material-icons');
    if (iconElement) {
        iconElement.textContent = style.icon;
        iconElement.style.color = style.color;
    }
    
    // Display loyalty with student name and styled format
    loyaltyDiv.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 0.75rem;">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span style="color: ${style.color}; font-size: 2rem; font-weight: 700;">${rank}</span>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 1.25rem; font-weight: 600; color: #1e293b; margin-bottom: 0.25rem;">${studentName}</div>
                <div style="font-size: 1.1rem; color: ${style.color}; font-weight: 600;">
                    ${points.toLocaleString('vi-VN')} điểm
                </div>
            </div>
        </div>
    `;
    
    showToast(`${rank}: ${studentName} (${points} điểm)`, 'success', 'Thành công');
}

// ========================================
// 3. ALL TEACHERS RANKING TABLE
// ========================================
function setupAllTeachersRankingTable() {
    const btnLoad = document.getElementById('btn-load-all-teachers');
    if (!btnLoad) {
        console.warn('Button btn-load-all-teachers not found');
        return;
    }
    
    btnLoad.addEventListener('click', loadAllTeachersRanking);
    setupTeacherFilters();
}

async function loadAllTeachersRanking() {
    const loadingDiv = document.getElementById('all-teachers-loading');
    const table = document.getElementById('table-all-teachers');
    const tbody = table ? table.querySelector('tbody') : null;
    const filtersDiv = document.getElementById('teacher-filters');
    
    if (!table || !tbody) {
        showToast('Không tìm thấy bảng hiển thị!', 'error');
        return;
    }
    
    try {
        // Show loading
        if (loadingDiv) loadingDiv.style.display = 'block';
        table.style.display = 'none';
        if (filtersDiv) filtersDiv.style.display = 'none';
        
        const response = await fetch(`${API_BASE_FUNCTIONS}/teachers/all-rankings`);
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message || 'Failed to load teachers ranking');
        }
        
        const teachers = result.data || [];
        
        // Store data for filtering
        allTeachersData = teachers;
        
        // Reset filters
        resetTeacherFilters();
        
        // Display data
        displayAllTeachersRanking(teachers);
        updateTeacherFilterStatus(teachers.length, teachers.length);
        
        // Hide loading, show table and filters
        if (loadingDiv) loadingDiv.style.display = 'none';
        table.style.display = 'table';
        if (filtersDiv) filtersDiv.style.display = 'block';
        
        showToast(`Đã tải ${teachers.length} giảng viên`, 'success');
        
    } catch (error) {
        console.error('Error loading all teachers ranking:', error);
        
        if (loadingDiv) loadingDiv.style.display = 'none';
        
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 2rem; color: #ef4444;">
                        <span class="material-icons" style="font-size: 3rem;">error_outline</span>
                        <p>Lỗi: ${error.message}</p>
                    </td>
                </tr>
            `;
        }
        table.style.display = 'table';
        
        showToast('Lỗi khi tải danh sách giảng viên!', 'error');
    }
}

function displayAllTeachersRanking(teachers) {
    const table = document.getElementById('table-all-teachers');
    const tbody = table ? table.querySelector('tbody') : null;
    
    if (!tbody) {
        console.warn('Table tbody not found');
        return;
    }
    
    if (!teachers || teachers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem; color: #94a3b8;">
                    <span class="material-icons" style="font-size: 3rem;">info</span>
                    <p>Không có giảng viên nào trong hệ thống</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // Rank badge styles
    const rankStyles = {
        'Excellent': { color: '#10b981', bg: '#d1fae5', icon: 'emoji_events' },
        'Good': { color: '#3b82f6', bg: '#dbeafe', icon: 'thumb_up' },
        'Average': { color: '#f59e0b', bg: '#fef3c7', icon: 'remove_circle' },
        'Poor': { color: '#ef4444', bg: '#fee2e2', icon: 'thumb_down' },
        'New Teacher': { color: '#94a3b8', bg: '#f1f5f9', icon: 'fiber_new' },
        'N/A': { color: '#64748b', bg: '#f8fafc', icon: 'help_outline' }
    };
    
    tbody.innerHTML = teachers.map((teacher, index) => {
        const rank = teacher.RankStatus || 'N/A';
        const style = rankStyles[rank] || rankStyles['N/A'];
        const avgRating = teacher.AvgRating != null ? teacher.AvgRating.toFixed(2) : 'N/A';
        
        return `
            <tr>
                <td style="text-align: center;">${index + 1}</td>
                <td><strong>${teacher.TeacherName}</strong></td>
                <td>${teacher.Expertise || '-'}</td>
                <td style="text-align: center;">
                    <span style="display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.5rem; background: #f1f5f9; border-radius: 6px;">
                        <span class="material-icons" style="font-size: 16px; color: #6366f1;">menu_book</span>
                        ${teacher.CourseCount}
                    </span>
                </td>
                <td style="text-align: center;">
                    ${avgRating !== 'N/A' ? `
                        <span style="display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.5rem; background: #fef3c7; border-radius: 6px; font-weight: 600; color: #f59e0b;">
                            <span class="material-icons" style="font-size: 16px;">star</span>
                            ${avgRating}
                        </span>
                    ` : '<span style="color: #94a3b8;">-</span>'}
                </td>
                <td style="text-align: center;">
                    <span style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; background: ${style.bg}; border-radius: 8px; font-weight: 600; color: ${style.color};">
                        <span class="material-icons" style="font-size: 18px;">${style.icon}</span>
                        ${rank}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
}

// ========================================
// 4. ALL STUDENTS LOYALTY RANKING TABLE
// ========================================
function setupAllStudentsLoyaltyTable() {
    const btnLoad = document.getElementById('btn-load-all-students');
    if (!btnLoad) {
        console.warn('Button btn-load-all-students not found');
        return;
    }
    
    btnLoad.addEventListener('click', loadAllStudentsLoyalty);
    setupStudentFilters();
}

async function loadAllStudentsLoyalty() {
    const loadingDiv = document.getElementById('all-students-loading');
    const table = document.getElementById('table-all-students');
    const tbody = table ? table.querySelector('tbody') : null;
    const filtersDiv = document.getElementById('student-filters');
    
    if (!table || !tbody) {
        showToast('Không tìm thấy bảng hiển thị!', 'error');
        return;
    }
    
    try {
        // Show loading
        if (loadingDiv) loadingDiv.style.display = 'block';
        table.style.display = 'none';
        if (filtersDiv) filtersDiv.style.display = 'none';
        
        const response = await fetch(`${API_BASE_FUNCTIONS}/students/all-loyalty`);
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message || 'Failed to load students loyalty');
        }
        
        const students = result.data || [];
        
        // Store data for filtering
        allStudentsData = students;
        
        // Reset filters
        resetStudentFilters();
        
        // Display data
        displayAllStudentsLoyalty(students);
        updateStudentFilterStatus(students.length, students.length);
        
        // Hide loading, show table and filters
        if (loadingDiv) loadingDiv.style.display = 'none';
        table.style.display = 'table';
        if (filtersDiv) filtersDiv.style.display = 'block';
        
        showToast(`Đã tải ${students.length} học viên`, 'success');
        
    } catch (error) {
        console.error('Error loading all students loyalty:', error);
        
        if (loadingDiv) loadingDiv.style.display = 'none';
        
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 2rem; color: #ef4444;">
                        <span class="material-icons" style="font-size: 3rem;">error_outline</span>
                        <p>Lỗi: ${error.message}</p>
                    </td>
                </tr>
            `;
        }
        table.style.display = 'table';
        
        showToast('Lỗi khi tải danh sách học viên!', 'error');
    }
}

function displayAllStudentsLoyalty(students) {
    const table = document.getElementById('table-all-students');
    const tbody = table ? table.querySelector('tbody') : null;
    
    if (!tbody) {
        console.warn('Table tbody not found');
        return;
    }
    
    if (!students || students.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem; color: #94a3b8;">
                    <span class="material-icons" style="font-size: 3rem;">info</span>
                    <p>Không có học viên nào trong hệ thống</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // Loyalty rank styles
    const rankStyles = {
        'Diamond': { 
            color: '#a855f7', 
            bg: 'linear-gradient(135deg, #fae8ff, #f3e8ff)', 
            icon: 'diamond',
            badge: 'linear-gradient(135deg, #a855f7, #ec4899)'
        },
        'Gold': { 
            color: '#f59e0b', 
            bg: 'linear-gradient(135deg, #fef3c7, #fde68a)', 
            icon: 'workspace_premium',
            badge: '#f59e0b'
        },
        'Silver': { 
            color: '#94a3b8', 
            bg: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)', 
            icon: 'military_tech',
            badge: '#94a3b8'
        },
        'New Member': { 
            color: '#64748b', 
            bg: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', 
            icon: 'person_add',
            badge: '#64748b'
        }
    };
    
    tbody.innerHTML = students.map((student, index) => {
        // Parse loyalty string: "Diamond (Points: 550)"
        const loyaltyStr = student.LoyaltyRank || 'New Member (Points: 0)';
        const rankMatch = loyaltyStr.match(/^([^(]+)/);
        const pointsMatch = loyaltyStr.match(/Points: (\d+)/);
        
        const rank = rankMatch ? rankMatch[1].trim() : 'New Member';
        const points = pointsMatch ? parseInt(pointsMatch[1]) : 0;
        
        const style = rankStyles[rank] || rankStyles['New Member'];
        
        // Medal for top 3
        let medalIcon = '';
        if (index === 0) medalIcon = '<span class="material-icons" style="font-size: 24px; color: #fbbf24;">emoji_events</span>';
        else if (index === 1) medalIcon = '<span class="material-icons" style="font-size: 24px; color: #d1d5db;">emoji_events</span>';
        else if (index === 2) medalIcon = '<span class="material-icons" style="font-size: 24px; color: #cd7f32;">emoji_events</span>';
        
        return `
            <tr>
                <td style="text-align: center;">
                    ${medalIcon || `<strong>${index + 1}</strong>`}
                </td>
                <td><strong>${student.StudentName}</strong></td>
                <td style="text-align: center;">
                    <span style="display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.5rem; background: #dbeafe; border-radius: 6px;">
                        <span class="material-icons" style="font-size: 16px; color: #3b82f6;">menu_book</span>
                        ${student.CompletedCourses}
                    </span>
                </td>
                <td style="text-align: center;">
                    <span style="display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.5rem; background: #fef3c7; border-radius: 6px;">
                        <span class="material-icons" style="font-size: 16px; color: #f59e0b;">emoji_events</span>
                        ${student.CertificateCount}
                    </span>
                </td>
                <td style="text-align: center;">
                    <span style="display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.5rem 0.75rem; background: #f1f5f9; border-radius: 8px; font-weight: 700; color: #6366f1; font-size: 1.1rem;">
                        <span class="material-icons" style="font-size: 20px;">stars</span>
                        ${points.toLocaleString('vi-VN')}
                    </span>
                </td>
                <td style="text-align: center;">
                    <span style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; background: ${style.bg}; border-radius: 8px; font-weight: 600; color: ${style.color}; border: 2px solid ${typeof style.badge === 'string' && !style.badge.includes('gradient') ? style.badge : style.color};">
                        <span class="material-icons" style="font-size: 18px;">${style.icon}</span>
                        ${rank}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
}

// ========================================
// 5. FILTERING SYSTEM FOR TEACHERS
// ========================================
let allTeachersData = [];
let teacherFilters = {
    search: '',
    rank: '',
    courses: ''
};

function setupTeacherFilters() {
    const searchInput = document.getElementById('filter-teacher-search');
    const rankSelect = document.getElementById('filter-teacher-rank');
    const coursesInput = document.getElementById('filter-teacher-courses'); // Changed to input
    const resetBtn = document.getElementById('btn-reset-teacher-filters');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            teacherFilters.search = e.target.value.trim().toLowerCase();
            applyTeacherFilters();
        });
    }

    if (rankSelect) {
        rankSelect.addEventListener('change', (e) => {
            teacherFilters.rank = e.target.value;
            applyTeacherFilters();
        });
    }

    if (coursesInput) {
        coursesInput.addEventListener('input', (e) => {
            const value = e.target.value.trim();
            teacherFilters.courses = value ? parseInt(value) : '';
            applyTeacherFilters();
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', resetTeacherFilters);
    }
}

function applyTeacherFilters() {
    let filtered = [...allTeachersData];

    // Search filter
    if (teacherFilters.search) {
        filtered = filtered.filter(teacher => {
            const name = teacher.TeacherName.toLowerCase();
            const expertise = (teacher.Expertise || '').toLowerCase();
            return name.includes(teacherFilters.search) || expertise.includes(teacherFilters.search);
        });
    }

    // Rank filter
    if (teacherFilters.rank) {
        filtered = filtered.filter(teacher => teacher.RankStatus === teacherFilters.rank);
    }

    // Courses filter - now numeric input
    if (teacherFilters.courses !== '') {
        const minCourses = parseInt(teacherFilters.courses);
        if (!isNaN(minCourses)) {
            filtered = filtered.filter(teacher => teacher.CourseCount >= minCourses);
        }
    }

    displayAllTeachersRanking(filtered);
    updateTeacherFilterStatus(filtered.length, allTeachersData.length);
}

function resetTeacherFilters() {
    teacherFilters = { search: '', rank: '', courses: '' };

    const searchInput = document.getElementById('filter-teacher-search');
    const rankSelect = document.getElementById('filter-teacher-rank');
    const coursesInput = document.getElementById('filter-teacher-courses'); // Changed

    if (searchInput) searchInput.value = '';
    if (rankSelect) rankSelect.value = '';
    if (coursesInput) coursesInput.value = '';

    applyTeacherFilters();
    showToast('Đã reset bộ lọc giảng viên', 'info');
}

function updateTeacherFilterStatus(shown, total) {
    const statusDiv = document.getElementById('teacher-filter-status');
    if (!statusDiv) return;

    if (shown === total) {
        statusDiv.innerHTML = `<span class="material-icons" style="font-size: 16px; vertical-align: middle; margin-right: 4px;">info</span>Hiển thị ${total} giảng viên`;
        return;
    }

    const filters = [];
    if (teacherFilters.search) filters.push(`Tìm kiếm: "${teacherFilters.search}"`);
    if (teacherFilters.rank) filters.push(`Xếp loại: ${teacherFilters.rank}`);
    if (teacherFilters.courses !== '') filters.push(`Khóa học ≥ ${teacherFilters.courses}`);

    statusDiv.innerHTML = `
        <span class="material-icons" style="font-size: 16px; vertical-align: middle; margin-right: 4px; color: #6366f1;">filter_alt</span>
        Hiển thị <strong>${shown}</strong> / ${total} giảng viên • ${filters.join(', ')}
    `;
}

// ========================================
// 6. FILTERING SYSTEM FOR STUDENTS
// ========================================
let allStudentsData = [];
let studentFilters = {
    search: '',
    loyalty: '',
    points: '',
    certs: ''
};

function setupStudentFilters() {
    const searchInput = document.getElementById('filter-student-search');
    const loyaltySelect = document.getElementById('filter-student-loyalty');
    const pointsInput = document.getElementById('filter-student-points'); // Changed to input
    const certsInput = document.getElementById('filter-student-certs'); // Changed to input
    const resetBtn = document.getElementById('btn-reset-student-filters');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            studentFilters.search = e.target.value.trim().toLowerCase();
            applyStudentFilters();
        });
    }

    if (loyaltySelect) {
        loyaltySelect.addEventListener('change', (e) => {
            studentFilters.loyalty = e.target.value;
            applyStudentFilters();
        });
    }

    if (pointsInput) {
        pointsInput.addEventListener('input', (e) => {
            const value = e.target.value.trim();
            studentFilters.points = value ? parseInt(value) : '';
            applyStudentFilters();
        });
    }

    if (certsInput) {
        certsInput.addEventListener('input', (e) => {
            const value = e.target.value.trim();
            studentFilters.certs = value ? parseInt(value) : '';
            applyStudentFilters();
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', resetStudentFilters);
    }
}

function applyStudentFilters() {
    let filtered = [...allStudentsData];

    // Search filter
    if (studentFilters.search) {
        filtered = filtered.filter(student => {
            const name = student.StudentName.toLowerCase();
            return name.includes(studentFilters.search);
        });
    }

    // Loyalty rank filter
    if (studentFilters.loyalty) {
        filtered = filtered.filter(student => {
            const loyaltyStr = student.LoyaltyRank || '';
            return loyaltyStr.startsWith(studentFilters.loyalty);
        });
    }

    // Points filter - now numeric input
    if (studentFilters.points !== '') {
        const minPoints = parseInt(studentFilters.points);
        if (!isNaN(minPoints)) {
            filtered = filtered.filter(student => {
                const pointsMatch = student.LoyaltyRank.match(/Points: (\d+)/);
                const points = pointsMatch ? parseInt(pointsMatch[1]) : 0;
                return points >= minPoints;
            });
        }
    }

    // Certificates filter - now numeric input
    if (studentFilters.certs !== '') {
        const minCerts = parseInt(studentFilters.certs);
        if (!isNaN(minCerts)) {
            filtered = filtered.filter(student => student.CertificateCount >= minCerts);
        }
    }

    displayAllStudentsLoyalty(filtered);
    updateStudentFilterStatus(filtered.length, allStudentsData.length);
}

function resetStudentFilters() {
    studentFilters = { search: '', loyalty: '', points: '', certs: '' };

    const searchInput = document.getElementById('filter-student-search');
    const loyaltySelect = document.getElementById('filter-student-loyalty');
    const pointsInput = document.getElementById('filter-student-points'); // Changed
    const certsInput = document.getElementById('filter-student-certs'); // Changed

    if (searchInput) searchInput.value = '';
    if (loyaltySelect) loyaltySelect.value = '';
    if (pointsInput) pointsInput.value = '';
    if (certsInput) certsInput.value = '';

    applyStudentFilters();
    showToast('Đã reset bộ lọc học viên', 'info');
}

function updateStudentFilterStatus(shown, total) {
    const statusDiv = document.getElementById('student-filter-status');
    if (!statusDiv) return;

    if (shown === total) {
        statusDiv.innerHTML = `<span class="material-icons" style="font-size: 16px; vertical-align: middle; margin-right: 4px;">info</span>Hiển thị ${total} học viên`;
        return;
    }

    const filters = [];
    if (studentFilters.search) filters.push(`Tìm kiếm: "${studentFilters.search}"`);
    if (studentFilters.loyalty) filters.push(`Hạng: ${studentFilters.loyalty}`);
    if (studentFilters.points !== '') filters.push(`Điểm ≥ ${studentFilters.points}`);
    if (studentFilters.certs !== '') filters.push(`Chứng chỉ ≥ ${studentFilters.certs}`);

    statusDiv.innerHTML = `
        <span class="material-icons" style="font-size: 16px; vertical-align: middle; margin-right: 4px; color: #f59e0b;">filter_alt</span>
        Hiển thị <strong>${shown}</strong> / ${total} học viên • ${filters.join(', ')}
    `;
}
