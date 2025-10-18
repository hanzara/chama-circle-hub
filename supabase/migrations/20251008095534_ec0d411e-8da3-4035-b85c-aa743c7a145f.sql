-- Create function to delete a chama (admin only)
create or replace function public.delete_chama(p_chama_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_chama_name text;
begin
  -- Check if user is admin of the chama
  if not public.is_chama_admin(p_chama_id) then
    raise exception 'Only admins can delete chamas';
  end if;

  -- Get chama name for logging
  select name into v_chama_name from public.chamas where id = p_chama_id;

  -- Delete chama (cascading deletes will handle related records)
  delete from public.chamas where id = p_chama_id;

  return jsonb_build_object(
    'success', true,
    'message', format('Chama "%s" has been deleted successfully', v_chama_name)
  );
end;
$$;