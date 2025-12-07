CREATE DATABASE TEST;
GO

USE TEST;
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
---D?n xu?t: Learning_progress
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