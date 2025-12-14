﻿------------------------
-- Task 2.2.1
------------------------
GO
CREATE OR ALTER TRIGGER trg_CheckQuizAttempts
ON ATTEMPT
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM INSERTED i
        JOIN QUIZ q
          ON q.Cour_id = i.Cour_id
         AND q.Lect_id = i.Lect_id
         AND q.Quiz_id = i.Quiz_id

        CROSS APPLY (
            SELECT COUNT(*) AS NumAttempts
            FROM ATTEMPT a
            WHERE a.Stu_id  = i.Stu_id
              AND a.Cour_id = i.Cour_id
              AND a.Lect_id = i.Lect_id
              AND a.Quiz_id = i.Quiz_id
        ) A
        WHERE A.NumAttempts > q.Attempts
    )
    BEGIN
        DECLARE @StuId    CHAR(10);
        DECLARE @FullName NVARCHAR(201);

        SELECT TOP 1 @StuId = i.Stu_id
        FROM INSERTED i;

        SELECT @FullName = u.L_name + N' ' + u.F_name
        FROM STUDENT s
        JOIN [USER] u
          ON u.User_id = s.Student_id
        WHERE s.Student_id = @StuId;

        IF @FullName IS NULL
            SET @FullName = N'Unknown student';

        RAISERROR(
            N'Error: Student %s has exceeded the maximum allowed number of attempts for this quiz.',
            16, 1,
            @FullName
        );

        ROLLBACK TRANSACTION;
        RETURN;
    END;
END;
GO

---------------------TEST 1----------------------
BEGIN TRAN;

SELECT *
FROM QUIZ
WHERE Cour_id = 'C000000001'
  AND Lect_id = 'L000000003'
  AND Quiz_id = 'Q000000001';

SELECT *
FROM ATTEMPT
WHERE Stu_id  = 'U000000006'
  AND Cour_id = 'C000000001'
  AND Lect_id = 'L000000003'
  AND Quiz_id = 'Q000000001';
GO

INSERT INTO ATTEMPT
    (Stu_id, Cour_id, Lect_id, Quiz_id, Attempt_id, Score, [Date], Start_time, Duration)
VALUES
    ('U000000006', 'C000000001', 'L000000003', 'Q000000001',
     2, 8.00, CAST(GETDATE() AS DATE), '11:00:00', 5);

SELECT *
FROM ATTEMPT
WHERE Stu_id  = 'U000000006'
  AND Cour_id = 'C000000001'
  AND Lect_id = 'L000000003'
  AND Quiz_id = 'Q000000001';
GO

ROLLBACK TRAN;
GO

---------------------TEST 2----------------------
BEGIN TRAN;

SELECT *
FROM QUIZ
WHERE Cour_id = 'C000000001'
  AND Lect_id = 'L000000001'
  AND Quiz_id = 'Q000000001';

SELECT *
FROM ATTEMPT
WHERE Stu_id  = 'U000000006'
  AND Cour_id = 'C000000001'
  AND Lect_id = 'L000000001'
  AND Quiz_id = 'Q000000001';
GO

INSERT INTO ATTEMPT
    (Stu_id, Cour_id, Lect_id, Quiz_id, Attempt_id, Score, [Date], Start_time, Duration)
VALUES
    ('U000000006', 'C000000001', 'L000000001', 'Q000000001',
     2, 8.00, CAST(GETDATE() AS DATE), '11:00:00', 5);

SELECT *
FROM ATTEMPT
WHERE Stu_id  = 'U000000006'
  AND Cour_id = 'C000000001'
  AND Lect_id = 'L000000001'
  AND Quiz_id = 'Q000000001';
GO

ROLLBACK TRAN;
GO

------------------------
-- Task 2.2.2
------------------------
GO
CREATE OR ALTER TRIGGER trg_UpdateStudentFinalScore
ON ATTEMPT
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @AffectList TABLE
    (
        Stu_id  VARCHAR(10),
        Cour_id VARCHAR(10)
    );

    INSERT INTO @AffectList (Stu_id, Cour_id)
    SELECT Stu_id, Cour_id FROM inserted
    UNION
    SELECT Stu_id, Cour_id FROM deleted;

    IF NOT EXISTS (SELECT 1 FROM @AffectList)
        RETURN;

    UPDATE R
    SET Final_score =
        ISNULL((
            SELECT CAST(AVG(QuizEffectScore) AS DECIMAL(4,2))
            FROM (
                SELECT
                    CASE
                        WHEN q.Grading = 'MAX' THEN MAX(a.Score)
                        WHEN q.Grading = 'AVG' THEN AVG(a.Score)
                        WHEN q.Grading = 'LAST' THEN (
                            SELECT TOP 1 sub.Score
                            FROM ATTEMPT sub
                            WHERE sub.Stu_id  = a.Stu_id
                              AND sub.Cour_id = a.Cour_id
                              AND sub.Lect_id = a.Lect_id
                              AND sub.Quiz_id = a.Quiz_id
                            ORDER BY sub.Attempt_id DESC
                        )
                        ELSE MAX(a.Score)
                    END AS QuizEffectScore
                FROM ATTEMPT a
                JOIN QUIZ q
                  ON  a.Cour_id = q.Cour_id
                  AND a.Lect_id = q.Lect_id
                  AND a.Quiz_id = q.Quiz_id
                WHERE a.Stu_id  = R.Stu_id
                  AND a.Cour_id = R.Cour_id
                GROUP BY a.Stu_id,
                         a.Cour_id,
                         a.Lect_id,
                         a.Quiz_id,
                         q.Grading
            ) AS Calc
        ), 0)
    FROM REGISTER R
    JOIN @AffectList A
      ON R.Stu_id  = A.Stu_id
     AND R.Cour_id = A.Cour_id;
END;
GO

-----------------------------------------------------------
-- TEST 1: Test INSERT
BEGIN TRAN;

SELECT * FROM REGISTER
WHERE Stu_id = 'U000000006'
  AND Cour_id = 'C000000001';

SELECT *
FROM QUIZ
WHERE Cour_id = 'C000000001'
  AND Lect_id = 'L000000003'
  AND Quiz_id = 'Q000000001';

INSERT INTO ATTEMPT
    (Stu_id, Cour_id, Lect_id, Quiz_id, Attempt_id, Score, [Date], Start_time, Duration)
VALUES
    ('U000000006', 'C000000001', 'L000000003', 'Q000000001',
     2, 8.00, CAST(GETDATE() AS DATE), '11:00:00', 5);

SELECT *
FROM ATTEMPT
WHERE Stu_id  = 'U000000006'
  AND Cour_id = 'C000000001'
  AND Lect_id = 'L000000003'
  AND Quiz_id = 'Q000000001';
GO

SELECT * FROM REGISTER
WHERE Stu_id = 'U000000006'
  AND Cour_id = 'C000000001';

SELECT Final_score AS After_Delete 
FROM REGISTER
WHERE Stu_id = 'U000000006'
  AND Cour_id = 'C000000001';
GO

ROLLBACK TRAN;
GO

-----------------------------------------------------------

-- TEST 2: Test UPDATE – đổi điểm attempt cuối
BEGIN TRAN;

SELECT * FROM REGISTER
WHERE Stu_id = 'U000000006'
  AND Cour_id = 'C000000001';
GO

SELECT *
FROM ATTEMPT
WHERE Stu_id  = 'U000000006'
  AND Cour_id = 'C000000001'
  AND Lect_id = 'L000000003'
  AND Quiz_id = 'Q000000001';
GO

UPDATE ATTEMPT
SET Score = 10.00
WHERE Stu_id='U000000006'
  AND Cour_id='C000000001'
  AND Lect_id='L000000003'
  AND Quiz_id='Q000000001'
  AND Attempt_id = 1;
GO

SELECT *
FROM ATTEMPT
WHERE Stu_id  = 'U000000006'
  AND Cour_id = 'C000000001'
  AND Lect_id = 'L000000003'
  AND Quiz_id = 'Q000000001';
GO

SELECT * FROM REGISTER
WHERE Stu_id = 'U000000006'
  AND Cour_id = 'C000000001';

SELECT Final_score AS After_Delete 
FROM REGISTER
WHERE Stu_id = 'U000000006'
  AND Cour_id = 'C000000001';
GO

ROLLBACK TRAN;
GO

-----------------------------------------------------------

-- TEST 3: Test DELETE – xóa attempt → Final_score tính lại
BEGIN TRAN;

SELECT *
FROM ATTEMPT
WHERE Stu_id  = 'U000000006'
  AND Cour_id = 'C000000001'
  AND Lect_id = 'L000000003'
  AND Quiz_id = 'Q000000001';
GO

SELECT Final_score AS Before_Delete 
FROM REGISTER
WHERE Stu_id = 'U000000006'
  AND Cour_id = 'C000000001';
GO

DELETE FROM ATTEMPT
WHERE Stu_id  = 'U000000006'
  AND Cour_id = 'C000000001'
  AND Lect_id = 'L000000003'
  AND Quiz_id = 'Q000000001'
  AND Attempt_id = 1;
GO

SELECT Final_score AS After_Delete
FROM REGISTER
WHERE Stu_id='U000000006' AND Cour_id='C000000001';
GO

ROLLBACK TRAN;

-----------------------------------------------------------