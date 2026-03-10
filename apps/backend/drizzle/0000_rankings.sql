CREATE TABLE "rankings" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"author" varchar(30) NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	"deleted_at" timestamp (3)
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rankings_set_updated_at
BEFORE UPDATE ON rankings
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Filtering on deleted_at IS NULL is a common soft-delete pattern: adding a partial index improves query performance
CREATE INDEX idx_rankings_active ON rankings (id) WHERE deleted_at IS NULL;