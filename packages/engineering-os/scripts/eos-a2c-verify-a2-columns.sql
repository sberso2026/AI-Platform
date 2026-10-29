select column_name
from information_schema.columns
where table_schema = 'public' and table_name = 'engineering_decisions'
  and column_name in (
    'decision_question', 'authority_id', 'effective_at',
    'selected_alternative_id', 'supersedes_decision_id'
  )
order by column_name;
