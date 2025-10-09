-- MySQL dump 10.13  Distrib 8.0.29, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: banhang
-- ------------------------------------------------------
-- Server version	8.0.29

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `vouchers`
--

DROP TABLE IF EXISTS `vouchers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vouchers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `discount_type` enum('percentage','fixed') NOT NULL DEFAULT 'percentage',
  `discount_value` decimal(10,2) NOT NULL,
  `min_order_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `max_discount` decimal(12,2) DEFAULT '0.00',
  `usage_limit` int NOT NULL DEFAULT '1',
  `used_count` int NOT NULL DEFAULT '0',
  `valid_from` datetime NOT NULL,
  `valid_until` datetime NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vouchers`
--

LOCK TABLES `vouchers` WRITE;
/*!40000 ALTER TABLE `vouchers` DISABLE KEYS */;
INSERT INTO `vouchers` VALUES (1,'SALE20','Giảm giá 20%','Giảm giá 20% cho đơn hàng từ 500k','percentage',20.00,500000.00,200000.00,100,0,'2025-08-26 12:23:00','2025-08-26 12:23:00',1,'2025-08-26 04:28:40','2025-08-26 05:23:41'),(2,'FREESHIP','Miễn phí vận chuyển','Miễn phí vận chuyển cho đơn hàng từ 1 triệu','fixed',50000.00,1000000.00,50000.00,50,0,'2024-01-01 00:00:00','2024-06-30 23:59:59',1,'2025-08-26 04:28:40','2025-08-26 04:28:40'),(3,'NEWUSER','Giảm giá cho khách mới','Giảm giá 15% cho khách hàng mới','percentage',15.00,200000.00,100000.00,200,0,'2024-01-01 00:00:00','2024-12-31 23:59:59',1,'2025-08-26 04:28:40','2025-08-26 04:28:40'),(4,'VIP50','Giảm giá VIP 50%','Giảm giá 50% cho khách hàng VIP','percentage',50.00,1000000.00,500000.00,10,0,'2024-01-01 00:00:00','2024-03-31 23:59:59',1,'2025-08-26 04:28:40','2025-08-26 04:29:09'),(5,'vudz2310','111111','111111','percentage',100.00,1000.00,10000.00,1000,0,'2025-08-26 11:35:00','2025-08-30 11:35:00',1,'2025-08-26 04:35:59','2025-08-26 04:35:59'),(9,'hmm','hmmm','200002','percentage',100.00,10000.00,1000000000.00,10000,0,'2025-08-26 12:09:00','2025-08-30 12:09:00',1,'2025-08-26 05:01:28','2025-08-26 05:09:05'),(10,'h111','11111','111','percentage',100.00,100.00,1000000000.00,1,0,'2025-08-26 12:08:00','2025-08-30 12:08:00',1,'2025-08-26 05:05:35','2025-08-26 05:08:46'),(11,'1111111','11111','111111','percentage',100.00,10000.00,100000.00,100000,0,'2025-08-26 13:23:00','2025-08-30 13:23:00',1,'2025-08-26 06:23:12','2025-08-26 06:23:12'),(12,'11','11','111','percentage',111.00,111.00,1000000000.00,11,0,'2025-09-06 01:59:00','2025-11-08 01:59:00',1,'2025-08-26 06:52:43','2025-09-05 19:00:03');
/*!40000 ALTER TABLE `vouchers` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-10  1:21:50
