-- \connect restro_sync

CREATE TABLE menu_categories
(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE menu_allergens
(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);


CREATE TABLE menu_items
(
    item_id SERIAL PRIMARY KEY,
    item_name VARCHAR(255) UNIQUE NOT NULL,
    item_description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category_id INT REFERENCES menu_categories(id) ON DELETE SET NULL,
    is_available BOOLEAN DEFAULT TRUE,
    is_vegetarian BOOLEAN DEFAULT FALSE,
    is_vegan BOOLEAN DEFAULT FALSE,
    is_gluten_free BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE menu_item_allergens
(
    menu_item_id INT REFERENCES menu_items(item_id) ON DELETE CASCADE,
    allergen_id INT REFERENCES menu_allergens(id) ON DELETE CASCADE,
    PRIMARY KEY (menu_item_id, allergen_id)
);

-- Create the Users Table
CREATE TABLE users (
    username VARCHAR(50) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    password_hash TEXT NOT NULL,
    type CHAR(1) CHECK (type IN ('S', 'M', 'E')), -- 'S' = Store Owner, 'M' = Manager, 'E' = Employee
    store_id INTEGER NULL -- Nullable, user can exist without a store
);

-- Create the Tables Table
CREATE TABLE tables
(
    table_num SERIAL PRIMARY KEY,
    num_seats INT NOT NULL,
    table_status BOOLEAN DEFAULT TRUE
);


-- Create the Reservations Table
CREATE TABLE reservations
(
    reservation_id SERIAL PRIMARY KEY,
    table_num INT REFERENCES tables(table_num) ON DELETE CASCADE,
    customer_name VARCHAR(50) NOT NULL,
    reservation_time TIMESTAMP NOT NULL,
    party_size INT NOT NULL
);

-- Create the Stores Table
CREATE TABLE stores (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    owner_username VARCHAR(50) NOT NULL,
    CONSTRAINT fk_owner FOREIGN KEY (owner_username) REFERENCES users(username) ON DELETE CASCADE
);


CREATE SEQUENCE order_serial_seq START WITH 100001 INCREMENT BY 1;


CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    order_number VARCHAR(15) UNIQUE,
    store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
    order_type VARCHAR(10) NOT NULL CHECK(order_type IN ('Dine-In', 'Take-Out')),
    table_num INTEGER REFERENCES tables(table_num) ON DELETE CASCADE,
    customer_name VARCHAR(255),
    order_status VARCHAR(50) DEFAULT 'Active' CHECK(order_status IN ('Active', 'Completed', 'Cancelled')),
    order_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    special_instructions TEXT DEFAULT NULL,
    total_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_by VARCHAR(50) REFERENCES users(username) ON DELETE SET NULL
);

CREATE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE 
    new_serial INTEGER;
    new_order_number VARCHAR(15);
BEGIN
    SELECT nextval('order_serial_seq') INTO new_serial;
    IF NEW.order_type = 'Dine-In' THEN
        new_order_number := 'DINE-' || LPAD(new_serial::TEXT, 6, '0');
    ELSE
        new_order_number := 'TAKE-' || LPAD(new_serial::TEXT, 6, '0');
    END IF;

    NEW.order_number := new_order_number;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER trigger_generate_order_number
BEFORE INSERT ON orders 
FOR EACH ROW
EXECUTE FUNCTION generate_order_number();
    

CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(order_id) ON DELETE CASCADE,
    menu_item_id INTEGER REFERENCES menu_items(item_id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    item_price DECIMAL(10,2) NOT NULL,
    created_by VARCHAR(50) REFERENCES users(username) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE order_status_history
(
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(order_id) ON DELETE CASCADE,
    status VARCHAR(50) CHECK (status IN ('Active', 'Completed', 'Cancelled')),
    changed_by VARCHAR(50) REFERENCES users(username) ON DELETE SET NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users 
ADD CONSTRAINT fk_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE SET NULL;

--Insert Store Owners (Type: 'S')
INSERT INTO users (username, first_name, last_name, password_hash, type, store_id)
VALUES 
    ('owner_john', 'John', 'Doe', '$2b$10$6FG6GpA4rRSSu3RP/syyzOEbh5/thfOYGGodaEk3KcUhWYDgiQPF6', 'S', NULL),
    ('owner_alice', 'Alice', 'Johnson', '$2b$10$6FG6GpA4rRSSu3RP/syyzOEbh5/thfOYGGodaEk3KcUhWYDgiQPF6', 'S', NULL),
    ('owner_mark', 'Mark', 'Williams', '$2b$10$6FG6GpA4rRSSu3RP/syyzOEbh5/thfOYGGodaEk3KcUhWYDgiQPF6', 'S', NULL);

--Insert Stores (Each store must have an owner)
INSERT INTO stores (name, owner_username)
VALUES 
    ('SuperMart', 'owner_john'),
    ('TechGear', 'owner_alice'),
    ('FreshFoods', 'owner_mark');

--Assign Store Owners to Their Stores
UPDATE users SET store_id = (SELECT id FROM stores WHERE owner_username = 'owner_john') WHERE username = 'owner_john';
UPDATE users SET store_id = (SELECT id FROM stores WHERE owner_username = 'owner_alice') WHERE username = 'owner_alice';
UPDATE users SET store_id = (SELECT id FROM stores WHERE owner_username = 'owner_mark') WHERE username = 'owner_mark';

--Insert Managers (Type: 'M') Assigned to Stores
INSERT INTO users (username, first_name, last_name, password_hash, type, store_id)
VALUES 
    ('manager_bob', 'Bob', 'Brown', '$2b$10$6FG6GpA4rRSSu3RP/syyzOEbh5/thfOYGGodaEk3KcUhWYDgiQPF6', 'M', (SELECT id FROM stores WHERE name = 'SuperMart')),
    ('manager_susan', 'Susan', 'Clark', '$2b$10$6FG6GpA4rRSSu3RP/syyzOEbh5/thfOYGGodaEk3KcUhWYDgiQPF6', 'M', (SELECT id FROM stores WHERE name = 'TechGear')),
    ('manager_mike', 'Mike', 'Davis', '$2b$10$6FG6GpA4rRSSu3RP/syyzOEbh5/thfOYGGodaEk3KcUhWYDgiQPF6', 'M', (SELECT id FROM stores WHERE name = 'FreshFoods'));

--Insert Employees (Type: 'E') Assigned to Stores
INSERT INTO users (username, first_name, last_name, password_hash, type, store_id)
VALUES 
    ('employee_emma', 'Emma', 'Jones', '$2b$10$6FG6GpA4rRSSu3RP/syyzOEbh5/thfOYGGodaEk3KcUhWYDgiQPF6', 'E', (SELECT id FROM stores WHERE name = 'SuperMart')),
    ('employee_david', 'David', 'Moore', '$2b$10$6FG6GpA4rRSSu3RP/syyzOEbh5/thfOYGGodaEk3KcUhWYDgiQPF6', 'E', (SELECT id FROM stores WHERE name = 'TechGear')),
    ('employee_lisa', 'Lisa', 'Taylor', '$2b$10$6FG6GpA4rRSSu3RP/syyzOEbh5/thfOYGGodaEk3KcUhWYDgiQPF6', 'E', (SELECT id FROM stores WHERE name = 'FreshFoods')),
    ('employee_chris', 'Chris', 'Anderson', '$2b$10$6FG6GpA4rRSSu3RP/syyzOEbh5/thfOYGGodaEk3KcUhWYDgiQPF6', 'E', (SELECT id FROM stores WHERE name = 'FreshFoods'));

--Insert Users Without a Store (Type: 'M' and 'E' but no store)
INSERT INTO users (username, first_name, last_name, password_hash, type, store_id)
VALUES 
    ('user_no_store1', 'James', 'Harris', '$2b$10$6FG6GpA4rRSSu3RP/syyzOEbh5/thfOYGGodaEk3KcUhWYDgiQPF6', 'M', NULL),
    ('user_no_store2', 'Natalie', 'Martinez', '$2b$10$6FG6GpA4rRSSu3RP/syyzOEbh5/thfOYGGodaEk3KcUhWYDgiQPF6', 'E', NULL);
INSERT INTO menu_categories
    (name)
VALUES
    ('Appetizer');

INSERT INTO menu_categories
    (name)
VALUES('Main Course');
INSERT INTO menu_categories
    (name)
VALUES('Dessert');
INSERT INTO menu_categories
    (name)
VALUES('Beverage');

INSERT INTO menu_allergens
    (name)
VALUES('Dairy');
INSERT INTO menu_allergens
    (name)
VALUES('Gluten');

INSERT INTO menu_allergens
    (name)
VALUES('Eggs');

INSERT INTO menu_allergens
    (name)
VALUES('Soy');
INSERT INTO menu_allergens
    (name)
VALUES('Peanuts');
INSERT INTO menu_allergens
    (name)
VALUES('Tree Nuts');
INSERT INTO menu_allergens
    (name)
VALUES('Shellfish');
INSERT INTO menu_allergens
    (name)
VALUES('Fish');

INSERT INTO menu_items
    (item_name, item_description, price, category_id, is_available, is_vegetarian, is_vegan, is_gluten_free)
VALUES
    ('Margherita Pizza', 'Classic pizza with mozzarella, tomatoes, and basil.', 12.99,
        (SELECT id
        FROM menu_categories
        WHERE name = 'Main Course'), TRUE, TRUE, FALSE, FALSE);

INSERT INTO menu_items
    (item_name, item_description, price, category_id, is_available, is_vegetarian, is_vegan, is_gluten_free
)
VALUES
    ('Vegan Buddha Bowl', 'Quinoa, chickpeas, avocado, and tahini dressing.', 11.99,
        (SELECT id
        FROM menu_categories
        WHERE name = 'Main Course'), TRUE, FALSE, TRUE, TRUE);

INSERT INTO menu_items
    (item_name, item_description, price, category_id, is_available, is_vegetarian, is_vegan, is_gluten_free
)
VALUES('Cheesecake', 'Rich and creamy cheesecake topped with strawberries.', 6.49,
        (SELECT id
        FROM menu_categories
        WHERE name = 'Dessert'), TRUE, TRUE, FALSE, FALSE);

INSERT INTO tables
    (num_seats)
VALUES(2);

INSERT INTO tables
    (num_seats)
VALUES(2);

INSERT INTO tables
    (num_seats)
VALUES(2);

INSERT INTO tables
    (num_seats)
VALUES(2);

INSERT INTO tables
    (num_seats)
VALUES(4);

INSERT INTO tables
    (num_seats)
VALUES(4);

INSERT INTO tables
    (num_seats)
VALUES
(4);

INSERT INTO tables
    (num_seats)
VALUES(4);

INSERT INTO tables
    (num_seats)
VALUES(8);

INSERT INTO tables
    (num_seats)
VALUES(8);

INSERT INTO tables
    (num_seats)
VALUES(2);

-- Clear existing data first (optional for clarity if re-running script)
DELETE FROM order_items;
DELETE FROM orders;

-- Insert Orders (Clearly structured and consistent)
-- Orders for March 17, 2025
INSERT INTO orders (store_id, order_type, table_num, customer_name, order_status, special_instructions, total_price, created_by, order_time)
VALUES 
(1, 'Dine-In', 5, NULL, 'Completed', 'Extra cheese', 45.00, 'employee_lisa', '2025-03-17 13:15:00'), -- order_id: 1
(1, 'Take-Out', NULL, 'Jane Smith', 'Completed', NULL, 30.00, 'employee_lisa', '2025-03-17 16:45:00'), -- order_id: 2
(1, 'Dine-In', 2, NULL, 'Completed', NULL, 80.00, 'employee_lisa', '2025-03-17 19:20:00'); -- order_id: 3

-- Orders for March 18, 2025
INSERT INTO orders (store_id, order_type, table_num, customer_name, order_status, special_instructions, total_price, created_by, order_time)
VALUES 
(1, 'Take-Out', NULL, 'Mike Tyson', 'Completed', 'No onions', 25.00, 'employee_lisa', '2025-03-18 12:30:00'), -- order_id: 4
(1, 'Dine-In', 4, NULL, 'Completed', 'Gluten-free', 60.00, 'employee_lisa', '2025-03-18 14:00:00'), -- order_id: 5
(1, 'Take-Out', NULL, 'Sarah Connor', 'Completed', 'Extra spicy', 40.00, 'employee_lisa', '2025-03-18 18:45:00'); -- order_id: 6

-- Orders for March 19, 2025
INSERT INTO orders (store_id, order_type, table_num, customer_name, order_status, special_instructions, total_price, created_by, order_time)
VALUES 
(1, 'Dine-In', 1, NULL, 'Completed', NULL, 55.00, 'employee_lisa', '2025-03-19 11:00:00'), -- order_id: 7
(1, 'Take-Out', NULL, 'Peter Parker', 'Completed', NULL, 35.00, 'employee_lisa', '2025-03-19 15:30:00'), -- order_id: 8
(1, 'Dine-In', 3, NULL, 'Completed', 'Extra napkins', 90.00, 'employee_lisa', '2025-03-19 20:10:00'); -- order_id: 9

-- Orders for March 20, 2025
INSERT INTO orders (store_id, order_type, table_num, customer_name, order_status, special_instructions, total_price, created_by, order_time)
VALUES
(1, 'Take-Out', NULL, 'Sarah Smith', 'Active', 'Light Cheese', 32.47, 'employee_david', '2025-03-20 13:15:00'), -- order_id: 10
(1, 'Take-Out', NULL, 'James Anderson', 'Completed', 'Extra Ketchup', 18.48, 'manager_susan', '2025-03-20 13:15:00'), -- order_id: 11
(1, 'Dine-In', 1, NULL, 'Active', 'No Cheese in Vegan Bowl', 18.48, 'employee_emma', '2025-03-20 13:15:00'), -- order_id: 12
(1, 'Dine-In', 2, NULL, 'Completed', NULL, 19.48, 'manager_bob', '2025-03-20 13:15:00'); -- order_id: 13

-- Insert consistent order_items for orders
INSERT INTO order_items (order_id, menu_item_id, quantity, item_price, created_by)
VALUES
-- March 17
(1, 1, 2, 12.99, 'employee_lisa'), -- Margherita Pizza (25.98)
(1, 3, 1, 6.49, 'employee_lisa'), -- Cheesecake (6.49), total = 32.47

(2, 2, 2, 11.99, 'employee_lisa'), -- Vegan Buddha Bowl (23.98), total = 23.98

(3, 1, 3, 12.99, 'employee_lisa'), -- Margherita Pizza (38.97)
(3, 2, 3, 11.99, 'employee_lisa'), -- Vegan Buddha Bowl (35.97), total = 74.94

-- March 18
(4, 2, 1, 11.99, 'employee_lisa'), -- Vegan Buddha Bowl (11.99), total = 11.99

(5, 2, 3, 11.99, 'employee_lisa'), -- Vegan Buddha Bowl (35.97)
(5, 3, 3, 6.49, 'employee_lisa'), -- Cheesecake (19.47), total = 55.44

(6, 1, 2, 12.99, 'employee_lisa'), -- Margherita Pizza (25.98)
(6, 3, 2, 6.49, 'employee_lisa'), -- Cheesecake (12.98), total = 38.96

-- March 19
(7, 1, 2, 12.99, 'employee_lisa'), -- Margherita Pizza (25.98)
(7, 2, 2, 11.99, 'employee_lisa'), -- Vegan Buddha Bowl (23.98), total = 49.96

(8, 3, 2, 6.49, 'employee_lisa'), -- Cheesecake (12.98)
(8, 2, 2, 11.99, 'employee_lisa'), -- Vegan Buddha Bowl (23.98), total = 36.96

(9, 1, 4, 12.99, 'employee_lisa'), -- Margherita Pizza (51.96)
(9, 2, 2, 11.99, 'employee_lisa'), -- Vegan Buddha Bowl (23.98), total = 75.94

-- March 20
(10, 1, 2, 12.99, 'employee_david'), -- Margherita Pizza (25.98)
(10, 3, 1, 6.49, 'employee_david'), -- Cheesecake (6.49), total = 32.47

(11, 2, 1, 11.99, 'manager_susan'), -- Vegan Buddha Bowl (11.99)
(11, 3, 1, 6.49, 'manager_susan'), -- Cheesecake (6.49), total = 18.48

(12, 2, 1, 11.99, 'employee_emma'), -- Vegan Buddha Bowl (11.99)
(12, 3, 1, 6.49, 'employee_emma'), -- Cheesecake (6.49), total = 18.48

(13, 1, 1, 12.99, 'manager_bob'), -- Margherita Pizza (12.99)
(13, 3, 1, 6.49, 'manager_bob'); -- Cheesecake (6.49), total = 19.48


COMMIT;

CREATE VIEW order_summary_view AS
SELECT
    o.order_id,
    o.order_number,
    o.order_type,
    COALESCE(t.table_num::TEXT, 'N/A') AS table_number,
    o.customer_name,
    o.order_status,
    o.order_time,
    o.special_instructions,

    SUM(oi.quantity * oi.item_price) AS item_total,

    ROUND(SUM(oi.quantity * oi.item_price) * 0.05, 2) AS service_charge,

    ROUND(SUM(oi.quantity * oi.item_price) * 0.05, 2) AS gst,

    ROUND(SUM(oi.quantity * oi.item_price) * 0.07, 2) AS pst,

    ROUND(SUM(oi.quantity * oi.item_price) * 1.17, 2) AS total_price,

    o.created_by
FROM orders o
    LEFT JOIN tables t ON o.table_num = t.table_num 
    JOIN order_items oi ON o.order_id = oi.order_id
GROUP BY o.order_id, o.order_number, o.order_type, t.table_num, 
         o.customer_name, o.order_status, o.order_time, o.created_by;


CREATE VIEW order_details_view AS
SELECT
    o.order_id,
    o.order_number,
    m.item_name,
    oi.quantity,
    oi.item_price,
    (oi.quantity * oi.item_price) AS total_item_price
FROM orders o
    JOIN order_items oi ON o.order_id = oi.order_id 
    JOIN menu_items m ON oi.menu_item_id = m.item_id
ORDER BY o.order_id, m.item_name;
