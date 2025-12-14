/*
-- =============================================
-- CREATE DATABASE - TABLE - CONSTRAINT
-- =============================================
*/ 

CREATE DATABASE Educity
GO

USE Educity
GO

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
---Dẫn xuất: Rating_avg, Num_student, Total_time
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
---Dẫn xuất: Num_finished_courses, Num_register_courses -> công thức tính?
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
---Dẫn xuất: Learning_progress
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

	CONSTRAINT PK_RECEIVE PRIMARY KEY (Cer_id, Stu_id),
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
-- =============================================
-- CREATE DATA
-- =============================================
*/

-- 1. Bảng [USER]
INSERT INTO [USER] (User_id, F_name, L_name, Phone, Date_join, Email, [Password])
VALUES
('U000000001', 'An', 'Nguyen Van', '0901234561', '2024-01-01', 'an.nguyenvan@gmail.com', 'Password111'),
('U000000002', 'Binh', 'Tran Thi', '0901234562', '2024-01-02', 'binh.tranthi@gmail.com', 'Password222'),
('U000000003', 'Chung', 'Le Van', '0901234563', '2024-01-03', 'chung.levan@gmail.com', 'Password333'),
('U000000004', 'Dung', 'Pham Thi', '0901234564', '2024-04-01', 'dung.phamthi@gmail.com', 'Password444'),
('U000000005', 'Duy', 'Hoang Van', '0901234565', '2024-05-01', 'duy.hoangvan@gmail.com', 'Password555'),
('U000000006', 'Long', 'Vu Minh', '0911234561', '2024-02-01', 'long.vuminh@gmail.com', 'Password666'),
('U000000007', 'Giang', 'Do Truong', '0911234562', '2024-02-02', 'giang.dotruong@gmail.com', 'Password777'),
('U000000008', 'Huy', 'Ha Hung', '0911234563', '2024-03-01', 'huy.hahung@gmail.com', 'Password888'),
('U000000009', 'Y', 'Dinh Mai', '0911234564', '2024-04-01', 'y.dinhmai@gmail.com', 'Password999'),
('U000000010', 'Khuong', 'Bui Long', '0911234565', '2024-05-01', 'khuong.builong@gmail.com', 'Password000');
GO

-- 2. Bảng [ADMIN]
INSERT INTO [ADMIN] (Admin_id, Admin_email, F_name, L_name)
VALUES
('A000000001', 'admin1@educity.com', 'Nhu', 'Nguyen Quynh'),
('A000000002', 'admin2@educity.com', 'Nhi', 'Tran Duong Khiet'),
('A000000003', 'admin3@educity.com', 'An', 'Tran Khanh'),
('A000000004', 'admin4@educity.com', 'Thu', 'Ho Thi Minh'),
('A000000005', 'admin5@educity.com', 'Manh', 'Tran Duc');
GO
--

-- 3. Bảng TEACHER
INSERT INTO TEACHER (Teacher_id, Expertise, Bank_name, Account_num, Revenue)
VALUES
('U000000001', 'Database Systems', 'Vietcombank', '111111111', 15000000.00),
('U000000002', 'AI and Machine Learning', 'Techcombank', '222222222', 25000000.00),
('U000000003', 'Web Development (React, Node)', 'ACB', '333333333', 12000000.00),
('U000000004', 'Mobile App Development (Flutter)', 'MB Bank', '444444444', 18000000.00),
('U000000005', 'Project Management (Agile, Scrum)', 'VietinBank', '555555555', 10000000.00);
GO

-- 4. Bảng STUDENT
INSERT INTO STUDENT (Student_id, Num_register_courses, Num_finished_courses)
VALUES
('U000000006', NULL, NULL),
('U000000007', NULL, NULL),
('U000000008', NULL, NULL),
('U000000009', NULL, NULL),
('U000000010', NULL, NULL);
GO

-- 5. Bảng TEACHER_QUALIFICATIONS
INSERT INTO TEACHER_QUALIFICATIONS (Tea_id, Qualification)
VALUES
('U000000001', 'Master of Computer Science - Bach Khoa University'),
('U000000001', 'Microsoft Certified: Azure Database Administrator'),
('U000000002', 'PhD in Artificial Intelligence - University of Natural Sciences'),
('U000000003', 'Google Fullstack Web Development Certificate'),
('U000000004', 'Udemy Flutter Development Certificate'),
('U000000005', 'Certified ScrumMaster (CSM)');
GO

-- 6. Bảng COURSE
INSERT INTO COURSE (Course_id, Tea_id, Cour_name, [Description], Min_avg_score, Price, [Language], Num_student, Rating_avg, Num_lecture, Total_time, Date_public)
VALUES
('C000000001', 'U000000001', 'Introduction to SQL Databases', 'A fundamental course on SQL, relational database design...', 5.0, 799000, 'Vietnamese', NULL, NULL, 20, NULL, '2024-03-01'),
('C000000002', 'U000000002', 'Machine Learning for Beginners', 'Learn about common Machine Learning algorithms...', 7.0, 1299000, 'Vietnamese', NULL, NULL, 30, NULL, '2024-03-15'),
('C000000003', 'U000000003', 'Build Web Apps with ReactJS from A-Z', 'Hands-on practice building 3 web projects...', 6.0, 999000, 'Vietnamese', NULL, NULL, 40, NULL, '2024-04-01'),
('C000000004', 'U000000004', 'Cross-Platform Flutter App Development', 'Master Flutter, build apps for iOS and Android...', 6.5, 1199000, 'English', NULL, NULL, 25, NULL, '2024-04-10'),
('C000000005', 'U000000005', 'Project Management with Scrum', 'Understand the Agile and Scrum framework...', 0.0, 499000, 'Vietnamese', NULL, NULL, 15, NULL, '2024-05-01');
GO

-- 7. Bảng CERTIFICATE
INSERT INTO CERTIFICATE (Cer_id, Cer_name, Cour_id)
VALUES
('CE0000000000001', 'Certificate of Completion: SQL Databases', 'C000000001'),
('CE0000000000002', 'Certificate of Completion: Machine Learning', 'C000000002'),
('CE0000000000003', 'Certificate of Completion: ReactJS', 'C000000003'),
('CE0000000000004', 'Certificate of Completion: Flutter', 'C000000004'),
('CE0000000000005', 'Certificate of Completion: Scrum', 'C000000005');
GO

-- 8. Bảng COURSE_TOPIC
INSERT INTO COURSE_TOPIC (Cour_id, Topic)
VALUES
('C000000001', 'Database'),
('C000000001', 'SQL Server'),
('C000000002', 'AI'),
('C000000002', 'Machine Learning'),
('C000000003', 'Web Development');
GO

-- 9. Bảng LECTURE
INSERT INTO LECTURE (Cour_id, Lecture_id, [Time], Lect_name, Document_link)
VALUES
('C000000001', 'L000000001', 30, 'Lec 1: Introduction to Databases', 'http://docs.com/c01/l01'),
('C000000001', 'L000000002', 45, 'Lec 2: ERD Modeling', 'http://docs.com/c01/l02'),
('C000000001', 'L000000003', 60, 'Lec 3: Basic SQL Commands', 'http://docs.com/c01/l03'),
('C000000002', 'L000000001', 40, 'Lec 1: Introduction to Machine Learning', 'http://docs.com/c02/l01'),
('C000000002', 'L000000002', 60, 'Lec 2: Linear Regression', 'http://docs.com/c02/l02'),
('C000000004', 'L000000001', 40, 'Lec 1: Introduction to SQL Databases', 'http://docs.com/c04/l01'),
('C000000004', 'L000000002', 60, 'Lec 2: Machine Learning for Beginners', 'http://docs.com/c04/l02');
GO

-- 10. Bảng APPROVE
INSERT INTO APPROVE (Cour_id, Ad_id)
VALUES
('C000000001', 'A000000001'),
('C000000002', 'A000000001'),
('C000000003', 'A000000002'),
('C000000004', 'A000000003'),
('C000000005', 'A000000002');
GO

-- 11. Bảng REGISTER
INSERT INTO REGISTER (Stu_id, Cour_id, Date_reg, Payment_status, Learning_progress, Final_score)
VALUES
('U000000006', 'C000000001', '2024-05-01', 'completed', NULL, 0),
('U000000006', 'C000000002', '2024-05-02', 'completed', NULL, 0),
('U000000007', 'C000000003', '2024-05-03', 'pending', NULL, 0),
('U000000008', 'C000000001', '2024-05-04', 'completed', NULL, 0),
('U000000009', 'C000000005', '2024-05-05', 'completed', NULL, 0),
('U000000007', 'C000000001', '2024-05-10', 'completed', NULL, 0),
('U000000010', 'C000000003', '2024-05-11', 'completed', NULL, 0),
('U000000010', 'C000000004', '2024-05-12', 'completed', NULL, 0);
GO

-- 12. Bảng FEEDBACK
INSERT INTO FEEDBACK (Stu_id, Cour_id, Rating, Comment, Date_rat)
VALUES
('U000000006', 'C000000001', 5, 'This SQL database course is excellent, the instructor teaches clearly.', '2024-06-01'),
('U000000006', 'C000000002', 4, 'The Machine Learning content is good, but needs more practical exercises.', '2024-06-02'),
('U000000008', 'C000000001', 4, 'The SQL content is complete, detailed. Well worth the money.', '2024-06-03'),
('U000000009', 'C000000005', 5, 'The Scrum course helped me understand the workflow. Very satisfied.', '2024-06-04'),
('U000000007', 'C000000001', 4, 'The instructor is enthusiastic and provides quick support on the forum.', '2024-06-05');
GO

-- 13. Bảng LECT_REQUIRE
INSERT INTO LECT_REQUIRE (Pre_lect_cou_id, Pre_lect_id, Post_lect_cou_id, Post_lect_id)
VALUES
('C000000001', 'L000000001', 'C000000001', 'L000000002'),
('C000000001', 'L000000002', 'C000000001', 'L000000003'),
('C000000002', 'L000000001', 'C000000002', 'L000000002'),
('C000000001', 'L000000001', 'C000000001', 'L000000003'),
('C000000004', 'L000000001', 'C000000004', 'L000000002');
GO

-- 14. Bảng QUIZ
INSERT INTO QUIZ (Cour_id, Lect_id, Quiz_id, Q_name, Q_duration, Attempts)
VALUES
('C000000001', 'L000000001', 'Q000000001', 'Test Lec 1: DB Overview', 15, 3),
('C000000001', 'L000000002', 'Q000000002', 'Test Lec 2: ERD Drawing', 20, 2),
('C000000001', 'L000000003', 'Q000000003', 'Test Lec 3: SQL Commands (DML)', 30, 1),
('C000000002', 'L000000001', 'Q000000001', 'Test Lec 1: What is ML?', 10, 3),
('C000000002', 'L000000002', 'Q000000002', 'Test Lec 2: Linear Regression', 25, 3);
GO

-- 15. Bảng QUESTION
INSERT INTO QUESTION (Cour_id, Lect_id, Quiz_id, Ques_id, Content, Answer)
VALUES
('C000000001', 'L000000001', 'Q000000001', 'QS00000001', 'What does SQL stand for?', 'Structured Query Language'),
('C000000001', 'L000000001', 'Q000000001', 'QS00000002', 'What does DBMS stand for?', 'Database Management System'),
('C000000001', 'L000000002', 'Q000000002', 'QS00000003', 'What shape represents an Entity in an ERD?', 'Rectangle'),
('C000000002', 'L000000001', 'Q000000001', 'QS00000001', 'Machine Learning is a subfield of...', 'Artificial Intelligence'),
('C000000002', 'L000000002', 'Q000000002', 'QS00000002', 'Linear Regression is used for what kind of problem?', 'Prediction');
GO

-- 16. Bảng [OPTION]
INSERT INTO [OPTION] (Cour_id, Lect_id, Quiz_id, Q_id, [Option])
VALUES
('C000000001', 'L000000001', 'Q000000001', 'QS00000001', 'Structured Query Language'),
('C000000001', 'L000000001', 'Q000000001', 'QS00000001', 'Simple Query Language'),
('C000000001', 'L000000001', 'Q000000001', 'QS00000001', 'System Query Language'),
('C000000001', 'L000000002', 'Q000000002', 'QS00000003', 'Rectangle'),
('C000000001', 'L000000002', 'Q000000002', 'QS00000003', 'Diamond');
GO
INSERT INTO [OPTION] (Cour_id, Lect_id, Quiz_id, Q_id, [Option])
VALUES
-- Bổ sung options cho các câu hỏi của C000000002
('C000000002', 'L000000001', 'Q000000001', 'QS00000001', 'Artificial Intelligence'),
('C000000002', 'L000000001', 'Q000000001', 'QS00000001', 'Data Mining'),
('C000000002', 'L000000002', 'Q000000002', 'QS00000002', 'Prediction'),
('C000000002', 'L000000002', 'Q000000002', 'QS00000002', 'Classification');
GO

-- 17. Bảng ATTEMPT
INSERT INTO ATTEMPT 
(Stu_id, Cour_id, Lect_id, Quiz_id, Attempt_id, Score, [Date], Start_time, Duration)
VALUES 
('U000000006', 'C000000001', 'L000000001', 'Q000000001', 1, 9.50, '2024-06-10', '09:00:00', 5),
('U000000006', 'C000000001', 'L000000001', 'Q000000001', 2, 10.00, '2024-06-10', '09:30:00', 5),
('U000000007', 'C000000001', 'L000000002', 'Q000000002', 1, 7.00, '2024-06-11', '10:00:00', 10),
('U000000006', 'C000000002', 'L000000001', 'Q000000001', 1, 8.25, '2024-06-12', '14:15:00', 7),
('U000000008', 'C000000002', 'L000000002', 'Q000000002', 1, 6.75, '2024-06-13', '15:00:00', 12);
GO


-- 18. Bảng [RECEIVE]

UPDATE REGISTER
SET Final_score = 9.0
WHERE Stu_id = 'U000000006' AND Cour_id = 'C000000001';

UPDATE REGISTER
SET Final_score = 8.0
WHERE Stu_id = 'U000000006' AND Cour_id = 'C000000002';

UPDATE REGISTER
SET Final_score = 8.5
WHERE Stu_id = 'U000000010' AND Cour_id = 'C000000003';

UPDATE REGISTER
SET Final_score = 8.0
WHERE Stu_id = 'U000000010' AND Cour_id = 'C000000004';

UPDATE REGISTER
SET Final_score = 9.5
WHERE Stu_id = 'U000000009' AND Cour_id = 'C000000005';
GO

UPDATE REGISTER
SET Learning_progress = 100
WHERE (Stu_id = 'U000000006' AND Cour_id = 'C000000001')
   OR (Stu_id = 'U000000006' AND Cour_id = 'C000000002')
   OR (Stu_id = 'U000000010' AND Cour_id = 'C000000003')
   OR (Stu_id = 'U000000010' AND Cour_id = 'C000000004')
   OR (Stu_id = 'U000000009' AND Cour_id = 'C000000005');
GO

INSERT INTO [RECEIVE] (Cer_id, Stu_id, Issue_date)
VALUES
	('CE0000000000001', 'U000000006', '2024-07-01'),
    ('CE0000000000002', 'U000000006', '2024-07-10'),
    ('CE0000000000003', 'U000000010', '2024-08-01'),
    ('CE0000000000004', 'U000000010', '2024-08-05'),
    ('CE0000000000005', 'U000000009', '2024-08-15');
GO

select * from LECT_REQUIRE