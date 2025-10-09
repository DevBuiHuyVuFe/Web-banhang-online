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
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL,
  `code` varchar(32) NOT NULL,
  `status` enum('pending','paid','shipped','completed','cancelled','refunded') NOT NULL DEFAULT 'pending',
  `subtotal` decimal(12,2) NOT NULL DEFAULT '0.00',
  `discount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `shipping_fee` decimal(12,2) NOT NULL DEFAULT '0.00',
  `tax` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `currency` varchar(8) NOT NULL DEFAULT 'VND',
  `payment_status` enum('pending','success','failed','refunded') NOT NULL DEFAULT 'pending',
  `shipping_status` enum('pending','picked_up','in_transit','delivered','failed') NOT NULL DEFAULT 'pending',
  `placed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `shipping_address_json` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_orders_user_status` (`user_id`,`status`),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (2,2,'ORD1756178150417ZNFW6','pending',25990000.00,0.00,0.00,2599000.00,28589000.00,'VND','pending','pending','2025-08-26 10:15:50','2025-08-26 10:15:50','2025-08-26 10:28:31','{\"city\": \"100000\", \"ward\": \"100000\", \"email\": \"vudz2310@gmail.com\", \"phone\": \"100000\", \"address\": \"100000\", \"district\": \"100000\", \"full_name\": \"100000\"}'),(3,2,'ORD1756178217687CPOYN','pending',13980000.00,0.00,0.00,1398000.00,15378000.00,'VND','pending','pending','2025-08-26 10:16:57','2025-08-26 10:16:57','2025-08-26 10:28:31','{\"city\": \"vudz2310\", \"ward\": \"vudz2310\", \"email\": \"vudz2310@gmail.com\", \"phone\": \"vudz2310\", \"address\": \"vudz2310\", \"district\": \"vudz2310\", \"full_name\": \"vudz2310\"}'),(4,2,'ORD20241226001','pending',150000.00,0.00,30000.00,15000.00,195000.00,'VND','pending','pending','2025-08-26 10:21:32','2025-08-26 10:21:32','2025-08-26 10:21:32','{\"city\": \"TP. Hồ Chí Minh\", \"ward\": \"Phường 1\", \"email\": \"nguyenvana@email.com\", \"phone\": \"0123456789\", \"address\": \"123 Đường ABC\", \"district\": \"Quận 1\", \"full_name\": \"Nguyễn Văn A\"}'),(5,2,'ORD1756178868889IZ9RU','pending',25990000.00,0.00,0.00,2599000.00,28589000.00,'VND','pending','pending','2025-08-26 10:27:48','2025-08-26 10:27:48','2025-08-26 10:28:31','{\"city\": \"v\", \"ward\": \"v\", \"email\": \"vudz2310@gmail.com\", \"phone\": \"v\", \"address\": \"v\", \"district\": \"v\", \"full_name\": \"v\"}'),(6,2,'ORD1756179123995HKO08','completed',51980000.00,0.00,0.00,5198000.00,57178000.00,'VND','pending','pending','2025-08-26 10:32:03','2025-08-26 10:32:03','2025-08-26 14:20:41','{\"city\": \"11111111111111\", \"ward\": \"11111111111111\", \"email\": \"vudz2310@gmail.com\", \"phone\": \"11111111111111\", \"address\": \"11111111111111\", \"district\": \"11111111111111\", \"full_name\": \"Vũ\"}'),(7,2,'ORD17561791518910YSXG','completed',32990000.00,0.00,0.00,3299000.00,36289000.00,'VND','pending','pending','2025-08-26 10:32:31','2025-08-26 10:32:31','2025-08-26 14:20:38','{\"city\": \"2222222222222\", \"ward\": \"11111111111111\", \"email\": \"vudz2310@gmail.com\", \"phone\": \"11111111111111\", \"address\": \"11111111111111\", \"district\": \"11111111111111\", \"full_name\": \"Vũ\"}'),(8,2,'ORD1756179531723XKBBL','refunded',32990000.00,0.00,0.00,3299000.00,36289000.00,'VND','pending','pending','2025-08-26 10:38:51','2025-08-26 10:38:51','2025-08-26 10:55:26','{\"city\": \"huuyyy\", \"ward\": \"huuyyy\", \"email\": \"vudz2310@gmail.com\", \"phone\": \"huuyyy\", \"address\": \"huuyyy\", \"district\": \"huuyyy\", \"full_name\": \"Vũ\"}'),(9,2,'ORD17561802173268ZK4T','completed',25990000.00,0.00,0.00,2599000.00,28589000.00,'VND','pending','pending','2025-08-26 10:50:17','2025-08-26 10:50:17','2025-08-26 14:20:45','{\"city\": \"hehehehe\", \"ward\": \"hehehehe\", \"email\": \"vudz2310@gmail.com\", \"phone\": \"hehehehe\", \"address\": \"hehehehe\", \"district\": \"hehehehe\", \"full_name\": \"Vũ\"}'),(10,2,'ORD1756180248946V9O76','shipped',6990000.00,0.00,0.00,699000.00,7689000.00,'VND','pending','pending','2025-08-26 10:50:48','2025-08-26 10:50:48','2025-08-26 14:20:46','{\"city\": \"hehehehe\", \"ward\": \"hehehehe\", \"email\": \"vudz2310@gmail.com\", \"phone\": \"hehehehe\", \"address\": \"hehehehe\", \"district\": \"hehehehe\", \"full_name\": \"Vũ\"}'),(11,2,'ORD17561804382991IMC9','paid',9990000.00,0.00,0.00,999000.00,10989000.00,'VND','pending','pending','2025-08-26 10:53:58','2025-08-26 10:53:58','2025-08-26 10:54:52','{\"city\": \"6990000.00\", \"ward\": \"6990000.00\", \"email\": \"vudz2310@gmail.com\", \"phone\": \"6990000.00\", \"address\": \"6990000.00\", \"district\": \"6990000.00\", \"full_name\": \"Vũ\"}'),(12,2,'ORD17561847799394RS51','paid',29990000.00,0.00,0.00,2999000.00,32989000.00,'VND','pending','pending','2025-08-26 12:06:19','2025-08-26 12:06:19','2025-08-26 13:50:16','{\"city\": \"1111\", \"ward\": \"1111\", \"email\": \"vudz2310@gmail.com\", \"phone\": \"11111111\", \"address\": \"1111111\", \"district\": \"11\", \"full_name\": \"Vũ\"}'),(13,2,'ORD1756186765262CXI9T','paid',25990000.00,0.00,0.00,0.00,0.00,'VND','pending','pending','2025-08-26 12:39:25','2025-08-26 12:39:25','2025-08-26 13:50:14','{\"city\": \"111\", \"ward\": \"111\", \"email\": \"vudz2310@gmail.com\", \"phone\": \"111\", \"address\": \"111\", \"district\": \"111\", \"full_name\": \"Vũ\"}'),(14,1,'ORD1756187354129NQOCL','paid',25990000.00,0.00,0.00,0.00,0.00,'VND','pending','pending','2025-08-26 12:49:14','2025-08-26 12:49:14','2025-08-26 14:10:37','{\"city\": \"111111111\", \"ward\": \"1111111111\", \"email\": \"test@example.com\", \"phone\": \"111111111111\", \"address\": \"11111111111\", \"district\": \"111111111\", \"full_name\": \"Nguyễn Văn Test\"}');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-10  1:21:43
