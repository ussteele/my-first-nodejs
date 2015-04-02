-- phpMyAdmin SQL Dump
-- version 4.0.4.1
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Apr 02, 2015 at 02:25 AM
-- Server version: 5.5.32
-- PHP Version: 5.4.19

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `test`
--
CREATE DATABASE IF NOT EXISTS `test` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `test`;

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `test_multi_sets`()
    DETERMINISTIC
begin
        select user() as first_col;
        select user() as first_col, now() as second_col;
        select user() as first_col, now() as second_col, now() as third_col;
        end$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `t_user`
--

CREATE TABLE IF NOT EXISTS `t_user` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(12) NOT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=10 ;

--
-- Dumping data for table `t_user`
--

INSERT INTO `t_user` (`user_id`, `name`, `email`, `phone`) VALUES
(1, 'Steven j Steele', 'ussteele@hotmail.com', '800-892-2431'),
(2, 'Ryan Vander Ark', 'ryan531@isp.com', '800-355-6469'),
(3, 'Jon Dickinson', 'Jon@transblucency.com', '800-358-9624'),
(4, 'David A. Smoot', 'dsmoot_2003@yahoo.com', '800-726-3140'),
(5, 'Kim Baller', 'ballerk@yahoo.com', '800-333-0040'),
(6, 'Dewayne Steele', 'dsteele@somemail.com', '800-403-0651'),
(7, 'Mona Pugh', 'mona@pughmail.com', '800-555-1212'),
(8, 'Eddie Pugh', 'eddie@pughmail.com', '800-555-1212'),
(9, 'Cleo Retriever', 'cleo@retriever.com', '800-555-1212');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
