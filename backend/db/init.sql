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

-- Create the Stores Table
CREATE TABLE stores (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    owner_username VARCHAR(50) NOT NULL,
    CONSTRAINT fk_owner FOREIGN KEY (owner_username) REFERENCES users(username) ON DELETE CASCADE
);

CREATE TABLE tables
(
    table_id SERIAL PRIMARY KEY,
    store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
    table_number INTEGER NOT NULL UNIQUE,
    table_capacity INTEGER NOT NULL CHECK(table_capacity > 0),
    is_available BOOLEAN DEFAULT TRUE
);

CREATE SEQUENCE order_serial_seq START WITH 100001 INCREMENT BY 1;

CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    order_number VARCHAR(15) UNIQUE,
    store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
    order_type VARCHAR(10) NOT NULL CHECK(order_type IN ('Dine-In', 'Take-Out')),
    table_id INTEGER REFERENCES tables(table_id) ON DELETE CASCADE,
    customer_name VARCHAR(255),
    order_status VARCHAR(50) DEFAULT 'Active' CHECK(order_status IN ('Active', 'Completed', 'Canceled')),
    order_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
        new_order_number := 'TAK-' || LPAD(new_serial::TEXT, 6, '0');
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
    item_id INTEGER REFERENCES menu_items(item_id) ON DELETE CASCADE,
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

INSERT INTO orders
    (store_id, order_type, table_id, customer_name, order_status, total_price, created_by)
VALUES
    (1, 'Take-Out', NULL, 'Sarah Smith', 'Active', 15.99, 'employee_david'),
    (1, 'Take-Out', NULL, 'James Anderson', 'Completed', 23.45, 'manager_susan'),
    (2, 'Take-Out', NULL, 'Olivia Brown', 'Active', 12.75, 'employee_lisa'),

    (1, 'Dine-In', 1, NULL, 'Active', 29.97, 'employee_emma'),
    (1, 'Dine-In', 2, NULL, 'Completed', 45.50, 'manager_bob'),
    (2, 'Dine-In', 5, NULL, 'Active', 37.80, 'manager_susan'),
    (3, 'Dine-In', 7, NULL, 'Completed', 22.25, 'employee_lisa');

INSERT INTO tables
    (num_seats)
VALUES(2);

INSERT INTO order_items
    (order_id, menu_item_id, quantity, price, created_by)
VALUES
    (1, 1, 2, 12.99, 'employee_emma'),
    (1, 3, 1, 3.99, 'employee_emma'),

    (2, 2, 1, 10.99, 'manager_bob'),
    (2, 4, 1, 6.50, 'manager_bob'),
    (2, 5, 2, 9.99, 'manager_bob'),

    (3, 1, 1, 12.99, 'employee_david'),
    (3, 6, 1, 2.99, 'employee_david'),

    (4, 2, 1, 10.99, 'manager_susan'),
    (4, 3, 1, 3.99, 'manager_susan'),
    (4, 7, 1, 8.49, 'manager_susan'),

    (5, 4, 1, 6.50, 'employee_lisa'),
    (5, 5, 1, 6.25, 'employee_lisa');


COMMIT;

GO
CREATE VIEW order_bill
AS
    SELECT
        o.order_id,
        o.order_type,
        t.table_number,
        o.customer_name,
        o.takeout_order_id,
        o.order_status,
        o.order_time,
        SUM(oi.quantity) AS total_items,
        SUM(oi.quantity * oi.item_price) AS total_price
    from orders o
        LEFT JOIN tables t ON o.table_id = t.table_id
        JOIN order_items oi ON o.order_id = oi.order_id
    WHERE o.order_status = 'Active'
    GROUP BY o.order_id, o.order_type, t.table_number, o.customer_name, o.takeout_order_id, o.order_status, o.order_time;

