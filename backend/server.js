// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sql, getPool } = require('./db');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// =============================================
// FEEDBACK APIs
// =============================================

// API 0: Get student info
app.get('/api/student/:studentId/info', async (req, res) => {
    try {
        const { studentId } = req.params;
        const pool = await getPool();
        
        const result = await pool.request()
            .input('studentId', sql.Char(10), studentId)
            .query(`
                SELECT 
                    s.Student_id,
                    u.F_name,
                    u.L_name,
                    u.L_name + ' ' + u.F_name AS Full_name
                FROM STUDENT s
                INNER JOIN [USER] u ON s.Student_id = u.User_id
                WHERE s.Student_id = @studentId
            `);
        
        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy học viên'
            });
        }
        
        res.json({
            success: true,
            data: result.recordset[0]
        });
    } catch (err) {
        console.error('Error in GET /api/student/:studentId/info:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// API 1: Get student's registered courses
app.get('/api/student/:studentId/courses', async (req, res) => {
    try {
        const { studentId } = req.params;
        const pool = await getPool();
        
        const result = await pool.request()
            .input('studentId', sql.Char(10), studentId)
            .query(`
                SELECT 
                    r.Cour_id,
                    c.Cour_name,
                    r.Learning_progress,
                    f.Rating,
                    f.Comment,
                    f.Date_rat,
                    CASE 
                        WHEN f.Rating IS NULL THEN 'Chưa đánh giá'
                        WHEN DATEDIFF(DAY, f.Date_rat, GETDATE()) <= 30 THEN 'Có thể sửa'
                        ELSE 'Không thể sửa'
                    END AS Status,
                    DATEDIFF(DAY, f.Date_rat, GETDATE()) AS DaysAgo
                FROM REGISTER r
                INNER JOIN COURSE c ON r.Cour_id = c.Course_id
                LEFT JOIN FEEDBACK f ON r.Stu_id = f.Stu_id AND r.Cour_id = f.Cour_id
                WHERE r.Stu_id = @studentId AND r.Payment_status = 'completed'
                ORDER BY c.Cour_name
            `);
        
        res.json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        console.error('Error in GET /api/student/:studentId/courses:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// API 2: Add new feedback
app.post('/api/feedback/add', async (req, res) => {
    try {
        const { studentId, courseId, rating, comment } = req.body;
        const pool = await getPool();
        
        await pool.request()
            .input('Stu_id', sql.Char(10), studentId)
            .input('Cour_id', sql.Char(10), courseId)
            .input('Rating', sql.Int, rating)
            .input('Comment', sql.VarChar(3000), comment)
            .execute('usp_AddFeedback');
        
        res.json({
            success: true,
            message: 'Thêm đánh giá thành công!'
        });
    } catch (err) {
        console.error('Error in POST /api/feedback/add:', err);
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
});

// API 3: Update feedback
app.put('/api/feedback/update', async (req, res) => {
    try {
        const { studentId, courseId, newRating, newComment } = req.body;
        const pool = await getPool();
        
        await pool.request()
            .input('Stu_id', sql.Char(10), studentId)
            .input('Cour_id', sql.Char(10), courseId)
            .input('NewRating', sql.Int, newRating)
            .input('NewComment', sql.VarChar(3000), newComment)
            .execute('usp_UpdateFeedback');
        
        res.json({
            success: true,
            message: 'Cập nhật đánh giá thành công!'
        });
    } catch (err) {
        console.error('Error in PUT /api/feedback/update:', err);
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
});

// API 4: Delete feedback
app.delete('/api/feedback/delete', async (req, res) => {
    try {
        const { studentId, courseId } = req.body;
        const pool = await getPool();
        
        await pool.request()
            .input('Stu_id', sql.Char(10), studentId)
            .input('Cour_id', sql.Char(10), courseId)
            .execute('usp_DeleteFeedback');
        
        res.json({
            success: true,
            message: 'Xóa đánh giá thành công!'
        });
    } catch (err) {
        console.error('Error in DELETE /api/feedback/delete:', err);
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
});

// API 5: Get feedback history
app.get('/api/student/:studentId/feedback-history', async (req, res) => {
    try {
        const { studentId } = req.params;
        const pool = await getPool();
        
        const result = await pool.request()
            .input('studentId', sql.Char(10), studentId)
            .query(`
                SELECT 
                    f.Date_rat,
                    f.Cour_id,
                    c.Cour_name,
                    f.Rating,
                    f.Comment,
                    CASE 
                        WHEN DATEDIFF(DAY, f.Date_rat, GETDATE()) <= 30 THEN 'Có thể sửa/xóa'
                        ELSE 'Đã khóa'
                    END AS Status,
                    DATEDIFF(DAY, f.Date_rat, GETDATE()) AS DaysAgo
                FROM FEEDBACK f
                INNER JOIN COURSE c ON f.Cour_id = c.Course_id
                WHERE f.Stu_id = @studentId
                ORDER BY f.Date_rat DESC
            `);
        
        res.json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        console.error('Error in GET /api/student/:studentId/feedback-history:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// API 6: Get feedback statistics
app.get('/api/student/:studentId/feedback-stats', async (req, res) => {
    try {
        const { studentId } = req.params;
        const pool = await getPool();
        
        // Get total feedback count
        const totalResult = await pool.request()
            .input('studentId', sql.Char(10), studentId)
            .query('SELECT COUNT(*) AS TotalFeedback FROM FEEDBACK WHERE Stu_id = @studentId');
        
        // Get average rating
        const avgResult = await pool.request()
            .input('studentId', sql.Char(10), studentId)
            .query('SELECT AVG(CAST(Rating AS FLOAT)) AS AvgRating FROM FEEDBACK WHERE Stu_id = @studentId');
        
        // Get total courses count
        const coursesResult = await pool.request()
            .input('studentId', sql.Char(10), studentId)
            .query(`
                SELECT COUNT(*) AS TotalCourses
                FROM REGISTER r
                WHERE r.Stu_id = @studentId AND Payment_status = 'completed'
            `);
        
        res.json({
            success: true,
            stats: {
                totalFeedback: totalResult.recordset[0].TotalFeedback,
                avgRating: avgResult.recordset[0].AvgRating || 0,
                totalCourses: coursesResult.recordset[0].TotalCourses
            }
        });
    } catch (err) {
        console.error('Error in GET /api/student/:studentId/feedback-stats:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// =============================================
// TASK 2.3 - STORED PROCEDURES
// =============================================

// API 7: Get top rated courses (2.3 - Thủ tục 1)
app.get('/api/courses/top-rated', async (req, res) => {
    try {
        const { publishedYear, minReview } = req.query;
        const pool = await getPool();
        
        const result = await pool.request()
            .input('PublishedYear', sql.Int, parseInt(publishedYear || new Date().getFullYear()))
            .input('MinFeedback', sql.Int, parseInt(minReview || 1))
            .execute('usp_GetTopRatedCourses');
        
        res.json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        console.error('Error in GET /api/courses/top-rated:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// API 8: Get teacher course feedback stats (2.3 - Thủ tục 2)
app.get('/api/teacher/:teacherId/course-stats', async (req, res) => {
    try {
        const { teacherId } = req.params;
        const pool = await getPool();
        
        const result = await pool.request()
            .input('TeacherId', sql.Char(10), teacherId)
            .execute('usp_GetTeacherCourseStats');
        
        res.json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        console.error('Error in GET /api/teacher/:teacherId/course-stats:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// API 8.1: Get teacher info
app.get('/api/teacher/:teacherId/info', async (req, res) => {
    try {
        const { teacherId } = req.params;
        const pool = await getPool();
        
        const result = await pool.request()
            .input('TeacherId', sql.Char(10), teacherId)
            .query(`
                SELECT 
                    t.Teacher_id,
                    u.L_name + ' ' + u.F_name AS TeacherName,
                    t.Expertise,
                    (SELECT COUNT(*) FROM COURSE WHERE Tea_id = t.Teacher_id) AS CourseCount
                FROM TEACHER t
                INNER JOIN [USER] u ON t.Teacher_id = u.User_id
                WHERE t.Teacher_id = @TeacherId
            `);
        
        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy giảng viên'
            });
        }
        
        res.json({
            success: true,
            data: result.recordset[0]
        });
    } catch (err) {
        console.error('Error in GET /api/teacher/:teacherId/info:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// API 9: Get teacher rank
app.get('/api/teacher/:teacherId/rank', async (req, res) => {
    try {
        const { teacherId } = req.params;
        const pool = await getPool();
        
        const result = await pool.request()
            .input('TeacherId', sql.Char(10), teacherId)
            .query('SELECT dbo.fn_RankTeacher(@TeacherId) AS Rank');
        
        res.json({
            success: true,
            data: result.recordset[0]
        });
    } catch (err) {
        console.error('Error in GET /api/teacher/:teacherId/rank:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// API 10: Get student loyalty rank
app.get('/api/student/:studentId/loyalty', async (req, res) => {
    try {
        const { studentId } = req.params;
        const pool = await getPool();
        
        const result = await pool.request()
            .input('StudentId', sql.Char(10), studentId)
            .query('SELECT dbo.fn_CalcStudentLoyaltyRank(@StudentId) AS Loyalty');
        
        res.json({
            success: true,
            data: {
                Loyalty: result.recordset[0].Loyalty
            }
        });
    } catch (err) {
        console.error('Error in GET /api/student/:studentId/loyalty:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// API 11: Get all teachers with ranking
app.get('/api/teachers/all-rankings', async (req, res) => {
    try {
        const pool = await getPool();
        
        const result = await pool.request().query(`
            SELECT 
                t.Teacher_id,
                u.L_name + ' ' + u.F_name AS TeacherName,
                t.Expertise,
                (SELECT COUNT(*) FROM COURSE WHERE Tea_id = t.Teacher_id) AS CourseCount,
                (SELECT AVG(CAST(Rating_avg AS FLOAT)) FROM COURSE WHERE Tea_id = t.Teacher_id AND Rating_avg IS NOT NULL) AS AvgRating,
                dbo.fn_RankTeacher(t.Teacher_id) AS RankStatus
            FROM TEACHER t
            JOIN [USER] u ON t.Teacher_id = u.User_id
            ORDER BY 
                CASE 
                    WHEN dbo.fn_RankTeacher(t.Teacher_id) = 'Excellent' THEN 1
                    WHEN dbo.fn_RankTeacher(t.Teacher_id) = 'Good' THEN 2
                    WHEN dbo.fn_RankTeacher(t.Teacher_id) = 'Average' THEN 3
                    WHEN dbo.fn_RankTeacher(t.Teacher_id) = 'Poor' THEN 4
                    ELSE 5
                END,
                AvgRating DESC
        `);
        
        res.json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        console.error('Error in GET /api/teachers/all-rankings:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// API 12: Get all students with loyalty ranking
app.get('/api/students/all-loyalty', async (req, res) => {
    try {
        const pool = await getPool();
        
        const result = await pool.request().query(`
            SELECT 
                s.Student_id,
                u.L_name + ' ' + u.F_name AS StudentName,
                (SELECT COUNT(*) FROM REGISTER WHERE Stu_id = s.Student_id AND Payment_status = 'completed') AS CompletedCourses,
                (SELECT COUNT(*) FROM [RECEIVE] WHERE Stu_id = s.Student_id) AS CertificateCount,
                dbo.fn_CalcStudentLoyaltyRank(s.Student_id) AS LoyaltyRank
            FROM STUDENT s
            JOIN [USER] u ON s.Student_id = u.User_id
            ORDER BY 
                -- Extract points from loyalty string for sorting
                CASE 
                    WHEN dbo.fn_CalcStudentLoyaltyRank(s.Student_id) LIKE 'Diamond%' THEN 4
                    WHEN dbo.fn_CalcStudentLoyaltyRank(s.Student_id) LIKE 'Gold%' THEN 3
                    WHEN dbo.fn_CalcStudentLoyaltyRank(s.Student_id) LIKE 'Silver%' THEN 2
                    ELSE 1
                END DESC,
                -- Sort by actual points value
                CAST(
                    SUBSTRING(
                        dbo.fn_CalcStudentLoyaltyRank(s.Student_id),
                        CHARINDEX('Points: ', dbo.fn_CalcStudentLoyaltyRank(s.Student_id)) + 8,
                        CHARINDEX(')', dbo.fn_CalcStudentLoyaltyRank(s.Student_id)) - CHARINDEX('Points: ', dbo.fn_CalcStudentLoyaltyRank(s.Student_id)) - 8
                    ) AS INT
                ) DESC
        `);
        
        res.json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        console.error('Error in GET /api/students/all-loyalty:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// API 14: Get course detail by ID
app.get('/api/course/:courseId', async (req, res) => {
    try {
        const { courseId } = req.params;
        const pool = await getPool();
        
        const result = await pool.request()
            .input('CourseId', sql.Char(10), courseId)
            .query(`
                SELECT 
                    c.Course_id,
                    c.Cour_name,
                    c.Price,
                    c.Date_public,
                    c.[Description],
                    c.[Language],
                    c.Min_avg_score,
                    c.Num_lecture,
                    c.Total_time,
                    c.Num_student,
                    c.Rating_avg,
                    c.Tea_id,
                    u.F_name + ' ' + u.L_name AS TeacherName,
                    -- Thống kê Feedback
                    COALESCE((SELECT COUNT(*) FROM FEEDBACK WHERE Cour_id = c.Course_id), 0) AS TotalFeedbacks,
                    COALESCE((SELECT CAST(AVG(CAST(Rating AS FLOAT)) AS DECIMAL(3,1)) FROM FEEDBACK WHERE Cour_id = c.Course_id), 0) AS AvgRating,
                    -- Thống kê Đăng ký
                    COALESCE((SELECT COUNT(*) FROM REGISTER WHERE Cour_id = c.Course_id), 0) AS NumRegistered,
                    COALESCE((SELECT COUNT(*) FROM REGISTER WHERE Cour_id = c.Course_id AND Payment_status = 'completed'), 0) AS NumPaid,
                    COALESCE((SELECT CAST(AVG(CAST(Final_score AS FLOAT)) AS DECIMAL(4,2)) FROM REGISTER WHERE Cour_id = c.Course_id), 0) AS AvgFinalScore,
                    -- Thống kê Chứng chỉ
                    COALESCE((SELECT COUNT(*) FROM [RECEIVE] rc JOIN CERTIFICATE ce ON rc.Cer_id = ce.Cer_id WHERE ce.Cour_id = c.Course_id), 0) AS NumCertificates,
                    -- Doanh thu
                    (c.Price * COALESCE((SELECT COUNT(*) FROM REGISTER WHERE Cour_id = c.Course_id AND Payment_status = 'completed'), 0)) AS TotalRevenue
                FROM COURSE c
                JOIN TEACHER t ON c.Tea_id = t.Teacher_id
                JOIN [USER] u ON t.Teacher_id = u.User_id
                WHERE c.Course_id = @CourseId
            `);
        
        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy khóa học'
            });
        }
        
        res.json({
            success: true,
            data: result.recordset[0]
        });
    } catch (err) {
        console.error('Error in GET /api/course/:courseId:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// =============================================
// COURSE MANAGEMENT APIs (CRUD)
// =============================================

// API 11: Add new course
app.post('/api/course/add', async (req, res) => {
    try {
        const { teacherId, courseName, price, datePublic, description, language, minAvgScore } = req.body;
        
        if (!teacherId || !courseName || !price || !language || minAvgScore === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin bắt buộc: teacherId, courseName, price, language, minAvgScore'
            });
        }
        
        // Validate
        if (minAvgScore < 0 || minAvgScore > 10) {
            return res.status(400).json({
                success: false,
                message: 'Điểm TB tối thiểu phải từ 0-10'
            });
        }
        
        const pool = await getPool();
        
        // Tạo Course_id mới (C + 8 số)
        const idResult = await pool.request().query(`
            SELECT 'C' + RIGHT('00000000' + CAST(ISNULL(MAX(CAST(SUBSTRING(Course_id, 2, 8) AS INT)), 0) + 1 AS VARCHAR), 8) AS NewCourseId
            FROM COURSE
        `);
        
        const newCourseId = idResult.recordset[0].NewCourseId;
        
        // Sử dụng stored procedure usp_InsertCourse từ 2.3.sql
        await pool.request()
            .input('Course_id', sql.Char(10), newCourseId)
            .input('Cour_name', sql.NVarChar(255), courseName)
            .input('Description', sql.NVarChar(sql.MAX), description || '')
            .input('Language', sql.NVarChar(50), language)
            .input('Min_avg_score', sql.Decimal(4, 2), minAvgScore)
            .input('Price', sql.Decimal(12, 2), price)
            .input('Date_public', sql.Date, datePublic || new Date())
            .input('Tea_id', sql.Char(10), teacherId)
            .execute('usp_InsertCourse');
        
        res.json({
            success: true,
            message: 'Thêm khóa học thành công!',
            courseId: newCourseId
        });
    } catch (err) {
        console.error('Error in POST /api/course/add:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// API 12: Update course
app.put('/api/course/update', async (req, res) => {
    try {
        const { courseId, courseName, price, datePublic, description, language, minAvgScore } = req.body;
        
        if (!courseId || !courseName || !price || !language || minAvgScore === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin bắt buộc: courseId, courseName, price, language, minAvgScore'
            });
        }
        
        // Validate
        if (minAvgScore < 0 || minAvgScore > 10) {
            return res.status(400).json({
                success: false,
                message: 'Điểm TB tối thiểu phải từ 0-10'
            });
        }
        
        const pool = await getPool();
        
        // Sử dụng stored procedure usp_UpdateCourse từ 2.3.sql
        await pool.request()
            .input('Course_id', sql.Char(10), courseId)
            .input('Cour_name', sql.NVarChar(255), courseName)
            .input('Description', sql.NVarChar(sql.MAX), description || null)
            .input('Language', sql.NVarChar(50), language)
            .input('Min_avg_score', sql.Decimal(4, 2), minAvgScore)
            .input('Price', sql.Decimal(12, 2), price)
            .input('Date_public', sql.Date, datePublic || null)
            .input('Tea_id', sql.Char(10), null) // Không thay đổi Tea_id khi update
            .execute('usp_UpdateCourse');
        
        res.json({
            success: true,
            message: 'Cập nhật khóa học thành công!'
        });
    } catch (err) {
        console.error('Error in PUT /api/course/update:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// API 13: Delete course
app.delete('/api/course/delete', async (req, res) => {
    try {
        const { courseId, teacherId } = req.body;
        
        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu courseId'
            });
        }
        
        const pool = await getPool();
        
        // Kiểm tra xem khóa học có thuộc về giảng viên này không
        const checkResult = await pool.request()
            .input('CourseId', sql.Char(10), courseId)
            .input('TeacherId', sql.Char(10), teacherId)
            .query(`
                SELECT Course_id FROM COURSE 
                WHERE Course_id = @CourseId AND Tea_id = @TeacherId
            `);
        
        if (checkResult.recordset.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền xóa khóa học này'
            });
        }
        
        // Sử dụng stored procedure usp_DeleteCourse từ 2.3.sql
        await pool.request()
            .input('Course_id', sql.Char(10), courseId)
            .execute('usp_DeleteCourse');
        
        res.json({
            success: true,
            message: 'Xóa khóa học thành công!'
        });
    } catch (err) {
        console.error('Error in DELETE /api/course/delete:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// =============================================
// Start server
// =============================================
app.listen(PORT, () => {
    console.log(`\n   Server running on http://localhost:${PORT}`);
    console.log(`\n   Feedback APIs (7 endpoints):`);
    console.log(`   GET  /api/student/:studentId/info`);
    console.log(`   GET  /api/student/:studentId/courses`);
    console.log(`   POST /api/feedback/add`);
    console.log(`   PUT  /api/feedback/update`);
    console.log(`   DELETE /api/feedback/delete`);
    console.log(`   GET  /api/student/:studentId/feedback-history`);
    console.log(`   GET  /api/student/:studentId/feedback-stats`);
    console.log(`\n   Analytics APIs (4 endpoints):`);
    console.log(`   GET  /api/courses/top-rated?publishedYear=YYYY&minReview=N`);
    console.log(`   GET  /api/teacher/:teacherId/course-stats`);
    console.log(`   GET  /api/teacher/:teacherId/rank`);
    console.log(`   GET  /api/student/:studentId/loyalty`);
    console.log(`\n   Course CRUD APIs (4 endpoints):`);
    console.log(`   GET    /api/course/:courseId`);
    console.log(`   POST   /api/course/add`);
    console.log(`   PUT    /api/course/update`);
    console.log(`   DELETE /api/course/delete`);
    console.log(`\n   Total: 15 API endpoints\n`);
});