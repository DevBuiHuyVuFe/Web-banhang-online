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
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  `variant_id` bigint unsigned DEFAULT NULL,
  `name_snapshot` varchar(255) NOT NULL,
  `sku_snapshot` varchar(64) DEFAULT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `quantity` int NOT NULL,
  `total` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_oi_product` (`product_id`),
  KEY `fk_oi_variant` (`variant_id`),
  KEY `idx_oi_order` (`order_id`),
  CONSTRAINT `fk_oi_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_oi_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_oi_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,2,1,6,'Sản phẩm #6','SKU-6',25990000.00,1,25990000.00),(2,3,1,4,'Sản phẩm #4','SKU-4',6990000.00,2,13980000.00),(3,4,1,1,'Sản phẩm demo 1','SKU-001',75000.00,1,75000.00),(4,4,1,2,'Sản phẩm demo 2','SKU-002',75000.00,1,75000.00),(5,3,1,1,'Sản phẩm cao cấp','SKU-PREMIUM',200000.00,1,200000.00),(6,5,1,6,'Sản phẩm #6','SKU-6',25990000.00,1,25990000.00),(7,6,1,6,'Sản phẩm #6','SKU-6',25990000.00,2,51980000.00),(8,7,1,3,'Sản phẩm #3','SKU-3',32990000.00,1,32990000.00),(9,8,1,3,'Sản phẩm #3','SKU-3',32990000.00,1,32990000.00),(10,9,4,6,'iPad Pro 12.9','IPP-12-9-128-WIFI',25990000.00,1,25990000.00),(11,10,3,4,'AirPods Pro 2nd Gen','APP-2ND-WHITE',6990000.00,1,6990000.00),(12,11,5,8,'Apple Watch Series 9','AWS-9-41-ALUM',9990000.00,1,9990000.00),(13,12,1,1,'iPhone 15 Pro','IP15P-BL-128',29990000.00,1,29990000.00),(14,13,4,6,'iPad Pro 12.9','IPP-12-9-128-WIFI',25990000.00,1,25990000.00),(15,14,4,6,'iPad Pro 12.9','IPP-12-9-128-WIFI',25990000.00,1,25990000.00);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-10  1:21:44
