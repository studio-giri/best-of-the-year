CREATE TABLE "owner_tokens" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"ranking_id" uuid NOT NULL,
	"token_hash" text NOT NULL UNIQUE,
	"created_at" timestamp(3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ranking_items" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"ranking_id" uuid NOT NULL,
	"year" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp(3) DEFAULT now() NOT NULL,
	"updated_at" timestamp(3) DEFAULT now() NOT NULL,
	CONSTRAINT "ranking_items_ranking_id_year_unique" UNIQUE("ranking_id","year")
);
--> statement-breakpoint
CREATE TABLE "rankings" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"username" varchar(30) NOT NULL,
	"email" varchar(254) NOT NULL,
	"created_at" timestamp(3) DEFAULT now() NOT NULL,
	"updated_at" timestamp(3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "rankings_username_lower_trim_unique" ON "rankings" (lower(trim("username")));--> statement-breakpoint
ALTER TABLE "owner_tokens" ADD CONSTRAINT "owner_tokens_ranking_id_rankings_id_fkey" FOREIGN KEY ("ranking_id") REFERENCES "rankings"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ranking_items" ADD CONSTRAINT "ranking_items_ranking_id_rankings_id_fkey" FOREIGN KEY ("ranking_id") REFERENCES "rankings"("id") ON DELETE CASCADE;