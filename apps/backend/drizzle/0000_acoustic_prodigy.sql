CREATE TABLE "rankings" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"author" varchar(30) NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	"deleted_at" timestamp (3)
);
