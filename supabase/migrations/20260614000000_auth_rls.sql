-- Fase 1: Autenticação — vincula usuarios ao Supabase Auth e aplica RLS

alter table public.usuarios
  add constraint usuarios_id_fkey
  foreign key (id) references auth.users (id) on delete cascade;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.usuarios (id, nome, email, perfil)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'perfil', 'professor')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

alter table public.usuarios enable row level security;

create policy "Usuarios veem proprio perfil"
  on public.usuarios
  for select
  to authenticated
  using (auth.uid() = id);

create policy "Usuarios atualizam proprio perfil"
  on public.usuarios
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);
