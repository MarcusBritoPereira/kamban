-- Add time tracking primitives for productivity/workload reporting.

CREATE TABLE "task_time_entries" (
  "id" TEXT NOT NULL,
  "task_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "started_at" TIMESTAMP(3) NOT NULL,
  "ended_at" TIMESTAMP(3),
  "duration_minutes" INTEGER,
  "note" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "task_time_entries_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "task_time_entries_task_id_idx" ON "task_time_entries"("task_id");
CREATE INDEX "task_time_entries_user_id_idx" ON "task_time_entries"("user_id");
CREATE INDEX "task_time_entries_started_at_idx" ON "task_time_entries"("started_at");

ALTER TABLE "task_time_entries"
  ADD CONSTRAINT "task_time_entries_task_id_fkey"
  FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "task_time_entries"
  ADD CONSTRAINT "task_time_entries_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
