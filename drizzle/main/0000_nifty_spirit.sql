CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"password" varchar(72) NOT NULL,
	"salt" varchar(255),
	"refreshtoken" varchar(255),
	"creationdate" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updationdate" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"avatar" varchar(255),
	"email" varchar(100),
	"firstname" varchar(50),
	"lastname" varchar(50),
	CONSTRAINT "users_username_key" UNIQUE("username"),
	CONSTRAINT "users_refreshtoken_key" UNIQUE("refreshtoken"),
	CONSTRAINT "users_email_key" UNIQUE("email"),
	CONSTRAINT "users_email_check" CHECK ((email)::text ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$'::text),
	CONSTRAINT "users_username_check" CHECK ((length((username)::text) > 3) AND ((username)::text ~ '^[a-zA-Z0-9_]+$'::text))
);
