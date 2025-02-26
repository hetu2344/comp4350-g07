CREATE TABLE users
(
    user_id SERIAL PRIMARY KEY,
    f_name VARCHAR(255),
    l_name VARCHAR(255),
    pass VARCHAR(255),
    username VARCHAR(255)
);

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

INSERT INTO users
    (f_name, l_name, pass, username)
VALUES('Het', 'Patel', 'h1234', 'hetu2344');
INSERT INTO users
    (f_name, l_name, pass, username)
VALUES('Divy', 'Patel', 'd1234', 'divy63');
INSERT INTO users
    (f_name, l_name, pass, username)
VALUES('Aswin', 'Manoj', 'a1234', 'aswinm');
INSERT INTO users
    (f_name, l_name, pass, username)
VALUES('Risham', 'Singh', 'r1234', 'rishams');
INSERT INTO users
    (f_name, l_name, pass, username)
VALUES('Seyi', 'Asoga', 'a1234', 'seyia');
INSERT INTO users
    (f_name, l_name, pass, username)
VALUES('Aidan', 'Labossiere', 'a1234', 'aidanl');

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



