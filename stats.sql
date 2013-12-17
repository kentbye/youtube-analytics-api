-- phpMyAdmin SQL Dump
-- version 3.3.9.2
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Server version: 5.5.9
-- PHP Version: 5.3.6

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `statsxx`
--

-- --------------------------------------------------------

--
-- Table structure for table `stats.engagement`
--

CREATE TABLE `engagement` (
  `id` varchar(255) NOT NULL,
  `timePeriod` int(11) NOT NULL,
  `sufficientData` int(11) NOT NULL,
  `views` int(11) DEFAULT NULL,
  `estimatedMinutesWatched` int(11) DEFAULT NULL,
  `averageViewDuration` float DEFAULT NULL,
  `averageViewPercentage` float DEFAULT NULL,
  `annotationClickThroughRate` float DEFAULT NULL,
  `annotationCloseRate` float DEFAULT NULL,
  `likes` int(11) DEFAULT NULL,
  `dislikes` int(11) DEFAULT NULL,
  `shares` int(11) DEFAULT NULL,
  `comments` int(11) DEFAULT NULL,
  `subscribersGained` int(11) DEFAULT NULL,
  `subscribersLost` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `stats.videos`
--

CREATE TABLE `videos` (
  `title` varchar(255) NOT NULL,
  `id` varchar(255) NOT NULL,
  `viewCountTotal` int(11) NOT NULL,
  `likeCountTotal` int(11) NOT NULL,
  `favoriteCountTotal` int(11) NOT NULL,
  `commentCountTotal` int(11) NOT NULL,
  `dislikeCountTotal` int(11) NOT NULL,
  `publishedDate` datetime NOT NULL,
  `publishedTime` time NOT NULL,
  `tags` varchar(255) NOT NULL,
  `categoryId` int(11) NOT NULL,
  `privacyStatus` varchar(255) NOT NULL,
  `durationText` varchar(255) NOT NULL,
  `durationSeconds` int(11) NOT NULL,
  `daysPublished` int(11) NOT NULL,
  `averageViewsPerDay` float NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;