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
  `firstname` varchar(50) NOT NULL,
  `lastname` varchar(50),
  `usertype` enum('Student', 'Teacher') NOT NULL,
  `mobile` varchar(15) NOT NULL,
  `email` varchar(200) NOT NULL,
  `status` enum('Pending', 'Active', 'Inactive') DEFAULT 'Pending',
  `timestamp` timestamp NOT NULL
);

CREATE TABLE `Exam_Master` (
	`examID` int NOT NULL UNIQUE AUTO_INCREMENT,
    `teacherId` int NOT NULL,
	`name` varchar(15) NOT NULL,
	`start_date` DATE NOT NULL,
    `start_time` TIME NOT NULL,
	`end_time` TIME NOT NULL,
    -- `duration` INT NOT NULL,
    `total_marks` INT DEFAULT 0,
    `passing_marks` INT DEFAULT 0,
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
  `attemptID` int UNIQUE NOT NULL AUTO_INCREMENT,
  `examID` int NOT NULL,
  `questionID` int NOT NULL,
  `applicationID` int NOT NULL,
  `selected_option` enum('optionA', 'optionB', 'optionC', 'optionD') NOT NULL,
  `status` ENUM('Pending','Completed') NOT NULL DEFAULT 'Pending',
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (examID, questionID, applicationID)
);

CREATE TABLE notices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    notice_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE `Question_Master` ADD FOREIGN KEY (`examID`) REFERENCES `Exam_Master` (`examID`);

ALTER TABLE `Attempt_Master` ADD FOREIGN KEY (`examID`) REFERENCES `Exam_Master` (`examID`);

ALTER TABLE `Attempt_Master` ADD FOREIGN KEY (`questionID`) REFERENCES `Question_Master` (`questionID`);

ALTER TABLE `Attempt_Master` ADD FOREIGN KEY (`applicationID`) REFERENCES `User_Master` (`userID`);

-- SELECT name FROM mysql.time_zone_name WHERE name LIKE 'Asia%';

SET time_zone = 'Asia/Kolkata';

SHOW TABLES;

INSERT INTO admin VALUES("admin", "admin123");

INSERT INTO user_master VALUES(1, 'Chetan', 'chetan', 'chetan', 'pawar', 'Student', 9854756321, 'chetan@gmail.com', 'Pending', CURRENT_TIMESTAMP);

INSERT INTO `User_Master` (`username`, `password`, `firstname`, `lastname`, `usertype`, `mobile`, `email`, `status`, `timestamp`) VALUES
('rohand', 'pass123', 'Rohan', 'Deshmukh', 'Student', '9876543210', 'rohan.deshmukh@example.com', 'Active', CURRENT_TIMESTAMP),
('snehalb', 'pass234', 'Snehal', 'Bhosale', 'Teacher', '9876543211', 'snehal.bhosale@example.com', 'Active', CURRENT_TIMESTAMP),
('swapnilp', 'pass345', 'Swapnil', 'Patil', 'Student', '9876543212', 'swapnil.patil@example.com', 'Active', CURRENT_TIMESTAMP),
('prajaktap', 'pass456', 'Prajakta', 'Pawar', 'Teacher', '9876543213', 'prajakta.pawar@example.com', 'Active', CURRENT_TIMESTAMP),
('amolk', 'pass567', 'Amol', 'Kulkarni', 'Student', '9876543214', 'amol.kulkarni@example.com', 'Active', CURRENT_TIMESTAMP),
('supriyac', 'pass678', 'Supriya', 'Chavan', 'Teacher', '9876543215', 'supriya.chavan@example.com', 'Active', CURRENT_TIMESTAMP),
('vikramj', 'pass789', 'Vikram', 'Jadhav', 'Student', '9876543216', 'vikram.jadhav@example.com', 'Active', CURRENT_TIMESTAMP),
('aishwaryag', 'pass890', 'Aishwarya', 'Gawande', 'Student', '9876543217', 'aishwarya.gawande@example.com', 'Pending', CURRENT_TIMESTAMP);

INSERT INTO `Exam_Master` (`examID`, `teacherId`, `name`, `start_date`, `start_time`, `end_time`, `total_marks`, `passing_marks`, `timestamp`) VALUES
(1, 3, 'Math Exam', '2024-10-20', '10:00:00', '12:00:00', 100, 35, CURRENT_TIMESTAMP),
(2, 3, 'Science Exam', '2024-10-22', '11:00:00', '13:00:00', 100, 40, CURRENT_TIMESTAMP),
(3, 3, 'English Exam', '2024-10-25', '09:00:00', '11:00:00', 100, 45, CURRENT_TIMESTAMP);

INSERT INTO `Question_Master` (`questionID`, `examID`, `question`, `optionA`, `optionB`, `optionC`, `optionD`, `answer_key`, `question_marks`, `timestamp`) VALUES
(1, 1, 'What is 2+2?', '3', '4', '5', '6', 'optionB', 5, CURRENT_TIMESTAMP),
(2, 1, 'What is the square root of 16?', '2', '4', '6', '8', 'optionB', 5, CURRENT_TIMESTAMP),
(3, 2, 'What is the chemical symbol for water?', 'H2O', 'CO2', 'O2', 'NaCl', 'optionA', 5, CURRENT_TIMESTAMP),
(4, 2, 'What is the acceleration due to gravity on Earth?', '9.8 m/s^2', '10 m/s^2', '12 m/s^2', '14 m/s^2', 'optionA', 5, CURRENT_TIMESTAMP),
(5, 3, 'Who wrote Hamlet?', 'Charles Dickens', 'William Shakespeare', 'Mark Twain', 'J.K. Rowling', 'optionB', 5, CURRENT_TIMESTAMP);

INSERT INTO `Question_Master` (`examID`, `question`, `optionA`, `optionB`, `optionC`, `optionD`, `answer_key`, `question_marks`, `timestamp`) VALUES
(1, 'What is 5 + 3?', '6', '7', '8', '9', 'optionC', 5, CURRENT_TIMESTAMP),
(1, 'Solve: 12 - 4', '8', '7', '6', '5', 'optionA', 5, CURRENT_TIMESTAMP),
(1, 'What is 9 x 3?', '27', '21', '30', '24', 'optionA', 5, CURRENT_TIMESTAMP),
(1, 'Solve: 18 ÷ 2', '6', '7', '9', '8', 'optionC', 5, CURRENT_TIMESTAMP),
(1, 'What is the square of 5?', '20', '25', '30', '35', 'optionB', 5, CURRENT_TIMESTAMP),
(1, 'What is the square root of 81?', '8', '9', '10', '7', 'optionB', 5, CURRENT_TIMESTAMP),
(1, 'Solve for x: 3x = 15', '5', '3', '7', '4', 'optionA', 5, CURRENT_TIMESTAMP),
(1, 'What is the perimeter of a square with side 4 units?', '16', '12', '8', '4', 'optionA', 5, CURRENT_TIMESTAMP),
(1, 'Convert 200 cm to meters', '2', '20', '0.2', '2000', 'optionA', 5, CURRENT_TIMESTAMP),
(1, 'What is 10% of 150?', '10', '15', '20', '25', 'optionB', 5, CURRENT_TIMESTAMP);

INSERT INTO `Question_Master` (`examID`, `question`, `optionA`, `optionB`, `optionC`, `optionD`, `answer_key`, `question_marks`, `timestamp`) VALUES
(2, 'What is the chemical symbol for gold?', 'Au', 'Ag', 'Pt', 'Fe', 'optionA', 5, CURRENT_TIMESTAMP),
(2, 'Which gas do plants use for photosynthesis?', 'Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen', 'optionB', 5, CURRENT_TIMESTAMP),
(2, 'What is the boiling point of water?', '90°C', '100°C', '110°C', '120°C', 'optionB', 5, CURRENT_TIMESTAMP),
(2, 'What is the process of water turning into vapor called?', 'Evaporation', 'Condensation', 'Precipitation', 'Sublimation', 'optionA', 5, CURRENT_TIMESTAMP),
(2, 'Which planet is known as the Red Planet?', 'Earth', 'Venus', 'Mars', 'Jupiter', 'optionC', 5, CURRENT_TIMESTAMP),
(2, 'What is the chemical formula for methane?', 'CO2', 'H2O', 'CH4', 'O2', 'optionC', 5, CURRENT_TIMESTAMP),
(2, 'What is the unit of force?', 'Joule', 'Newton', 'Pascal', 'Watt', 'optionB', 5, CURRENT_TIMESTAMP),
(2, 'What type of energy is stored in a stretched rubber band?', 'Kinetic Energy', 'Potential Energy', 'Thermal Energy', 'Chemical Energy', 'optionB', 5, CURRENT_TIMESTAMP),
(2, 'What is the hardest natural substance on Earth?', 'Gold', 'Iron', 'Diamond', 'Graphite', 'optionC', 5, CURRENT_TIMESTAMP),
(2, 'What is the atomic number of oxygen?', '6', '7', '8', '9', 'optionC', 5, CURRENT_TIMESTAMP);

INSERT INTO `Question_Master` (`examID`, `question`, `optionA`, `optionB`, `optionC`, `optionD`, `answer_key`, `question_marks`, `timestamp`) VALUES
(3, 'Who wrote "Romeo and Juliet"?', 'Charles Dickens', 'William Shakespeare', 'George Orwell', 'Mark Twain', 'optionB', 5, CURRENT_TIMESTAMP),
(3, 'Which of the following is a synonym of "happy"?', 'Sad', 'Joyful', 'Angry', 'Tired', 'optionB', 5, CURRENT_TIMESTAMP),
(3, 'What is the antonym of "bright"?', 'Shiny', 'Dark', 'Colorful', 'Light', 'optionB', 5, CURRENT_TIMESTAMP),
(3, 'What is the past tense of "run"?', 'Runs', 'Running', 'Ran', 'Runned', 'optionC', 5, CURRENT_TIMESTAMP),
(3, 'Which word is a noun?', 'Quick', 'Jump', 'Chair', 'Beautiful', 'optionC', 5, CURRENT_TIMESTAMP),
(3, 'What is a synonym of "quick"?', 'Fast', 'Slow', 'Tired', 'Heavy', 'optionA', 5, CURRENT_TIMESTAMP),
(3, 'Which of these is a verb?', 'Think', 'Table', 'Blue', 'Quick', 'optionA', 5, CURRENT_TIMESTAMP),
(3, 'Complete the sentence: "He ____ to the market."', 'Go', 'Goes', 'Going', 'Gone', 'optionB', 5, CURRENT_TIMESTAMP),
(3, 'What is the plural of "child"?', 'Childs', 'Children', 'Childes', 'Childrens', 'optionB', 5, CURRENT_TIMESTAMP),
(3, 'Which word is a preposition?', 'Under', 'Beautiful', 'Strong', 'Sad', 'optionA', 5, CURRENT_TIMESTAMP);

INSERT INTO `Attempt_Master` (`attemptID`, `examID`, `questionID`, `applicationID`, `selected_option`, `timestamp`) VALUES
(1, 1, 1, 1, 'optionB', CURRENT_TIMESTAMP),
(2, 1, 2, 1, 'optionB', CURRENT_TIMESTAMP),
(3, 2, 3, 3, 'optionA', CURRENT_TIMESTAMP),
(4, 2, 4, 3, 'optionA', CURRENT_TIMESTAMP),
(5, 3, 5, 5, 'optionB', CURRENT_TIMESTAMP);

INSERT INTO notices (notice_text) VALUES
('Math Exam will be held on 20th October 2024'),
('Science Exam has been rescheduled to 22nd October 2024'),
('New syllabus for English Exam is available on the portal.');
