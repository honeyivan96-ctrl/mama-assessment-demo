begin;
alter table public.mama_submissions drop constraint mama_submissions_version_shape_check;
alter table public.mama_submissions add constraint mama_submissions_version_shape_check check((question_version in ('fifteen-v3-20261027','fifteen-v3-20261027-r2') and jsonb_array_length(answers)=15) or (question_version not in ('fifteen-v3-20261027','fifteen-v3-20261027-r2') and jsonb_array_length(answers)=10));
commit;
