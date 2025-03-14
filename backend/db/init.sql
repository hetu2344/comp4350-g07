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
VALUES(4);

INSERT INTO tables
    (num_seats)
VALUES(4);

INSERT INTO tables
    (num_seats)
VALUES(8);

INSERT INTO tables
    (num_seats)
VALUES(8);
