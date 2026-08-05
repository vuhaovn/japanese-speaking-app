CREATE TABLE "practice_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_key" varchar(64) NOT NULL,
	"sentence_id" integer NOT NULL,
	"mode" varchar(20) NOT NULL,
	"match_score" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sentences" (
	"id" serial PRIMARY KEY NOT NULL,
	"jp" text NOT NULL,
	"kana" text NOT NULL,
	"meaning_vi" text NOT NULL,
	"level" varchar(2) NOT NULL,
	"method" text[] NOT NULL,
	"pitch" jsonb,
	"grammar_point" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "practice_sessions" ADD CONSTRAINT "practice_sessions_sentence_id_sentences_id_fk" FOREIGN KEY ("sentence_id") REFERENCES "public"."sentences"("id") ON DELETE cascade ON UPDATE no action;