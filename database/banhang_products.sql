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
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `sku` varchar(64) DEFAULT NULL,
  `description` mediumtext,
  `product_img` varchar(512) DEFAULT NULL,
  `product_img_alt` varchar(255) DEFAULT NULL,
  `product_img_title` varchar(255) DEFAULT NULL,
  `has_images` tinyint(1) NOT NULL DEFAULT '0',
  `brand` varchar(191) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  UNIQUE KEY `sku` (`sku`),
  KEY `idx_products_img` (`product_img`),
  KEY `idx_products_has_images` (`has_images`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'iPhone 15 Pro','iphone-15-pro','IP15P','iPhone 15 Pro với chip A17 Pro mạnh mẽ, camera 48MP, màn hình Super Retina XDR 6.1 inch.','/uploads/image-1758431382523-330729635.png','iPhone 15 Pro - Product Image','View iPhone 15 Pro - Product Details',0,'Apple',1,'2025-08-25 17:49:05','2025-09-21 12:09:42'),(2,'MacBook Air M2','macbook-air-m2','MBA-M2','Laptop mỏng nhẹ với chip M2, màn hình 13.6 inch, pin trâu.','/uploads/image-1758431343284-104699964.jpg','MacBook Air M2 - Product Image','View MacBook Air M2 - Product Details',1,'Apple',1,'2025-08-25 17:49:05','2025-09-21 12:09:03'),(3,'AirPods Pro 2nd Gen','airpods-pro-2nd-gen','APP-2ND','Tai nghe không dây với chống ồn chủ động, âm thanh chất lượng cao.','/uploads/image-1758431329588-978532858.jpg','AirPods Pro 2nd Gen - Wireless Earbuds','View AirPods Pro 2nd Gen - Wireless Earbuds Details',1,'Apple',1,'2025-08-25 17:49:05','2025-09-21 12:08:49'),(4,'iPad Pro 12.9','ipad-pro-12-9','IPP-12-9','Máy tính bảng cao cấp với màn hình 12.9 inch, chip M2 mạnh mẽ.','/uploads/image-1758431289958-83822369.jpg','iPad Pro 12.9 - Premium Tablet','View iPad Pro 12.9 - Premium Tablet Details',1,'Apple',1,'2025-08-25 17:49:05','2025-09-21 12:08:09'),(5,'Apple Watch Series 9','apple-watch-series-9','AWS-91','Đồng hồ thông minh với nhiều tính năng sức khỏe và thể thao.','/uploads/image-1758431268727-375259575.jpg','Apple Watch Series 9 - Smart Watch','View Apple Watch Series 9 - Smart Watch Details',1,'Apple',1,'2025-08-25 17:49:05','2025-09-21 12:07:48');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-10  1:21:46
