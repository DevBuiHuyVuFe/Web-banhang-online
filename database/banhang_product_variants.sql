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
-- Table structure for table `product_variants`
--

DROP TABLE IF EXISTS `product_variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variants` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint unsigned NOT NULL,
  `variant_sku` varchar(64) DEFAULT NULL,
  `color` varchar(64) DEFAULT NULL,
  `size` varchar(64) DEFAULT NULL,
  `price` decimal(12,2) NOT NULL,
  `compare_price` decimal(12,2) DEFAULT NULL,
  `weight` decimal(10,3) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `variant_sku` (`variant_sku`),
  KEY `idx_variants_product` (`product_id`),
  CONSTRAINT `fk_variants_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variants`
--

LOCK TABLES `product_variants` WRITE;
/*!40000 ALTER TABLE `product_variants` DISABLE KEYS */;
INSERT INTO `product_variants` VALUES (1,1,'IP15P-BL-1281111','Black','128GB',29990000.00,32990000.00,1111.000,1,'2025-08-25 17:49:05'),(2,1,'IP15P-BL-256','Black','256GB',33990000.00,36990000.00,0.200,1,'2025-08-25 17:49:05'),(3,2,'MBA-M2-8-256','Silver','8/256',32990000.00,34990000.00,1.200,1,'2025-08-25 17:49:05'),(4,3,'APP-2ND-WHITE','White','Standard',6990000.00,7990000.00,0.050,1,'2025-08-25 17:49:05'),(5,3,'APP-2ND-BLACK','Black','Standard',6990000.00,7990000.00,0.050,1,'2025-08-25 17:49:05'),(6,4,'IPP-12-9-128-WIFI','Silver','128GB WiFi',25990000.00,27990000.00,0.680,1,'2025-08-25 17:49:05'),(7,4,'IPP-12-9-256-WIFI','Silver','256GB WiFi',28990000.00,30990000.00,0.680,1,'2025-08-25 17:49:05'),(8,5,'AWS-9-41-ALUM','Aluminum','41mm',9990000.00,10990000.00,0.030,1,'2025-08-25 17:49:05'),(9,5,'AWS-9-45-ALUM','Aluminum','45mm',10990000.00,11990000.00,0.030,1,'2025-08-25 17:49:05'),(10,5,'AWS-9-45-ALUMm','đỏ','128 GB',2000040433.00,200000.00,256.000,1,'2025-08-26 09:18:49');
/*!40000 ALTER TABLE `product_variants` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-10  1:21:49
