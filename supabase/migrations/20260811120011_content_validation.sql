-- Auditoría de beta-readiness, Prioridad 8: la validación de contenido de
-- usuario (reviews.comment/amount_paid/occasion, profiles.display_name) solo
-- vivía en zod (cliente). Supabase REST es accesible directamente con un JWT
-- válido -- cualquiera podría saltarse la app y mandar un PATCH/POST crudo,
-- así que estas reglas también quedan como CHECK constraints en la base de
-- datos (mismo principio que el CHECK de datos reales de la Prioridad 1: no
-- confiar solo en una capa). Los límites replican exactamente lo que ya
-- exige `reviewFormSchema`/`registerSchema` en el cliente, no son nuevos.

alter table public.reviews
  add constraint reviews_comment_length
    check (comment is null or (char_length(trim(comment)) > 0 and char_length(comment) <= 500)),
  add constraint reviews_amount_paid_range
    -- Tope generoso (10 millones COP) para bloquear valores absurdos/basura,
    -- no para restringir lugares caros reales.
    check (amount_paid is null or (amount_paid > 0 and amount_paid <= 10000000)),
  add constraint reviews_occasion_valid
    check (occasion is null or occasion in ('amigos', 'pareja', 'familia', 'solo', 'trabajo'));

alter table public.profiles
  add constraint profiles_display_name_length
    check (char_length(trim(display_name)) > 0 and char_length(display_name) <= 80);
