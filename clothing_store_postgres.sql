-- SQLINES DEMO ***  Distrib 8.0.43, for Win64 (x86_64)
--
-- SQLINES DEMO ***   Database: clothing_store
-- SQLINES DEMO *** -------------------------------------
-- SQLINES DEMO *** 5.5-10.4.32-MariaDB

/* SQLINES DEMO *** CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/* SQLINES DEMO *** CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/* SQLINES DEMO *** COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/* SQLINES DEMO ***  utf8mb4 */;
/* SQLINES DEMO *** TIME_ZONE=@@TIME_ZONE */;
/* SQLINES DEMO *** ZONE='+00:00' */;
/* SQLINES DEMO *** UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/* SQLINES DEMO *** FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/* SQLINES DEMO *** SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/* SQLINES DEMO *** SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- SQLINES DEMO *** or table `admin_users`
--

DROP TABLE IF EXISTS admin_users;
/* SQLINES DEMO *** d_cs_client     = @@character_set_client */;
/* SQLINES DEMO *** cter_set_client = utf8mb4 */;
-- SQLINES FOR EVALUATION USE ONLY (14 DAYS)
CREATE TABLE admin_users (
  admin_id int NOT NULL GENERATED ALWAYS AS IDENTITY,
  username varchar(50) NOT NULL,
  password_hash varchar(255) NOT NULL,
  email varchar(100) DEFAULT NULL,
  created_at timestamp(0) NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (admin_id),
  CONSTRAINT username UNIQUE (username)
)  ;

ALTER SEQUENCE admin_users_seq RESTART WITH 2;
/* SQLINES DEMO *** cter_set_client = @saved_cs_client */;

--
-- SQLINES DEMO *** table `admin_users`
--

LOCK TABLES admin_users WRITE;
/* SQLINES DEMO *** LE `admin_users` DISABLE KEYS */;
INSERT INTO admin_users VALUES (1,'admin123','$2b$10$kiTqWFJTU8yIQjToeFPWyOvwJL4Mm6uxx30i2Ym5n5X89F4TPC3Ya','chandimapramod6@gmail.com','2025-12-16 10:36:46');
/* SQLINES DEMO *** LE `admin_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- SQLINES DEMO *** or table `categories`
--

DROP TABLE IF EXISTS categories;
/* SQLINES DEMO *** d_cs_client     = @@character_set_client */;
/* SQLINES DEMO *** cter_set_client = utf8mb4 */;
CREATE TABLE categories (
  category_id int NOT NULL GENERATED ALWAYS AS IDENTITY,
  category_name varchar(100) NOT NULL,
  description text DEFAULT NULL,
  image_path varchar(500) DEFAULT NULL,
  hover_image_path varchar(500) DEFAULT NULL,
  is_active smallint DEFAULT 1,
  created_at timestamp(0) NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (category_id)
)  ;

ALTER SEQUENCE categories_seq RESTART WITH 5;
/* SQLINES DEMO *** cter_set_client = @saved_cs_client */;

--
-- SQLINES DEMO *** table `categories`
--

LOCK TABLES categories WRITE;
/* SQLINES DEMO *** LE `categories` DISABLE KEYS */;
INSERT INTO categories VALUES (1,'Men','','/uploads/products/1765881707211-478014820.jpeg','/uploads/products/1765881707210-54051452.jpeg',1,'2025-12-16 10:41:47'),(2,'Wemen','Wemen's cloths','/uploads/products/1765887780685-635466577.jpg','/uploads/products/1765887780687-350623184.jpg',1,'2025-12-16 12:23:00'),(3,'Men','','/uploads/products/1765945015972-703783670.jpeg','/uploads/products/1765945015971-951218279.jpeg',0,'2025-12-17 04:16:55'),(4,'Men','','/uploads/products/1765945046382-125534702.jpeg','/uploads/products/1765945046383-566236975.jpeg',0,'2025-12-17 04:17:26');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_messages`
--

DROP TABLE IF EXISTS `contact_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_messages` (
  `message_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `message` text NOT NULL,
  `status` enum('new','read','replied') DEFAULT 'new',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `replied_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`message_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_messages`
--

LOCK TABLES `contact_messages` WRITE;
/*!40000 ALTER TABLE `contact_messages` DISABLE KEYS */;
INSERT INTO `contact_messages` VALUES (1,'Site','chandimapramod6@gmail.com','scaSv raeg erga','new','2025-12-16 11:36:01',NULL),(2,'wefwe','fernandopramod0@gmail.com','efgser g serg','new','2025-12-16 11:40:05',NULL),(3,'Site','fernandopramod0@gmail.com','rqfw fagr wg','new','2025-12-16 11:45:10',NULL),(4,'yrthbd','pramodfernando49@gmail.com','zgr rsgre g','new','2025-12-16 11:48:10',NULL),(5,'ewfes','pramodfernando49@gmail.com','srfergfer','new','2025-12-16 12:01:34',NULL),(6,'fcsd','pramodfernando49@gmail.com','zfvrgr','new','2025-12-16 12:04:32',NULL),(7,'pramo chand','pramodfernando49@gmail.com','rehtrt h5hy 5w4y','new','2025-12-16 12:09:42',NULL),(8,'pramo chand','pramodfernando49@gmail.com','htjgvj','new','2025-12-16 12:14:11',NULL),(9,'pramo chand','pramodfernando49@gmail.com','dfsbc b','new','2025-12-16 12:17:35',NULL),(10,'pramo chand','pramodfernando49@gmail.com','fdbgnvyjthf','new','2025-12-16 12:19:17',NULL),(11,'pramo chand','pramodfernando49@gmail.com','Welcome to FashionHub, your number one source for all things fashion. We're dedicated to giving you the very best of clothing, with a focus on quality, customer service, and uniqueness.nnFounded in 2024, FashionHub has come a long way from its beginnings. When we first started out, our passion for providing the best fashion at affordable prices drove us to start our own business. We now serve customers all over Sri Lanka and are thrilled to be a part of the eco-friendly wing of the fashion industry.','new','2025-12-16 12:20:11',NULL),(12,'pramo chand','pramodfernando49@gmail.com','grhtsrt hh','new','2025-12-16 12:57:57',NULL),(13,'pramo chand','pramodfernando49@gmail.com','fgnmb','new','2025-12-16 13:22:59',NULL),(14,'pramod','pramodfernando49@gmail.com','feghsgdjmh','new','2025-12-17 04:15:25',NULL),(15,'pramo chand','pramodfernando49@gmail.com','gergnery ey ae5y ae5y','new','2025-12-17 04:56:03',NULL);
/* SQLINES DEMO *** LE `contact_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- SQLINES DEMO *** or table `order_items`
--

DROP TABLE IF EXISTS order_items;
/* SQLINES DEMO *** d_cs_client     = @@character_set_client */;
/* SQLINES DEMO *** cter_set_client = utf8mb4 */;
CREATE TABLE order_items (
  item_id int NOT NULL GENERATED ALWAYS AS IDENTITY,
  order_id int DEFAULT NULL,
  product_id int DEFAULT NULL,
  color_name varchar(50) DEFAULT NULL,
  quantity int NOT NULL,
  unit_price decimal(10,2) NOT NULL,
  PRIMARY KEY (item_id)
,
  CONSTRAINT order_items_ibfk_1 FOREIGN KEY (order_id) REFERENCES orders (order_id) ON DELETE CASCADE,
  CONSTRAINT order_items_ibfk_2 FOREIGN KEY (product_id) REFERENCES products (product_id)
)  ;

ALTER SEQUENCE order_items_seq RESTART WITH 7;
/* SQLINES DEMO *** cter_set_client = @saved_cs_client */;

CREATE INDEX order_id ON order_items (order_id);
CREATE INDEX product_id ON order_items (product_id);

--
-- SQLINES DEMO *** table `order_items`
--

LOCK TABLES order_items WRITE;
/* SQLINES DEMO *** LE `order_items` DISABLE KEYS */;
INSERT INTO order_items VALUES (1,1,1,'Black',1,1400.00),(2,2,1,'Black',1,1400.00),(3,3,1,'Red',1,1400.00),(4,4,2,'Pink',1,3100.00),(5,5,1,'Red',1,1400.00),(6,6,1,'Red',1,1400.00);
/* SQLINES DEMO *** LE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- SQLINES DEMO *** or table `orders`
--

DROP TABLE IF EXISTS orders;
/* SQLINES DEMO *** d_cs_client     = @@character_set_client */;
/* SQLINES DEMO *** cter_set_client = utf8mb4 */;
CREATE TABLE orders (
  order_id int NOT NULL GENERATED ALWAYS AS IDENTITY,
  customer_name varchar(100) NOT NULL,
  total_amount decimal(10,2) NOT NULL,
  order_date timestamp(0) NOT NULL DEFAULT current_timestamp(),
  status varchar(20) DEFAULT 'pending',
  PRIMARY KEY (order_id)
)  ;

ALTER SEQUENCE orders_seq RESTART WITH 7;
/* SQLINES DEMO *** cter_set_client = @saved_cs_client */;

--
-- SQLINES DEMO *** table `orders`
--

LOCK TABLES orders WRITE;
/* SQLINES DEMO *** LE `orders` DISABLE KEYS */;
INSERT INTO orders VALUES (1,'WhatsApp Customer',1400.00,'2025-12-16 10:43:01','pending'),(2,'WhatsApp Customer',1400.00,'2025-12-16 10:44:55','pending'),(3,'WhatsApp Customer',1400.00,'2025-12-16 12:21:02','pending'),(4,'WhatsApp Customer',3100.00,'2025-12-16 12:26:03','pending'),(5,'WhatsApp Customer',1400.00,'2025-12-16 12:58:37','pending'),(6,'WhatsApp Customer',1400.00,'2025-12-17 04:55:41','pending');
/* SQLINES DEMO *** LE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- SQLINES DEMO *** or table `product_colors`
--

DROP TABLE IF EXISTS product_colors;
/* SQLINES DEMO *** d_cs_client     = @@character_set_client */;
/* SQLINES DEMO *** cter_set_client = utf8mb4 */;
CREATE TABLE product_colors (
  color_id int NOT NULL GENERATED ALWAYS AS IDENTITY,
  product_id int DEFAULT NULL,
  color_name varchar(50) NOT NULL,
  color_code varchar(7) DEFAULT '#000000',
  available smallint DEFAULT 1,
  PRIMARY KEY (color_id)
,
  CONSTRAINT product_colors_ibfk_1 FOREIGN KEY (product_id) REFERENCES products (product_id) ON DELETE CASCADE
)  ;

ALTER SEQUENCE product_colors_seq RESTART WITH 4;
/* SQLINES DEMO *** cter_set_client = @saved_cs_client */;

CREATE INDEX product_id ON product_colors (product_id);

--
-- SQLINES DEMO *** table `product_colors`
--

LOCK TABLES product_colors WRITE;
/* SQLINES DEMO *** LE `product_colors` DISABLE KEYS */;
INSERT INTO product_colors VALUES (1,1,'Black','#000000',1),(2,1,'Red','#ff0000',1),(3,2,'Pink','#c595c6',1);
/* SQLINES DEMO *** LE `product_colors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- SQLINES DEMO *** or table `products`
--

DROP TABLE IF EXISTS products;
/* SQLINES DEMO *** d_cs_client     = @@character_set_client */;
/* SQLINES DEMO *** cter_set_client = utf8mb4 */;
CREATE TABLE products (
  product_id int NOT NULL GENERATED ALWAYS AS IDENTITY,
  product_name varchar(200) NOT NULL,
  description text DEFAULT NULL,
  base_price decimal(10,2) NOT NULL,
  category_id int DEFAULT NULL,
  stock_quantity int DEFAULT 0,
  image_path varchar(500) DEFAULT NULL,
  is_active smallint DEFAULT 1,
  date_added timestamp(0) NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (product_id)
,
  CONSTRAINT products_ibfk_1 FOREIGN KEY (category_id) REFERENCES categories (category_id) ON DELETE SET NULL
)  ;

ALTER SEQUENCE products_seq RESTART WITH 3;
/* SQLINES DEMO *** cter_set_client = @saved_cs_client */;

CREATE INDEX category_id ON products (category_id);

--
-- SQLINES DEMO *** table `products`
--

LOCK TABLES products WRITE;
/* SQLINES DEMO *** LE `products` DISABLE KEYS */;
INSERT INTO products VALUES (1,'Shirt','Men's t shirt',1400.00,1,3,'/uploads/products/1765881766210-445836070.jpeg',1,'2025-12-16 10:42:46'),(2,'Frog','Wemen's frog',3100.00,2,17,'/uploads/products/1765887949549-770822792.jpg',1,'2025-12-16 12:25:49');
/* SQLINES DEMO *** LE `products` ENABLE KEYS */;
UNLOCK TABLES;
/* SQLINES DEMO *** ZONE=@OLD_TIME_ZONE */;

/* SQLINES DEMO *** ODE=@OLD_SQL_MODE */;
/* SQLINES DEMO *** GN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/* SQLINES DEMO *** E_CHECKS=@OLD_UNIQUE_CHECKS */;
/* SQLINES DEMO *** CTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/* SQLINES DEMO *** CTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/* SQLINES DEMO *** TION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/* SQLINES DEMO *** OTES=@OLD_SQL_NOTES */;

-- SQLINES DEMO ***  2025-12-17 12:59:08
