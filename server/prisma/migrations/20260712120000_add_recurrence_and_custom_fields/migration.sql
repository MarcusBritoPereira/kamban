-- Add recurrence metadata and custom field support for professional task domains.

ALTER TABLE "tasks" ADD COLUMN "recurrence_rule" TEXT;
ALTER TABLE "tasks" ADD COLUMN "recurrence_until" TIMESTAMP(3);

CREATE TABLE "custom_field_definitions" (
  "id" TEXT NOT NULL,
  "space_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "options" JSONB,
  "required" BOOLEAN NOT NULL DEFAULT false,
  "position" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "custom_field_definitions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "task_custom_field_values" (
  "id" TEXT NOT NULL,
  "task_id" TEXT NOT NULL,
  "field_id" TEXT NOT NULL,
  "value" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "task_custom_field_values_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "custom_field_definitions_space_id_name_key" ON "custom_field_definitions"("space_id", "name");
CREATE INDEX "custom_field_definitions_space_id_idx" ON "custom_field_definitions"("space_id");
CREATE UNIQUE INDEX "task_custom_field_values_task_id_field_id_key" ON "task_custom_field_values"("task_id", "field_id");
CREATE INDEX "task_custom_field_values_field_id_idx" ON "task_custom_field_values"("field_id");

ALTER TABLE "custom_field_definitions"
  ADD CONSTRAINT "custom_field_definitions_space_id_fkey"
  FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "task_custom_field_values"
  ADD CONSTRAINT "task_custom_field_values_task_id_fkey"
  FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "task_custom_field_values"
  ADD CONSTRAINT "task_custom_field_values_field_id_fkey"
  FOREIGN KEY ("field_id") REFERENCES "custom_field_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
