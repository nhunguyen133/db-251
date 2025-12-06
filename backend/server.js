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
            .input('MinReview', sql.Int, parseInt(minReview || 1))
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
            rank: result.recordset[0].Rank
        });
    } catch (err) {
        console.error('Error in GET /api/teacher/:teacherId/rank:', err);
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
    console.log(`   Feedback API endpoints:`);
    console.log(`   GET  /api/student/:studentId/courses`);
    console.log(`   POST /api/feedback/add`);
    console.log(`   PUT  /api/feedback/update`);
    console.log(`   DELETE /api/feedback/delete`);
    console.log(`   GET  /api/student/:studentId/feedback-history`);
    console.log(`   GET  /api/student/:studentId/feedback-stats`);
    console.log(`   \n   Task 2.3 Procedures:`);
    console.log(`   GET  /api/courses/top-rated?publishedYear=2024&minReview=2`);
    console.log(`   GET  /api/teacher/:teacherId/course-stats\n`);
});