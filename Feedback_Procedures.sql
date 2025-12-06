-- =============================================
-- 1. THỦ TỤC INSERT FEEDBACK
-- =============================================
GO
CREATE OR ALTER PROC usp_AddFeedback
    @Stu_id     CHAR(10),
    @Cour_id    CHAR(10),
    @Rating     INT,
    @Comment    VARCHAR(3000)
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Kiểm tra sinh viên tồn tại
    IF NOT EXISTS (SELECT 1 FROM STUDENT WHERE Student_id = @Stu_id)
    BEGIN
        RAISERROR ('Student %s does not exist.', 16, 1, @Stu_id);
        RETURN;
    END

    -- 2. Kiểm tra khóa học tồn tại
    IF NOT EXISTS (SELECT 1 FROM COURSE WHERE Course_id = @Cour_id)
    BEGIN
        RAISERROR ('Course %s does not exist.', 16, 1, @Cour_id);
        RETURN;
    END

    -- 3. Kiểm tra sinh viên đã đăng ký khóa học + tiến độ ≥ 50%
    DECLARE @LearningProgress INT;

    SELECT @LearningProgress = Learning_progress
    FROM REGISTER
    WHERE Stu_id = @Stu_id AND Cour_id = @Cour_id;

    IF @LearningProgress IS NULL
    BEGIN
        RAISERROR ('Student has not registered for this course, so feedback cannot be given.', 16, 1);
        RETURN;
    END

    IF @LearningProgress < 50
    BEGIN
        RAISERROR (
            'Student has not completed at least 50%% of the progress (current: %d%%), so feedback cannot be given yet.',
            16, 1, @LearningProgress
        );
        RETURN;
    END

    -- 4. Kiểm tra đã có feedback chưa (khóa chính (Stu_id, Cour_id))
    IF EXISTS (SELECT 1 FROM FEEDBACK WHERE Stu_id = @Stu_id AND Cour_id = @Cour_id)
    BEGIN
        RAISERROR ('Student has already provided feedback for this course. Please use the update procedure.', 16, 1);
        RETURN;
    END

    -- 5. Kiểm tra giá trị Rating
    IF (@Rating < 1 OR @Rating > 5)
    BEGIN
        RAISERROR ('Rating must be an integer between 1 and 5.', 16, 1);
        RETURN;
    END

    -- 6. Kiểm tra độ dài comment (nếu có)
    IF (@Comment IS NOT NULL AND LEN(LTRIM(RTRIM(@Comment))) < 20)
    BEGIN
        RAISERROR ('Comment content must be at least 20 characters long.', 16, 1);
        RETURN;
    END

    -- 8. Thêm dữ liệu
    INSERT INTO FEEDBACK (Stu_id, Cour_id, Rating, Comment, Date_rat)
    VALUES (@Stu_id, @Cour_id, @Rating, @Comment, GETDATE());
END
GO


-- =============================================
-- 2. THỦ TỤC UPDATE FEEDBACK
-- =============================================
GO
CREATE OR ALTER PROC usp_UpdateFeedback
    @Stu_id      CHAR(10),
    @Cour_id     CHAR(10),
    @NewRating   INT,
    @NewComment  VARCHAR(3000)
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Kiểm tra feedback tồn tại
    IF NOT EXISTS (SELECT 1 FROM FEEDBACK WHERE Stu_id = @Stu_id AND Cour_id = @Cour_id)
    BEGIN
        RAISERROR ('Feedback for course %s from student %s was not found.',
                   16, 1, @Cour_id, @Stu_id);
        RETURN;
    END

    -- 2. Kiểm tra sau 30 ngày ko thể sửa
    IF EXISTS (
            SELECT 1 
            FROM FEEDBACK
            WHERE Stu_id =  @Stu_id AND Cour_id = @Cour_id
            AND DATEDIFF(DAY, Date_rat, GETDATE()) > 30
        )
        BEGIN
            RAISERROR('Cannot update feedback that has existed for more than 30 days.', 16, 1);
            RETURN;
        END

    -- 3. Kiểm tra rating mới
    IF (@NewRating < 1 OR @NewRating > 5)
    BEGIN
        RAISERROR ('Rating must be an integer between 1 and 5.', 16, 1);
        RETURN;
    END

    -- 4. Kiểm tra nội dung comment mới
    IF (@NewComment IS NOT NULL AND LEN(LTRIM(RTRIM(@NewComment))) < 20)
    BEGIN
        RAISERROR ('Comment content must be at least 20 characters long.', 16, 1);
        RETURN;
    END

    -- 5. Cập nhật
    UPDATE FEEDBACK
    SET Rating  = @NewRating,
        Comment = @NewComment
    WHERE Stu_id = @Stu_id AND Cour_id = @Cour_id;
END
GO

-- =============================================
-- 3. THỦ TỤC DELETE FEEDBACK
-- =============================================
CREATE OR ALTER PROCEDURE usp_DeleteFeedback
    @Stu_id  CHAR(10),
    @Cour_id CHAR(10)
AS
BEGIN
    -- 1. Kiểm tra feedback có tồn tại không
    IF NOT EXISTS (
        SELECT 1
        FROM FEEDBACK
        WHERE Stu_id = @Stu_id AND Cour_id = @Cour_id
    )
    BEGIN
        RAISERROR('Feedback does not exist to delete.', 16, 1);
        RETURN;
    END

    -- 2. Kiểm tra thời gian cho phép xóa (≤ 30 ngày)
    IF EXISTS (
        SELECT 1
        FROM FEEDBACK
        WHERE Stu_id = @Stu_id 
          AND Cour_id = @Cour_id
          AND DATEDIFF(DAY, Date_rat, GETDATE()) > 30
    )
    BEGIN
        RAISERROR(
            'Cannot delete feedback that has existed for more than 30 days.', 
            16, 1
        );
        RETURN;
    END

    -- 3. Thực hiện xóa
    DELETE FROM FEEDBACK
    WHERE Stu_id = @Stu_id AND Cour_id = @Cour_id;
END;
GO