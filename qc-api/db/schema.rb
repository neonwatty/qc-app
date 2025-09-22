# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_09_22_151436) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"
  enable_extension "pgcrypto"

  create_table "action_items", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "title", null: false
    t.text "description"
    t.uuid "assigned_to_id"
    t.date "due_date"
    t.boolean "completed", default: false, null: false
    t.uuid "check_in_id", null: false
    t.datetime "completed_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "priority"
    t.string "category"
    t.uuid "created_by_id"
    t.uuid "completed_by_id"
    t.datetime "reassigned_at"
    t.boolean "completed_on_time"
    t.jsonb "notes", default: []
    t.index ["assigned_to_id", "completed", "due_date"], name: "index_action_items_assigned_status_due"
    t.index ["assigned_to_id"], name: "index_action_items_on_assigned_to_id"
    t.index ["category"], name: "index_action_items_on_category"
    t.index ["check_in_id", "completed"], name: "index_action_items_checkin_completed"
    t.index ["check_in_id"], name: "index_action_items_on_check_in_id"
    t.index ["completed"], name: "index_action_items_on_completed"
    t.index ["created_at"], name: "index_action_items_on_created_at"
    t.index ["due_date", "completed"], name: "index_action_items_on_due_date_and_completed"
    t.index ["due_date"], name: "index_action_items_on_due_date"
    t.index ["priority"], name: "index_action_items_on_priority"
  end

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "categories", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.string "icon", null: false
    t.text "description"
    t.text "prompts", default: [], array: true
    t.boolean "is_custom", default: false, null: false
    t.integer "order", default: 0, null: false
    t.uuid "couple_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["couple_id", "order"], name: "index_categories_on_couple_id_and_order"
    t.index ["couple_id"], name: "index_categories_on_couple_id"
    t.index ["created_at"], name: "index_categories_on_created_at"
  end

  create_table "check_ins", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "couple_id", null: false
    t.uuid "participants", default: [], array: true
    t.datetime "started_at", null: false
    t.datetime "completed_at"
    t.string "status", default: "in-progress", null: false
    t.uuid "categories", default: [], array: true
    t.integer "mood_before"
    t.integer "mood_after"
    t.text "reflection"
    t.uuid "session_settings_id"
    t.jsonb "timeouts", default: {}
    t.integer "extensions", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "current_step"
    t.jsonb "step_durations", default: {}
    t.datetime "abandoned_at"
    t.datetime "last_activity_at"
    t.integer "last_updated_by"
    t.index ["completed_at"], name: "index_check_ins_on_completed_at"
    t.index ["couple_id", "completed_at"], name: "index_check_ins_couple_completed"
    t.index ["couple_id", "started_at"], name: "index_check_ins_on_couple_id_and_started_at"
    t.index ["couple_id", "status", "created_at"], name: "index_check_ins_couple_status_created"
    t.index ["couple_id"], name: "index_check_ins_on_couple_id"
    t.index ["created_at"], name: "index_check_ins_on_created_at"
    t.index ["current_step"], name: "index_check_ins_on_current_step"
    t.index ["status"], name: "index_check_ins_on_status"
  end

  create_table "couple_users", id: false, force: :cascade do |t|
    t.uuid "couple_id", null: false
    t.uuid "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["couple_id", "user_id"], name: "index_couple_users_on_couple_id_and_user_id", unique: true
  end

  create_table "couples", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.string "check_in_frequency", default: "weekly"
    t.string "reminder_time"
    t.string "theme", default: "system"
    t.integer "total_check_ins", default: 0, null: false
    t.integer "current_streak", default: 0, null: false
    t.datetime "last_check_in_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["created_at"], name: "index_couples_on_created_at"
    t.index ["current_streak"], name: "index_couples_on_current_streak"
    t.index ["last_check_in_at"], name: "index_couples_on_last_check_in_at"
    t.index ["total_check_ins"], name: "index_couples_on_total_check_ins"
    t.index ["updated_at"], name: "index_couples_on_updated_at"
    t.check_constraint "current_streak >= 0", name: "check_current_streak_non_negative"
    t.check_constraint "total_check_ins >= 0", name: "check_total_check_ins_non_negative"
  end

  create_table "custom_prompts", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.text "content", null: false
    t.uuid "category_id", null: false
    t.integer "order", default: 0, null: false
    t.boolean "is_active", default: true, null: false
    t.uuid "couple_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["category_id"], name: "index_custom_prompts_on_category_id"
    t.index ["couple_id", "category_id"], name: "index_custom_prompts_on_couple_id_and_category_id"
    t.index ["couple_id", "order"], name: "index_custom_prompts_on_couple_id_and_order"
    t.index ["couple_id"], name: "index_custom_prompts_on_couple_id"
    t.index ["created_at"], name: "index_custom_prompts_on_created_at"
  end

  create_table "jwt_denylists", force: :cascade do |t|
    t.string "jti"
    t.datetime "exp"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["jti"], name: "index_jwt_denylists_on_jti"
  end

  create_table "love_actions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "title", null: false
    t.text "description"
    t.uuid "linked_language_id", null: false
    t.string "linked_language_title"
    t.string "suggested_by", null: false
    t.uuid "suggested_by_id"
    t.string "status", default: "suggested", null: false
    t.string "frequency"
    t.integer "completed_count", default: 0, null: false
    t.datetime "last_completed_at"
    t.datetime "planned_for"
    t.string "difficulty", default: "moderate", null: false
    t.text "notes"
    t.uuid "for_user_id", null: false
    t.uuid "created_by", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "effectiveness_rating"
    t.jsonb "completion_notes", default: []
    t.datetime "archived_at"
    t.index ["archived_at"], name: "index_love_actions_on_archived_at"
    t.index ["created_at"], name: "index_love_actions_on_created_at"
    t.index ["created_by", "created_at"], name: "index_love_actions_by_created"
    t.index ["created_by"], name: "index_love_actions_on_created_by"
    t.index ["effectiveness_rating"], name: "index_love_actions_on_effectiveness_rating"
    t.index ["for_user_id"], name: "index_love_actions_on_for_user_id"
    t.index ["linked_language_id"], name: "index_love_actions_on_linked_language_id"
    t.index ["planned_for"], name: "index_love_actions_on_planned_for"
    t.index ["status"], name: "index_love_actions_on_status"
  end

  create_table "love_language_discoveries", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.uuid "check_in_id"
    t.text "discovery", null: false
    t.uuid "converted_to_language_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "source"
    t.string "confidence_level"
    t.uuid "discovered_by_id"
    t.boolean "reviewed", default: false
    t.datetime "reviewed_at"
    t.boolean "rejected", default: false
    t.datetime "rejected_at"
    t.datetime "converted_at"
    t.string "suggested_category"
    t.string "suggested_importance"
    t.string "suggested_title"
    t.index ["check_in_id"], name: "index_love_language_discoveries_on_check_in_id"
    t.index ["discovered_by_id"], name: "index_love_language_discoveries_on_discovered_by_id"
    t.index ["reviewed"], name: "index_love_language_discoveries_on_reviewed"
    t.index ["source"], name: "index_love_language_discoveries_on_source"
    t.index ["user_id"], name: "index_love_language_discoveries_on_user_id"
  end

  create_table "love_languages", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.string "title", null: false
    t.text "description", null: false
    t.text "examples", default: [], array: true
    t.string "category", null: false
    t.string "privacy", default: "shared", null: false
    t.string "importance", default: "medium", null: false
    t.text "tags", default: [], array: true
    t.datetime "last_discussed_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.uuid "couple_id"
    t.integer "importance_rank"
    t.boolean "is_active", default: true
    t.integer "discussion_count", default: 0
    t.datetime "importance_updated_at"
    t.index ["category"], name: "index_love_languages_on_category"
    t.index ["couple_id"], name: "index_love_languages_on_couple_id"
    t.index ["importance_rank"], name: "index_love_languages_on_importance_rank"
    t.index ["tags"], name: "index_love_languages_on_tags", using: :gin
    t.index ["user_id", "category"], name: "index_love_languages_on_user_id_and_category"
    t.index ["user_id", "title"], name: "index_love_languages_on_user_id_and_title", unique: true
    t.index ["user_id"], name: "index_love_languages_on_user_id"
  end

  create_table "milestone_achievements", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "milestone_id", null: false
    t.uuid "couple_id", null: false
    t.datetime "achieved_at", null: false
    t.integer "points_earned"
    t.integer "bonus_points"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["achieved_at"], name: "index_milestone_achievements_on_achieved_at"
    t.index ["couple_id"], name: "index_milestone_achievements_on_couple_id"
    t.index ["milestone_id"], name: "index_milestone_achievements_on_milestone_id"
  end

  create_table "milestone_progress_updates", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "milestone_id", null: false
    t.integer "previous_progress"
    t.integer "new_progress"
    t.text "update_notes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["milestone_id"], name: "index_milestone_progress_updates_on_milestone_id"
  end

  create_table "milestones", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "title", null: false
    t.text "description"
    t.datetime "achieved_at"
    t.string "icon", null: false
    t.string "category", null: false
    t.uuid "couple_id", null: false
    t.boolean "achieved", default: false, null: false
    t.integer "points", default: 0
    t.string "rarity"
    t.integer "progress", default: 0
    t.date "target_date"
    t.jsonb "data", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "target_value"
    t.jsonb "criteria"
    t.uuid "achieved_by"
    t.text "achievement_notes"
    t.index ["achieved_at"], name: "index_milestones_on_achieved_at"
    t.index ["achieved_by"], name: "index_milestones_on_achieved_by"
    t.index ["category"], name: "index_milestones_on_category"
    t.index ["couple_id", "achieved", "rarity"], name: "index_milestones_couple_achieved_rarity"
    t.index ["couple_id", "achieved"], name: "index_milestones_on_couple_id_and_achieved"
    t.index ["couple_id", "category", "achieved"], name: "index_milestones_couple_category_achieved"
    t.index ["couple_id", "category"], name: "index_milestones_on_couple_id_and_category"
    t.index ["couple_id", "title"], name: "unique_index_milestones_couple_title", unique: true
    t.index ["couple_id"], name: "index_milestones_on_couple_id"
    t.index ["created_at"], name: "index_milestones_on_created_at"
    t.index ["criteria"], name: "index_milestones_on_criteria", using: :gin
    t.index ["progress"], name: "index_milestones_on_progress"
    t.check_constraint "points >= 0", name: "check_points_non_negative"
    t.check_constraint "progress >= 0 AND progress <= 100", name: "check_progress_range"
  end

  create_table "notes", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.text "content", null: false
    t.string "privacy", default: "draft", null: false
    t.uuid "author_id", null: false
    t.uuid "category_id"
    t.uuid "check_in_id"
    t.text "tags", default: [], array: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "published_at"
    t.datetime "first_shared_at"
    t.boolean "is_favorite", default: false
    t.index ["author_id", "created_at"], name: "index_notes_author_created"
    t.index ["author_id", "privacy"], name: "index_notes_on_author_id_and_privacy"
    t.index ["author_id"], name: "index_notes_on_author_id"
    t.index ["category_id"], name: "index_notes_on_category_id"
    t.index ["check_in_id", "privacy"], name: "index_notes_checkin_privacy"
    t.index ["check_in_id"], name: "index_notes_on_check_in_id"
    t.index ["created_at"], name: "index_notes_on_created_at"
    t.index ["first_shared_at"], name: "index_notes_on_first_shared_at"
    t.index ["is_favorite"], name: "index_notes_on_is_favorite"
    t.index ["privacy"], name: "index_notes_on_privacy"
    t.index ["published_at"], name: "index_notes_on_published_at"
    t.index ["tags"], name: "index_notes_on_tags", using: :gin
  end

  create_table "preparation_topics", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.text "content", null: false
    t.uuid "author_id", null: false
    t.integer "priority", default: 0
    t.boolean "is_quick_topic", default: false, null: false
    t.uuid "session_preparation_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["author_id"], name: "index_preparation_topics_on_author_id"
    t.index ["session_preparation_id"], name: "index_preparation_topics_on_session_preparation_id"
  end

  create_table "prompt_templates", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "title", null: false
    t.text "description"
    t.text "prompts", default: [], array: true
    t.uuid "category_id"
    t.text "tags", default: [], array: true
    t.boolean "is_system", default: false, null: false
    t.integer "usage_count", default: 0, null: false
    t.uuid "couple_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["category_id"], name: "index_prompt_templates_on_category_id"
    t.index ["couple_id"], name: "index_prompt_templates_on_couple_id"
    t.index ["created_at"], name: "index_prompt_templates_on_created_at"
    t.index ["is_system"], name: "index_prompt_templates_on_is_system"
    t.index ["tags"], name: "index_prompt_templates_on_tags", using: :gin
  end

  create_table "quick_reflections", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "session_id", null: false
    t.uuid "author_id", null: false
    t.integer "feeling_before", null: false
    t.integer "feeling_after", null: false
    t.text "gratitude"
    t.text "key_takeaway"
    t.boolean "share_with_partner", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["author_id"], name: "index_quick_reflections_on_author_id"
    t.index ["session_id", "author_id"], name: "index_quick_reflections_on_session_id_and_author_id", unique: true
    t.index ["session_id"], name: "index_quick_reflections_on_session_id"
  end

  create_table "relationship_requests", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "title", null: false
    t.text "description", null: false
    t.string "category", null: false
    t.uuid "requested_by", null: false
    t.uuid "requested_for", null: false
    t.string "priority", default: "medium", null: false
    t.datetime "suggested_date"
    t.string "suggested_frequency"
    t.string "status", default: "pending", null: false
    t.text "response"
    t.datetime "responded_at"
    t.uuid "converted_to_reminder_id"
    t.text "tags", default: [], array: true
    t.uuid "related_check_in_id"
    t.text "attachments", default: [], array: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.uuid "couple_id"
    t.string "notification_preference"
    t.datetime "expires_at"
    t.datetime "response_required_by"
    t.text "response_notes"
    t.string "decline_reason"
    t.datetime "accepted_at"
    t.datetime "declined_at"
    t.datetime "converted_at"
    t.datetime "expired_at"
    t.datetime "deferred_until"
    t.string "defer_reason"
    t.integer "defer_count", default: 0
    t.boolean "discussed", default: false
    t.datetime "discussed_at"
    t.index ["couple_id", "status", "created_at"], name: "index_requests_couple_status_created"
    t.index ["couple_id"], name: "index_relationship_requests_on_couple_id"
    t.index ["created_at"], name: "index_relationship_requests_on_created_at"
    t.index ["expires_at"], name: "index_relationship_requests_on_expires_at"
    t.index ["priority", "status"], name: "index_relationship_requests_on_priority_and_status"
    t.index ["requested_by"], name: "index_relationship_requests_on_requested_by"
    t.index ["requested_for", "status", "priority"], name: "index_requests_for_status_priority"
    t.index ["requested_for", "status"], name: "index_relationship_requests_on_requested_for_and_status"
    t.index ["requested_for"], name: "index_relationship_requests_on_requested_for"
    t.index ["responded_at"], name: "index_relationship_requests_on_responded_at"
    t.index ["status", "expires_at"], name: "index_relationship_requests_on_status_and_expires_at"
    t.index ["status"], name: "index_relationship_requests_on_status"
    t.index ["tags"], name: "index_relationship_requests_on_tags", using: :gin
  end

  create_table "reminders", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "title", null: false
    t.text "message", null: false
    t.string "category", null: false
    t.string "frequency", null: false
    t.datetime "scheduled_for", null: false
    t.string "notification_channel", default: "both", null: false
    t.uuid "created_by", null: false
    t.uuid "assigned_to"
    t.boolean "is_active", default: true, null: false
    t.boolean "is_snoozed", default: false, null: false
    t.datetime "snooze_until"
    t.datetime "completed_at"
    t.datetime "last_notified_at"
    t.uuid "related_check_in_id"
    t.uuid "related_action_item_id"
    t.uuid "converted_from_request_id"
    t.jsonb "custom_schedule", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.uuid "couple_id"
    t.uuid "parent_reminder_id"
    t.jsonb "custom_frequency_data"
    t.integer "advance_notice_minutes", default: 15
    t.integer "priority"
    t.integer "completion_count", default: 0
    t.integer "skip_count", default: 0
    t.integer "snooze_count", default: 0
    t.integer "reschedule_count", default: 0
    t.datetime "skipped_at"
    t.boolean "is_template", default: false
    t.index ["assigned_to", "is_active"], name: "index_reminders_on_assigned_to_and_is_active"
    t.index ["assigned_to", "is_snoozed", "snooze_until"], name: "index_reminders_assigned_snoozed"
    t.index ["assigned_to"], name: "index_reminders_on_assigned_to"
    t.index ["category"], name: "index_reminders_on_category"
    t.index ["completed_at"], name: "index_reminders_on_completed_at"
    t.index ["couple_id", "is_active", "scheduled_for"], name: "index_reminders_couple_active_scheduled"
    t.index ["couple_id"], name: "index_reminders_on_couple_id"
    t.index ["created_at"], name: "index_reminders_on_created_at"
    t.index ["created_by", "is_active"], name: "index_reminders_on_created_by_and_is_active"
    t.index ["created_by"], name: "index_reminders_on_created_by"
    t.index ["frequency"], name: "index_reminders_on_frequency"
    t.index ["is_active", "scheduled_for"], name: "index_reminders_on_is_active_and_scheduled_for"
    t.index ["parent_reminder_id"], name: "index_reminders_on_parent_reminder_id"
    t.index ["scheduled_for"], name: "index_reminders_on_scheduled_for"
  end

  create_table "session_preparations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "session_id"
    t.uuid "couple_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["couple_id"], name: "index_session_preparations_on_couple_id"
    t.index ["session_id"], name: "index_session_preparations_on_session_id"
  end

  create_table "session_settings", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "couple_id", null: false
    t.integer "session_duration", default: 30, null: false
    t.integer "timeouts_per_partner", default: 2, null: false
    t.integer "timeout_duration", default: 5, null: false
    t.boolean "turn_based_mode", default: false, null: false
    t.integer "turn_duration"
    t.boolean "allow_extensions", default: true, null: false
    t.boolean "pause_notifications", default: true, null: false
    t.boolean "auto_save_drafts", default: true, null: false
    t.boolean "warm_up_questions", default: true, null: false
    t.integer "cool_down_time", default: 5, null: false
    t.datetime "agreed_at"
    t.uuid "agreed_by", default: [], array: true
    t.integer "version", default: 1, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "categories_enabled", default: [], array: true
    t.string "notification_timing"
    t.string "reminder_frequency"
    t.integer "break_intervals"
    t.integer "max_session_length"
    t.boolean "allow_async_mode", default: false
    t.boolean "require_both_present", default: true
    t.boolean "auto_save_notes", default: true
    t.string "privacy_mode", default: "shared"
    t.boolean "archived", default: false
    t.index ["archived"], name: "index_session_settings_on_archived"
    t.index ["couple_id", "agreed_at"], name: "index_session_settings_on_couple_id_and_agreed_at"
    t.index ["couple_id", "archived", "version"], name: "index_settings_couple_archived_version"
    t.index ["couple_id", "version"], name: "index_session_settings_on_couple_id_and_version"
    t.index ["couple_id"], name: "index_session_settings_on_couple_id"
    t.index ["created_at"], name: "index_session_settings_on_created_at"
    t.check_constraint "session_duration > 0", name: "check_session_duration_positive"
    t.check_constraint "version > 0", name: "check_version_positive"
  end

  create_table "session_settings_proposals", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "proposed_by", null: false
    t.datetime "proposed_at", null: false
    t.jsonb "settings", default: {}, null: false
    t.string "status", default: "pending", null: false
    t.uuid "reviewed_by"
    t.datetime "reviewed_at"
    t.uuid "couple_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "title"
    t.text "reason"
    t.uuid "current_settings_id"
    t.text "review_message"
    t.text "rejection_reason"
    t.text "withdrawal_reason"
    t.datetime "withdrawn_at"
    t.datetime "expired_at"
    t.uuid "created_settings_id"
    t.index ["couple_id", "status", "proposed_at"], name: "index_proposals_couple_status_proposed"
    t.index ["couple_id", "status"], name: "index_session_settings_proposals_on_couple_id_and_status"
    t.index ["couple_id"], name: "index_session_settings_proposals_on_couple_id"
    t.index ["created_at"], name: "index_session_settings_proposals_on_created_at"
    t.index ["created_settings_id"], name: "index_session_settings_proposals_on_created_settings_id"
    t.index ["current_settings_id"], name: "index_session_settings_proposals_on_current_settings_id"
    t.index ["proposed_at"], name: "index_session_settings_proposals_on_proposed_at"
    t.index ["proposed_by", "status"], name: "index_session_settings_proposals_on_proposed_by_and_status"
    t.index ["proposed_by"], name: "index_session_settings_proposals_on_proposed_by"
    t.index ["status"], name: "index_session_settings_proposals_on_status"
  end

  create_table "solid_cache_entries", force: :cascade do |t|
    t.binary "key", null: false
    t.binary "value", null: false
    t.datetime "created_at", null: false
    t.bigint "key_hash", null: false
    t.integer "byte_size", null: false
    t.index ["byte_size"], name: "index_solid_cache_entries_on_byte_size"
    t.index ["key_hash", "byte_size"], name: "index_solid_cache_entries_on_key_hash_and_byte_size"
    t.index ["key_hash"], name: "index_solid_cache_entries_on_key_hash", unique: true
  end

  create_table "users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.string "email", null: false
    t.string "avatar"
    t.uuid "partner_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.index ["created_at"], name: "index_users_on_created_at"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["partner_id"], name: "index_users_on_partner_id"
    t.index ["remember_created_at"], name: "index_users_on_remember_created_at"
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["updated_at"], name: "index_users_on_updated_at"
  end

  add_foreign_key "action_items", "check_ins"
  add_foreign_key "action_items", "users", column: "assigned_to_id"
  add_foreign_key "action_items", "users", column: "completed_by_id"
  add_foreign_key "action_items", "users", column: "created_by_id"
  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "categories", "couples"
  add_foreign_key "check_ins", "couples"
  add_foreign_key "couple_users", "couples"
  add_foreign_key "couple_users", "users"
  add_foreign_key "custom_prompts", "categories"
  add_foreign_key "custom_prompts", "couples"
  add_foreign_key "love_actions", "love_languages", column: "linked_language_id"
  add_foreign_key "love_actions", "users", column: "created_by"
  add_foreign_key "love_actions", "users", column: "for_user_id"
  add_foreign_key "love_actions", "users", column: "suggested_by_id"
  add_foreign_key "love_language_discoveries", "check_ins"
  add_foreign_key "love_language_discoveries", "love_languages", column: "converted_to_language_id"
  add_foreign_key "love_language_discoveries", "users"
  add_foreign_key "love_language_discoveries", "users", column: "discovered_by_id"
  add_foreign_key "love_languages", "couples"
  add_foreign_key "love_languages", "users"
  add_foreign_key "milestone_achievements", "couples"
  add_foreign_key "milestone_achievements", "milestones"
  add_foreign_key "milestone_progress_updates", "milestones"
  add_foreign_key "milestones", "couples"
  add_foreign_key "milestones", "users", column: "achieved_by"
  add_foreign_key "notes", "categories"
  add_foreign_key "notes", "check_ins"
  add_foreign_key "notes", "users", column: "author_id"
  add_foreign_key "preparation_topics", "session_preparations"
  add_foreign_key "preparation_topics", "users", column: "author_id"
  add_foreign_key "prompt_templates", "categories"
  add_foreign_key "prompt_templates", "couples"
  add_foreign_key "quick_reflections", "check_ins", column: "session_id"
  add_foreign_key "quick_reflections", "users", column: "author_id"
  add_foreign_key "relationship_requests", "check_ins", column: "related_check_in_id"
  add_foreign_key "relationship_requests", "couples"
  add_foreign_key "relationship_requests", "reminders", column: "converted_to_reminder_id"
  add_foreign_key "relationship_requests", "users", column: "requested_by"
  add_foreign_key "relationship_requests", "users", column: "requested_for"
  add_foreign_key "reminders", "action_items", column: "related_action_item_id"
  add_foreign_key "reminders", "check_ins", column: "related_check_in_id"
  add_foreign_key "reminders", "couples"
  add_foreign_key "reminders", "relationship_requests", column: "converted_from_request_id"
  add_foreign_key "reminders", "reminders", column: "parent_reminder_id"
  add_foreign_key "reminders", "users", column: "assigned_to"
  add_foreign_key "reminders", "users", column: "created_by"
  add_foreign_key "session_preparations", "check_ins", column: "session_id"
  add_foreign_key "session_preparations", "couples"
  add_foreign_key "session_settings", "couples"
  add_foreign_key "session_settings_proposals", "couples"
  add_foreign_key "session_settings_proposals", "session_settings", column: "created_settings_id"
  add_foreign_key "session_settings_proposals", "session_settings", column: "current_settings_id"
  add_foreign_key "session_settings_proposals", "users", column: "proposed_by"
  add_foreign_key "session_settings_proposals", "users", column: "reviewed_by"
  add_foreign_key "users", "users", column: "partner_id"
end
