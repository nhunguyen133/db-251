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
EXEC usp_GetTeacherCourseStats @TeacherId = 'U000000009';
GO

EXEC usp_GetTeacherCourseStats @TeacherId = 'U000000012';
GO

-- Test trường hợp Teacher_id not found
EXEC usp_GetTeacherCourseStats @TeacherId = 'U999999999';
GO

/* =========================================================
   TASK 2.3 - COURSE CRUD with Revenue Rule
   Includes:
     1) usp_InsertCourse
     2) usp_UpdateCourse
     3) usp_DeleteCourse
     4) Testcases (with Vietnamese explanations)

   Business Rule:
   - Only allow UPDATE/DELETE when Total Revenue = 0
   - Revenue = Price * COUNT(REGISTER with Payment_status = 'completed')

   Notes:
   - This script assumes columns exist in COURSE:
       Course_id, Cour_name, Description, Language,
       Num_lect, Total_time, Min_avg_score, Price,
       Date_public, Num_student, Rating_avg, Tea_id
   - If your DB name is different, change USE below.

========================================================= */

/* =========================================================
   1) INSERT COURSE
========================================================= */
CREATE OR ALTER PROCEDURE usp_InsertCourse
    @Course_id      CHAR(10),
    @Cour_name      NVARCHAR(255),
    @Description    NVARCHAR(MAX),
    @Language       NVARCHAR(50),
    @Min_avg_score  DECIMAL(4,2),
    @Price          DECIMAL(12,2),
    @Date_public    DATE,
    @Tea_id         CHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Check trùng PK
    IF EXISTS (SELECT 1 FROM COURSE WHERE Course_id = @Course_id)
    BEGIN
        RAISERROR('Error: Course with ID %s already exists.', 16, 1, @Course_id);
        RETURN;
    END;

    -- 2. Check giảng viên
    IF NOT EXISTS (SELECT 1 FROM TEACHER WHERE Teacher_id = @Tea_id)
    BEGIN
        RAISERROR('Error: Teacher with ID %s does not exist.', 16, 1, @Tea_id);
        RETURN;
    END;

    -- 3. Domain
    IF (@Price < 0)
    BEGIN
        RAISERROR('Error: Course price must be >= 0.', 16, 1);
        RETURN;
    END;

    IF (@Min_avg_score < 0 OR @Min_avg_score > 10)
    BEGIN
        RAISERROR('Error: Min_avg_score must be between 0 and 10.', 16, 1);
        RETURN;
    END;

    -- 4. Insert
    -- Rating_avg là derived column nên để NULL, sẽ được tính tự động từ FEEDBACK
    -- Total_time cũng là derived nên set = NULL thay vì 0 (vì có CHECK > 0)
    INSERT INTO COURSE
    (
        Course_id, Cour_name, [Description], [Language],
        Num_lecture, Total_time, Min_avg_score, Price,
        Date_public, Num_student, Rating_avg, Tea_id
    )
    VALUES
    (
        @Course_id, @Cour_name, @Description, @Language,
        0, NULL, @Min_avg_score, @Price,
        @Date_public, 0, NULL, @Tea_id
    );

    PRINT 'Insert course successfully.';
END;
GO

/* =========================================================
   2) UPDATE COURSE
   Rule: Only allow when Revenue = 0
========================================================= */
CREATE OR ALTER PROCEDURE usp_UpdateCourse
    @Course_id      CHAR(10),
    @Cour_name      NVARCHAR(255)     = NULL,
    @Description    NVARCHAR(MAX)     = NULL,
    @Language       NVARCHAR(50)      = NULL,
    @Min_avg_score  DECIMAL(4,2)      = NULL,
    @Price          DECIMAL(12,2)     = NULL,
    @Date_public    DATE              = NULL,
    @Tea_id         CHAR(10)          = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Check course tồn tại
    IF NOT EXISTS (SELECT 1 FROM COURSE WHERE Course_id = @Course_id)
    BEGIN
        RAISERROR('Error: Course with ID %s does not exist.', 16, 1, @Course_id);
        RETURN;
    END;

    -- 2. Tính doanh thu: Price hiện tại * số REGISTER completed
    DECLARE @NumPaid INT = 0;
    DECLARE @CurrentPrice DECIMAL(12,2) = 0;
    DECLARE @Revenue DECIMAL(18,2) = 0;

    SELECT @NumPaid = COUNT(*)
    FROM REGISTER
    WHERE Cour_id = @Course_id
      AND Payment_status = 'completed';

    SELECT @CurrentPrice = Price
    FROM COURSE
    WHERE Course_id = @Course_id;

    SET @Revenue = ISNULL(@CurrentPrice, 0) * ISNULL(@NumPaid, 0);

    IF (@Revenue > 0)
    BEGIN
        RAISERROR(
            'Error: Course %s cannot be updated because total revenue is greater than 0.',
            16, 1, @Course_id
        );
        RETURN;
    END;

    -- 3. Validate các tham số thay đổi (nếu có)
    IF (@Tea_id IS NOT NULL 
        AND NOT EXISTS (SELECT 1 FROM TEACHER WHERE Teacher_id = @Tea_id))
    BEGIN
        RAISERROR('Error: Teacher with ID %s does not exist.', 16, 1, @Tea_id);
        RETURN;
    END;

    IF (@Price IS NOT NULL AND @Price < 0)
    BEGIN
        RAISERROR('Error: Course price must be >= 0.', 16, 1);
        RETURN;
    END;

    IF (@Min_avg_score IS NOT NULL 
        AND (@Min_avg_score < 0 OR @Min_avg_score > 10))
    BEGIN
        RAISERROR('Error: Min_avg_score must be between 0 and 10.', 16, 1);
        RETURN;
    END;

    -- 4. UPDATE: chỉ ghi đè cột nào có truyền tham số
    UPDATE COURSE
    SET
        Cour_name     = ISNULL(@Cour_name,     Cour_name),
        [Description] = ISNULL(@Description,   [Description]),
        [Language]    = ISNULL(@Language,      [Language]),
        Min_avg_score = ISNULL(@Min_avg_score, Min_avg_score),
        Price         = ISNULL(@Price,         Price),
        Date_public   = ISNULL(@Date_public,   Date_public),
        Tea_id        = ISNULL(@Tea_id,        Tea_id)
    WHERE Course_id = @Course_id;

    PRINT 'Update course successfully.';
END;
GO

/* =========================================================
   3) DELETE COURSE
   Rule: Only allow when Revenue = 0
========================================================= */
CREATE OR ALTER PROCEDURE usp_DeleteCourse
    @Course_id CHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Check tồn tại
    IF NOT EXISTS (SELECT 1 FROM COURSE WHERE Course_id = @Course_id)
    BEGIN
        RAISERROR('Error: Course with ID %s does not exist.', 16, 1, @Course_id);
        RETURN;
    END;

    -- 2. Tính doanh thu
    DECLARE @NumPaid INT = 0;
    DECLARE @CurrentPrice DECIMAL(12,2) = 0;
    DECLARE @Revenue DECIMAL(18,2) = 0;

    SELECT @NumPaid = COUNT(*)
    FROM REGISTER
    WHERE Cour_id = @Course_id
      AND Payment_status = 'completed';

    SELECT @CurrentPrice = Price
    FROM COURSE
    WHERE Course_id = @Course_id;

    SET @Revenue = ISNULL(@CurrentPrice, 0) * ISNULL(@NumPaid, 0);

    IF (@Revenue > 0)
    BEGIN
        RAISERROR(
            'Error: Course %s cannot be deleted because total revenue is greater than 0.',
            16, 1, @Course_id
        );
        RETURN;
    END;

    -- 3. Xoá course (nếu FK không cascade thì xóa bảng con trước)
    DELETE FROM COURSE
    WHERE Course_id = @Course_id;

    PRINT 'Delete course successfully.';
END;
GO
