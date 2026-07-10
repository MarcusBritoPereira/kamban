-- Add professional task-management features: subtasks, custom statuses,
-- watchers, dependencies, and checklists.

ALTER TABLE "tasks" ADD COLUMN "parent_task_id" TEXT;

ALTER TABLE "tasks"
  ADD CONSTRAINT "tasks_parent_task_id_fkey"
  FOREIGN KEY ("parent_task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "custom_statuses" (
  "id" TEXT NOT NULL,
  "space_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "color" TEXT DEFAULT '#64748b',
  "position" INTEGER NOT NULL DEFAULT 0,
  "is_default" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "custom_statuses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "task_watchers" (
  "task_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "task_watchers_pkey" PRIMARY KEY ("task_id", "user_id")
);

CREATE TABLE "task_dependencies" (
  "id" TEXT NOT NULL,
  "blocking_task_id" TEXT NOT NULL,
  "blocked_task_id" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'blocks',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "task_dependencies_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "task_checklists" (
  "id" TEXT NOT NULL,
  "task_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "position" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "task_checklists_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "task_checklist_items" (
  "id" TEXT NOT NULL,
  "checklist_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "completed" BOOLEAN NOT NULL DEFAULT false,
  "position" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "task_checklist_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "custom_statuses_space_id_name_key" ON "custom_statuses"("space_id", "name");
CREATE INDEX "custom_statuses_space_id_idx" ON "custom_statuses"("space_id");
CREATE INDEX "tasks_list_id_idx" ON "tasks"("list_id");
CREATE INDEX "tasks_parent_task_id_idx" ON "tasks"("parent_task_id");
CREATE INDEX "tasks_status_idx" ON "tasks"("status");
CREATE INDEX "tasks_deadline_idx" ON "tasks"("deadline");
CREATE INDEX "task_watchers_user_id_idx" ON "task_watchers"("user_id");
CREATE UNIQUE INDEX "task_dependencies_blocking_task_id_blocked_task_id_key" ON "task_dependencies"("blocking_task_id", "blocked_task_id");
CREATE INDEX "task_dependencies_blocked_task_id_idx" ON "task_dependencies"("blocked_task_id");
CREATE INDEX "task_checklists_task_id_idx" ON "task_checklists"("task_id");
CREATE INDEX "task_checklist_items_checklist_id_idx" ON "task_checklist_items"("checklist_id");

ALTER TABLE "custom_statuses"
  ADD CONSTRAINT "custom_statuses_space_id_fkey"
  FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "task_watchers"
  ADD CONSTRAINT "task_watchers_task_id_fkey"
  FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "task_watchers"
  ADD CONSTRAINT "task_watchers_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "task_dependencies"
  ADD CONSTRAINT "task_dependencies_blocking_task_id_fkey"
  FOREIGN KEY ("blocking_task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "task_dependencies"
  ADD CONSTRAINT "task_dependencies_blocked_task_id_fkey"
  FOREIGN KEY ("blocked_task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "task_checklists"
  ADD CONSTRAINT "task_checklists_task_id_fkey"
  FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "task_checklist_items"
  ADD CONSTRAINT "task_checklist_items_checklist_id_fkey"
  FOREIGN KEY ("checklist_id") REFERENCES "task_checklists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
