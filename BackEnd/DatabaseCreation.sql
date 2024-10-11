DROP DATABASE IF EXISTS smartgrade;

CREATE DATABASE IF NOT EXISTS smartgrade;

USE smartgrade;

CREATE TABLE `admin` (
  `username` varchar(20) NOT NULL,
  `password` varchar(20) NOT NULL
);

CREATE TABLE `User_Master` (
  `userID` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `username` varchar(20) NOT NULL,
  `password` varchar(20) NOT NULL,
  `firstname` varchar(10) NOT NULL,
  `lastname` varchar(10),
  `usertype` enum('Student', 'Teacher') NOT NULL,
  `mobile` varchar(15) NOT NULL,
  `email` varchar(25) NOT NULL,
  `status` enum('Pending', 'Active', 'Inactive') DEFAULT 'Pending',
  `timestamp` timestamp NOT NULL
);

CREATE TABLE `Teacher` (
  `teacherId` int UNIQUE PRIMARY KEY NOT NULL,
  `userID` int NOT NULL,
  `timestamp` timestamp NOT NULL
);

CREATE TABLE `Student` (
  `applicationID` int UNIQUE PRIMARY KEY NOT NULL,
  `userID` int NOT NULL,
  `examID` int UNIQUE NOT NULL,
  `appstatus` enum('Pending', 'Active', 'Inactive') NOT NULL,
  `attendance` enum('Pending', 'Present', 'Absent') NOT NULL,
  `marks` int NOT NULL,
  `timestamp` timestamp NOT NULL
);

-- CREATE TABLE `Exam_Master` (
--   `examID` int UNIQUE PRIMARY KEY NOT NULL,
--   `name` varchar(15) NOT NULL,
--   `app_start_date` date NOT NULL,
--   `app_end_date` date NOT NULL,
--   `exam_start_time` time NOT NULL,
--   `exam_end_date` date NOT NULL,
--   `exam_end_time` time NOT NULL,
--   `total_marks` int NOT NULL,
--   `passing_marks` int NOT NULL,
--   `status` enum('Pending', 'Completed') NOT NULL,
--   `timestamp` timestamp NOT NULL
-- );

CREATE TABLE `Exam_Master` (
	`examID` int NOT NULL UNIQUE AUTO_INCREMENT,
    `teacherId` int NOT NULL,
	`name` varchar(15) NOT NULL,
	`start_date` DATE NOT NULL,
    `start_time` TIME NOT NULL,
	`duration` INT NOT NULL,
    `total_marks` INT NOT NULL,
    `passing_marks` INT NOT NULL,
	`timestamp` timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `Question_Master` (
  `questionID` int NOT NULL UNIQUE AUTO_INCREMENT,
  `examID` int NOT NULL,
  -- `questiontype` varchar(20) NOT NULL, 
  `question` TEXT NOT NULL,
  `optionA` varchar(150) NOT NULL,
  `optionB` varchar(150) NOT NULL,
  `optionC` varchar(150) NOT NULL,
  `optionD` varchar(150) NOT NULL,
  `answer_key` enum('optionA', 'optionB', 'optionC', 'optionD') NOT NULL,
  `question_marks` int NOT NULL,
  `timestamp` timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `Attempt_Master` (
  `attemptID` int UNIQUE PRIMARY KEY NOT NULL,
  `examID` int NOT NULL,
  `questionID` int NOT NULL,
  `applicationID` int NOT NULL,
  `selected_option` enum('optionA', 'optionB', 'optionC', 'optionD') NOT NULL,
  `correct_option` enum('optionA', 'optionB', 'optionC', 'optionD') NOT NULL,
  `marks_obt` int NOT NULL,
  `timestamp` timestamp NOT NULL
);

ALTER TABLE `Teacher` ADD FOREIGN KEY (`userID`) REFERENCES `User_Master` (`userID`);

ALTER TABLE `Student` ADD FOREIGN KEY (`userID`) REFERENCES `User_Master` (`userID`);

ALTER TABLE `Student` ADD FOREIGN KEY (`examID`) REFERENCES `Exam_Master` (`examID`);

ALTER TABLE `Question_Master` ADD FOREIGN KEY (`examID`) REFERENCES `Exam_Master` (`examID`);

ALTER TABLE `Attempt_Master` ADD FOREIGN KEY (`examID`) REFERENCES `Student` (`examID`);

ALTER TABLE `Attempt_Master` ADD FOREIGN KEY (`questionID`) REFERENCES `Question_Master` (`questionID`);

ALTER TABLE `Attempt_Master` ADD FOREIGN KEY (`applicationID`) REFERENCES `Student` (`applicationID`);

SELECT * FROM user_master;
SELECT * FROM question_master;
SELECT * FROM exam_master;

drop table exam_master;
drop table question_master;

truncate question_master;
truncate exam_master;

alter table question_master drop timestamp;

SHOW TABLES;

INSERT INTO admin VALUES("admin", "admin123");

INSERT INTO user_master VALUES(1, 'Chetan', 'chetan', 'chetan', 'pawar', 'Student', 8793164197, 'chetan.pawar492@gmail.com', 'Pending', CURRENT_TIMESTAMP);
INSERT INTO user_master(username, password, firstname, lastname, usertype, mobile, email, timestamp) VALUES('shubham', 'ss', 'shubham', 'pawar', 'Student', 8237776199, 'shubham@gmail.com', current_timestamp());