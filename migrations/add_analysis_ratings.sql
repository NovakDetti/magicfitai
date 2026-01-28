-- Create analysis_ratings table
CREATE TABLE IF NOT EXISTS "analysis_ratings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "analysis_session_id" uuid NOT NULL,
  "user_id" uuid,
  "rating" integer NOT NULL,
  "comment" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "analysis_ratings_analysis_session_id_fkey"
    FOREIGN KEY ("analysis_session_id")
    REFERENCES "analysis_sessions"("id")
    ON DELETE CASCADE,
  CONSTRAINT "analysis_ratings_user_id_fkey"
    FOREIGN KEY ("user_id")
    REFERENCES "users"("id")
    ON DELETE SET NULL,
  CONSTRAINT "rating_range_check"
    CHECK ("rating" >= 1 AND "rating" <= 5)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "analysis_ratings_session_id_idx"
  ON "analysis_ratings" ("analysis_session_id");

CREATE INDEX IF NOT EXISTS "analysis_ratings_user_id_idx"
  ON "analysis_ratings" ("user_id");

-- Add a comment to the table
COMMENT ON TABLE "analysis_ratings" IS 'User ratings and reviews for completed makeup analyses';
COMMENT ON COLUMN "analysis_ratings"."rating" IS 'Star rating from 1 to 5';
COMMENT ON COLUMN "analysis_ratings"."comment" IS 'Optional text feedback from the user';
