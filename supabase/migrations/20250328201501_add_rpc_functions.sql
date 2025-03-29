-- Add RPC functions for AI context management

-- Dashboard Context RPC
CREATE OR REPLACE FUNCTION get_dashboard_context(team_id UUID)
RETURNS TABLE (
  recent_tasks JSONB,
  upcoming_events JSONB,
  recent_activity JSONB,
  team_stats JSONB
) SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH task_data AS (
    SELECT jsonb_agg(jsonb_build_object(
      'id', t.id,
      'title', t.title,
      'status', t.status,
      'due_date', t.due_date,
      'priority', t.priority,
      'assigned_to', t.assigned_to
    )) as tasks
    FROM family_tasks t
    WHERE t.team_id = team_id
    AND t.deleted_at IS NULL
    ORDER BY t.created_at DESC
    LIMIT 5
  ),
  event_data AS (
    SELECT jsonb_agg(jsonb_build_object(
      'id', e.id,
      'title', e.title,
      'start_date', e.start_date,
      'end_date', e.end_date,
      'status', e.status
    )) as events
    FROM family_events e
    WHERE e.team_id = team_id
    AND e.deleted_at IS NULL
    AND e.start_date >= now()
    ORDER BY e.start_date ASC
    LIMIT 5
  ),
  activity_data AS (
    SELECT jsonb_agg(jsonb_build_object(
      'id', a.id,
      'action', a.action,
      'details', a.details,
      'created_at', a.created_at,
      'user_id', a.user_id
    )) as activity
    FROM activity_logs a
    WHERE a.team_id = team_id
    ORDER BY a.created_at DESC
    LIMIT 10
  ),
  stats_data AS (
    SELECT jsonb_build_object(
      'pending_tasks', COUNT(*) FILTER (WHERE t.status = 'pending'),
      'upcoming_events', COUNT(*) FILTER (WHERE e.start_date > now()),
      'active_documents', COUNT(*) FILTER (WHERE d.status = 'active'),
      'team_members', COUNT(DISTINCT tm.user_id)
    ) as stats
    FROM team_members tm
    LEFT JOIN family_tasks t ON t.team_id = tm.team_id AND t.deleted_at IS NULL
    LEFT JOIN family_events e ON e.team_id = tm.team_id AND e.deleted_at IS NULL
    LEFT JOIN family_documents d ON d.team_id = tm.team_id AND d.deleted_at IS NULL
    WHERE tm.team_id = team_id
    AND tm.deleted_at IS NULL
  )
  SELECT 
    task_data.tasks,
    event_data.events,
    activity_data.activity,
    stats_data.stats
  FROM task_data, event_data, activity_data, stats_data;
END;
$$ LANGUAGE plpgsql;

-- Family Rules and Preferences RPC
CREATE OR REPLACE FUNCTION get_family_rules(team_id UUID)
RETURNS TABLE (
  rules JSONB,
  preferences JSONB,
  important_dates JSONB
) SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH rules_data AS (
    SELECT jsonb_agg(jsonb_build_object(
      'id', fi.id,
      'title', fi.title,
      'content', fi.content,
      'created_at', fi.created_at
    )) as rules
    FROM family_information fi
    WHERE fi.team_id = team_id
    AND fi.deleted_at IS NULL
  ),
  dates_data AS (
    SELECT jsonb_agg(jsonb_build_object(
      'id', fd.id,
      'title', fd.title,
      'date', fd.date,
      'type', fd.type,
      'description', fd.description
    )) as dates
    FROM family_dates fd
    WHERE fd.team_id = team_id
    AND fd.deleted_at IS NULL
    AND fd.date >= now()
    ORDER BY fd.date ASC
  )
  SELECT 
    rules_data.rules,
    jsonb_build_object(
      'notifications_enabled', true,
      'default_reminder_time', '24h',
      'preferred_communication', 'email'
    ) as preferences,
    dates_data.dates
  FROM rules_data, dates_data;
END;
$$ LANGUAGE plpgsql;

-- Recent Conversations Context RPC
CREATE OR REPLACE FUNCTION get_recent_conversations(team_id UUID, user_id UUID)
RETURNS TABLE (
  conversations JSONB,
  relevant_tasks JSONB,
  relevant_documents JSONB
) SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH conv_data AS (
    SELECT jsonb_agg(jsonb_build_object(
      'id', c.id,
      'message', c.message,
      'response', c.response,
      'timestamp', c.timestamp,
      'action', c.action
    )) as conversations
    FROM family_ai_chats c
    WHERE c.team_id = team_id
    AND c.deleted_at IS NULL
    ORDER BY c.timestamp DESC
    LIMIT 5
  ),
  task_data AS (
    SELECT jsonb_agg(jsonb_build_object(
      'id', t.id,
      'title', t.title,
      'status', t.status,
      'due_date', t.due_date
    )) as tasks
    FROM family_tasks t
    WHERE t.team_id = team_id
    AND t.deleted_at IS NULL
    AND (
      t.assigned_to = user_id
      OR t.created_by = user_id
    )
    ORDER BY t.due_date ASC
    LIMIT 5
  ),
  doc_data AS (
    SELECT jsonb_agg(jsonb_build_object(
      'id', d.id,
      'title', d.title,
      'status', d.status,
      'created_at', d.created_at
    )) as documents
    FROM family_documents d
    WHERE d.team_id = team_id
    AND d.deleted_at IS NULL
    AND (
      d.created_by = user_id
      OR d.updated_by = user_id
    )
    ORDER BY d.updated_at DESC
    LIMIT 5
  )
  SELECT 
    conv_data.conversations,
    task_data.tasks,
    doc_data.documents
  FROM conv_data, task_data, doc_data;
END;
$$ LANGUAGE plpgsql;

-- Financial Overview RPC
CREATE OR REPLACE FUNCTION get_financial_overview(team_id UUID)
RETURNS TABLE (
  active_subscriptions JSONB,
  upcoming_payments JSONB,
  monthly_summary JSONB
) SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH sub_data AS (
    SELECT jsonb_agg(jsonb_build_object(
      'id', fs.id,
      'title', fs.title,
      'amount', fs.amount,
      'frequency', fs.frequency,
      'next_billing_date', fs.next_billing_date,
      'description', fs.description
    )) as subscriptions
    FROM family_subscriptions fs
    WHERE fs.team_id = team_id
    AND fs.deleted_at IS NULL
  ),
  payment_data AS (
    SELECT jsonb_agg(jsonb_build_object(
      'subscription_id', fs.id,
      'title', fs.title,
      'amount', fs.amount,
      'due_date', fs.next_billing_date,
      'frequency', fs.frequency
    )) as payments
    FROM family_subscriptions fs
    WHERE fs.team_id = team_id
    AND fs.deleted_at IS NULL
    AND fs.next_billing_date <= now() + interval '30 days'
  ),
  summary_data AS (
    SELECT jsonb_build_object(
      'total_monthly', COALESCE(SUM(
        CASE 
          WHEN frequency = 'monthly' THEN amount
          WHEN frequency = 'quarterly' THEN amount/3
          WHEN frequency = 'yearly' THEN amount/12
        END
      ), 0),
      'subscription_count', COUNT(*),
      'next_payment_date', MIN(next_billing_date)
    ) as summary
    FROM family_subscriptions
    WHERE team_id = team_id
    AND deleted_at IS NULL
  )
  SELECT 
    sub_data.subscriptions,
    payment_data.payments,
    summary_data.summary
  FROM sub_data, payment_data, summary_data;
END;
$$ LANGUAGE plpgsql;

-- Task Analytics RPC
CREATE OR REPLACE FUNCTION get_task_analytics(team_id UUID)
RETURNS TABLE (
  task_stats JSONB,
  member_workload JSONB,
  overdue_tasks JSONB,
  upcoming_deadlines JSONB
) SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH stats_data AS (
    SELECT jsonb_build_object(
      'total_tasks', COUNT(*),
      'completed_tasks', COUNT(*) FILTER (WHERE status = 'completed'),
      'pending_tasks', COUNT(*) FILTER (WHERE status = 'pending'),
      'in_progress_tasks', COUNT(*) FILTER (WHERE status = 'in_progress'),
      'overdue_tasks', COUNT(*) FILTER (WHERE status != 'completed' AND due_date < now())
    ) as stats
    FROM family_tasks
    WHERE team_id = team_id
    AND deleted_at IS NULL
  ),
  workload_data AS (
    SELECT jsonb_agg(jsonb_build_object(
      'user_id', tm.user_id,
      'pending_count', COUNT(*) FILTER (WHERE t.status = 'pending'),
      'in_progress_count', COUNT(*) FILTER (WHERE t.status = 'in_progress'),
      'completed_count', COUNT(*) FILTER (WHERE t.status = 'completed')
    )) as workload
    FROM team_members tm
    LEFT JOIN family_tasks t ON t.assigned_to = tm.user_id AND t.deleted_at IS NULL
    WHERE tm.team_id = team_id
    AND tm.deleted_at IS NULL
    GROUP BY tm.user_id
  ),
  overdue_data AS (
    SELECT jsonb_agg(jsonb_build_object(
      'id', t.id,
      'title', t.title,
      'due_date', t.due_date,
      'assigned_to', t.assigned_to,
      'priority', t.priority
    )) as overdue
    FROM family_tasks t
    WHERE t.team_id = team_id
    AND t.deleted_at IS NULL
    AND t.status != 'completed'
    AND t.due_date < now()
    ORDER BY t.due_date ASC
  ),
  deadline_data AS (
    SELECT jsonb_agg(jsonb_build_object(
      'id', t.id,
      'title', t.title,
      'due_date', t.due_date,
      'assigned_to', t.assigned_to,
      'priority', t.priority
    )) as deadlines
    FROM family_tasks t
    WHERE t.team_id = team_id
    AND t.deleted_at IS NULL
    AND t.status != 'completed'
    AND t.due_date > now()
    AND t.due_date <= now() + interval '7 days'
    ORDER BY t.due_date ASC
  )
  SELECT 
    stats_data.stats,
    workload_data.workload,
    overdue_data.overdue,
    deadline_data.deadlines
  FROM stats_data, workload_data, overdue_data, deadline_data;
END;
$$ LANGUAGE plpgsql;

-- Document Management RPC
CREATE OR REPLACE FUNCTION get_document_status(team_id UUID)
RETURNS TABLE (
  document_summary JSONB,
  recent_documents JSONB,
  expiring_documents JSONB
) SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH summary_data AS (
    SELECT jsonb_build_object(
      'total_documents', COUNT(*),
      'active_documents', COUNT(*) FILTER (WHERE status = 'active'),
      'draft_documents', COUNT(*) FILTER (WHERE status = 'draft'),
      'archived_documents', COUNT(*) FILTER (WHERE status = 'archived')
    ) as summary
    FROM family_documents
    WHERE team_id = team_id
    AND deleted_at IS NULL
  ),
  recent_data AS (
    SELECT jsonb_agg(jsonb_build_object(
      'id', d.id,
      'title', d.title,
      'status', d.status,
      'created_at', d.created_at,
      'created_by', d.created_by,
      'updated_at', d.updated_at
    )) as recent
    FROM family_documents d
    WHERE d.team_id = team_id
    AND d.deleted_at IS NULL
    ORDER BY d.updated_at DESC
    LIMIT 5
  ),
  expiring_data AS (
    SELECT jsonb_agg(jsonb_build_object(
      'id', d.id,
      'title', d.title,
      'expiry_date', d.expiry_date,
      'status', d.status,
      'created_by', d.created_by
    )) as expiring
    FROM family_documents d
    WHERE d.team_id = team_id
    AND d.deleted_at IS NULL
    AND d.expiry_date IS NOT NULL
    AND d.expiry_date <= now() + interval '30 days'
    ORDER BY d.expiry_date ASC
  )
  SELECT 
    summary_data.summary,
    recent_data.recent,
    expiring_data.expiring
  FROM summary_data, recent_data, expiring_data;
END;
$$ LANGUAGE plpgsql;

-- Family Calendar RPC
CREATE OR REPLACE FUNCTION get_calendar_overview(team_id UUID)
RETURNS TABLE (
  upcoming_events JSONB,
  important_dates JSONB,
  recurring_events JSONB,
  event_summary JSONB
) SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH event_data AS (
    SELECT jsonb_agg(jsonb_build_object(
      'id', e.id,
      'title', e.title,
      'start_date', e.start_date,
      'end_date', e.end_date,
      'status', e.status,
      'description', e.description,
      'location', e.location,
      'attendees', e.attendees
    )) as events
    FROM family_events e
    WHERE e.team_id = team_id
    AND e.deleted_at IS NULL
    AND e.start_date >= now()
    ORDER BY e.start_date ASC
    LIMIT 10
  ),
  date_data AS (
    SELECT jsonb_agg(jsonb_build_object(
      'id', d.id,
      'title', d.title,
      'date', d.date,
      'type', d.type,
      'description', d.description,
      'recurring', d.recurring
    )) as dates
    FROM family_dates d
    WHERE d.team_id = team_id
    AND d.deleted_at IS NULL
    AND d.date >= now()
    ORDER BY d.date ASC
    LIMIT 10
  ),
  recurring_data AS (
    SELECT jsonb_agg(jsonb_build_object(
      'id', e.id,
      'title', e.title,
      'frequency', e.frequency,
      'next_occurrence', e.next_occurrence,
      'description', e.description
    )) as recurring
    FROM family_events e
    WHERE e.team_id = team_id
    AND e.deleted_at IS NULL
    AND e.recurring = true
  ),
  summary_data AS (
    SELECT jsonb_build_object(
      'total_events', COUNT(*) FILTER (WHERE e.start_date >= now()),
      'upcoming_events', COUNT(*) FILTER (WHERE e.start_date >= now() AND e.start_date <= now() + interval '7 days'),
      'recurring_events', COUNT(*) FILTER (WHERE e.recurring = true),
      'total_dates', COUNT(*) FILTER (WHERE d.date >= now())
    ) as summary
    FROM family_events e
    LEFT JOIN family_dates d ON d.team_id = e.team_id AND d.deleted_at IS NULL
    WHERE e.team_id = team_id
    AND e.deleted_at IS NULL
  )
  SELECT 
    event_data.events,
    date_data.dates,
    recurring_data.recurring,
    summary_data.summary
  FROM event_data, date_data, recurring_data, summary_data;
END;
$$ LANGUAGE plpgsql; 