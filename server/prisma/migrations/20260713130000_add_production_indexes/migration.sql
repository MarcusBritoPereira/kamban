-- Production lookup indexes for tenant scoping, activity feeds, attachments and notifications.
CREATE INDEX IF NOT EXISTS "spaces_owner_id_idx" ON "spaces"("owner_id");
CREATE INDEX IF NOT EXISTS "folders_space_id_idx" ON "folders"("space_id");
CREATE INDEX IF NOT EXISTS "lists_folder_id_idx" ON "lists"("folder_id");
CREATE INDEX IF NOT EXISTS "space_members_user_id_idx" ON "space_members"("user_id");
CREATE INDEX IF NOT EXISTS "task_assignees_user_id_idx" ON "task_assignees"("user_id");
CREATE INDEX IF NOT EXISTS "task_tags_tag_id_idx" ON "task_tags"("tag_id");
CREATE INDEX IF NOT EXISTS "tags_space_id_idx" ON "tags"("space_id");
CREATE INDEX IF NOT EXISTS "attachments_task_id_idx" ON "attachments"("task_id");
CREATE INDEX IF NOT EXISTS "notifications_user_id_read_created_at_idx" ON "notifications"("user_id", "read", "created_at");
CREATE INDEX IF NOT EXISTS "task_activities_task_id_created_at_idx" ON "task_activities"("task_id", "created_at");
CREATE INDEX IF NOT EXISTS "companies_status_idx" ON "companies"("status");
CREATE INDEX IF NOT EXISTS "company_members_user_id_idx" ON "company_members"("user_id");
