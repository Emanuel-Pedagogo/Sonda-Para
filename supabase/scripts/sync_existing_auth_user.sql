-- Execute no SQL Editor se o usuario foi criado manualmente em Authentication
-- ANTES da migration de auth (sem linha em public.usuarios).
--
-- Substitua USER_UUID pelo ID do usuario em Authentication > Users.

insert into public.usuarios (id, nome, email, perfil)
select
  id,
  coalesce(raw_user_meta_data ->> 'nome', split_part(email, '@', 1)),
  email,
  coalesce(raw_user_meta_data ->> 'perfil', 'professor')
from auth.users
where id = 'USER_UUID'
on conflict (id) do nothing;
