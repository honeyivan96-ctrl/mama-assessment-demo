begin;
alter table public.mama_submissions drop constraint mama_submissions_answers_check;
alter table public.mama_submissions drop constraint mama_submissions_question_snapshot_check;
alter table public.mama_submissions add constraint mama_submissions_answers_check check(jsonb_typeof(answers)='array' and jsonb_array_length(answers) in (10,15));
alter table public.mama_submissions add constraint mama_submissions_question_snapshot_check check(jsonb_typeof(question_snapshot)='array' and jsonb_array_length(question_snapshot)=jsonb_array_length(answers));
alter table public.mama_submissions add constraint mama_submissions_version_shape_check check((question_version='fifteen-v3-20261027' and jsonb_array_length(answers)=15) or (question_version<>'fifteen-v3-20261027' and jsonb_array_length(answers)=10));
commit;
