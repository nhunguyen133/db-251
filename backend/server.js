// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sql, getPool } = require('./db');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, '..', 'public')));

// =========================
// API 1: Top khóa học rating cao (usp_GetTopRatedCourses)
// =========================
app.get('/api/top-courses', async (req, res) => {
  const { year, minReview } = req.query;

  try {
    const pool = await getPool();

    // TODO: Gọi thủ tục usp_GetTopRatedCourses @PublishedYear, @MinReview
    // Ví dụ mẫu:
    /*
    const result = await pool.request()
      .input('PublishedYear', sql.Int, parseInt(year))
      .input('MinReview', sql.Int, parseInt(minReview))
      .execute('usp_GetTopRatedCourses');

    return res.json(result.recordset);
    */

    return res.status(501).json({ 
      todo: true,
      message: 'TODO: Implement usp_GetTopRatedCourses call in backend.' 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// =========================
// API 2: Thống kê course theo giảng viên (sp_GetTeacherCourseFeedbackStats)
// =========================
app.get('/api/teacher/:teacherId/courses', async (req, res) => {
  const { teacherId } = req.params;

  try {
    const pool = await getPool();

    // TODO: Gọi sp_GetTeacherCourseFeedbackStats @TeacherId
    /*
    const result = await pool.request()
      .input('TeacherId', sql.Char(10), teacherId)
      .execute('sp_GetTeacherCourseFeedbackStats');

    return res.json(result.recordset);
    */

    return res.status(501).json({
      todo: true,
      message: 'TODO: Implement sp_GetTeacherCourseFeedbackStats call in backend.'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// =========================
// API 3: Xếp loại giảng viên (fn_RankTeacher)
// =========================
app.get('/api/teacher/:teacherId/rank', async (req, res) => {
  const { teacherId } = req.params;

  try {
    const pool = await getPool();

    // TODO: SELECT dbo.fn_RankTeacher(@Tea_id)
    /*
    const result = await pool.request()
      .input('Tea_id', sql.Char(10), teacherId)
      .query('SELECT dbo.fn_RankTeacher(@Tea_id) AS RankText');

    return res.json(result.recordset[0]);
    */

    return res.status(501).json({
      todo: true,
      message: 'TODO: Implement fn_RankTeacher call in backend.'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// =========================
// API 4: Xếp hạng loyalty sinh viên (fn_CalcStudentLoyaltyRank)
// =========================
app.get('/api/student/:stuId/loyalty', async (req, res) => {
  const { stuId } = req.params;

  try {
    const pool = await getPool();

    // TODO: SELECT dbo.fn_CalcStudentLoyaltyRank(@StuID)
    /*
    const result = await pool.request()
      .input('StuID', sql.Char(10), stuId)
      .query('SELECT dbo.fn_CalcStudentLoyaltyRank(@StuID) AS Loyalty');

    return res.json(result.recordset[0]);
    */

    return res.status(501).json({
      todo: true,
      message: 'TODO: Implement fn_CalcStudentLoyaltyRank call in backend.'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// =========================
// API 5: Feedback – Add / Update / Delete
// dùng usp_AddFeedback, usp_UpdateFeedback, sp_DeleteFeedback
// =========================

app.post('/api/feedback', async (req, res) => {
    const { Stu_id, Cour_id, Rating, Comment } = req.body;

    try {
        const pool = await getPool();

        // TODO: EXEC usp_AddFeedback @Stu_id, @Cour_id, @Rating, @Comment
        await pool.request()
        .input('Stu_id', sql.Char(10), Stu_id)
        .input('Cour_id', sql.Char(10), Cour_id)
        .input('Rating', sql.Int, Rating)
        .input('Comment', sql.VarChar(3000), Comment)
        .execute('usp_AddFeedback');

        return res.json({ success: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error' });
    }
});

app.put('/api/feedback', async (req, res) => {
    const { Stu_id, Cour_id, Rating, Comment } = req.body;

    try {
        const pool = await getPool();

        // TODO: EXEC usp_UpdateFeedback @Stu_id, @Cour_id, @NewRating, @NewComment
        await pool.request()
        .input('Stu_id', sql.Char(10), Stu_id)
        .input('Cour_id', sql.Char(10), Cour_id)
        .input('NewRating', sql.Int, Rating)
        .input('NewComment', sql.VarChar(3000), Comment)
        .execute('usp_UpdateFeedback');

        return res.json({ success: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error' });
    }
});

app.delete('/api/feedback', async (req, res) => {
  const { Stu_id, Cour_id } = req.body;

  try {
    const pool = await getPool();

    // TODO: EXEC sp_DeleteFeedback @Stu_id, @Cour_id
    await pool.request()
      .input('Stu_id', sql.Char(10), Stu_id)
      .input('Cour_id', sql.Char(10), Cour_id)
      .execute('sp_DeleteFeedback');

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Educity backend skeleton listening at http://localhost:${PORT}`);
});
