------------------------------
-- TASK 2.4
------------------------------
-- HÀM 1: Xếp loại giảng viên dựa trên đánh giá (Dùng Cursor & IF) ---

-- Mục tiêu: Tính điểm đánh giá trung bình của giảng viên và xếp loại
-- Input: Teacher_id
-- Output: Chuỗi xếp loại (VARCHAR)
------------------------------
CREATE OR ALTER FUNCTION dbo.fn_RankTeacher
(
    @Tea_id CHAR(10)
)
RETURNS VARCHAR(20)
AS
BEGIN
    -- 1. KIỂM TRA THAM SỐ ĐẦU VÀO
    -- Kiểm tra xem giảng viên có tồn tại trong hệ thống không
    IF NOT EXISTS (SELECT 1 FROM TEACHER WHERE Teacher_id = @Tea_id)
        RETURN 'N/A'; -- Trả về Not Available nếu không tìm thấy

    DECLARE @TotalScore FLOAT = 0;
    DECLARE @CountCourses INT = 0;
    DECLARE @CurrentRating FLOAT;
    
    -- 2. KHAI BÁO CON TRỎ (CURSOR)
    -- Duyệt qua các khóa học của giảng viên mà đã có điểm đánh giá (Rating_avg IS NOT NULL)
    DECLARE course_cursor CURSOR FOR 
    SELECT Rating_avg 
    FROM COURSE 
    WHERE Tea_id = @Tea_id AND Rating_avg IS NOT NULL;

    OPEN course_cursor;
    FETCH NEXT FROM course_cursor INTO @CurrentRating;

    -- 3. VÒNG LẶP (LOOP/WHILE) ĐỂ TÍNH TOÁN
    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- Cộng dồn tổng điểm
        SET @TotalScore = @TotalScore + @CurrentRating;
        -- Tăng biến đếm số lượng khóa học
        SET @CountCourses = @CountCourses + 1;
        
        FETCH NEXT FROM course_cursor INTO @CurrentRating;
    END

    CLOSE course_cursor;
    DEALLOCATE course_cursor;

    -- 4. LOGIC XẾP LOẠI (Sử dụng IF)
    -- Trường hợp giảng viên chưa có khóa học nào được đánh giá
    IF @CountCourses = 0 RETURN 'New Teacher';

    DECLARE @AvgScore FLOAT;
    -- Tính trung bình cộng
    SET @AvgScore = @TotalScore / @CountCourses;

    -- Xếp loại dựa trên điểm trung bình
    IF @AvgScore >= 4.5
        RETURN 'Excellent';
    ELSE IF @AvgScore >= 3.5
        RETURN 'Good';
    ELSE IF @AvgScore >= 2.5
        RETURN 'Average';
    
    RETURN 'Poor';
END;
GO

-----------------------------
-- Test
-----------------------------
SELECT dbo.fn_RankTeacher('U000000009') AS RankingStatus;
GO

SELECT 
    t.Teacher_id,
    u.L_name + ' ' + u.F_name AS TeacherName,
    t.Expertise,
    dbo.fn_RankTeacher(t.Teacher_id) AS RankingStatus
FROM TEACHER t
JOIN [USER] u ON t.Teacher_id = u.User_id;
GO

-- Test trường hợp 'N/A'
SELECT dbo.fn_RankTeacher('U999999999') AS RankingStatus;
GO

----------------------------------------------------------------------------------------

------------------------------
-- HÀM 2: Xếp hạng thành viên (LOYALTY) ---

-- Sử dụng: REGISTER, COURSE, RECEIVE, FEEDBACK
------------------------------
CREATE OR ALTER FUNCTION dbo.fn_CalcStudentLoyaltyRank
(
    @StuID CHAR(10)
)
RETURNS NVARCHAR(100)
AS
BEGIN
    -- 1. Kiểm tra tham số
    IF NOT EXISTS (SELECT 1 FROM STUDENT WHERE Student_id = @StuID)
        RETURN 'Error: Student does not exist.';

    DECLARE @LoyaltyPoints INT = 0;

    -- Biến chạy
    DECLARE @Cur_CourID CHAR(10);
    DECLARE @Cur_Price FLOAT;
    DECLARE @Cur_Status VARCHAR(50);

    -- 2. Khai báo CURSOR: Duyệt lịch sử giao dịch của SV
    DECLARE HistoryCursor CURSOR FOR
    SELECT R.Cour_id, C.Price, R.Payment_status
    FROM REGISTER R
    JOIN COURSE C ON R.Cour_id = C.Course_id
    WHERE R.Stu_id = @StuID;

    OPEN HistoryCursor;
    FETCH NEXT FROM HistoryCursor INTO @Cur_CourID, @Cur_Price, @Cur_Status;

    -- 3. Vòng lặp
    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- Chỉ tính điểm cho giao dịch thành công
        IF @Cur_Status = 'completed'
        BEGIN
            -- Quy đổi tiền thành điểm: 10k VND = 1 điểm
            SET @LoyaltyPoints = @LoyaltyPoints + CAST((@Cur_Price / 10000) AS INT); -------------------------------------

            -- Kiểm tra: Đã nhận chứng chỉ khóa này chưa? (Thưởng 50 điểm)
            IF EXISTS (SELECT 1 FROM [RECEIVE] WHERE Stu_id = @StuID AND Cer_id IN (SELECT Cer_id FROM CERTIFICATE WHERE Cour_id = @Cur_CourID))
            BEGIN
                SET @LoyaltyPoints = @LoyaltyPoints + 50;
            END
        END

        FETCH NEXT FROM HistoryCursor INTO @Cur_CourID, @Cur_Price, @Cur_Status;
    END;

    CLOSE HistoryCursor;
    DEALLOCATE HistoryCursor;

    -- 4. Xếp hạng
    DECLARE @Rank NVARCHAR(50);
    IF @LoyaltyPoints >= 500
        SET @Rank = 'Diamond';
    ELSE IF @LoyaltyPoints >= 200
        SET @Rank = 'Gold';
    ELSE IF @LoyaltyPoints >= 100
        SET @Rank = 'Silver';
    ELSE
        SET @Rank = 'New Member';

    RETURN @Rank + ' (Points: ' + CAST(@LoyaltyPoints AS NVARCHAR(20)) + ')';
END;
GO

-----------------------------
-- Test
-----------------------------
SELECT dbo.fn_CalcStudentLoyaltyRank('U000000006') AS LoyaltyRank;
GO

SELECT 
    s.Student_id,
    u.L_name + ' ' + u.F_name AS StudentName,
    dbo.fn_CalcStudentLoyaltyRank(s.Student_id) AS LoyaltyRank
FROM STUDENT s
JOIN [USER] u ON s.Student_id = u.User_id
WHERE s.Student_id IN ('U000000009', 'U000000010');
GO

SELECT 
    s.Student_id,
    u.L_name + ' ' + u.F_name AS StudentName,
    dbo.fn_CalcStudentLoyaltyRank(s.Student_id) AS LoyaltyRank
FROM STUDENT s
JOIN [USER] u ON s.Student_id = u.User_id
GO

-- Test trường hợp Student có Payment_status = 'pending'
SELECT dbo.fn_CalcStudentLoyaltyRank('U000000007') AS LoyaltyRank;
GO

-- Test trường hợp Student không tồn tại
SELECT dbo.fn_CalcStudentLoyaltyRank('U999999998') AS LoyaltyRank;
GO