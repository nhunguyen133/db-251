# Educity - E-learning Analytics & Feedback System

Hệ thống quản lý feedback và thống kê phân tích cho nền tảng e-learning Educity.

## Thông tin dự án

- **Môn học**: Hệ cơ sở dữ liệu (CO2013) - 251
- **Bài tập lớn**: BTL2 - Stored Procedures, Functions & Frontend Integration
- **Nhóm**: 6-L03
- **Năm học**: 2024-2025

## Tính năng chính

### 1. Feedback Management (Panel 1)
- Thêm feedback mới cho khóa học đã đăng ký
- Sửa feedback trong vòng 30 ngày
- Xóa feedback trong vòng 30 ngày
- Xem lịch sử feedback và thống kê chi tiết
- Interactive 5-star rating system
- Real-time validation (20-3000 ký tự)

### 2. Top Courses Analytics (Panel 2)
- Lọc top khóa học theo năm xuất bản
- Filter theo số lượng review tối thiểu
- Hiển thị rating trung bình và số lượng feedback
- Stored Procedure: `usp_GetTopRatedCourses`

### 3. Teacher Dashboard (Panel 3)
- Thống kê chi tiết khóa học của giảng viên
- Hiển thị: Feedback count, Rating TB, Số HV đăng ký, Điểm TB
- **MỚI**: Số chứng chỉ đã cấp
- **MỚI**: Doanh thu khóa học
- Xếp hạng giảng viên (Function: `fn_RankTeacher`)
- Stored Procedure: `usp_GetTeacherCourseStats`

### 4. Student Loyalty (Panel 4)
- Tính toán loyalty rank của học viên
- Function: `fn_CalcStudentLoyaltyRank`
- Hiển thị hạng thành viên (Bronze/Silver/Gold/Platinum)

### UI/UX Excellence
- Material Design với Material Icons
- Responsive Single Page Application (SPA)
- Modern gradient theme với dark accents
- Fast navigation với tab switching
- Professional dashboard layout
- Smooth animations và transitions

## Tech Stack

**Frontend:**
- HTML5, CSS3 (Modern CSS Variables & Flexbox)
- Vanilla JavaScript (ES6+ Modules)
- Material Icons CDN
- Modular Architecture (Separate files per panel)

**Backend:**
- Node.js v16+ 
- Express.js v4.18+
- CORS middleware
- RESTful API design

**Database:**
- Microsoft SQL Server
- Windows Authentication
- Driver: `msnodesqlv8`
- Database: `Educity`

**Architecture:**
- Single Page Application (SPA)
- Event-driven programming
- Async/await for API calls
- Modular frontend (1 file per panel)

## Quick Start Guide

### Prerequisites
- Node.js v16 or higher
- Microsoft SQL Server (any edition)
- SQL Server Management Studio (SSMS) - optional but recommended
- Modern web browser (Chrome, Firefox, Edge)

### Installation Steps

#### 1. Clone repository
```bash
git clone https://github.com/nhunguyen133/db-251.git
cd db-251/educity-web
```

#### 2. Install dependencies
```bash
npm install
```

#### 3. Setup database
```sql
-- Trong SSMS, chạy các file SQL theo thứ tự:
1. Educity.sql              -- Tạo database và tables
2. Feedback_Procedures.sql  -- Tạo CRUD procedures
3. 2.3.sql                  -- Tạo analytics procedures
4. 2.4.sql                  -- Tạo scalar functions
```

#### 4. Configure database connection
Kiểm tra file `backend/db.js`:
```javascript
const config = {
  server: 'localhost',           // Hoặc tên server của bạn
  database: 'Educity',
  driver: 'msnodesqlv8',
  options: {
    trustedConnection: true,     // Windows Authentication
    trustServerCertificate: true
  }
};
```

#### 5. Start server
```bash
node backend/server.js
```
Output: `Server running on http://localhost:3000`

#### 6. Open application
- **Option A**: Mở `public/index.html` trong browser
- **Option B**: Dùng VS Code Live Server
- **Option C**: Truy cập `http://localhost:3000` (nếu có static file serving)

### First Time Usage
1. Mở Panel "Feedback" (Panel 1)
2. Student ID mặc định: `U000000006`
3. Xem danh sách khóa học đã đăng ký
4. Thử thêm feedback cho 1 khóa học
5. Khám phá các panel khác (Top Courses, Teacher, Student)

## Troubleshooting

### Lỗi kết nối database
```
Error: Login failed for user
```
**Giải pháp:**
- Kiểm tra SQL Server đang chạy
- Kiểm tra Windows Authentication được enable
- Thử chạy SSMS với user hiện tại

### Lỗi module not found
```
Error: Cannot find module 'express'
```
**Giải pháp:**
```bash
npm install
# Hoặc cài từng package:
npm install express cors msnodesqlv8
```

### Lỗi stored procedure not found
```
Could not find stored procedure 'usp_AddFeedback'
```
**Giải pháp:**
- Chạy lại file `Feedback_Procedures.sql`
- Kiểm tra database đúng: `USE Educity`

### Port 3000 đã được sử dụng
```
Error: EADDRINUSE: address already in use
```
**Giải pháp:**
```bash
# Windows: Tìm và kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Hoặc đổi port trong server.js
const PORT = 3001;
```

## Cấu trúc dự án

```
educity-web/
├── backend/
│   ├── db.js                    # Database connection config
│   └── server.js                # Express server với 11 APIs
│
├── public/
│   ├── index.html               # SPA main structure (4 panels)
│   ├── styles.css               # Material Design CSS (359 lines)
│   │
│   ├── app.js                   # Core: Navigation & utilities (70 lines)
│   │
│   ├── feedback.js              # Panel 1: Feedback CRUD (832 lines)
│   ├── top-courses.js           # Panel 2: Top Courses (155 lines)
│   ├── teacher-courses-rank.js  # Panel 3: Teacher Dashboard (180 lines)
│   └── student-rank.js          # Panel 4: Student Loyalty (94 lines)
│
├── SQL Files/
│   ├── Educity.sql              # Database schema & seed data
│   ├── Feedback_Procedures.sql  # CRUD stored procedures
│   ├── 2.3.sql                  # Task 2.3: Procedures
│   └── 2.4.sql                  # Task 2.4: Functions
│
├── Documentation/
│   ├── README.md                # This file
│   ├── ARCHITECTURE-DIAGRAM.md  # System architecture
│   ├── REFACTORING-SUMMARY.md   # Code refactoring history
│   └── UPDATE-PANEL-TEACHER-SUMMARY.md  # Panel 3 updates
│
├── package.json                 # NPM dependencies
└── package-lock.json
```

### File Statistics

| File | Lines | Purpose |
|------|-------|---------|
| `server.js` | 400+ | Backend API server |
| `feedback.js` | 832 | Complete feedback management |
| `teacher-courses-rank.js` | 180 | Teacher analytics |
| `top-courses.js` | 155 | Top courses display |
| `student-rank.js` | 94 | Student loyalty |
| `app.js` | 70 | Navigation only |
| `styles.css` | 359 | All styling |

## API Endpoints

### Student & Feedback APIs (Panel 1)
```
GET    /api/student/:studentId/info
       → Lấy thông tin học viên (F_name + L_name)

GET    /api/student/:studentId/courses
       → Danh sách khóa học đã đăng ký + trạng thái feedback

POST   /api/feedback/add
       → Thêm feedback mới (gọi usp_AddFeedback)
       Body: { Stu_id, Cour_id, Rating, Comment }

PUT    /api/feedback/update
       → Cập nhật feedback (gọi usp_UpdateFeedback)
       Body: { Stu_id, Cour_id, NewRating, NewComment }

DELETE /api/feedback/delete
       → Xóa feedback (gọi sp_DeleteFeedback)
       Body: { Stu_id, Cour_id }

GET    /api/student/:studentId/feedback-history
       → Lịch sử tất cả feedback của học viên

GET    /api/student/:studentId/feedback-stats
       → Thống kê: Tổng feedback, Rating TB, Khóa học đã hoàn thành
```

### Analytics APIs (Panel 2, 3, 4)
```
GET    /api/courses/top-rated?publishedYear=2024&minReview=2
       → Top khóa học theo rating (gọi usp_GetTopRatedCourses)

GET    /api/teacher/:teacherId/course-stats
       → Thống kê khóa học giảng viên (gọi usp_GetTeacherCourseStats)
       Output: 9 trường (có Chứng chỉ + Doanh thu)

GET    /api/teacher/:teacherId/rank
       → Xếp hạng giảng viên (gọi fn_RankTeacher)
       Output: "Excellent Teacher" / "Good Teacher" / etc.

GET    /api/student/:studentId/loyalty
       → Loyalty rank học viên (gọi fn_CalcStudentLoyaltyRank)
       Output: "Platinum Member" / "Gold Member" / etc.
```

**Tổng cộng: 11 API endpoints**

## Validation Rules

- **Rating**: 1-5 sao (bắt buộc)
- **Comment**: 20-3000 ký tự (bắt buộc)
- **Edit/Delete**: Chỉ trong vòng 30 ngày kể từ ngày đánh giá
- **Courses**: Hiển thị tất cả khóa học đã đăng ký

## Database Objects

### Stored Procedures

#### Feedback CRUD
- `usp_AddFeedback(@Stu_id, @Cour_id, @Rating, @Comment)`
  - Thêm feedback mới
  - Validation: Rating 1-5, Comment 20-3000 ký tự
  
- `usp_UpdateFeedback(@Stu_id, @Cour_id, @NewRating, @NewComment)`
  - Cập nhật feedback trong vòng 30 ngày
  - Return code: 0 (success), 1 (not found), 2 (expired)
  
- `sp_DeleteFeedback(@Stu_id, @Cour_id)`
  - Xóa feedback trong vòng 30 ngày
  - Return code: 0 (success), 1 (not found), 2 (expired)

#### Analytics Procedures
- `usp_GetTopRatedCourses(@PublishedYear, @MinFeedback)`
  - Output: CourseID, CourseName, TeacherName, TotalFeedbacks, AvgRating
  - Sắp xếp: AvgRating DESC, TotalFeedbacks DESC
  
- `usp_GetTeacherCourseStats(@TeacherId)`
  - **Phiên bản mới** (9 trường output):
    1. Course_id
    2. Cour_name
    3. TotalFeedbacks
    4. AvgRating
    5. NumRegisteredStudents
    6. AvgFinalScore
    7. **NumCertificatesReceived** ← Mới
    8. **TotalRevenue** ← Mới
  - Sử dụng Derived Tables để tránh duplicate data
  - Tính doanh thu: Price × Số HV đã thanh toán

### Scalar Functions

- `fn_RankTeacher(@TeacherId) RETURNS NVARCHAR(50)`
  - Xếp loại: "Excellent Teacher", "Good Teacher", "Average Teacher", "New Teacher"
  - Tiêu chí: Số khóa học, Rating TB, Số feedback
  
- `fn_CalcStudentLoyaltyRank(@StudentId) RETURNS NVARCHAR(50)`
  - Hạng thành viên: "Platinum Member", "Gold Member", "Silver Member", "Bronze Member"
  - Tiêu chí: Số khóa học đã hoàn thành, Tổng số tiền, Số feedback

## Testing

### Sample Test Data
```javascript
// Student IDs
U000000006, U000000007, U000000008, U000000009, U000000010

// Teacher IDs
U000000001, U000000002, U000000003, U000000004, U000000005

// Test Parameters
- Top Courses: publishedYear = 2024, minReview = 2
- Feedback: Rating 1-5, Comment 20-3000 chars
```

### Test Scenarios

#### Panel 1: Feedback CRUD
1. Thêm feedback cho khóa học chưa đánh giá
2. Sửa feedback trong vòng 30 ngày
3. Không thể sửa/xóa feedback quá 30 ngày
4. Validation rating (1-5) và comment (20-3000)
5. Tìm kiếm khóa học theo tên
6. Hiển thị lịch sử và thống kê

#### Panel 2: Top Courses
1. Filter theo năm xuất bản (2024, 2025)
2. Filter theo số review tối thiểu (1, 5, 10)
3. Hiển thị đúng rating và số lượng feedback
4. Sắp xếp theo rating giảm dần

#### Panel 3: Teacher Dashboard
1. Hiển thị thống kê 8 cột (có chứng chỉ + doanh thu)
2. Format doanh thu đúng (75,000,000 ₫)
3. Hiển thị xếp hạng giảng viên
4. Teacher không tồn tại → hiển thị error

#### Panel 4: Student Loyalty
1. Hiển thị loyalty rank (Platinum/Gold/Silver/Bronze)
2. Student không tồn tại → hiển thị error
3. Loading states khi gọi API

## BTL Requirements Compliance

### Task 3.1 - CRUD Operations (Panel 1)
- [x] Giao diện thêm/sửa/xóa/xem feedback
- [x] Validation đầy đủ (client + server side)
- [x] Error handling từ stored procedures
- [x] Return codes được xử lý đúng (0, 1, 2)
- [x] UI/UX professional với Material Design

### Task 3.2 - List & Search
- [x] Hiển thị danh sách từ procedures/functions
- [x] Tìm kiếm real-time theo tên khóa học
- [x] Sắp xếp (ORDER BY trong SQL queries)
- [x] Cập nhật/xóa từ danh sách (inline actions)
- [x] Validate dữ liệu đầu vào (JS + SQL)
- [x] Loading states và error handling

### Task 3.3 - Advanced Features
- [x] Gọi procedures: `usp_GetTopRatedCourses`, `usp_GetTeacherCourseStats`
- [x] Gọi functions: `fn_RankTeacher`, `fn_CalcStudentLoyaltyRank`
- [x] Hiển thị kết quả thống kê đẹp mắt
- [x] Giao diện professional và responsive
- [x] Multiple panels với smooth navigation

### Bonus Features (Beyond Requirements)
- Single Page Application (SPA) architecture
- Modular code structure (1 file per panel)
- Real-time character counting
- Interactive 5-star rating
- Progress bars cho learning progress
- Color-coded status indicators
- Material Icons integration
- Format tiền tệ VN (75,000,000 ₫)
- Responsive design cho mobile
- Comprehensive documentation

## UI Features & Design

### Material Design Components
- **Material Icons**: 30+ icons cho intuitive UX
- **Cards**: Elevated cards với shadows
- **Badges**: Color-coded status badges
- **Buttons**: Raised buttons với ripple effects
- **Forms**: Clean form design với inline validation
- **Tables**: Responsive tables với hover effects

### Interactive Elements
- **5-Star Rating**: Interactive với hover preview
- **Progress Bars**: Animated learning progress (0-100%)
- **Search**: Real-time filtering với debounce
- **Loading States**: Spinner animations khi load data
- **Error Handling**: User-friendly error messages

### Color System
```css
--primary: #6366f1 (Indigo)
--success: #10b981 (Green)
--warning: #f59e0b (Amber)
--error: #ef4444 (Red)
--info: #3b82f6 (Blue)
--purple: #8b5cf6
--yellow: #fbbf24
```

### Status Colors
- **Green**: Completed courses (100%), Success actions
- **Yellow**: In-progress courses, Warnings
- **Red**: Cannot edit (>30 days), Errors
- **Blue**: Info, Average scores
- **Purple**: Feedback counts
- **Orange**: Certificates

### Animations & Transitions
- Smooth 0.3s transitions on all interactive elements
- Fade-in animations cho panel switching
- Hover effects trên buttons và badges
- Loading spinner với rotation animation
- Scale effects trên cards hover

## Documentation

### Main Documentation
- `README.md` (this file) - Complete project overview
- `ARCHITECTURE-DIAGRAM.md` - System architecture diagrams
- `REFACTORING-SUMMARY.md` - Code refactoring history
- `UPDATE-PANEL-TEACHER-SUMMARY.md` - Panel 3 update details
- `public/README-structure.md` - Frontend file structure

### SQL Documentation
- `2.3.sql` - Stored procedures documentation
- `2.4.sql` - Scalar functions documentation
- `Feedback_Procedures.sql` - CRUD procedures

### Code Comments
All JavaScript files có extensive comments:
- Function purpose và parameters
- API endpoint documentation
- Database object references
- Business logic explanations

## Team & Credits

**Nhóm 6-L03**  
Môn: Hệ cơ sở dữ liệu (CO2013-251)  
Trường: Đại học Bách Khoa TPHCM  
Học kỳ: 2024-2025

**Technologies Used:**
- Node.js & Express.js
- Microsoft SQL Server
- Vanilla JavaScript
- Material Design
- Git & GitHub

## License

Educational project - HCMUT 2025