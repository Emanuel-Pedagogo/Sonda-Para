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
where id = '3e37c890-7133-495f-8127-ce4f58a3f64b'
on conflict (id) do nothing;
