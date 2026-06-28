CREATE TABLE "owner_tokens" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"ranking_id" uuid NOT NULL,
	"token_hash" text NOT NULL UNIQUE,
	"created_at" timestamp(3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "rankings" DROP CONSTRAINT "rankings_username_unique";--> statement-breakpoint
ALTER TABLE "rankings" ADD COLUMN "email" varchar(254) NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "rankings_username_lower_trim_unique" ON "rankings" (lower(trim("username")));--> statement-breakpoint
ALTER TABLE "owner_tokens" ADD CONSTRAINT "owner_tokens_ranking_id_rankings_id_fkey" FOREIGN KEY ("ranking_id") REFERENCES "rankings"("id") ON DELETE CASCADE;