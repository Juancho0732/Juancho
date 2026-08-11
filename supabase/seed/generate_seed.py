#!/usr/bin/env python3
"""
Genera supabase/seed.sql con datos MOCK (ficticios) para desarrollo local.

No representa lugares reales de Bogotá -- todos los nombres, reseñas y precios
son inventados a propósito para poblar la app durante el desarrollo (Regla 1).
Las coordenadas son centroides aproximados y públicos de cada localidad, usados
solo para que las consultas de cercanía tengan sentido geográfico.

Pensado para poder escalar el volumen de datos simplemente subiendo N_PLACES,
sin tocar el esquema (ver docs/00-fase0-analisis.md sección 6: 100 -> 500 -> 5000).

Uso: python3 supabase/seed/generate_seed.py > supabase/seed.sql
"""

import random

random.seed(42)  # reproducible: correr el script dos veces da el mismo resultado

N_PLACES = 72

LOCALITIES = [
    ("Chapinero", 4.6486, -74.0628),
    ("Usaquén", 4.6946, -74.0307),
    ("Candelaria", 4.5981, -74.0758),
    ("Teusaquillo", 4.6320, -74.0898),
    ("Zona Rosa", 4.6667, -74.0546),
    ("Suba", 4.7420, -74.0837),
]

CATEGORIES = [
    ("Restaurantes", "restaurantes"),
    ("Bares y Rooftops", "bares-rooftops"),
    ("Cafés", "cafes"),
    ("Cultura y Museos", "cultura-museos"),
    ("Aire Libre y Parques", "aire-libre-parques"),
    ("Vida Nocturna", "vida-nocturna"),
    ("Planes con Amigos", "planes-amigos"),
    ("Planes en Pareja", "planes-pareja"),
    ("Experiencias y Talleres", "experiencias-talleres"),
    ("Deportes y Recreación", "deportes-recreacion"),
]

# (banda de precio min/max por persona en COP) por categoría, para que el rango
# tenga algo de sentido (un café no debería costar lo mismo que un rooftop).
PRICE_BANDS = {
    "restaurantes": (25000, 90000),
    "bares-rooftops": (30000, 120000),
    "cafes": (8000, 25000),
    "cultura-museos": (0, 30000),
    "aire-libre-parques": (0, 15000),
    "vida-nocturna": (40000, 150000),
    "planes-amigos": (15000, 80000),
    "planes-pareja": (30000, 130000),
    "experiencias-talleres": (35000, 100000),
    "deportes-recreacion": (10000, 60000),
}

TAGS_POOL = [
    "pet_friendly", "outdoor", "live_music", "romantic", "budget_friendly",
    "group_friendly", "instagrammable", "quiet", "late_night",
    "family_friendly", "craft_beer", "vegetarian_friendly", "rooftop",
    "board_games", "artesanal",
]

NAME_PREFIXES = [
    "El", "La", "Casa", "Rincón", "Terraza", "Estudio", "Taller", "Jardín",
    "Mirador", "Refugio", "Punto", "Andén",
]
NAME_CORES = [
    "Sur", "Norte", "Andino", "Bohemio", "Colibrí", "Aguacate", "Frailejón",
    "Cometa", "Ciprés", "Guayacán", "Nube", "Sabana", "Tinto", "Alameda",
    "Bambú", "Cardamomo", "Solar", "Trópico", "Musgo", "Ceiba",
]
NAME_SUFFIXES = {
    "restaurantes": "Cocina",
    "bares-rooftops": "Rooftop",
    "cafes": "Café",
    "cultura-museos": "Galería",
    "aire-libre-parques": "Parque",
    "vida-nocturna": "Club",
    "planes-amigos": "Social",
    "planes-pareja": "Lounge",
    "experiencias-talleres": "Taller",
    "deportes-recreacion": "Arena",
}

SCHEDULE = {
    "lun_vie": "12:00-22:00",
    "sab_dom": "10:00-23:00",
}

REVIEW_COMMENTS = [
    "Muy buen ambiente, repetiríamos sin dudarlo.",
    "El servicio fue lento pero la experiencia valió la pena.",
    "Ideal para ir en grupo, precios justos.",
    "Un poco caro para lo que ofrece, pero se disfruta.",
    "Nos encantó la decoración y la música.",
    "Buena opción para una primera cita.",
    "El lugar es pequeño, mejor reservar con anticipación.",
    "Relación precio/calidad muy buena.",
    "Volveríamos, aunque el parqueadero es complicado.",
    "Excelente para desconectarse un rato.",
]
OCCASIONS = ["amigos", "pareja", "familia", "solo", "trabajo"]

DEV_USERS = [
    ("11111111-1111-1111-1111-111111111101", "dev.laura@example.test", "Laura"),
    ("11111111-1111-1111-1111-111111111102", "dev.andres@example.test", "Andrés"),
    ("11111111-1111-1111-1111-111111111103", "dev.camila@example.test", "Camila"),
    ("11111111-1111-1111-1111-111111111104", "dev.felipe@example.test", "Felipe"),
    ("11111111-1111-1111-1111-111111111105", "dev.valentina@example.test", "Valentina"),
    ("11111111-1111-1111-1111-111111111106", "dev.juan@example.test", "Juan"),
]


def sql_str(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def jitter(base: float, spread: float = 0.012) -> float:
    return base + random.uniform(-spread, spread)


SEED_CONFIRM_PHRASE = "si-quiero-cargar-datos-ficticios"


def seed_guard_block() -> str:
    """Salvaguarda (auditoría de beta-readiness, Prioridad 1/7): este archivo
    carga datos FICTICIOS de desarrollo y nunca debe correr contra un
    proyecto con datos reales. Se frena solo, con un mensaje explícito, salvo
    que quien lo ejecute:
      1) haya puesto explícitamente la frase de confirmación en la misma
         sesión/conexión (no es algo que se corra "sin querer"), y
      2) la base todavía no tenga ningún lugar real (is_mock = false) -- si
         ya lo tiene, sembrar MOCK encima siempre se rechaza, confirmación o no.
    """
    return "\n".join(
        [
            "-- ============================================================================",
            "-- SALVAGUARDA: este archivo carga datos FICTICIOS (MOCK) de desarrollo.",
            "-- NUNCA debe correr contra un proyecto con usuarios o datos reales.",
            "--",
            "-- Para confirmar que sabés lo que estás haciendo, corré esta línea ANTES",
            "-- de este archivo, en la MISMA sesión/conexión (psql, Supabase SQL Editor, etc.):",
            "--",
            f"--   SET myapp.confirm_mock_seed = '{SEED_CONFIRM_PHRASE}';",
            "--",
            "-- Sin esa confirmación explícita, o si la base ya tiene algún lugar real",
            "-- (is_mock = false), este script se detiene sin cambiar nada.",
            "-- ============================================================================",
            "do $$",
            "begin",
            f"  if coalesce(current_setting('myapp.confirm_mock_seed', true), '') <> '{SEED_CONFIRM_PHRASE}' then",
            "    raise exception 'Seed MOCK abortado: falta confirmación explícita. Corré antes: "
            f"SET myapp.confirm_mock_seed = ''{SEED_CONFIRM_PHRASE}''; -- "
            "Este seed es SOLO para desarrollo local, nunca para producción.';",
            "  end if;",
            "",
            "  if exists (select 1 from public.places where is_mock = false) then",
            "    raise exception 'Seed MOCK abortado: ya existen lugares reales (is_mock = false) "
            "en esta base. No se puede sembrar datos ficticios sobre datos reales.';",
            "  end if;",
            "end",
            "$$;",
        ]
    )


def main() -> None:
    lines: list[str] = []
    lines.append("-- Datos MOCK/DEMO para desarrollo local. Generado por")
    lines.append("-- supabase/seed/generate_seed.py -- no ejecutar contra producción.")
    lines.append("-- Ningún nombre, reseña o precio corresponde a un lugar real.")
    lines.append("")
    # Todo el archivo corre en una sola transacción: si la salvaguarda de
    # arriba lanza una excepción, nada de lo que sigue se llega a confirmar,
    # incluso si quien lo ejecuta no usa `psql -v ON_ERROR_STOP=1` (que por
    # defecto sigue corriendo statements después de un error).
    lines.append("begin;")
    lines.append("")
    lines.append(seed_guard_block())
    lines.append("")

    # --- Categorías ---
    lines.append("insert into public.categories (name, slug) values")
    lines.append(
        ",\n".join(f"  ({sql_str(name)}, {sql_str(slug)})" for name, slug in CATEGORIES) + ";"
    )
    lines.append("")

    # --- Usuarios de desarrollo (solo para poder sembrar reseñas MOCK). ---
    # En Supabase real, auth.users lo gestiona el servicio de Auth; esto solo
    # tiene sentido corriendo contra una base local de desarrollo.
    lines.append("insert into auth.users (id, email, raw_user_meta_data) values")
    lines.append(
        ",\n".join(
            f"  ({sql_str(uid)}, {sql_str(email)}, "
            f"jsonb_build_object('display_name', {sql_str(name)}))"
            for uid, email, name in DEV_USERS
        )
        + ";"
    )
    lines.append("")
    lines.append(
        "-- El trigger on_auth_user_created ya inserta el profile correspondiente."
    )
    lines.append("")

    # --- Places ---
    lines.append("with inserted_places as (")
    lines.append("  insert into public.places")
    lines.append(
        "    (name, description, category_id, tags, address, locality, lat, lng, "
        "price_min, price_max, schedule, is_mock)"
    )
    lines.append("  values")

    place_rows = []
    place_meta = []  # guarda (index, category_slug, price_min, price_max) para reviews/images
    for i in range(N_PLACES):
        locality, base_lat, base_lng = LOCALITIES[i % len(LOCALITIES)]
        category_name, category_slug = CATEGORIES[i % len(CATEGORIES)]
        prefix = random.choice(NAME_PREFIXES)
        core = random.choice(NAME_CORES)
        suffix = NAME_SUFFIXES[category_slug]
        name = f"{prefix} {core} {suffix}"

        band_min, band_max = PRICE_BANDS[category_slug]
        price_min = random.randint(band_min, max(band_min, band_max - 10000)) if band_max > 0 else 0
        price_max = price_min + random.randint(5000, max(5000, band_max - price_min))

        tags = random.sample(TAGS_POOL, k=random.randint(2, 4))
        lat = jitter(base_lat)
        lng = jitter(base_lng)
        address = f"Calle {random.randint(1, 140)} # {random.randint(1, 30)}-{random.randint(1, 99)}, {locality}"
        group_text = "grupos" if "group_friendly" in tags else "una experiencia tranquila"
        description = (
            f"Plan de {category_name.lower()} en {locality}, pensado para "
            f"{group_text}. (Dato ficticio de demo)"
        )
        schedule_json = (
            '{"lun_vie": "' + SCHEDULE["lun_vie"] + '", "sab_dom": "' + SCHEDULE["sab_dom"] + '"}'
        )

        row = (
            f"    ({sql_str(name)}, {sql_str(description)}, "
            f"(select id from public.categories where slug = {sql_str(category_slug)}), "
            f"array[{', '.join(sql_str(t) for t in tags)}]::text[], "
            f"{sql_str(address)}, {sql_str(locality)}, {lat:.6f}, {lng:.6f}, "
            f"{price_min}, {price_max}, "
            f"{sql_str(schedule_json)}::jsonb, "
            f"true)"
        )
        place_rows.append(row)
        place_meta.append((name, category_slug, price_min, price_max))

    lines.append(",\n".join(place_rows))
    lines.append("  returning id, name")
    lines.append(")")

    # --- Imágenes (placeholders, sin URLs reales) ---
    lines.append(
        "insert into public.place_images (place_id, url, position)\n"
        "select id, 'https://picsum.photos/seed/' || md5(id::text) || '/800/600', 0\n"
        "from inserted_places;"
    )
    lines.append("")

    # --- Reseñas MOCK sobre un subconjunto de lugares ---
    lines.append("with target_places as (")
    lines.append("  select id from public.places where is_mock = true order by created_at limit 40")
    lines.append(")")
    lines.append("insert into public.reviews (place_id, user_id, rating, comment, amount_paid, occasion)")
    lines.append("select p.id, u.id, r.rating, r.comment, r.amount_paid, r.occasion")
    lines.append("from target_places p")
    lines.append("cross join lateral (")
    lines.append("  select * from (values")

    review_rows = []
    for uid, _, _ in DEV_USERS:
        rating = random.randint(3, 5)
        comment = random.choice(REVIEW_COMMENTS)
        amount_paid = random.randint(15000, 90000)
        occasion = random.choice(OCCASIONS)
        review_rows.append(
            f"    ({sql_str(uid)}::uuid, {rating}, {sql_str(comment)}, {amount_paid}, {sql_str(occasion)})"
        )
    lines.append(",\n".join(review_rows))
    lines.append("  ) as v(user_id, rating, comment, amount_paid, occasion)")
    lines.append("  order by random()")
    lines.append("  limit 3")
    lines.append(") as r(user_id, rating, comment, amount_paid, occasion)")
    lines.append("join auth.users u on u.id = r.user_id")
    lines.append("on conflict (place_id, user_id) do nothing;")
    lines.append("")
    lines.append("commit;")
    lines.append("")

    print("\n".join(lines))


if __name__ == "__main__":
    main()
