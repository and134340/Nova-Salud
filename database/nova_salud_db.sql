-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         8.4.3 - MySQL Community Server - GPL
-- SO del servidor:              Win64
-- HeidiSQL Versión:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Volcando estructura de base de datos para nova_salud_db
CREATE DATABASE IF NOT EXISTS `nova_salud_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `nova_salud_db`;

-- Volcando estructura para tabla nova_salud_db.categorias
CREATE TABLE IF NOT EXISTS `categorias` (
  `id_categoria` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_categoria`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla nova_salud_db.categorias: ~6 rows (aproximadamente)
INSERT INTO `categorias` (`id_categoria`, `nombre`, `descripcion`) VALUES
	(1, 'Medicamentos', 'Medicamentos de uso general'),
	(2, 'Vitaminas', 'Vitaminas y suplementos'),
	(3, 'Cuidado personal', 'Productos de higiene y cuidado personal'),
	(4, 'Primeros auxilios', 'Productos para atención básica'),
	(5, 'Higiene bucal', 'Productos para la higiene y cuidado de los dientes y la boca'),
	(6, 'Bebés y cuidado infantil', 'Productos de higiene y cuidado para bebés');

-- Volcando estructura para tabla nova_salud_db.detalle_ventas
CREATE TABLE IF NOT EXISTS `detalle_ventas` (
  `id_detalle` int NOT NULL AUTO_INCREMENT,
  `id_venta` int NOT NULL,
  `id_producto` int NOT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_detalle`),
  KEY `id_venta` (`id_venta`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `detalle_ventas_ibfk_1` FOREIGN KEY (`id_venta`) REFERENCES `ventas` (`id_venta`),
  CONSTRAINT `detalle_ventas_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla nova_salud_db.detalle_ventas: ~2 rows (aproximadamente)
INSERT INTO `detalle_ventas` (`id_detalle`, `id_venta`, `id_producto`, `cantidad`, `precio_unitario`, `subtotal`) VALUES
	(1, 1, 1, 1, 5.00, 5.00),
	(2, 1, 3, 1, 15.00, 15.00);

-- Volcando estructura para tabla nova_salud_db.productos
CREATE TABLE IF NOT EXISTS `productos` (
  `id_producto` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `id_categoria` int DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `stock_minimo` int NOT NULL DEFAULT '5',
  `estado` tinyint(1) DEFAULT '1',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_producto`),
  KEY `id_categoria` (`id_categoria`),
  CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id_categoria`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla nova_salud_db.productos: ~20 rows (aproximadamente)
INSERT INTO `productos` (`id_producto`, `nombre`, `descripcion`, `id_categoria`, `precio`, `stock`, `stock_minimo`, `estado`, `fecha_creacion`) VALUES
	(1, 'Paracetamol 500mg', 'Tabletas para aliviar el dolor y la fiebre', 1, 5.00, 99, 5, 1, '2026-11-07 18:21:58'),
	(2, 'Ibuprofeno 400mg', 'Tabletas antiinflamatorias', 1, 8.50, 80, 5, 1, '2026-11-07 18:21:58'),
	(3, 'Vitamina C', 'Suplemento de vitamina C', 2, 15.00, 49, 5, 1, '2026-11-07 18:21:58'),
	(4, 'Alcohol medicinal', 'Alcohol para uso externo', 3, 7.00, 60, 5, 1, '2026-11-07 18:21:58'),
	(5, 'Gasas esterilizadas', 'Gasas para curaciones', 4, 4.50, 120, 5, 1, '2026-11-07 18:21:58'),
	(7, 'Loratadina 10 mg', 'Antialérgico en tabletas', 1, 1.50, 80, 5, 1, '2026-11-07 22:13:18'),
	(8, 'Omeprazol 20 mg', 'Cápsulas para el tratamiento de problemas gástricos', 1, 1.00, 100, 5, 1, '2026-11-07 22:13:18'),
	(9, 'Sales de rehidratación oral', 'Sobres para preparar solución de rehidratación', 1, 3.50, 50, 5, 1, '2026-11-07 22:13:18'),
	(10, 'Complejo B', 'Suplemento vitamínico', 2, 1.50, 60, 5, 1, '2026-11-07 22:13:18'),
	(11, 'Multivitamínico', 'Suplemento de vitaminas y minerales', 2, 2.00, 45, 5, 1, '2026-11-07 22:13:18'),
	(12, 'Vitamina D3', 'Suplemento de vitamina D3', 2, 2.50, 40, 5, 1, '2026-11-07 22:13:18'),
	(13, 'Shampoo', 'Producto para la limpieza del cabello', 3, 12.90, 30, 5, 1, '2026-11-07 22:13:18'),
	(14, 'Jabón antibacterial', 'Jabón para higiene personal', 3, 4.50, 50, 5, 1, '2026-11-07 22:13:18'),
	(15, 'Protector solar FPS 50', 'Protector solar para uso diario', 3, 35.90, 20, 5, 1, '2026-11-07 22:13:18'),
	(16, 'Agua oxigenada', 'Solución de peróxido de hidrógeno', 4, 4.00, 35, 5, 1, '2026-11-07 22:13:18'),
	(17, 'Vendas elásticas', 'Venda para primeros auxilios', 4, 6.50, 25, 5, 1, '2026-11-07 22:13:18'),
	(18, 'Curitas', 'Apósitos adhesivos para heridas pequeñas', 4, 5.00, 40, 5, 1, '2026-11-07 22:13:18'),
	(19, 'Pasta dental', 'Producto para higiene bucal', 5, 7.50, 35, 5, 1, '2026-11-07 22:13:18'),
	(20, 'Cepillo dental', 'Cepillo para limpieza dental', 5, 5.90, 30, 5, 1, '2026-11-07 22:13:18'),
	(21, 'Pañales para bebé', 'Pañales desechables para bebé', 6, 39.90, 20, 5, 1, '2026-11-07 22:13:18');

-- Volcando estructura para tabla nova_salud_db.usuarios
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `correo` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol` enum('administrador','vendedor') COLLATE utf8mb4_unicode_ci DEFAULT 'vendedor',
  `estado` tinyint(1) DEFAULT '1',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `correo` (`correo`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla nova_salud_db.usuarios: ~8 rows (aproximadamente)
INSERT INTO `usuarios` (`id_usuario`, `nombre`, `correo`, `password`, `rol`, `estado`, `fecha_creacion`) VALUES
	(1, 'Administrador', 'admin@novasalud.com', '123456', 'vendedor', 1, '2026-11-07 21:00:45'),
	(2, 'Andresss', 'andres21@gmail.com', '1234567', 'vendedor', 1, '2026-11-07 21:48:04'),
	(3, 'José', 'jose@novasalud.com', '654321', 'vendedor', 1, '2026-11-07 22:20:14'),
	(4, 'Ana', 'ana@novasalud.com', 'Ana1234', 'vendedor', 1, '2026-11-07 22:20:50'),
	(5, 'Franco', 'franco@novasalud.com', 'fran12345', 'vendedor', 1, '2026-11-07 22:21:30'),
	(6, 'Melani', 'melani@novasalud.com', '5678910', 'vendedor', 1, '2026-11-07 22:21:52'),
	(7, 'Gabriela', 'gabriela@novasalud.com', 'gabriela34567', 'vendedor', 1, '2026-11-07 22:22:48'),
	(8, 'Imanol', 'imanol@novasalud.com', 'ima210107', 'vendedor', 1, '2026-11-07 22:23:05');

-- Volcando estructura para tabla nova_salud_db.ventas
CREATE TABLE IF NOT EXISTS `ventas` (
  `id_venta` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `fecha_venta` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_venta`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `ventas_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla nova_salud_db.ventas: ~1 rows (aproximadamente)
INSERT INTO `ventas` (`id_venta`, `id_usuario`, `total`, `fecha_venta`) VALUES
	(1, 1, 20.00, '2026-11-07 21:03:53');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
