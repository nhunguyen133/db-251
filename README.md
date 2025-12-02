# Educity - E-learning Feedback System

Hệ thống quản lý feedback khóa học cho nền tảng e-learning Educity.

## 📋 Thông tin dự án

- **Môn học**: Hệ cơ sở dữ liệu (CO2013) - 251
- **Bài tập lớn**: BTL2 - Phần 2
- **Nhóm**: 6-L03

## 🚀 Tính năng

### Feedback Management (Task 3.1 - CRUD)
- ✅ Thêm feedback mới cho khóa học đã đăng ký
- ✅ Sửa feedback trong vòng 30 ngày
- ✅ Xóa feedback trong vòng 30 ngày
- ✅ Xem lịch sử feedback và thống kê

### Advanced Features (Task 3.2 & 3.3)
- ✅ Hiển thị danh sách khóa học từ stored procedures
- ✅ Tìm kiếm và sắp xếp khóa học
- ✅ Top khóa học theo rating (`usp_GetTopRatedCourses`)
- ✅ Thống kê feedback giảng viên (`sp_GetTeacherCourseFeedbackStats`)
- ✅ Loyalty rank học viên (`fn_CalcStudentLoyaltyRank`)

### UI/UX
- 🎨 Material Design với Material Icons
- ⭐ Interactive 5-star rating system
- 🎯 Real-time validation & character counting
- 📱 Responsive design
- 🌈 Modern gradient theme

## 🛠️ Tech Stack

**Frontend:**
- HTML5, CSS3 (CSS Variables)
- Vanilla JavaScript (ES6+)
- Material Icons CDN

**Backend:**
- Node.js + Express.js
- CORS middleware

**Database:**
- SQL Server
- Windows Authentication
- Driver: `msnodesqlv8`

## 📦 Cài đặt

### 1. Clone repository

```bash
git clone https://github.com/nhunguyen133/db-251.git
cd db-251
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình database

Đảm bảo SQL Server đang chạy và database `Educity` đã được tạo. Kiểm tra file `backend/db.js`:

```javascript
{
  server: 'localhost',
  database: 'Educity',
  driver: 'msnodesqlv8',
  options: {
    trustedConnection: true
  }
}
```

### 4. Chạy server

```bash
node backend/server_new.js
```

Server sẽ chạy tại: `http://localhost:3000`

### 5. Mở ứng dụng

Mở file `public/index.html` trong trình duyệt hoặc sử dụng Live Server.

## 📁 Cấu trúc dự án

```
educity-web/
├── backend/
│   ├── db.js              # Cấu hình kết nối database
│   ├── server.js          # Server cũ (deprecated)
│   └── server_new.js      # Server chính với 8 APIs
├── public/
│   ├── index.html         # Giao diện chính
│   ├── styles.css         # CSS với Material Design
│   ├── app.js             # Panel navigation logic
│   ├── feedback.js        # Feedback CRUD logic (700+ lines)
│   └── procedures.js      # Task 2.3 procedures logic
├── Educity.sql            # Database schema
├── Feedback_Procedures.sql # Stored procedures
├── 2.3.sql                # Task 2.3 queries
├── 2.4.sql                # Task 2.4 queries
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Feedback Management
- `GET /api/student/:studentId/info` - Lấy thông tin học viên
- `GET /api/student/:studentId/courses` - Danh sách khóa học đã đăng ký
- `POST /api/feedback/add` - Thêm feedback mới
- `PUT /api/feedback/update` - Cập nhật feedback
- `DELETE /api/feedback/delete` - Xóa feedback
- `GET /api/student/:studentId/feedback-history` - Lịch sử feedback
- `GET /api/student/:studentId/feedback-stats` - Thống kê feedback

### Task 2.3 Procedures
- `GET /api/courses/top-rated?publishedYear=2024&minReview=2` - Top khóa học
- `GET /api/teacher/:teacherId/course-stats` - Thống kê giảng viên

## ✅ Validation Rules

- **Rating**: 1-5 sao (bắt buộc)
- **Comment**: 20-3000 ký tự (bắt buộc)
- **Edit/Delete**: Chỉ trong vòng 30 ngày kể từ ngày đánh giá
- **Courses**: Hiển thị tất cả khóa học đã đăng ký

## 🎯 Stored Procedures

### Feedback
- `usp_AddFeedback` - Thêm feedback mới
- `usp_UpdateFeedback` - Cập nhật feedback
- `sp_DeleteFeedback` - Xóa feedback

### Analytics
- `usp_GetTopRatedCourses` - Top khóa học theo rating
- `sp_GetTeacherCourseFeedbackStats` - Thống kê giảng viên
- `fn_CalcStudentLoyaltyRank` - Tính loyalty rank học viên
- `fn_RankTeacher` - Xếp loại giảng viên

## 🧪 Testing

### Sample Data
- **Student ID**: U000000006, U000000007
- **Teacher ID**: U000000001 - U000000005
- **Courses**: Được load tự động từ database

### Test Scenarios
1. ✅ Thêm feedback cho khóa học chưa đánh giá
2. ✅ Sửa feedback trong vòng 30 ngày
3. ✅ Không thể sửa/xóa feedback quá 30 ngày
4. ✅ Validation rating và comment
5. ✅ Tìm kiếm và filter khóa học
6. ✅ Hiển thị top courses với điều kiện năm + min reviews
7. ✅ Hiển thị thống kê giảng viên

## 📝 BTL Requirements Compliance

### Task 3.1 - CRUD Operations ✅
- Giao diện thêm/sửa/xóa/xem feedback
- Validation đầy đủ
- Error handling từ stored procedures

### Task 3.2 - List & Search ✅
- Hiển thị danh sách từ procedures
- Tìm kiếm theo tên khóa học
- Sắp xếp (ORDER BY trong queries)
- Cập nhật/xóa từ danh sách
- Validate dữ liệu đầu vào

### Task 3.3 - Other Procedures ✅
- Gọi các function: `fn_RankTeacher`, `fn_CalcStudentLoyaltyRank`
- Hiển thị kết quả thống kê
- Giao diện đẹp và professional

## 🎨 UI Features

- **Material Icons**: 20+ icons cho better UX
- **5-Star Rating**: Interactive với hover effects
- **Progress Bars**: Hiển thị tiến độ học tập
- **Color Coding**: 
  - 🟢 Green: Completed courses (100%)
  - 🟡 Yellow: In-progress courses
  - 🔴 Red: Cannot edit (>30 days)
- **Animations**: Smooth transitions và hover effects
- **Gradients**: Modern gradient backgrounds

## 👥 Contributors

- Nhóm 6-L03
- Môn: Hệ cơ sở dữ liệu (CO2013-251)

## 📄 License

Educational project - HCMUT 2025

---

**Note**: Đảm bảo SQL Server đang chạy và database Educity đã được tạo với đầy đủ stored procedures trước khi chạy ứng dụng.
