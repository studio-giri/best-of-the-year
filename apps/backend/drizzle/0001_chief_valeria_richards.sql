CREATE TABLE "ranking_items" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"ranking_id" uuid NOT NULL,
	"year" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "ranking_items_ranking_id_year_unique" UNIQUE("ranking_id","year")
);
--> statement-breakpoint
ALTER TABLE "ranking_items" ADD CONSTRAINT "ranking_items_ranking_id_rankings_id_fk" FOREIGN KEY ("ranking_id") REFERENCES "public"."rankings"("id") ON DELETE cascade ON UPDATE no action;