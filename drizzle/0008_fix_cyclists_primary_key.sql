-- Drop the existing primary key constraint on username
ALTER TABLE "cyclists" DROP CONSTRAINT "cyclists_pkey";

-- Make user_id the primary key
ALTER TABLE "cyclists" ADD CONSTRAINT "cyclists_pkey" PRIMARY KEY ("user_id");
