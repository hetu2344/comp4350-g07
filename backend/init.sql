CREATE TABLE users(
    user_id SERIAL PRIMARY KEY,
    f_name VARCHAR(255),
    l_name VARCHAR(255),
    pass VARCHAR(255),
    username VARCHAR(255)
);

INSERT INTO users (f_name, l_name, pass, username) VALUES('Het', 'Patel', 'h1234', 'hetu2344');
INSERT INTO users (f_name, l_name, pass, username) VALUES('Divy', 'Patel', 'd1234', 'divy63');
INSERT INTO users (f_name, l_name, pass, username) VALUES('Aswin', 'Manoj', 'a1234', 'aswinm');
INSERT INTO users (f_name, l_name, pass, username) VALUES('Risham', 'Singh', 'r1234', 'rishams');
INSERT INTO users (f_name, l_name, pass, username) VALUES('Seyi', 'Asoga', 'a1234', 'seyia');
INSERT INTO users (f_name, l_name, pass, username) VALUES('Aidan', 'Labossiere', 'a1234', 'aidanl');


