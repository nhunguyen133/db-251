CREATE DATABASE Educity
GO

USE Educity
GO

/*
-- =============================================
-- CREATE DATABASE - TABLE - CONSTRAINT
-- =============================================
*/ 

CREATE TABLE [USER] (
	[User_id]		CHAR(10)		PRIMARY KEY,
	F_name			VARCHAR(20)		NOT NULL,
	L_name			VARCHAR(100)	NOT NULL,
	Phone			CHAR(10)		NOT NULL,
	Date_join		DATE			NOT NULL DEFAULT GETDATE(),
	Email			VARCHAR(64)		UNIQUE NOT NULL,
	[Password]		VARCHAR(64)		NOT NULL,
	CONSTRAINT CK_Phone CHECK(Phone LIKE '0[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'),
	CONSTRAINT CK_Date CHECK (Date_join <= CAST(GETDATE() AS DATE)),
	CONSTRAINT CK_Email CHECK (Email LIKE '%_@_%.com'),
	CONSTRAINT CK_Password CHECK (
		LEN([Password]) >= 8
		AND PATINDEX('%[A-Z]%', [Password] COLLATE Latin1_General_CS_AS) > 0
		AND PATINDEX('%[a-z]%', [Password] COLLATE Latin1_General_CS_AS) > 0
		AND PATINDEX('%[0-9]%', [Password]) > 0
	)
);
GO

CREATE TABLE TEACHER (
	Teacher_id		CHAR(10)		PRIMARY KEY,
	Expertise		VARCHAR(100),
	Bank_name		VARCHAR(100)	NOT NULL,
	Account_num		VARCHAR(30)		NOT NULL,
	Revenue			DECIMAL(12,2)	DEFAULT 0.00,
	CONSTRAINT FK_TEA_USER FOREIGN KEY (Teacher_id) REFERENCES [USER](User_id)
);
GO

CREATE TABLE TEACHER_QUALIFICATIONS (
	Tea_id			CHAR(10)		NOT NULL,
	Qualification	VARCHAR(150),
	PRIMARY KEY (Tea_id, Qualification),
	CONSTRAINT FK_QUALI_TEA FOREIGN KEY (Tea_id) REFERENCES TEACHER(Teacher_id)
);
GO

CREATE TABLE COURSE (
	Course_id		CHAR(10)		PRIMARY KEY,
	Tea_id			CHAR(10)		NOT NULL,
	Cour_name		VARCHAR(200)	NOT NULL,
	[Description]	VARCHAR(1000),
	Min_avg_score	FLOAT			NOT NULL,
	Price			FLOAT			NOT NULL,
	[Language]		VARCHAR(50),
	Num_student		INT,
	Rating_avg		FLOAT,
	Num_lecture		INT,
	Total_time		INT,
	Date_public		DATE,

	CONSTRAINT CK_Min_avg_score CHECK(Min_avg_score BETWEEN 0 AND 10),
	CONSTRAINT CK_Price CHECK(Price >= 0),
	CONSTRAINT CK_Num_student CHECK(Num_student >= 0 ),
	CONSTRAINT CK_Rating_avg CHECK(Rating_avg BETWEEN 1 AND 5),
	CONSTRAINT CK_Num_lecture CHECK(Num_lecture >= 0),
	CONSTRAINT CK_Total_time CHECK(Total_time > 0),
	CONSTRAINT PK_COURSE_TEACHER FOREIGN KEY (Tea_id) REFERENCES TEACHER(Teacher_id)
);
---D?n xu?t: Rating_avg, Num_student, Total_time
GO

CREATE TABLE [CERTIFICATE] (
	Cer_id			CHAR(15)		PRIMARY KEY,
	Cer_name		VARCHAR(100)	NOT NULL,
	Cour_id			CHAR(10)		NOT NULL,
	CONSTRAINT FK_CER_COUR FOREIGN KEY (Cour_id) REFERENCES COURSE(Course_id)
			ON DELETE CASCADE
);
GO

CREATE TABLE STUDENT (
	Student_id				CHAR(10)		PRIMARY KEY,
	Num_register_courses	INT,
	Num_finished_courses	INT,

	CONSTRAINT CK_Num_register_courses CHECK(Num_register_courses >= 0),
	CONSTRAINT CK_Num_finished_courses CHECK(Num_finished_courses >= 0),
	CONSTRAINT FK_STUDENT_USER FOREIGN KEY (Student_id) REFERENCES [USER](User_id)
);
---D?n xu?t: Num_finished_courses, Num_register_courses -> công th?c tính?
GO

CREATE TABLE COURSE_TOPIC (
    Cour_id			CHAR(10)		NOT NULL,
    Topic			VARCHAR(50)		NOT NULL,
    CONSTRAINT PK_COURSE_TOPIC PRIMARY KEY (Cour_id, Topic),
    CONSTRAINT FK_COURSE_TOPIC_COURSE FOREIGN KEY (Cour_id) REFERENCES COURSE(Course_id)
			ON DELETE CASCADE
);
GO

CREATE TABLE LECTURE (
    Cour_id         CHAR(10)		NOT NULL,
    Lecture_id      CHAR(10)		NOT NULL,
    [Time]          INT				NOT NULL,
    Lect_name       VARCHAR(200)	NOT NULL,
    Document_link   VARCHAR(1000),

    CONSTRAINT PK_LECTURE PRIMARY KEY (Cour_id, Lecture_id),
    CONSTRAINT CK_LECTURE_Time CHECK (Time > 0),
    CONSTRAINT FK_LECTURE_COURSE FOREIGN KEY (Cour_id) REFERENCES COURSE(Course_id)
			ON DELETE CASCADE
);
GO

CREATE TABLE REGISTER (
    Stu_id              CHAR(10)		NOT NULL,
    Cour_id             CHAR(10)		NOT NULL,
    Date_reg            DATE            NOT NULL,
    Payment_status      VARCHAR(50)		DEFAULT 'pending',
    Learning_progress   INT             DEFAULT 0,
	Final_score			DECIMAL(4,2)	DEFAULT 0,

    CONSTRAINT CK_REGISTER_FinalScore
        CHECK (Final_score >= 0 AND Final_score <= 10),

    CONSTRAINT PK_REGISTER PRIMARY KEY (Stu_id, Cour_id),
    CONSTRAINT CK_REGISTER_LearningProgress CHECK (Learning_progress BETWEEN 0 AND 100),
    CONSTRAINT FK_REGISTER_STUDENT FOREIGN KEY (Stu_id) REFERENCES STUDENT(Student_id),
    CONSTRAINT FK_REGISTER_COURSE FOREIGN KEY (Cour_id) REFERENCES COURSE(Course_id)
			ON DELETE CASCADE
);
GO

CREATE TABLE FEEDBACK (
    Stu_id      CHAR(10)		NOT NULL,
    Cour_id     CHAR(10)		NOT NULL,
    Rating      INT             NOT NULL,
    Comment     VARCHAR(3000),
    Date_rat    DATE            DEFAULT GETDATE(),

    CONSTRAINT PK_FEEDBACK PRIMARY KEY (Stu_id, Cour_id),
    CONSTRAINT CK_FEEDBACK_Rating CHECK (Rating BETWEEN 1 AND 5),
    CONSTRAINT CK_FEEDBACK_Comment CHECK (Comment IS NULL OR LEN(Comment) >= 20),
    CONSTRAINT FK_FEEDBACK_STUDENT FOREIGN KEY (Stu_id) REFERENCES STUDENT(Student_id),
    CONSTRAINT FK_FEEDBACK_COURSE FOREIGN KEY (Cour_id) REFERENCES COURSE(Course_id)
			ON DELETE CASCADE
);
GO

CREATE TABLE [RECEIVE] (
	Cer_id			CHAR(15)	NOT NULL,
	Stu_id			CHAR(10)	NOT NULL,
	Issue_date		DATE		NOT NULL,

	CONSTRAINT PK_RECEIVE PRIMARY KEY (Stu_id, Cer_id),
	CONSTRAINT FK_RECEIVE_STUDENT FOREIGN KEY (Stu_id) REFERENCES STUDENT(Student_id),
	CONSTRAINT FK_RECEIVE_CERT FOREIGN KEY (Cer_id) REFERENCES CERTIFICATE(Cer_id)
			ON DELETE CASCADE
);
GO

CREATE TABLE [ADMIN] (
    Admin_id		CHAR(10)			NOT NULL,
    Admin_email     VARCHAR(64)			NOT NULL,
    F_name          VARCHAR(20)			NOT NULL,
    L_name          VARCHAR(100)		NOT NULL,
    
    PRIMARY KEY(Admin_id),
    UNIQUE(Admin_email),
	CONSTRAINT CK_Ad_Email_Format CHECK (Admin_email LIKE '%_@_%.com')
);
GO

CREATE TABLE APPROVE (
	Cour_id			CHAR(10)			NOT NULL,
	Ad_id			CHAR(10)			NOT NULL,

	PRIMARY KEY(Cour_id, Ad_id),
	FOREIGN KEY(Cour_id) REFERENCES COURSE(Course_id)
			ON DELETE CASCADE,
	FOREIGN KEY(Ad_id) REFERENCES ADMIN(Admin_id)
);
GO

CREATE TABLE LECT_REQUIRE (
	Pre_lect_cou_id		CHAR(10)			NOT NULL,
	Pre_lect_id			CHAR(10)			NOT NULL,
	Post_lect_cou_id	CHAR(10)			NOT NULL,
	Post_lect_id		CHAR(10)			NOT NULL,

	PRIMARY KEY(Pre_lect_cou_id, Pre_lect_id, Post_lect_cou_id, Post_lect_id),
	CONSTRAINT CK_Pre_Post CHECK (Pre_lect_cou_id = Post_lect_cou_id),
	FOREIGN KEY(Pre_lect_cou_id, Pre_lect_id) REFERENCES LECTURE(Cour_id, Lecture_id)
			ON DELETE CASCADE,
	FOREIGN KEY(Post_lect_cou_id, Post_lect_id) REFERENCES LECTURE(Cour_id, Lecture_id)
);
GO

CREATE TABLE QUIZ (
	Cour_id				CHAR(10)			NOT NULL,
	Lect_id				CHAR(10)			NOT NULL,
	Quiz_id				CHAR(10)			NOT NULL,
	Q_name				VARCHAR(200)		NOT NULL,
	Q_duration			INT					NOT NULL,
	Attempts			INT					DEFAULT 1,
	Grading				VARCHAR(4)			DEFAULT 'MAX',

	PRIMARY KEY(Cour_id, Lect_id, Quiz_id),
	FOREIGN KEY(Cour_id, Lect_id) REFERENCES LECTURE(Cour_id, Lecture_id)
			ON DELETE CASCADE,

	CONSTRAINT QDuration CHECK (Q_duration >= 0),
	CONSTRAINT QAttempts CHECK (Attempts >= 1),
	CONSTRAINT QGrading CHECK (Grading IN ('MAX', 'AVG', 'LAST'))
);
GO

CREATE TABLE QUESTION (
    Cour_id         CHAR(10)            NOT NULL,
    Lect_id         CHAR(10)			NOT NULL,
    Quiz_id         CHAR(10)			NOT NULL,
    Ques_id         CHAR(10)			NOT NULL,
    Content         VARCHAR(500)        NOT NULL,
    Answer          VARCHAR(255)        NOT NULL,

    CONSTRAINT PK_QUESTION PRIMARY KEY (Cour_id, Lect_id, Quiz_id, Ques_id),
    CONSTRAINT FK_QS_QUIZ FOREIGN KEY (Cour_id, Lect_id, Quiz_id)
			REFERENCES QUIZ(Cour_id, Lect_id, Quiz_id)
			ON DELETE CASCADE,
    CONSTRAINT CK_QS_ContentLen CHECK (LEN(Content) >= 10)
);
GO

CREATE TABLE [OPTION] (
    Cour_id         CHAR(10)            NOT NULL,
    Lect_id         CHAR(10)            NOT NULL,
    Quiz_id         CHAR(10)            NOT NULL,
    Q_id            CHAR(10)            NOT NULL,
    [Option]        VARCHAR(255)        NOT NULL,

    CONSTRAINT PK_OPTION PRIMARY KEY (Cour_id, Lect_id, Quiz_id, Q_id, [Option]),
    CONSTRAINT FK_OP_QUESTION FOREIGN KEY (Cour_id, Lect_id, Quiz_id, Q_id)
			REFERENCES QUESTION(Cour_id, Lect_id, Quiz_id, Ques_id)
			ON DELETE CASCADE
);
GO

CREATE TABLE ATTEMPT (
    Cour_id         CHAR(10)            NOT NULL,
    Lect_id         CHAR(10)            NOT NULL,
    Quiz_id         CHAR(10)            NOT NULL,
	Stu_id			CHAR(10)			NOT NULL,
    Attempt_id      INT					NOT NULL DEFAULT 1,
    Score			DECIMAL(4,2)		NOT NULL,
	[Date]			DATE				NOT NULL,
	Start_time		TIME				NOT NULL,
    Duration		INT					NOT NULL DEFAULT 0,

    CONSTRAINT PK_ATTEMPT 
        PRIMARY KEY (Stu_id, Cour_id, Lect_id, Quiz_id, Attempt_id),

    CONSTRAINT FK_ATTEMPT_QUIZ FOREIGN KEY (Cour_id, Lect_id, Quiz_id)
        REFERENCES QUIZ(Cour_id, Lect_id, Quiz_id)
        ON DELETE CASCADE,

    CONSTRAINT FK_ATTEMPT_STU FOREIGN KEY (Stu_id)
        REFERENCES STUDENT(Student_id),

    CONSTRAINT CK_ATTEMPT_ScoreRange CHECK (Score BETWEEN 0 AND 10),
    CONSTRAINT CK_ATTEMPT_Date CHECK ([Date] <= CAST(GETDATE() AS DATE)),
    CONSTRAINT CK_ATTEMPT_Duration CHECK (Duration >= 0)
);
GO

/*
-- ===================================================================================================================================================
-- CREATE DATA
-- ===================================================================================================================================================
*/


INSERT INTO [ADMIN] (Admin_id, Admin_email, F_name, L_name)
VALUES
('A000000001', 'admin1@educity.com', 'Nhu', 'Nguyen Quynh'),
('A000000002', 'admin2@educity.com', 'Nhi', 'Tran Duong Khiet'),
('A000000003', 'admin3@educity.com', 'An', 'Tran Khanh'),
('A000000004', 'admin4@educity.com', 'Thu', 'Ho Thi Minh'),
('A000000005', 'admin5@educity.com', 'Manh', 'Tran Duc');
GO

-- ========================== SEED USER + STUDENT ==========================

-- B?ng Firstname
DECLARE @Fname TABLE (value VARCHAR(50));
INSERT INTO @Fname VALUES
('Thao'),('Tu'),('Hoai'),('Thu'),('Nhu'),('Nhi'),('An'),('Binh'),
('Kien'),('Kiet'),('Hoang'),('Thanh'),('Trang'),('Binh'),('Thien');

-- B?ng Lastname
DECLARE @Lname TABLE (value VARCHAR(50));
INSERT INTO @Lname VALUES
('Nguyen'),('Ho'),('Le'),('Tran'),('Dang'),('Ly'),('Truong'),('Pham'),
('Phan'),('Do'),('Ngo'),('Phung'),('Dinh'),('Vo'),('Doan');

DECLARE @i INT = 1;
WHILE @i <= 100
BEGIN
    DECLARE @F VARCHAR(50) = (SELECT TOP 1 value FROM @Fname ORDER BY NEWID());
    DECLARE @L VARCHAR(50) = (SELECT TOP 1 value FROM @Lname ORDER BY NEWID());

    -- Random ngày (trong vòng 3 n?m tr? l?i)
    DECLARE @Date DATE = DATEADD(DAY, -ABS(CHECKSUM(NEWID())) % 1000, GETDATE());

    INSERT INTO [USER] (user_id, F_name, L_name, phone, date_join, email, [password])
    VALUES (
        CONCAT('U', RIGHT('000000000' + CAST(@i AS VARCHAR), 9)), 
        @F,
        @L,
        CONCAT('090', RIGHT('0000000' + CAST(@i AS VARCHAR), 7)), 
        @Date,
        CONCAT(@F,@L,@i,'@mail.com'),
        'Password1!'
    );

    SET @i = @i + 1;
END;
GO

--=================================TEACHER====================================
-- danh sách chuyên môn
DECLARE @Expert TABLE (value VARCHAR(100));
INSERT INTO @Expert VALUES
('Computer Science'),('Artificial Intelligence'),('Machine Learning'),
('Deep Learning'),('Data Science'),('Cyber Security'),('Web Development'),
('Mobile Development'),('Database System'),('Cloud Computing'),
('Embedded System'),('Software Engineering'),('DevOps'),('Blockchain'),
('Graphics & Vision'),('Game Development'),('Network Administration'),
('Operating System'),('Information System'),('IoT Development');

-- danh sách ngân hàng
DECLARE @Bank TABLE (value VARCHAR(100));
INSERT INTO @Bank VALUES
('Vietcombank'),('Vietinbank'),('BIDV'),('Techcombank'),('ACB'),
('MB Bank'),('Agribank'),('Sacombank'),('VPBank'),('TPBank');

DECLARE @i_t INT = 1;
DECLARE @max INT = 25;

DECLARE @uid CHAR(10);
DECLARE @expert_t VARCHAR(100);
DECLARE @bank_t VARCHAR(100);
DECLARE @acc VARCHAR(20);

WHILE @i_t <= @max
BEGIN
    -- random user_id (khi không thu?c teacher)
    SELECT TOP 1 @uid = user_id
    FROM [USER] U
    WHERE NOT EXISTS (SELECT 1 FROM TEACHER T WHERE T.Teacher_id = U.user_id)
    ORDER BY NEWID();

	-- n?u không còn user nào th?a => thoát vòng
    IF @uid IS NULL
    BEGIN
        PRINT 'No more users available to create new teachers.';
        BREAK;
    END

    -- random chuyên môn
    SELECT TOP 1 @expert_t = value FROM @Expert ORDER BY NEWID();

    -- random ngân hàng
    SELECT TOP 1 @bank_t = value FROM @Bank ORDER BY NEWID();

    -- random s? tài kho?n
    SET @acc = CONCAT(
        'AC',
        RIGHT('000000000' + CAST(ABS(CHECKSUM(NEWID())) % 999999999 AS VARCHAR), 9)
    );

    -- insert vào TEACHER
    INSERT INTO TEACHER(Teacher_id, Expertise, Bank_name, Account_num, Revenue)
    VALUES (@uid, @expert_t, @bank_t, @acc, NULL);

    SET @i_t += 1;
END;
GO

--========================================TEACHER_QUALIFICATIONS=======================================================

-- B?ng danh sách các qualification có th? có
DECLARE @Qual TABLE (value VARCHAR(150));
INSERT INTO @Qual VALUES
('Bachelor in Computer Science'),
('Master in Artificial Intelligence'),
('PhD in Machine Learning'),
('Certification in Data Science'),
('Certification in Cyber Security'),
('Certification in Cloud Computing'),
('Bachelor in Software Engineering'),
('Master in Information Systems'),
('PhD in Embedded Systems'),
('Certification in Web Development'),
('Certification in Mobile Development'),
('Certificate in Network Administration'),
('Certification in DevOps'),
('Certification in Blockchain'),
('Certificate in IoT Development');

-- L?y danh sách Teacher_id t? b?ng TEACHER
DECLARE @Teachers TABLE (Tea_id CHAR(10));
INSERT INTO @Teachers (Tea_id)
SELECT Teacher_id FROM TEACHER;

-- Bi?n s? d?ng trong quá trình seed
DECLARE @Tea_id CHAR(10);
DECLARE @NumQual INT;
DECLARE @q VARCHAR(150);

-- Cursor duy?t t?ng giáo viên
DECLARE Teacher_Cursor CURSOR FOR
SELECT Tea_id FROM @Teachers;

OPEN Teacher_Cursor;
FETCH NEXT FROM Teacher_Cursor INTO @Tea_id;

WHILE @@FETCH_STATUS = 0
BEGIN
    -- Random s? l??ng qualification (1–3)
    SET @NumQual = 1 + ABS(CHECKSUM(NEWID())) % 3;

    DECLARE @i_c INT = 1;

    WHILE @i_c <= @NumQual
    BEGIN
     
        SET @q = (
            SELECT TOP 1 value 
            FROM @Qual 
            ORDER BY NEWID()
        );

        -- Ch? insert n?u ch?a t?n t?i 
        IF NOT EXISTS (
            SELECT 1
            FROM TEACHER_QUALIFICATIONS
            WHERE Tea_id = @Tea_id AND Qualification = @q
        )
        BEGIN
            INSERT INTO TEACHER_QUALIFICATIONS (Tea_id, Qualification)
            VALUES (@Tea_id, @q);
        END
        
        SET @i_c = @i_c + 1;
    END

    FETCH NEXT FROM Teacher_Cursor INTO @Tea_id;
END

CLOSE Teacher_Cursor;
DEALLOCATE Teacher_Cursor;
GO

--========================================COURSE==============================================

DECLARE @y INT = 1;
DECLARE @max1 INT = 100;
DECLARE @Teach_id CHAR(10);
DECLARE @CourseName VARCHAR(200);
DECLARE @Description VARCHAR(1000);
DECLARE @Language VARCHAR(50);
DECLARE @Price FLOAT;
DECLARE @MinAvgScore FLOAT;
DECLARE @DatePublic DATE;

-- Ch? ?? khoá h?c
DECLARE @Subject TABLE (Name VARCHAR(100));
INSERT INTO @Subject VALUES
('Python Programming'),('Machine Learning'),('Web Development'),
('Mobile App Development'),('Data Structures'),
('Network Security'),('Database Design'),('Cloud Computing'),
('Deep Learning'),('Algorithms'),('UI/UX Design'),
('Cyber Security'),('C# OOP Fundamentals'),('Java Backend'),
('Frontend ReactJS'),('Game Development Unity'),
('Operating System Basics'),('Data Visualization'),
('Big Data Analytics'),('DevOps Deployment');

-- Level khóa h?c
DECLARE @Level TABLE (Lv VARCHAR(50));
INSERT INTO @Level VALUES ('Beginner'),('Intermediate'),('Advanced'),('Masterclass');

-- Ngôn ng?
DECLARE @Lang TABLE (value VARCHAR(50));
INSERT INTO @Lang VALUES ('English'),('Vietnamese'),('French'),('Japanese'),('Chinese');

WHILE @y <= @max1
BEGIN
    -- Random giáo viên
    SELECT TOP 1 @Teach_id = Teacher_id FROM TEACHER ORDER BY NEWID();

    -- Random tên khóa h?c có ý ngh?a
    DECLARE @sub VARCHAR(100), @lv VARCHAR(50);
    SELECT TOP 1 @sub = Name FROM @Subject ORDER BY NEWID();
    SELECT TOP 1 @lv = Lv FROM @Level ORDER BY NEWID();
    SELECT TOP 1 @Language = value FROM @Lang ORDER BY NEWID();

    SET @CourseName = @lv + ' ' + @sub;  
    SET @Description = CONCAT(
        'This course "', @CourseName, '" provides fundamental to advanced knowledge. ',
        'Students will learn practical skills through examples, exercises, and real projects.'
    );

    -- Giá khóa h?c 
    IF ABS(CHECKSUM(NEWID())) % 100 < 5      -- 5% free
		SET @Price = 0;
	ELSE
		SET @Price = (100000 + ABS(CHECKSUM(NEWID())) % 900001) / 1000 * 1000;

    -- ?i?m trung bình yêu c?u t? 5.0 -> 7.0
	SET @MinAvgScore = CAST(ROUND((50 + ABS(CHECKSUM(NEWID())) % 21) / 10.0, 1) AS FLOAT);

    -- Random ngày public trong 2 n?m g?n nh?t
    SET @DatePublic = DATEADD(DAY, -ABS(CHECKSUM(NEWID())) % 730, GETDATE());

    INSERT INTO COURSE(
        Course_id, Tea_id, Cour_name, [Description], Min_avg_score, Price, [Language],
        Num_student, Rating_avg, Num_lecture, Total_time, Date_public
    )
    VALUES(
        CONCAT('C', RIGHT('000000000' + CAST(@y AS VARCHAR), 9)),
        @Teach_id,
        @CourseName,
        @Description,
        @MinAvgScore,
        @Price,
        @Language,
        NULL,
        NULL,
        NULL,
        NULL,
        @DatePublic
    );

    SET @y += 1;
END;
GO

--========================================APPROVE=============================================

INSERT INTO APPROVE (Cour_id, Ad_id)
SELECT 
    C.Course_id,
    A.Admin_id
FROM 
(
    SELECT 
        Course_id,
        ROW_NUMBER() OVER (ORDER BY Course_id) AS rn
    FROM COURSE
) C
JOIN 
(
    SELECT 
        Admin_id,
        ROW_NUMBER() OVER (ORDER BY NEWID()) AS rn
    FROM ADMIN
) A
    ON (C.rn % (SELECT COUNT(*) FROM ADMIN)) + 1 = A.rn;
GO

--============================================STUDENT===========================================

INSERT INTO STUDENT (Student_id)
SELECT TOP 100
    U.User_id
FROM [USER] U
WHERE NOT EXISTS (
    SELECT 1 
    FROM STUDENT S
    WHERE S.Student_id = U.User_id
)
ORDER BY NEWID();  -- random
GO

--==============================================TOPIC============================================

DECLARE @Topics TABLE (value VARCHAR(50));
INSERT INTO @Topics VALUES
('Programming'), ('Data Science'), ('AI Basics'), ('Machine Learning'), ('Deep Learning'),
('Web Development'), ('Mobile Development'), ('Database'), ('Cloud Computing'), ('Cyber Security'),
('Software Engineering'), ('DevOps'), ('Computer Vision'), ('Blockchain'), ('IoT'),
('Networking'), ('Game Development'), ('Operating System'), ('Information System'), ('Algorithms');

INSERT INTO COURSE_TOPIC (Cour_id, Topic)
SELECT 
    C.Course_id,
    SelectedTopics.value
FROM COURSE C

CROSS APPLY (
    SELECT TOP (1 + ABS(CHECKSUM(NEWID())) % 4) value 
    FROM @Topics
    ORDER BY NEWID() 
) AS SelectedTopics

WHERE NOT EXISTS (
    SELECT 1 FROM COURSE_TOPIC CT 
    WHERE CT.Cour_id = C.Course_id AND CT.Topic = SelectedTopics.value
);
GO

--==================================================LECTURE================================================

DECLARE @LectureTitle TABLE (title VARCHAR(200));
INSERT INTO @LectureTitle VALUES
('Introduction'), ('Fundamental Concepts'), ('Core Techniques'), ('Deep Dive Theory'),
('Hands-on Practice'), ('Important Algorithms'), ('Real-World Applications'), ('Common Mistakes'),
('Advanced Methods'), ('Optimization Strategies'), ('Practical Workshop'), ('System Architecture'),
('Performance Tuning'), ('Security Considerations'), ('Design Principles'), ('Case Study'),
('Testing & Debugging'), ('Deployment Guide'), ('Best Practices'), ('Summary & Conclusion');


INSERT INTO LECTURE (Cour_id, Lecture_id, [Time], Lect_name, Document_link)
SELECT 
    C.Course_id,

    CONCAT('L', RIGHT('000000000' + CAST(Nums.n AS VARCHAR), 9)) AS Lecture_id,
    
    8 + ABS(CHECKSUM(NEWID(), C.Course_id, Nums.n)) % 33 AS [Time],
    
  
    CONCAT(T.title, ' - ', C.Cour_name) AS Lect_name,
    
    CASE 
        WHEN (ABS(CHECKSUM(NEWID(), C.Course_id, Nums.n)) % 10) < 3 THEN NULL
        ELSE CONCAT('https://materials.courses.com/', 
                    RTRIM(C.Course_id), '/', 
                    CONCAT('L', RIGHT('000000000' + CAST(Nums.n AS VARCHAR), 9)), 
                    '-', REPLACE(T.title, ' ', '_'), '.pdf')
    END AS Document_link

FROM COURSE C

CROSS APPLY (
    SELECT 6 + ABS(CHECKSUM(NEWID(), C.Course_id)) % 13 AS Limit
) AS RandomCount

CROSS APPLY (
    SELECT n FROM (VALUES 
        (1), (2), (3), (4), (5), (6), (7), (8), (9), (10),
        (11), (12), (13), (14), (15), (16), (17), (18)
    ) AS v(n)
    WHERE v.n <= RandomCount.Limit
) AS Nums


CROSS APPLY (
    SELECT TOP 1 title 
    FROM @LectureTitle 
    ORDER BY CHECKSUM(NEWID(), C.Course_id, Nums.n)
) AS T;
GO
--==============================================LECTURE_REQUIRE==========================================

INSERT INTO LECT_REQUIRE (
    Pre_lect_cou_id, Pre_lect_id,
    Post_lect_cou_id, Post_lect_id
)
SELECT 
    Cour_id,           
    Lecture_id,        
    Cour_id,           
    Next_Lecture_id   
FROM (
    SELECT 
        Cour_id,
        Lecture_id,
        LEAD(Lecture_id) OVER (PARTITION BY Cour_id ORDER BY Lecture_id) AS Next_Lecture_id
    FROM LECTURE
) AS SortedLectures
WHERE Next_Lecture_id IS NOT NULL; 
GO

--====================================================QUIZ================================================

INSERT INTO QUIZ (Cour_id, Lect_id, Quiz_id, Q_name, Q_duration, Attempts, Grading) -- 1. Thêm Grading vào ?ây
SELECT 
    Final.Cour_id,
    Final.Lecture_id,
    
    CONCAT('Q', RIGHT('00000000' + CAST(Final.Quiz_Num AS VARCHAR), 9)) AS Quiz_id,

    CONCAT('Test Lec ', Final.Lect_Index, ': ', Final.Lect_name) AS Q_name,

    10 + ABS(CHECKSUM(NEWID())) % 21 AS Q_duration,

    1 + ABS(CHECKSUM(NEWID())) % 3 AS Attempts,

    CHOOSE(1 + ABS(CHECKSUM(NEWID())) % 3, 'MAX', 'AVG', 'LAST') AS Grading

FROM (
    SELECT 
        L.Cour_id,
        L.Lecture_id,
        L.Lect_name,
        
        DENSE_RANK() OVER (PARTITION BY L.Cour_id ORDER BY L.Lecture_id) AS Lect_Index,
        
        Gen_Nums.n AS Quiz_Num

    FROM LECTURE L
	CROSS APPLY (
		SELECT TOP (5 + ABS(CHECKSUM(NEWID())) % 6) n
		FROM (VALUES (1), (2), (3), (4), (5), (6), (7), (8), (9), (10)) AS v(n)
		ORDER BY n 
	) AS Gen_Nums
) AS Final;

GO

--===============================================QUESTION===========================================

INSERT INTO QUESTION (Cour_id, Lect_id, Quiz_id, Ques_id, Content, Answer)
SELECT 
    Final.Cour_id,
    Final.Lect_id,
    Final.Quiz_id,
    
    CONCAT('QS', RIGHT('00000000' + CAST(Final.Num AS VARCHAR), 8)) AS Ques_id,
    REPLACE(
        REPLACE(Template.Pattern, '{Q}', CAST(Final.Quiz_id AS VARCHAR(20))), 
        '{L}', CAST(Final.Lect_id AS VARCHAR(20))
    ) AS Content,
    
    CHAR(65 + ABS(CHECKSUM(NEWID())) % 4) AS Answer

FROM (
    SELECT 
        Q.Cour_id, 
        Q.Lect_id, 
        Q.Quiz_id,
        Numbers.n AS Num
    FROM QUIZ Q
    CROSS APPLY (
        SELECT TOP (1 + ABS(CHECKSUM(NEWID(), Q.Quiz_id)) % 5) n
        FROM (VALUES (1), (2), (3), (4), (5)) AS Num(n)
    ) AS Numbers
) AS Final

CROSS APPLY (
    SELECT TOP 1 Pattern
    FROM (VALUES 
        ('What is the main purpose of quiz {Q} in lecture {L}?'),
        ('Which statement is correct about quiz {Q} from lecture {L}?'),
        ('What concept is being tested in quiz {Q} of lecture {L}?'),
        ('Which option best describes the topic covered in quiz {Q} of lecture {L}?'),
        ('What should students learn from quiz {Q} in lecture {L}?'),
        ('Which of the following is true regarding quiz {Q} in lecture {L}?'),
        ('What knowledge area does quiz {Q} in lecture {L} focus on?'),
        ('Which choice is the correct answer for a question in quiz {Q} of lecture {L}?')
    ) AS T(Pattern)
   
    ORDER BY CHECKSUM(NEWID(), Final.Quiz_id, Final.Num)
) AS Template;
GO

--==============================================OPTIONS================================================

DECLARE @OptionTemplates TABLE (text VARCHAR(255));
INSERT INTO @OptionTemplates VALUES
('It provides an overview of the main topic.'),
('It introduces the fundamental concepts.'),
('It explains the purpose of the lesson.'),
('It describes a key technique related to the topic.'),
('It outlines a real-world application.'),
('It covers an advanced detail of the concept.'),
('It summarizes the important ideas.'),
('It identifies a common mistake students make.'),
('It gives an example related to the lesson.'),
('It defines the core principle behind the topic.'),
('It presents a typical use-case.'),
('It highlights an essential method or process.'),
('It explains when the concept should be applied.'),
('It compares different related ideas.'),
('It discusses an important limitation or constraint.');


INSERT INTO [OPTION] (Cour_id, Lect_id, Quiz_id, Q_id, [Option])
SELECT 
    Q.Cour_id,
    Q.Lect_id,
    Q.Quiz_id,
    Q.Ques_id,
    Ops.text AS [Option]
FROM QUESTION Q

CROSS APPLY (
    SELECT TOP 4 text
    FROM @OptionTemplates
    ORDER BY NEWID()
) AS Ops;
GO

--=====================================REGISTER=======================================

INSERT INTO REGISTER (Stu_id, Cour_id, Date_reg, Payment_status, Learning_progress, Final_score)
SELECT 
    S.Student_id,
    SelectedCourses.Course_id,
    
    -- Random Date c?ng c?n ph? thu?c vào Stu_id ?? m?i ng??i có ngày khác nhau
    DATEADD(DAY, ABS(CHECKSUM(NEWID(), S.Student_id)) % 700, '2024-01-01') AS Date_reg,
    
    'completed' AS Payment_status,
    NULL AS Learning_progress,
    0 AS Final_score

FROM STUDENT S

CROSS APPLY (
    
    SELECT TOP (ABS(CHECKSUM(NEWID(), S.Student_id)) % 16) 
           C.Course_id
    FROM COURSE C
  
    ORDER BY CHECKSUM(NEWID(), S.Student_id)
) AS SelectedCourses

WHERE NOT EXISTS (
    SELECT 1 FROM REGISTER R 
    WHERE R.Stu_id = S.Student_id 
      AND R.Cour_id = SelectedCourses.Course_id
);
GO

--==============================================ATTEMPT================================================
DECLARE @StudentBehavior TABLE (
    Stu_id CHAR(10),
    Cour_id CHAR(10),
    Date_reg DATE,
    Student_Type VARCHAR(20)
);

-- Phân lo?i student
INSERT INTO @StudentBehavior (Stu_id, Cour_id, Date_reg, Student_Type)
SELECT 
    Stu_id,
    Cour_id,
    Date_reg,
    CASE 
        WHEN (ABS(CHECKSUM(NEWID())) % 100) < 5 THEN 'PERFECT'          -- 5%
        WHEN (ABS(CHECKSUM(NEWID())) % 100) < 70 THEN 'HARD_WORKING'    -- 65%
        ELSE 'LAZY'                                                     -- 30%
    END
FROM REGISTER;


INSERT INTO ATTEMPT (
    Cour_id, Lect_id, Quiz_id, Stu_id, 
    Attempt_id, Score, [Date], Start_time, Duration
)
SELECT 
    Q.Cour_id,
    Q.Lect_id,
    Q.Quiz_id,
    SB.Stu_id,
    1 AS Attempt_id,

    CAST((ABS(CHECKSUM(NEWID())) % 1001) / 100.0 AS DECIMAL(4,2)) AS Score,

    DATEADD(DAY, 
        ABS(CHECKSUM(NEWID())) % (DATEDIFF(DAY, SB.Date_reg, GETDATE()) + 1),
        SB.Date_reg),

    TIMEFROMPARTS(
        ABS(CHECKSUM(NEWID())) % 24,
        ABS(CHECKSUM(NEWID())) % 60,
        0, 0, 0),

    ABS(CHECKSUM(NEWID())) % 56 + 5

FROM QUIZ Q
JOIN @StudentBehavior SB 
    ON SB.Cour_id = Q.Cour_id

WHERE 
    
      (SB.Student_Type = 'PERFECT' AND 1 = 1)

 OR (SB.Student_Type = 'HARD_WORKING' 
        AND (ABS(CHECKSUM(NEWID())) % 100) < 90)

 OR (SB.Student_Type = 'LAZY' 
        AND (ABS(CHECKSUM(NEWID())) % 100) < (40 + ABS(CHECKSUM(NEWID())) % 21));
GO

--===================================UPDATE LEARNING_PROGRESS=========================
UPDATE REGISTER
SET Learning_progress =
    CASE
        WHEN Final_score = 0 THEN 0  

        WHEN RAND(CHECKSUM(NEWID())) < 0.10 THEN       
            CAST(80 + RAND(CHECKSUM(NEWID())) * 20 AS INT)

        WHEN RAND(CHECKSUM(NEWID())) < 0.70 THEN      
            CAST(30 + RAND(CHECKSUM(NEWID())) * 50 AS INT) 

        ELSE                                           
            CAST(RAND(CHECKSUM(NEWID())) * 30 AS INT)     
    END;
GO



--==========================================FEEDBACK======================================================


DECLARE @Reg TABLE (Stu_id CHAR(10), Cour_id CHAR(10), Date_reg DATE);

INSERT INTO @Reg (Stu_id, Cour_id, Date_reg)
SELECT R.Stu_id, R.Cour_id, R.Date_reg
FROM REGISTER R
LEFT JOIN FEEDBACK F ON R.Stu_id = F.Stu_id AND R.Cour_id = F.Cour_id
WHERE ISNULL(R.Learning_progress, 0) >= 50 
  AND F.Stu_id IS NULL;

DECLARE @AllComments TABLE (Type VARCHAR(3), T VARCHAR(3000));

INSERT INTO @AllComments (Type, T) VALUES
('POS', 'Excellent course with very clear explanations.'), ('POS', 'Loved the structure and teaching style!'),
('POS', 'Great content and very helpful examples.'), ('POS', 'The instructor explained everything very well.'),
('POS', 'Amazing course, highly recommended.'), ('POS', 'Easy to follow and well organized.'),
('POS', 'One of the best courses I’ve taken online.'), ('POS', 'The lessons were engaging and informative.'),
('POS', 'Outstanding material and pacing.'), ('POS', 'Very practical and useful knowledge.'),
('POS', 'High-quality content and good exercises.'), ('POS', 'This course exceeded my expectations.'),
('POS', 'Clear, concise, and very effective.'), ('POS', 'Great improvement after finishing this course.'),
('POS', 'Fantastic course with excellent guidance.'),
('NEU', 'The course was okay overall.'), ('NEU', 'Some parts were helpful, others were not.'),
('NEU', 'Average experience, nothing special.'), ('NEU', 'Good for beginners but lacks depth.'),
('NEU', 'The content was acceptable.'), ('NEU', 'Decent course but could be better.'),
('NEU', 'Learned some basics but expected more.'), ('NEU', 'Neutral feelings about this course.'),
('NEU', 'It covered the main points adequately.'), ('NEU', 'The course was fine but not remarkable.'),
('NEG', 'The content was unclear and confusing.'), ('NEG', 'Poorly organized and difficult to follow.'),
('NEG', 'I did not find the lessons helpful.'), ('NEG', 'Too theoretical and not practical enough.'),
('NEG', 'The instructor was hard to understand.'), ('NEG', 'Low-quality material and outdated examples.'),
('NEG', 'I learned very little from this course.'), ('NEG', 'The explanations were weak and repetitive.'),
('NEG', 'Not worth the time, disappointing.'), ('NEG', 'Sound or video quality was poor.'),
('NEG', 'Slides were confusing and messy.'), ('NEG', 'Did not meet my expectations at all.'),
('NEG', 'Very boring and unengaging lectures.'), ('NEG', 'Examples were not relevant or useful.'),
('NEG', 'Overall, this course was not good.');

INSERT INTO FEEDBACK (Stu_id, Cour_id, Rating, Comment, Date_rat)
SELECT TOP 70 PERCENT
    R.Stu_id,
    R.Cour_id,
    
    Calc.Rating,

    CASE 
        WHEN Calc.Should_Have_Comment = 0 THEN NULL
        ELSE CONCAT(C.T, ' (Course: ', RTRIM(R.Cour_id), ', Student: ', RTRIM(R.Stu_id), ').')
    END AS Comment,

    DATEADD(DAY, 
        ABS(CHECKSUM(NEWID(), R.Stu_id)) % (DATEDIFF(DAY, R.Date_reg, GETDATE()) + 1), 
        R.Date_reg
    ) AS Date_rat

FROM @Reg R

CROSS APPLY (
    SELECT 
      
        CASE 
            WHEN (ABS(CHECKSUM(NEWID(), R.Stu_id)) % 100) < 50 THEN 5
            ELSE 1 + ABS(CHECKSUM(NEWID(), R.Stu_id)) % 4
        END AS Rating,
       
        CASE 
            WHEN (ABS(CHECKSUM(NEWID(), R.Cour_id)) % 10) < 4 THEN 0 
            ELSE 1 
        END AS Should_Have_Comment
) AS Calc

OUTER APPLY (
    SELECT TOP 1 T 
    FROM @AllComments AC
    WHERE 
        
        Calc.Should_Have_Comment = 1 
        AND AC.Type = CASE 
                        WHEN Calc.Rating >= 4 THEN 'POS'
                        WHEN Calc.Rating = 3 THEN 'NEU'
                        ELSE 'NEG'
                      END
   
    ORDER BY CHECKSUM(NEWID(), R.Stu_id, R.Cour_id)
) AS C
ORDER BY NEWID();
GO

--==================================CERTI=================================

INSERT INTO CERTIFICATE (Cer_id, Cer_name, Cour_id)
SELECT 
    
    CAST(LEFT(CONCAT('CER_', Course_id), 15) AS CHAR(15)), 
    
    LEFT(CONCAT('Certificate of Completion: ', Cour_name), 100),
    
    Course_id
FROM COURSE C
WHERE NOT EXISTS (
   
    SELECT 1 FROM CERTIFICATE Cert WHERE Cert.Cour_id = C.Course_id
);

GO

--========================================RECEIVE===========================================

INSERT INTO [RECEIVE] (Cer_id, Stu_id, Issue_date)
SELECT 
    C.Cer_id,
    R.Stu_id,
    
    GETDATE()
FROM REGISTER R
JOIN CERTIFICATE C ON R.Cour_id = C.Cour_id
WHERE 
    R.Learning_progress = 100
    
    AND NOT EXISTS (
        SELECT 1 FROM [RECEIVE] Rec 
        WHERE Rec.Stu_id = R.Stu_id 
          AND Rec.Cer_id = C.Cer_id
    );
GO

--=============================UPDATE REVENUE===============================

UPDATE T
SET Revenue = ISNULL(Cal.TotalRevenue, 0)
FROM TEACHER T
LEFT JOIN (
    SELECT 
        C.Tea_id, 
       
        SUM(CAST(C.Price AS DECIMAL(12,2))) AS TotalRevenue
    FROM REGISTER R
    JOIN COURSE C ON R.Cour_id = C.Course_id
    WHERE 
       
        R.Payment_status IN ('paid', 'completed')
    GROUP BY C.Tea_id
) Cal ON T.Teacher_id = Cal.Tea_id;


SELECT Teacher_id, Revenue FROM TEACHER;
GO

--===================================UPDATE NUM TOTAL LECTURE=========================
UPDATE C
SET Num_lecture = ISNULL(L.Total_Lectures, 0)
FROM COURSE C
LEFT JOIN (
    
    SELECT Cour_id, COUNT(*) AS Total_Lectures
    FROM LECTURE
    GROUP BY Cour_id
) L ON C.Course_id = L.Cour_id;


SELECT Course_id, Cour_name, Num_lecture FROM COURSE;
GO

--=============================UPDATE RATING_AVG=============================
UPDATE C
SET Rating_avg = F.AvgScore
FROM COURSE C
LEFT JOIN (
    SELECT 
        Cour_id, 
        ROUND(AVG(CAST(Rating AS FLOAT)), 1) AS AvgScore
    FROM FEEDBACK
    GROUP BY Cour_id
) F ON C.Course_id = F.Cour_id;

GO

--===========================UPDATE NUM_STUDENT=========================
UPDATE C
SET Num_student = ISNULL(R.Total_Students, 0)
FROM COURSE C
LEFT JOIN (
    SELECT Cour_id, COUNT(Stu_id) AS Total_Students
    FROM REGISTER
    GROUP BY Cour_id
) R ON C.Course_id = R.Cour_id;

GO
--================================UPDATE TOTAL TIME=================================
UPDATE C
SET Total_time = L.Sum_Minutes
FROM COURSE C
INNER JOIN (
   
    SELECT Cour_id, SUM([Time]) AS Sum_Minutes
    FROM LECTURE
    GROUP BY Cour_id
) L ON C.Course_id = L.Cour_id
WHERE L.Sum_Minutes > 0; 

SELECT Course_id, Cour_name, Total_time FROM COURSE ORDER BY Total_time DESC;
GO

--==================================FINAL SCORE======================================
UPDATE R
SET Final_score = ISNULL(Scores.FinalScore, 0)
FROM REGISTER R
OUTER APPLY (
    SELECT 
        CAST(AVG(QuizEffectScore) AS DECIMAL(4,2)) AS FinalScore
    FROM (
        SELECT
            CASE 
                WHEN q.Grading = 'MAX' THEN MAX(a.Score)
                WHEN q.Grading = 'AVG' THEN AVG(a.Score)
                WHEN q.Grading = 'LAST' THEN 
                    (
                        SELECT TOP 1 sub.Score
                        FROM ATTEMPT sub
                        WHERE sub.Stu_id  = a.Stu_id
                          AND sub.Cour_id = a.Cour_id
                          AND sub.Lect_id = a.Lect_id
                          AND sub.Quiz_id = a.Quiz_id
                        ORDER BY sub.Attempt_id DESC
                    )
                ELSE MAX(a.Score) -- fallback
            END AS QuizEffectScore
        FROM ATTEMPT a
        JOIN QUIZ q
            ON a.Cour_id = q.Cour_id
           AND a.Lect_id = q.Lect_id
           AND a.Quiz_id = q.Quiz_id
        WHERE a.Stu_id  = R.Stu_id
          AND a.Cour_id = R.Cour_id
        GROUP BY 
            a.Stu_id,
            a.Cour_id,
            a.Lect_id,
            a.Quiz_id,
            q.Grading
    ) AS T
) AS Scores;

--===============================NUM REGISTER COURSE=====================================
UPDATE S
SET Num_register_courses = ISNULL(Reg.Total, 0)
FROM STUDENT S
LEFT JOIN (
    SELECT Stu_id, COUNT(Cour_id) AS Total
    FROM REGISTER
    GROUP BY Stu_id
) Reg ON S.Student_id = Reg.Stu_id;
GO

--===============================NUM FINISH COURSE=====================================
UPDATE S
SET Num_finished_courses = ISNULL(Fin.Total, 0)
FROM STUDENT S
LEFT JOIN (
    SELECT Stu_id, COUNT(Cour_id) AS Total
    FROM REGISTER
    WHERE Learning_progress = 100 
    GROUP BY Stu_id
) Fin ON S.Student_id = Fin.Stu_id;


SELECT Student_id, Num_register_courses, Num_finished_courses FROM STUDENT;
GO
/*
-- ==================================================================================================================================
-- DONE DATA 
-- ==================================================================================================================================
*/ 




/*
-- ===================================================================================================================================
-- TEST
-- ===================================================================================================================================
*/ 


--==================================SHOW TABLE===================================
SELECT * FROM QUIZ;
SELECT * FROM STUDENT;
SELECT * FROM REGISTER;
DELETE FROM ATTEMPT;
SELECT * FROM [OPTION];

SELECT Cour_id, COUNT(*) AS Total_Quizzes
FROM QUIZ
GROUP BY Cour_id;

SELECT 
    Stu_id,
    Cour_id,
    COUNT(*) AS Completed_Quizzes
FROM (
    SELECT DISTINCT 
        Stu_id, 
        Cour_id, 
        Lect_id, 
        Quiz_id
    FROM ATTEMPT
) AS DistinctAttempts
GROUP BY Stu_id, Cour_id
ORDER BY Stu_id, Cour_id;



--================================DELETE TO TEST=================================
USE master;

ALTER DATABASE TEST SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
DROP DATABASE TEST;

DELETE FROM ATTEMPT;

--================================================================================================
