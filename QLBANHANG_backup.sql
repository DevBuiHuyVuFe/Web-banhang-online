create database banhang;

use bh;

DROP TABLE IF EXISTS `wishlists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wishlists` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `fk_wish_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `wishlists` WRITE;
UNLOCK TABLES;

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `addresses` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `full_name` varchar(191) NOT NULL,
  `phone` varchar(32) NOT NULL,
  `line1` varchar(255) NOT NULL,
  `ward` varchar(191) DEFAULT NULL,
  `district` varchar(191) DEFAULT NULL,
  `city` varchar(191) DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_addresses_user` (`user_id`),
  CONSTRAINT `fk_addresses_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `cart_id` bigint unsigned NOT NULL,
  `variant_id` bigint unsigned NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `unit_price` decimal(12,2) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_ci_variant` (`variant_id`),
  KEY `idx_ci_cart` (`cart_id`),
  CONSTRAINT `fk_ci_cart` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ci_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
INSERT INTO `cart_items` VALUES (20,1,6,1,25990000.00,'2025-08-26 14:33:53');
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;


DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL,
  `session_id` varchar(191) DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `session_id` (`session_id`),
  CONSTRAINT `fk_carts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
INSERT INTO `carts` VALUES (1,2,'demo-session','2025-09-25 09:29:15','2025-08-26 09:29:15');
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;


DROP TABLE IF EXISTS `inventory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `variant_id` bigint unsigned NOT NULL,
  `quantity` int NOT NULL DEFAULT '0',
  `low_stock_threshold` int NOT NULL DEFAULT '0',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `variant_id` (`variant_id`),
  CONSTRAINT `fk_inventory_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory`
--

LOCK TABLES `inventory` WRITE;
/*!40000 ALTER TABLE `inventory` DISABLE KEYS */;
INSERT INTO `inventory` VALUES (1,1,45,10,'2025-08-26 12:40:21'),(2,2,30,10,'2025-08-25 17:49:05'),(3,3,25,5,'2025-08-25 17:49:05'),(4,4,20,5,'2025-08-25 17:49:05'),(5,5,20,5,'2025-08-25 17:49:05'),(6,6,15,5,'2025-08-25 17:49:05'),(7,7,15,5,'2025-08-25 17:49:05'),(8,8,25,5,'2025-08-25 17:49:05'),(9,9,25,5,'2025-08-25 17:49:05');
/*!40000 ALTER TABLE `inventory` ENABLE KEYS */;
UNLOCK TABLES;


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


DROP TABLE IF EXISTS `product_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_category` (
  `product_id` bigint unsigned NOT NULL,
  `category_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`product_id`,`category_id`),
  KEY `fk_pc_category` (`category_id`),
  CONSTRAINT `fk_pc_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pc_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_category`
--

LOCK TABLES `product_category` WRITE;
/*!40000 ALTER TABLE `product_category` DISABLE KEYS */;
INSERT INTO `product_category` VALUES (1,1),(2,2),(3,3),(4,4),(5,5);
/*!40000 ALTER TABLE `product_category` ENABLE KEYS */;
UNLOCK TABLES;

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint unsigned NOT NULL,
  `url` varchar(512) NOT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT '0',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_images_product` (`product_id`),
  CONSTRAINT `fk_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
INSERT INTO `product_images` VALUES (3,2,'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',0,0,'2025-08-25 17:49:05'),(6,2,'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop&crop=face',0,2,'2025-08-25 17:49:05'),(7,2,'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop&crop=face&sat=-50',0,3,'2025-08-25 17:49:05'),(8,3,'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',1,1,'2025-08-25 17:49:05'),(9,3,'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&crop=face',0,2,'2025-08-25 17:49:05'),(10,4,'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop',1,1,'2025-08-25 17:49:05'),(11,4,'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop&crop=face',0,2,'2025-08-25 17:49:05'),(13,5,'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&h=400&fit=crop&crop=face',0,2,'2025-08-25 17:49:05'),(14,2,'/uploads/image-1756146312065-846391456.jpg',1,1,'2025-08-26 01:25:12'),(16,5,'/uploads/image-1756191768879-854817590.jpg',1,1,'2025-08-26 14:02:48');
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `product_reviews`;
CREATE TABLE `product_reviews` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `rating` tinyint NOT NULL,
  `title` varchar(191) DEFAULT NULL,
  `content` text,
  `images_json` json DEFAULT NULL,
  `is_approved` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_reviews_user` (`user_id`),
  KEY `idx_reviews_product` (`product_id`,`is_approved`,`rating`),
  CONSTRAINT `fk_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_reviews_chk_1` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
--

LOCK TABLES `product_reviews` WRITE;
/*!40000 ALTER TABLE `product_reviews` DISABLE KEYS */;
INSERT INTO `product_reviews` VALUES (1,5,1,5,'1','1',NULL,1,'2025-08-26 13:46:50'),(2,1,1,5,'e','dcm',NULL,1,'2025-08-26 14:13:09');
/*!40000 ALTER TABLE `product_reviews` ENABLE KEYS */;
UNLOCK TABLES;

DROP TABLE IF EXISTS `shipments`;
CREATE TABLE `shipments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `carrier` varchar(191) DEFAULT NULL,
  `tracking_number` varchar(191) DEFAULT NULL,
  `status` enum('pending','picked_up','in_transit','delivered','failed') NOT NULL DEFAULT 'pending',
  `shipped_at` datetime DEFAULT NULL,
  `delivered_at` datetime DEFAULT NULL,
  `address_snapshot_json` json DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ship_order` (`order_id`,`status`),
  CONSTRAINT `fk_ship_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `shipments` WRITE;
UNLOCK TABLES;

DROP TABLE IF EXISTS `user_vouchers`;
CREATE TABLE `user_vouchers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `voucher_id` int NOT NULL,
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_used` tinyint(1) NOT NULL DEFAULT '0',
  `used_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_voucher` (`user_id`,`voucher_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `user_vouchers` WRITE;
/*!40000 ALTER TABLE `user_vouchers` DISABLE KEYS */;
INSERT INTO `user_vouchers` VALUES (1,2,5,'2025-08-26 04:43:30',0,NULL),(2,1,5,'2025-08-26 04:47:55',0,NULL),(3,1,10,'2025-08-26 05:05:45',0,NULL),(4,2,10,'2025-08-26 05:05:45',0,NULL);
/*!40000 ALTER TABLE `user_vouchers` ENABLE KEYS */;
UNLOCK TABLES;

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(191) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(191) NOT NULL,
  `phone` varchar(32) DEFAULT NULL,
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `status` enum('active','inactive','banned') NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'test@example.com','123','Nguyễn Văn Test','','user','active','2025-08-25 17:49:05','2025-08-26 13:38:26',1),(2,'vudz2310@gmail.com','123','Vũ','','admin','active','2025-08-25 17:50:16','2025-08-26 13:32:44',1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

DROP TABLE IF EXISTS `vouchers`;
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

LOCK TABLES `vouchers` WRITE;
INSERT INTO `vouchers` VALUES (1,'SALE20','Giảm giá 20%','Giảm giá 20% cho đơn hàng từ 500k','percentage',20.00,500000.00,200000.00,100,0,'2025-08-26 12:23:00','2025-08-26 12:23:00',1,'2025-08-26 04:28:40','2025-08-26 05:23:41'),(2,'FREESHIP','Miễn phí vận chuyển','Miễn phí vận chuyển cho đơn hàng từ 1 triệu','fixed',50000.00,1000000.00,50000.00,50,0,'2024-01-01 00:00:00','2024-06-30 23:59:59',1,'2025-08-26 04:28:40','2025-08-26 04:28:40'),(3,'NEWUSER','Giảm giá cho khách mới','Giảm giá 15% cho khách hàng mới','percentage',15.00,200000.00,100000.00,200,0,'2024-01-01 00:00:00','2024-12-31 23:59:59',1,'2025-08-26 04:28:40','2025-08-26 04:28:40'),(4,'VIP50','Giảm giá VIP 50%','Giảm giá 50% cho khách hàng VIP','percentage',50.00,1000000.00,500000.00,10,0,'2024-01-01 00:00:00','2024-03-31 23:59:59',1,'2025-08-26 04:28:40','2025-08-26 04:29:09'),(5,'vudz2310','111111','111111','percentage',100.00,1000.00,10000.00,1000,0,'2025-08-26 11:35:00','2025-08-30 11:35:00',1,'2025-08-26 04:35:59','2025-08-26 04:35:59'),(9,'hmm','hmmm','200002','percentage',100.00,10000.00,1000000000.00,10000,0,'2025-08-26 12:09:00','2025-08-30 12:09:00',1,'2025-08-26 05:01:28','2025-08-26 05:09:05'),(10,'h111','11111','111','percentage',100.00,100.00,1000000000.00,1,0,'2025-08-26 12:08:00','2025-08-30 12:08:00',1,'2025-08-26 05:05:35','2025-08-26 05:08:46'),(11,'1111111','11111','111111','percentage',100.00,10000.00,100000.00,100000,0,'2025-08-26 13:23:00','2025-08-30 13:23:00',1,'2025-08-26 06:23:12','2025-08-26 06:23:12'),(12,'11','11','111','percentage',111.00,111.00,11.00,11,0,'2025-07-13 14:10:00','2025-08-30 14:10:00',1,'2025-08-26 06:52:43','2025-08-26 07:10:55');
UNLOCK TABLES;

DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `parent_id` bigint unsigned DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `fk_categories_parent` (`parent_id`),
  CONSTRAINT `fk_categories_parent` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `categories` WRITE;
INSERT INTO `categories` VALUES (1,'Điện thoạii','dien-thoaii',NULL,1,'2025-08-25 17:49:05'),(2,'Laptop','laptop',NULL,2,'2025-08-25 17:49:05'),(3,'Tai nghe','tai-nghe',NULL,3,'2025-08-25 17:49:05'),(4,'Máy tính bảng','may-tinh-bang',NULL,4,'2025-08-25 17:49:05'),(5,'Đồng hồ thông minh','dong-ho-thong-minh',NULL,5,'2025-08-25 17:49:05'),(6,'hhh','hhh',NULL,0,'2025-08-26 13:52:17');
UNLOCK TABLES;

DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `method` enum('cod','bank','momo') NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `status` enum('pending','success','failed','refunded') NOT NULL DEFAULT 'pending',
  `transaction_ref` varchar(191) DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `payload_json` json DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pay_order` (`order_id`,`status`),
  CONSTRAINT `fk_pay_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `payments` WRITE;
UNLOCK TABLES;

DROP TABLE IF EXISTS `product_variants`;
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

LOCK TABLES `product_variants` WRITE;
INSERT INTO `product_variants` VALUES (1,1,'IP15P-BL-1281111','Black','128GB',29990000.00,32990000.00,1111.000,1,'2025-08-25 17:49:05'),(2,1,'IP15P-BL-256','Black','256GB',33990000.00,36990000.00,0.200,1,'2025-08-25 17:49:05'),(3,2,'MBA-M2-8-256','Silver','8/256',32990000.00,34990000.00,1.200,1,'2025-08-25 17:49:05'),(4,3,'APP-2ND-WHITE','White','Standard',6990000.00,7990000.00,0.050,1,'2025-08-25 17:49:05'),(5,3,'APP-2ND-BLACK','Black','Standard',6990000.00,7990000.00,0.050,1,'2025-08-25 17:49:05'),(6,4,'IPP-12-9-128-WIFI','Silver','128GB WiFi',25990000.00,27990000.00,0.680,1,'2025-08-25 17:49:05'),(7,4,'IPP-12-9-256-WIFI','Silver','256GB WiFi',28990000.00,30990000.00,0.680,1,'2025-08-25 17:49:05'),(8,5,'AWS-9-41-ALUM','Aluminum','41mm',9990000.00,10990000.00,0.030,1,'2025-08-25 17:49:05'),(9,5,'AWS-9-45-ALUM','Aluminum','45mm',10990000.00,11990000.00,0.030,1,'2025-08-25 17:49:05'),(10,5,'AWS-9-45-ALUMm','đỏ','128 GB',2000040433.00,200000.00,256.000,1,'2025-08-26 09:18:49');
UNLOCK TABLES;

DROP TABLE IF EXISTS `products`;
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

LOCK TABLES `products` WRITE;
INSERT INTO `products` VALUES (1,'iPhone 15 Pro','iphone-15-pro','IP15P','iPhone 15 Pro với chip A17 Pro mạnh mẽ, camera 48MP, màn hình Super Retina XDR 6.1 inch.','/uploads/image-1756145276371-924508581.jpg','iPhone 15 Pro - Product Image','View iPhone 15 Pro - Product Details',0,'Apple',1,'2025-08-25 17:49:05','2025-08-26 01:07:56'),(2,'MacBook Air M2','macbook-air-m2','MBA-M2','Laptop mỏng nhẹ với chip M2, màn hình 13.6 inch, pin trâu.','/uploads/image-1756146330950-290927906.jpg','MacBook Air M2 - Product Image','View MacBook Air M2 - Product Details',1,'Apple',1,'2025-08-25 17:49:05','2025-08-26 01:25:30'),(3,'AirPods Pro 2nd Gen','airpods-pro-2nd-gen','APP-2ND','Tai nghe không dây với chống ồn chủ động, âm thanh chất lượng cao.','/uploads/image-1756146349182-103219334.jpg','AirPods Pro 2nd Gen - Wireless Earbuds','View AirPods Pro 2nd Gen - Wireless Earbuds Details',1,'Apple',1,'2025-08-25 17:49:05','2025-08-26 01:25:49'),(4,'iPad Pro 12.9','ipad-pro-12-9','IPP-12-9','Máy tính bảng cao cấp với màn hình 12.9 inch, chip M2 mạnh mẽ.','/uploads/image-1756146367333-759597370.jpg','iPad Pro 12.9 - Premium Tablet','View iPad Pro 12.9 - Premium Tablet Details',1,'Apple',1,'2025-08-25 17:49:05','2025-08-26 01:26:07'),(5,'Apple Watch Series 9','apple-watch-series-9','AWS-91','Đồng hồ thông minh với nhiều tính năng sức khỏe và thể thao.','/uploads/image-1756191942161-790941647.jpg','Apple Watch Series 9 - Smart Watch','View Apple Watch Series 9 - Smart Watch Details',1,'Apple',1,'2025-08-25 17:49:05','2025-08-26 14:10:30');

UNLOCK TABLES;

