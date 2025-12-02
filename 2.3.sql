------------------------
-- Task 2.3
------------------------
-- THỦ TỤC 1:
-- Thống kê Top khóa học có Rating cao nhất ---
------------------------
CREATE OR ALTER PROCEDURE usp_GetTopRatedCourses
                @PublishedYear INT, @MinReview INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT c.Course_id,
           c.Cour_name,
           u.F_name + ' ' + u.L_name,
           COUNT(f.Stu_id) AS Total_Reviews,
           CAST(AVG(CAST(f.Rating AS FLOAT)) AS DECIMAL(3,1)) AS Avg_Rating
    FROM COURSE c
    LEFT JOIN FEEDBACK f On c.Course_id = f.Cour_id
    JOIN TEACHER t ON c.Tea_id = t.Teacher_id
    JOIN [USER] u ON t.Teacher_id = u.User_id
    WHERE YEAR(c.Date_public) = @PublishedYear
    GROUP BY c.Course_id, c.Cour_name, u.F_name, u.L_name
    HAVING COUNT(f.Stu_id) >= @MinReview
    ORDER BY
        Avg_Rating DESC,
        Total_Reviews DESC;
END;
GO

-----------------------------
-- Test (Cần chuẩn bị dữ liệu và các câu test mới)
-----------------------------
EXEC usp_GetTopRatedCourses 
     @PublishedYear = 2024,
     @MinReview = 2;
GO
-----------------------------

------------------------
-- THỦ TỤC 2:
-- Giảng viên xem thống kê đánh giá & kết quả học tập cho các khóa học mình dạy ---

-- Cho 1 @TeacherId, thủ tục trả về từng khóa:
-- Số feedback (NumFeedbacks)
-- Rating trung bình (AvgRating) – từ bảng FEEDBACK (liên quan trực tiếp 2.1)
-- Số sinh viên đã đăng ký (NumRegisteredStudents) – từ REGISTER
-- Điểm trung bình cuối khóa (AvgFinalScore)
-- Số lượng học viên đã nhận chứng chỉ
-- Doanh thu của khóa học
------------------------

-- Cần viết lại với các yêu cầu mới

CREATE PROCEDURE sp_GetTeacherCourseFeedbackStats
    @TeacherId        CHAR(10)   -- mã giảng viên
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        c.Course_id,
        c.Cour_name,
        COUNT(DISTINCT f.Stu_id)          AS NumFeedbacks,
        AVG(CAST(f.Rating AS FLOAT))      AS AvgRating,
        COUNT(DISTINCT r.Stu_id)          AS NumRegisteredStudents,
        AVG(CAST(r.Final_score AS FLOAT)) AS AvgFinalScore
    FROM COURSE c
    JOIN TEACHER t 
        ON t.Teacher_id = c.Tea_id
    LEFT JOIN FEEDBACK f
        ON f.Cour_id = c.Course_id
    LEFT JOIN REGISTER r
        ON r.Cour_id = c.Course_id
    WHERE 
        c.Tea_id = @TeacherId                -- tham số trong WHERE
    GROUP BY 
        c.Course_id, c.Cour_name
--    HAVING 
        
    ORDER BY 
        -- Doanh thu > Avg Final_score 
END
GO

-----------------------------
-- Test (Cần chuẩn bị dữ liệu và các câu test mới)
-----------------------------
EXEC sp_GetTeacherCourseFeedbackStats 
    @TeacherId = 'U000000005',
    @MinFeedbackCount = 3;
-----------------------------