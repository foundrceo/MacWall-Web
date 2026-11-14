-- Trial ladder: the first email no longer carries a discount; a new "offer"
-- step sends the 10% code 6 hours later. Allow that step in the queue.

alter table public.macwall_trial_ended_queue
  drop constraint macwall_trial_ended_queue_step_ok;
alter table public.macwall_trial_ended_queue
  add constraint macwall_trial_ended_queue_step_ok
  check (step = any (array['ended', 'offer', 'ladder_20', 'ladder_30', 'reminder', 'last_call']));
