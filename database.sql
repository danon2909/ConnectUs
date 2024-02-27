CREATE DATABASE IF NOT EXISTS `placeholder`;

USE `placeholder`;

CREATE TABLE IF NOT EXISTS `chat` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `user2_id` int(11) NOT NULL,
  `read_1` tinyint(1) NOT NULL,
  `read_2` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `usergroups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `groupName` varchar(60) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `groups_members` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `groupId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `readGroup` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_group` (`groupId`,`userId`)
);

CREATE TABLE IF NOT EXISTS `messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `message` varchar(150) NOT NULL,
  `date` datetime NOT NULL DEFAULT current_timestamp(),
  `senderId` int(11) NOT NULL,
  `receiverId` int(11) DEFAULT NULL,
  `groupId` int(11) DEFAULT NULL,
  `file` tinyint(1) NOT NULL,
  `fileName` varchar(220) DEFAULT NULL,
  `filePrefix` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `firstname` varchar(30) NOT NULL,
  `lastname` varchar(30) NOT NULL,
  `login` varchar(30) NOT NULL,
  `password` varchar(60) NOT NULL,
  `pfp` varchar(60) DEFAULT NULL,
  `status` enum('Offline','Online','DND') NOT NULL,
  `isAdmin` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
);

DELETE FROM `users` WHERE `id` = 0;

INSERT INTO `users` (`id`, `firstname`, `lastname`, `login`, `password`, `pfp`, `status`, `isAdmin`) VALUES
(0, 'Default', 'User', 'Admin', '$2b$10$V2SPQmVYSkOPfd3wkJ9E.uIgh1WYNcOCaXufxhgGNxnorgi.SFIlK', NULL, 'Offline', 1);

UPDATE `users` SET `id` = 0 WHERE `login` = 'Admin';