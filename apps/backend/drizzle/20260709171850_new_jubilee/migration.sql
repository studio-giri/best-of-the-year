CREATE TABLE "recovery_tokens" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"ranking_id" uuid NOT NULL,
	"token_hash" text NOT NULL UNIQUE,
	"expires_at" timestamp(3) NOT NULL,
	"consumed_at" timestamp(3),
	"created_at" timestamp(3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "rankings_email_lower_trim_unique" ON "rankings" (lower(trim("email")));--> statement-breakpoint
ALTER TABLE "recovery_tokens" ADD CONSTRAINT "recovery_tokens_ranking_id_rankings_id_fkey" FOREIGN KEY ("ranking_id") REFERENCES "rankings"("id") ON DELETE CASCADE;