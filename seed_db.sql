DROP DATABASE IF EXISTS shop;

CREATE DATABASE shop;

CREATE TABLE shop.users (
	UserID			INT				NOT NULL PRIMARY KEY AUTO_INCREMENT,
	UserName		NVARCHAR(40)	NOT NULL UNIQUE,
	PasswordHash	BINARY(64)		NOT NULL,
	FirstName		NVARCHAR(40)	NOT NULL,
	LastName		NVARCHAR(40)	NOT NULL,
	Email			VARCHAR(40)		NOT NULL,
	PermissionLevel	INT				DEFAULT 0
);

CREATE TABLE shop.products (
	ProductID		INT				NOT NULL PRIMARY KEY AUTO_INCREMENT,
	Name			NVARCHAR(40)	NOT NULL,
	Description		VARCHAR(200)	NOT NULL,
	Price			FLOAT(10, 1)	NOT NULL,
	CurrentQuantity	INT				DEFAULT 0
);

CREATE TABLE shop.transactions (
	TransactionID	INT					NOT NULL PRIMARY KEY AUTO_INCREMENT,
	Type			ENUM("in", "out")	NOT NULL,
	Description		VARCHAR(70)			NOT NULL,
	_Date			DATETIME			NOT NULL,
	ProductID		INT					NOT NULL,
	Quantity		INT					NOT NULL,
	FOREIGN KEY(ProductID) REFERENCES shop.products(ProductID)
);

INSERT INTO shop.users (UserName, PasswordHash, FirstName, LastName, PermissionLevel) VALUES
("bobovas"		, SHA2("asdf"															, 256), "bobo"	, "vas"	, 4),
("SCP-2770-1"	, SHA2("I think you forgot about the water table, you fucking idiot."	, 256), "1"		, "2770", 0);


INSERT INTO shop.products VALUES 
("печка"				, "пе4ка"													, 420.0 , 0),
("лестаро телевизор"	, "телевизор леново, ама стар"								, 1337.0, 0),
("ютия"					, "lorem Ipsum dolor sit amet, conseqteur adipiscing elit"	, 69.0  , 0),
("кабел"				, "кабел (надъвкан)"										, 10.0  , 0),
("митковълнова печка"	, "ММММММММММММММММММММММММММММММММММММММММММММММММММММММММ", 119.0 , 0),
("тостер"				, "Аз съм тостер"											, 426.0 , 0);




SELECT * FROM shop.users;