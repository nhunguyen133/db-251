------------------------
-- Task 2.3
------------------------
-- THỦ TỤC 1:
-- Thống kê Top khóa học có Rating cao nhất ---
------------------------
CREATE OR ALTER PROCEDURE usp_GetTopRatedCourses
                @PublishedYear INT, @MinFeedback INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT c.Course_id AS CourseID,
           c.Cour_name AS CourseName,
           u.L_name + ' ' + u.F_name AS TeacherName,
           COUNT(f.Stu_id) AS TotalFeedbacks,
           CAST(AVG(CAST(f.Rating AS FLOAT)) AS DECIMAL(3,1)) AS AvgRating
    FROM COURSE c
    LEFT JOIN FEEDBACK f On c.Course_id = f.Cour_id
    JOIN TEACHER t ON c.Tea_id = t.Teacher_id
    JOIN [USER] u ON t.Teacher_id = u.User_id
    WHERE YEAR(c.Date_public) = @PublishedYear
    GROUP BY c.Course_id, c.Cour_name, u.F_name, u.L_name
    HAVING COUNT(f.Stu_id) >= @MinFeedback
    ORDER BY
        AvgRating DESC,
        TotalFeedbacks DESC;
END;
GO

-----------------------------
-- Test
-----------------------------
EXEC usp_GetTopRatedCourses 
     @PublishedYear = 2024,
     @MinFeedback = 1; 
GO

EXEC usp_GetTopRatedCourses 
     @PublishedYear = 2025,
     @MinFeedback = 10;
GO

----------------------------------------------------------------------------------------

------------------------
-- THỦ TỤC 2:
-- Thống kê chi tiết khóa học của Giảng viên ---

-- Input: TeacherId
-- Output: Thông tin khóa học, Số Feedback, Rating trung bình, Số HV đã đăng ký,
--         Điểm TB, Số chứng chỉ đã cấp, Doanh thu khóa học.
------------------------
CREATE OR ALTER PROCEDURE usp_GetTeacherCourseStats
    @TeacherId CHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Kiểm tra Giảng viên có tồn tại không
    IF NOT EXISTS (SELECT 1 FROM TEACHER WHERE Teacher_id = @TeacherId)
    BEGIN
        PRINT 'Error: Teacher with ID ' + @TeacherId + ' not found.';
        RETURN;
    END

    -- 2. Truy vấn thống kê
    -- Sử dụng các bảng dẫn xuất (Derived Tables) để tính toán trước khi JOIN 
    -- nhằm tránh sai sót dữ liệu do quan hệ 1-N chồng chéo.
    SELECT 
        c.Course_id,
        c.Cour_name,
        
        -- Thống kê Feedback
        COALESCE(F_Stats.NumFeedbacks, 0) AS TotalFeedbacks,
        COALESCE(F_Stats.AvgRating, 0)    AS AvgRating,
        
        -- Thống kê Đăng ký (Register)
        COALESCE(R_Stats.NumRegistered, 0) AS NumRegisteredStudents,
        COALESCE(R_Stats.AvgFinalScore, 0) AS AvgFinalScore,
        
        -- Thống kê Chứng chỉ (Certificate -> Receive)
        COALESCE(C_Stats.NumCertificates, 0) AS NumCertificatesReceived,
        
        -- Tính Doanh thu: Giá * Số lượng HV đã thanh toán (completed)
        (c.Price * COALESCE(R_Stats.NumPaid, 0)) AS TotalRevenue

    FROM COURSE c
    
    -- Join để lấy Feedback stats
    LEFT JOIN (
        SELECT Cour_id, 
               COUNT(Stu_id) AS NumFeedbacks, 
               CAST(AVG(CAST(Rating AS FLOAT)) AS DECIMAL(3,1)) AS AvgRating
        FROM FEEDBACK 
        GROUP BY Cour_id
    ) F_Stats ON c.Course_id = F_Stats.Cour_id

    -- Join để lấy Register stats
    LEFT JOIN (
        SELECT Cour_id, 
               COUNT(Stu_id) AS NumRegistered,
               CAST(AVG(CAST(Final_score AS FLOAT)) AS DECIMAL(4,2)) AS AvgFinalScore,
               COUNT(CASE WHEN Payment_status = 'completed' THEN 1 END) AS NumPaid
        FROM REGISTER 
        GROUP BY Cour_id
    ) R_Stats ON c.Course_id = R_Stats.Cour_id

    -- Join để lấy Certificate stats
    LEFT JOIN (
        SELECT ce.Cour_id, COUNT(rc.Stu_id) AS NumCertificates
        FROM CERTIFICATE ce
        JOIN [RECEIVE] rc ON ce.Cer_id = rc.Cer_id
        GROUP BY ce.Cour_id
    ) C_Stats ON c.Course_id = C_Stats.Cour_id

    WHERE c.Tea_id = @TeacherId
    ORDER BY TotalRevenue DESC, NumRegisteredStudents DESC;
END;
GO

-----------------------------
-- Test
-----------------------------
EXEC usp_GetTeacherCourseStats @TeacherId = 'U000000001';
GO

EXEC usp_GetTeacherCourseStats @TeacherId = 'U000000005';
GO

-- Test trường hợp Teacher_id not found
EXEC usp_GetTeacherCourseStats @TeacherId = 'U999999999';
GO