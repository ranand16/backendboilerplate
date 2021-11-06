create table user(
id INT NOT NULL AUTO_INCREMENT,
pronoun VARCHAR(10) NOT NULL DEFAULT '',
firstname VARCHAR(100) NOT NULL DEFAULT '',
lastname VARCHAR(100) NOT NULL DEFAULT '',
displayname VARCHAR(100) NOT NULL DEFAULT '',
username VARCHAR(100) NOT NULL UNIQUE DEFAULT '',
password VARCHAR(100) NULL,
email VARCHAR(100) NULL UNIQUE,
phone1 VARCHAR(20) NOT NULL DEFAULT '',
gender ENUM("M", "F", "O") NULL,
dob INT NOT NULL DEFAULT 0,
bio TEXT NOT NULL,
city VARCHAR(45) NOT NULL DEFAULT '',
country VARCHAR(45) NOT NULL DEFAULT '',
address TEXT NOT NULL,
state VARCHAR(100) NOT NULL DEFAULT '',
picture VARCHAR(100) NOT NULL DEFAULT '',
timecreated INT NOT NULL,
created_by INT UNSIGNED NOT NULL DEFAULT 0,
lasttimeupdated INT NOT NULL,
lastupdated_by INT UNSIGNED NOT NULL DEFAULT 0,
deleted ENUM('0','1') NOT NULL DEFAULT '0',
calling_code1 VARCHAR(45) NOT NULL DEFAULT '',
PRIMARY KEY (id)
);

create table login_history(
id INT NOT NULL AUTO_INCREMENT,
ip VARCHAR(100) NOT NULL DEFAULT '',
browser_info TEXT,
device_type VARCHAR(100) NOT NULL DEFAULT '',
user_id INT UNSIGNED NOT NULL DEFAULT 0,
logged_in_by INT UNSIGNED NOT NULL DEFAULT 0,
status TINYINT(1) NOT NULL DEFAULT 1,
timecreated INT NOT NULL DEFAULT 0,
lasttimeupdated INT NOT NULL DEFAULT 0,
PRIMARY KEY (id)
);