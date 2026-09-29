CREATE OR REPLACE FUNCTION engineering_decision_sync_selected_alternative()
RETURNS TRIGGER AS $$
BEGIN
  IF pg_trigger_depth() > 1 THEN
    RETURN NEW;
  END IF;
  IF TG_TABLE_NAME = 'engineering_decisions' THEN
    UPDATE engineering_decision_alternatives
       SET is_selected = (id = NEW.selected_alternative_id),
           status = CASE
             WHEN id = NEW.selected_alternative_id THEN 'selected'
             WHEN is_selected AND status = 'selected' THEN 'considered'
             ELSE status
           END
     WHERE decision_id = NEW.id
       AND (is_selected OR id = NEW.selected_alternative_id);
    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER
SET search_path = public, pg_temp;
