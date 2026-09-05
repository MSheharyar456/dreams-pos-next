-- phpMyAdmin SQL Dump
-- version 4.9.0.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 09, 2025 at 04:37 PM
-- Server version: 10.4.6-MariaDB
-- PHP Version: 7.2.22

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pos`
--

-- --------------------------------------------------------

--
-- Table structure for table `collection`
--

CREATE TABLE `collection` (
  `transaction_id` int(11) NOT NULL,
  `date` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `invoice` varchar(100) NOT NULL,
  `amount` varchar(100) NOT NULL,
  `remarks` varchar(100) NOT NULL,
  `balance` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `customer`
--

CREATE TABLE `customer` (
  `customer_id` int(11) NOT NULL,
  `customer_name` varchar(100) NOT NULL,
  `address` varchar(100) DEFAULT NULL,
  `contact` varchar(100) DEFAULT NULL,
  `membership_number` varchar(100) DEFAULT NULL,
  `prod_name` varchar(550) DEFAULT NULL,
  `expected_date` varchar(500) DEFAULT NULL,
  `note` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `customer`
--

INSERT INTO `customer` (`customer_id`, `customer_name`, `address`, `contact`, `membership_number`, `prod_name`, `expected_date`, `note`) VALUES
(1, 'dsf', NULL, NULL, NULL, NULL, NULL, NULL),
(2, 'ali', NULL, NULL, NULL, NULL, NULL, NULL),
(3, 'kjl', NULL, NULL, NULL, NULL, NULL, NULL),
(4, 'kjl', NULL, NULL, NULL, NULL, NULL, NULL),
(5, 'dhjf', NULL, NULL, NULL, NULL, NULL, NULL),
(6, 'dhjf', NULL, NULL, NULL, NULL, NULL, NULL),
(7, 'dhjf', NULL, NULL, NULL, NULL, NULL, NULL),
(8, 'dhjf', NULL, NULL, NULL, NULL, NULL, NULL),
(9, 'ghjg', NULL, NULL, NULL, NULL, NULL, NULL),
(10, 'ali', NULL, NULL, NULL, NULL, NULL, NULL),
(11, 'dsfj', NULL, NULL, NULL, NULL, NULL, NULL),
(12, 'ejfoj', NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `product_id` int(11) NOT NULL,
  `product_code` varchar(200) NOT NULL,
  `gen_name` varchar(200) NOT NULL,
  `product_name` varchar(200) NOT NULL,
  `cost` varchar(100) NOT NULL,
  `o_price` varchar(100) NOT NULL,
  `price` varchar(100) DEFAULT NULL,
  `profit` varchar(100) DEFAULT NULL,
  `supplier` varchar(100) NOT NULL,
  `onhand_qty` int(10) NOT NULL,
  `qty` int(11) DEFAULT NULL,
  `qty_sold` int(11) NOT NULL DEFAULT 0,
  `expiry_date` varchar(500) DEFAULT NULL,
  `date_arrival` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`product_id`, `product_code`, `gen_name`, `product_name`, `cost`, `o_price`, `price`, `profit`, `supplier`, `onhand_qty`, `qty`, `qty_sold`, `expiry_date`, `date_arrival`) VALUES
(1, 'dfds', 'csf', 'fg ', '', '6000', '60000.00', NULL, 'sdf', 5, 1, 0, NULL, '2025-07-31'),
(2, 'iofd', 'jsdjkl', 'ljklj  ', '', '500', '2500.00', NULL, 'sdf', 10, 0, 0, NULL, '2025-10-25'),
(3, 'hlkjf', 'kjdsfkkfd', 'dsfs', '', '1500', '7500.00', NULL, 'sdf', 5, 1, 0, NULL, '');

-- --------------------------------------------------------

--
-- Table structure for table `purchases`
--

CREATE TABLE `purchases` (
  `transaction_id` int(11) NOT NULL,
  `invoice_number` varchar(100) NOT NULL,
  `date` varchar(100) NOT NULL,
  `suplier` varchar(100) NOT NULL,
  `remarks` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `purchases_item`
--

CREATE TABLE `purchases_item` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `qty` int(11) NOT NULL,
  `cost` varchar(100) NOT NULL,
  `invoice` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `purchase_item`
--

CREATE TABLE `purchase_item` (
  `purchase_id` int(11) NOT NULL,
  `invoice` varchar(255) DEFAULT NULL,
  `distributor` varchar(255) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `paid_amount` decimal(10,2) DEFAULT NULL,
  `p_amount` decimal(10,2) DEFAULT NULL,
  `remarks` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `sales`
--

CREATE TABLE `sales` (
  `transaction_id` int(11) NOT NULL,
  `invoice_number` varchar(100) NOT NULL,
  `cashier` varchar(100) NOT NULL,
  `date` varchar(100) NOT NULL,
  `type` varchar(100) NOT NULL,
  `amount` varchar(100) NOT NULL,
  `profit` varchar(100) NOT NULL,
  `due_date` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `balance` varchar(100) NOT NULL,
  `o_price` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `sales`
--

INSERT INTO `sales` (`transaction_id`, `invoice_number`, `cashier`, `date`, `type`, `amount`, `profit`, `due_date`, `name`, `balance`, `o_price`) VALUES
(1, 'RS-2358837', 'Admin', '07/31/25', 'cash', '9000', '3000', '5000', 'dsf', '', 0),
(2, 'RS-03002202', 'ali', '10/23/25', 'cash', '40000', '10000', '40000', 'ali', '', 0),
(3, 'RS-262336', 'ali', '10/24/25', 'cash', '600', '100', '600', 'kjl', '', 0),
(4, 'RS-262336', 'ali', '10/24/25', 'cash', '600', '100', '600', 'kjl', '', 0),
(5, 'RS-262336', 'ali', '10/24/25', 'cash', '600', '100', '600', 'dhjf', '', 0),
(6, 'RS-262336', 'ali', '10/24/25', 'cash', '600', '100', '600', 'dhjf', '', 0),
(7, 'RS-262336', 'ali', '10/24/25', 'cash', '600', '100', '600', 'dhjf', '', 0),
(8, 'RS-262336', 'ali', '10/24/25', 'cash', '600', '100', '600', 'dhjf', '', 0),
(9, 'RS-622236', 'shazia bibi', '10/26/25', 'cash', '1800', '300', '1800', 'ghjg', '', 0),
(10, 'RS-038032', 'shazia bibi', '10/26/25', 'cash', '600', '100', '600', 'ali', '', 0),
(11, 'RS-0552358', 'shazia bibi', '10/26/25', 'cash', '27000', '9000', '800', 'dsfj', '', 0),
(12, 'RS-68730600', 'ali', '11/04/25', 'cash', '7200', '1200', '7000', 'ejfoj', '', 0);

-- --------------------------------------------------------

--
-- Table structure for table `sales_order`
--

CREATE TABLE `sales_order` (
  `transaction_id` int(11) NOT NULL,
  `invoice` varchar(100) NOT NULL,
  `product` varchar(100) NOT NULL,
  `qty` varchar(100) NOT NULL,
  `amount` varchar(100) NOT NULL,
  `profit` varchar(100) NOT NULL,
  `product_code` varchar(150) NOT NULL,
  `gen_name` varchar(200) NOT NULL,
  `name` varchar(200) NOT NULL,
  `price` varchar(100) NOT NULL,
  `o_price` int(100) NOT NULL,
  `discount` varchar(100) NOT NULL,
  `date` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `sales_order`
--

INSERT INTO `sales_order` (`transaction_id`, `invoice`, `product`, `qty`, `amount`, `profit`, `product_code`, `gen_name`, `name`, `price`, `o_price`, `discount`, `date`) VALUES
(1, 'RS-2358837', '1', '1', '9000', '3000', 'dfds', 'csf', 'fg', '6000', 9000, '', '07/31/25'),
(2, 'RS-623', '1', '1', '10000', '4000', 'dfds', 'csf', 'fg', '6000', 10000, '', '07/31/25'),
(3, 'RS-320303', '1', '1', '7000', '1000', 'dfds', 'csf', 'fg', '6000', 7000, '', '10/22/25'),
(5, 'RS-0330340', '1', '1', '70000', '64000', 'dfds', 'csf', 'fg', '6000', 70000, '', '10/23/25'),
(6, 'RS-230024', '1', '1', '60000', '54000', 'dfds', 'csf', 'fg', '6000', 60000, '', '10/23/25'),
(7, 'RS-234022', '1', '1', '7000', '1000', 'dfds', 'csf', 'fg ', '6000', 7000, '', '10/23/25'),
(8, 'RS-03002202', '1', '5', '40000', '10000', 'dfds', 'csf', 'fg ', '6000', 8000, '', '10/23/25'),
(9, 'RS-03302', '2', '5', '3000', '500', 'iofd', 'jsdjkl', 'ljklj ', '500', 600, '', '10/24/25'),
(10, 'RS-25233', '2', '5', '3000', '500', 'iofd', 'jsdjkl', 'ljklj ', '500', 600, '', '10/24/25'),
(11, 'RS-262336', '2', '1', '600', '100', 'iofd', 'jsdjkl', 'ljklj  ', '500', 600, '', '10/24/25'),
(12, 'RS-622236', '2', '3', '1800', '300', 'iofd', 'jsdjkl', 'ljklj  ', '500', 600, '', '10/26/25'),
(13, 'RS-038032', '2', '1', '600', '100', 'iofd', 'jsdjkl', 'ljklj  ', '500', 600, '', '10/26/25'),
(14, 'RS-0552358', '1', '3', '27000', '9000', 'dfds', 'csf', 'fg ', '6000', 9000, '', '10/26/25'),
(15, 'RS-68730600', '3', '4', '7200', '1200', 'hlkjf', 'kjdsfkkfd', 'dsfs', '1500', 1800, '', '11/04/25');

-- --------------------------------------------------------

--
-- Table structure for table `supliers`
--

CREATE TABLE `supliers` (
  `suplier_id` int(11) NOT NULL,
  `suplier_name` varchar(100) NOT NULL,
  `suplier_address` varchar(100) NOT NULL,
  `suplier_contact` varchar(100) NOT NULL,
  `contact_person` varchar(100) NOT NULL,
  `note` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `supliers`
--

INSERT INTO `supliers` (`suplier_id`, `suplier_name`, `suplier_address`, `suplier_contact`, `contact_person`, `note`) VALUES
(1, 'sdf', 'dsf', '3366', 'dsfjskfd', 'sds');

-- --------------------------------------------------------

--
-- Table structure for table `udhar_customer`
--

CREATE TABLE `udhar_customer` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `cashier` varchar(255) NOT NULL,
  `invoice_no` varchar(100) NOT NULL,
  `date` date NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `paid_amount` decimal(10,2) DEFAULT 0.00,
  `balance` decimal(10,2) GENERATED ALWAYS AS (`amount` - `paid_amount`) STORED,
  `due_date` date DEFAULT NULL,
  `remarks` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `loan` varchar(255) NOT NULL,
  `updation_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `udhar_customer`
--

INSERT INTO `udhar_customer` (`id`, `customer_id`, `cashier`, `invoice_no`, `date`, `amount`, `paid_amount`, `due_date`, `remarks`, `loan`, `updation_date`) VALUES
(1, 1, 'ali', 'RS-2358837', '2025-07-31', '9000.00', '5000.00', '0000-00-00', 'gf', 'Baqaya len', '2025-10-26 05:16:06'),
(2, 2, 'ali', 'RS-03002202', '2025-10-23', '40000.00', '40000.00', '0000-00-00', '2', 'Baqaya len', '2025-10-26 17:17:53'),
(11, 11, 'shazia bibi', 'RS-0552358', '2025-10-26', '27000.00', '800.00', '0000-00-00', 'jsdj', 'Baqaya len', '2025-10-26 05:11:55'),
(12, 0, '12', 'RS-68730600', '2025-11-04', '7200.00', '7000.00', '0000-00-00', 'hehds', 'Baqaya len', '2025-11-04 15:06:01');

-- --------------------------------------------------------

--
-- Table structure for table `udhar_suplier`
--

CREATE TABLE `udhar_suplier` (
  `id` int(11) NOT NULL,
  `suplier_id` int(11) NOT NULL,
  `invoice_no` varchar(100) NOT NULL,
  `date` date NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `paid_amount` decimal(10,2) DEFAULT 0.00,
  `balance` decimal(10,2) GENERATED ALWAYS AS (`amount` - `paid_amount`) STORED,
  `due_date` date DEFAULT NULL,
  `remarks` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `loan` varchar(255) NOT NULL,
  `updation_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `position` varchar(100) NOT NULL,
  `profile_image` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `username`, `password`, `name`, `position`, `profile_image`) VALUES
(1, 'admin', '$2y$10$u0dVB9YkaU30zdTUGmgXiedmrWjPcpCkER0WfzjQ2szGHHyuyhvJi', 'Sheharyar', 'admin', '../uploads/1761451506_529ff723404b2601dc62353c67e3007c.jpg'),
(5, 'ali123', '$2y$10$7VBZdCKGzfP/ZGFd60q2luV0dI1cKak9FYxpT6qLj1Yw35hPRM7ny', 'ali', 'cashier', '../uploads/1761452722_onboard1.png'),
(6, 'shazia123', '$2y$10$Cuo8en7GgK7MOdMldLwMXOBJZzjbbPoDhRLhaDxhldw89ZnBZbdhy', 'shazia bibi', 'cashier', '../uploads/1761454355_529ff723404b2601dc62353c67e3007c.jpg');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `collection`
--
ALTER TABLE `collection`
  ADD PRIMARY KEY (`transaction_id`);

--
-- Indexes for table `customer`
--
ALTER TABLE `customer`
  ADD PRIMARY KEY (`customer_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`product_id`);

--
-- Indexes for table `purchases`
--
ALTER TABLE `purchases`
  ADD PRIMARY KEY (`transaction_id`);

--
-- Indexes for table `purchases_item`
--
ALTER TABLE `purchases_item`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `purchase_item`
--
ALTER TABLE `purchase_item`
  ADD PRIMARY KEY (`purchase_id`);

--
-- Indexes for table `sales`
--
ALTER TABLE `sales`
  ADD PRIMARY KEY (`transaction_id`);

--
-- Indexes for table `sales_order`
--
ALTER TABLE `sales_order`
  ADD PRIMARY KEY (`transaction_id`);

--
-- Indexes for table `supliers`
--
ALTER TABLE `supliers`
  ADD PRIMARY KEY (`suplier_id`);

--
-- Indexes for table `udhar_customer`
--
ALTER TABLE `udhar_customer`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `udhar_suplier`
--
ALTER TABLE `udhar_suplier`
  ADD PRIMARY KEY (`id`),
  ADD KEY `udhar_suplier_ibfk_1` (`suplier_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `collection`
--
ALTER TABLE `collection`
  MODIFY `transaction_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `customer`
--
ALTER TABLE `customer`
  MODIFY `customer_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `purchases`
--
ALTER TABLE `purchases`
  MODIFY `transaction_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `purchases_item`
--
ALTER TABLE `purchases_item`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `purchase_item`
--
ALTER TABLE `purchase_item`
  MODIFY `purchase_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sales`
--
ALTER TABLE `sales`
  MODIFY `transaction_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `sales_order`
--
ALTER TABLE `sales_order`
  MODIFY `transaction_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `supliers`
--
ALTER TABLE `supliers`
  MODIFY `suplier_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `udhar_customer`
--
ALTER TABLE `udhar_customer`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `udhar_suplier`
--
ALTER TABLE `udhar_suplier`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `udhar_suplier`
--
ALTER TABLE `udhar_suplier`
  ADD CONSTRAINT `udhar_suplier_ibfk_1` FOREIGN KEY (`suplier_id`) REFERENCES `supliers` (`suplier_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
