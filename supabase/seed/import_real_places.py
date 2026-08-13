#!/usr/bin/env python3
"""
Valida un archivo CSV o JSON de lugares REALES y, si todo lo válido pasa la
validación, genera un .sql de solo-INSERT para que un humano lo revise y lo
aplique a mano contra el proyecto que corresponda.

Este script NUNCA se conecta a ninguna base de datos -- no tiene ni pide
credenciales. Solo lee el archivo de entrada y (opcionalmente) escribe un
archivo .sql local. Aplicar ese .sql sigue siendo un paso manual y explícito.

No inventa lugares: cada fila tiene que venir de investigación real de quien
arma el CSV/JSON. Este script solo valida formato y trazabilidad, no verifica
que el lugar exista de verdad -- esa responsabilidad es de la fuente.

Uso:
    python3 supabase/seed/import_real_places.py lugares.csv
    python3 supabase/seed/import_real_places.py lugares.json --output supabase/seed/real_places_import.sql

Formato esperado (columnas/campos, todas como texto en CSV):
    name, category, address, locality, lat, lng, price_min, price_max,
    schedule, description, source, last_verified_at
    Opcionales: images (URLs separadas por "|"), tags (separados por "|")

    schedule acepta JSON (`{"lun_vie": "12:00-22:00"}`) o el formato corto
    "lun_vie=12:00-22:00;sab_dom=10:00-23:00".

    source debe ser una URL (http/https) o una descripción específica de la
    fuente (ej. "Visita presencial 2026-03-01", "Instagram oficial @lugar")
    -- términos genéricos como "internet" o "google" se rechazan.

    last_verified_at es obligatoria (fecha ISO, ej. "2026-03-01"). Nunca se
    completa automáticamente: si falta, la fila se rechaza.

Ver supabase/seed/real_places.example.csv para un ejemplo de formato (con
filas de ejemplo, no datos reales).
"""

import argparse
import csv
import json
import re
import sys
import uuid
from dataclasses import dataclass, field
from datetime import date, datetime
from pathlib import Path
from urllib.parse import urlparse

sys.path.insert(0, str(Path(__file__).parent))
from generate_seed import CATEGORIES, LOCALITIES, sql_str  # noqa: E402

REQUIRED_FIELDS = [
    "name",
    "category",
    "address",
    "locality",
    "lat",
    "lng",
    "description",
    "source",
    "last_verified_at",
]
# price_min/price_max/schedule son opcionales A PROPÓSITO: hay categorías
# enteras (vida nocturna, sobre todo) donde el lugar existe y es real pero no
# publica horario ni precio en ninguna fuente verificable. Antes eran
# obligatorios, y eso obligaba a elegir entre inventar el dato o descartar el
# lugar. Ahora se dejan vacíos -> NULL en la base, y la app muestra
# "Horario no publicado -- confirma con el lugar" / "Precio no disponible".
# Vacío nunca significa "gratis" ni "cerrado": significa "no se sabe".
OPTIONAL_FIELDS = ["images", "tags", "price_min", "price_max", "schedule"]

# Sanity check de coordenadas -- no es el límite exacto de Bogotá, es un
# rectángulo generoso para atrapar lat/lng invertidas o basura evidente.
BOGOTA_LAT_RANGE = (4.40, 4.90)
BOGOTA_LNG_RANGE = (-74.35, -73.90)

MIN_DESCRIPTION_LENGTH = 20
MAX_DESCRIPTION_LENGTH = 1000
MIN_SOURCE_LENGTH = 8
GENERIC_SOURCE_TERMS = {
    "internet", "web", "google", "buscador", "search", "online", "n/a", "na",
    "desconocido", "unknown", "varios", "various", "chatgpt", "gpt", "ia",
    "ai", "inteligencia artificial", "no se", "no recuerdo", "google maps",
}
SCHEDULE_VALUE_RE = re.compile(r"^\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}$")
KNOWN_CATEGORIES = {name.lower() for name, _ in CATEGORIES} | {slug.lower() for _, slug in CATEGORIES}
KNOWN_LOCALITIES = {name.lower() for name, _, _ in LOCALITIES}


@dataclass
class RowResult:
    row_number: int
    raw: dict
    errors: list = field(default_factory=list)
    warnings: list = field(default_factory=list)
    place_id: str = ""
    category_name: str = ""
    schedule_json: str = ""
    images: list = field(default_factory=list)
    tags: list = field(default_factory=list)

    @property
    def is_valid(self) -> bool:
        return not self.errors


def looks_like_url(value: str) -> bool:
    try:
        parsed = urlparse(value)
        return parsed.scheme in ("http", "https") and bool(parsed.netloc)
    except ValueError:
        return False


def validate_source(raw: str) -> tuple[bool, str]:
    value = raw.strip()
    if not value:
        return False, "source vacío"
    if looks_like_url(value):
        return True, ""
    normalized = value.lower().strip(" .")
    if normalized in GENERIC_SOURCE_TERMS:
        return (
            False,
            f'source demasiado genérico ("{value}") -- usa una URL o describe la fuente '
            'específica (ej. "Visita presencial 2026-03-01", "Instagram oficial @lugar")',
        )
    if len(value) < MIN_SOURCE_LENGTH:
        return (
            False,
            f'source demasiado corto/vago ("{value}") -- usa una URL o describe la fuente específica',
        )
    return True, ""


def validate_last_verified_at(raw: str) -> tuple[str | None, str]:
    value = raw.strip()
    if not value:
        return None, "last_verified_at vacío -- obligatoria, no se completa automáticamente"
    try:
        parsed = date.fromisoformat(value[:10])
    except ValueError:
        return None, f'last_verified_at inválida ("{value}") -- usa formato ISO, ej. "2026-03-01"'
    if parsed > date.today():
        return None, f"last_verified_at ({parsed.isoformat()}) es una fecha futura"
    return parsed.isoformat(), ""


def resolve_category(raw: str) -> tuple[str | None, str]:
    normalized = raw.strip().lower()
    if not normalized:
        return None, "category vacía"
    for name, slug in CATEGORIES:
        if normalized == name.lower() or normalized == slug.lower():
            return name, ""
    known = ", ".join(name for name, _ in CATEGORIES)
    return None, f'category "{raw}" no coincide con ninguna categoría existente ({known})'


def parse_float(raw: str, field_name: str) -> tuple[float | None, str]:
    try:
        return float(raw.strip()), ""
    except (ValueError, AttributeError):
        return None, f'{field_name} inválido ("{raw}") -- debe ser numérico'


def parse_schedule(raw: str) -> tuple[str | None, list[str], str]:
    """Devuelve (json_para_sql, warnings, error)."""
    value = raw.strip()
    if not value:
        return None, [], "schedule vacío"
    parsed: dict | None = None
    try:
        candidate = json.loads(value)
        if isinstance(candidate, dict):
            parsed = candidate
    except json.JSONDecodeError:
        pass
    if parsed is None:
        parsed = {}
        for pair in value.split(";"):
            pair = pair.strip()
            if not pair:
                continue
            if "=" not in pair:
                return None, [], f'schedule inválido ("{raw}") -- usa "grupo=HH:MM-HH:MM;..." o JSON'
            key, _, val = pair.partition("=")
            parsed[key.strip()] = val.strip()
    if not parsed:
        return None, [], f'schedule vacío o mal formado ("{raw}")'
    warnings = []
    for key, val in parsed.items():
        if not isinstance(val, str) or not SCHEDULE_VALUE_RE.match(val.strip()):
            warnings.append(f'schedule["{key}"] = "{val}" no tiene forma "HH:MM-HH:MM", revisar a mano')
    return json.dumps(parsed, ensure_ascii=False), warnings, ""


def validate_row(row_number: int, raw: dict) -> RowResult:
    result = RowResult(row_number=row_number, raw=raw)

    for field_name in REQUIRED_FIELDS:
        if field_name not in raw or not str(raw.get(field_name, "")).strip():
            result.errors.append(f"falta el campo obligatorio '{field_name}'")
    if result.errors:
        return result

    name = raw["name"].strip()
    if len(name) > 200:
        result.errors.append("name demasiado largo (máximo 200 caracteres)")

    category_name, err = resolve_category(raw["category"])
    if err:
        result.errors.append(err)
    else:
        result.category_name = category_name

    address = raw["address"].strip()
    if len(address) > 300:
        result.errors.append("address demasiado larga (máximo 300 caracteres)")

    locality = raw["locality"].strip()
    if locality.lower() not in KNOWN_LOCALITIES:
        result.warnings.append(
            f'locality "{locality}" no está en la lista curada actual '
            f"({', '.join(name for name, _, _ in LOCALITIES)}) -- se importa igual, pero no va a "
            "aparecer en el filtro de zona de Search hasta que se agregue a "
            "src/features/places/constants.ts y supabase/seed/generate_seed.py"
        )

    lat, err = parse_float(raw["lat"], "lat")
    if err:
        result.errors.append(err)
    elif not (BOGOTA_LAT_RANGE[0] <= lat <= BOGOTA_LAT_RANGE[1]):
        result.errors.append(f"lat ({lat}) fuera del rango esperado para Bogotá {BOGOTA_LAT_RANGE}")

    lng, err = parse_float(raw["lng"], "lng")
    if err:
        result.errors.append(err)
    elif not (BOGOTA_LNG_RANGE[0] <= lng <= BOGOTA_LNG_RANGE[1]):
        result.errors.append(f"lng ({lng}) fuera del rango esperado para Bogotá {BOGOTA_LNG_RANGE}")

    price_min = None
    if str(raw.get("price_min", "")).strip():
        price_min, err = parse_float(raw["price_min"], "price_min")
        if err:
            result.errors.append(err)
        elif price_min < 0:
            result.errors.append("price_min no puede ser negativo")

    price_max = None
    if str(raw.get("price_max", "")).strip():
        price_max, err = parse_float(raw["price_max"], "price_max")
        if err:
            result.errors.append(err)
        elif price_max < 0:
            result.errors.append("price_max no puede ser negativo")

    if price_min is not None and price_max is not None and price_min > price_max:
        result.errors.append(f"price_min ({price_min}) no puede ser mayor que price_max ({price_max})")

    if str(raw.get("schedule", "")).strip():
        schedule_json, schedule_warnings, err = parse_schedule(raw["schedule"])
        if err:
            result.errors.append(err)
        else:
            result.schedule_json = schedule_json
            result.warnings.extend(schedule_warnings)

    description = raw["description"].strip()
    if len(description) < MIN_DESCRIPTION_LENGTH:
        result.errors.append(f"description demasiado corta (mínimo {MIN_DESCRIPTION_LENGTH} caracteres)")
    elif len(description) > MAX_DESCRIPTION_LENGTH:
        result.errors.append(f"description demasiado larga (máximo {MAX_DESCRIPTION_LENGTH} caracteres)")

    ok, err = validate_source(raw["source"])
    if not ok:
        result.errors.append(err)

    verified_at, err = validate_last_verified_at(raw["last_verified_at"])
    if err:
        result.errors.append(err)

    images_raw = str(raw.get("images", "")).strip()
    if images_raw:
        candidates = json.loads(images_raw) if images_raw.startswith("[") else images_raw.split("|")
        for url in candidates:
            url = str(url).strip()
            if not url:
                continue
            if not looks_like_url(url):
                result.errors.append(f'images: "{url}" no es una URL http(s) válida')
            else:
                result.images.append(url)

    tags_raw = str(raw.get("tags", "")).strip()
    if tags_raw:
        candidates = json.loads(tags_raw) if tags_raw.startswith("[") else tags_raw.split("|")
        result.tags = [str(t).strip() for t in candidates if str(t).strip()]

    if not result.errors:
        result.place_id = str(uuid.uuid4())

    return result


def read_rows(path: Path) -> list[dict]:
    if path.suffix.lower() == ".json":
        data = json.loads(path.read_text(encoding="utf-8"))
        if not isinstance(data, list):
            raise ValueError("el JSON de entrada debe ser una lista de objetos")
        return data
    with path.open(encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def generate_sql(valid_rows: list[RowResult]) -> str:
    lines = [
        "-- Generado por supabase/seed/import_real_places.py.",
        "-- REVISAR ANTES DE APLICAR -- este archivo no se generó ni se aplicó solo.",
        "-- No lo corras contra un proyecto real sin haber verificado cada fila a mano.",
        "",
        "begin;",
        "",
    ]
    for row in valid_rows:
        raw = row.raw
        lines.append(f"-- Fila {row.row_number}: {raw['name'].strip()}")
        lines.append("insert into public.places")
        lines.append(
            "  (id, name, category_id, address, locality, lat, lng, price_min, price_max, "
            "schedule, description, tags, is_mock, source, last_verified_at)"
        )
        lines.append("values (")
        lines.append(f"  {sql_str(row.place_id)}::uuid,")
        lines.append(f"  {sql_str(raw['name'].strip())},")
        lines.append(f"  (select id from public.categories where name = {sql_str(row.category_name)}),")
        lines.append(f"  {sql_str(raw['address'].strip())},")
        lines.append(f"  {sql_str(raw['locality'].strip())},")
        lines.append(f"  {float(raw['lat'])},")
        lines.append(f"  {float(raw['lng'])},")
        # Vacío -> NULL, nunca 0: en price un 0 significaría "gratis" y en
        # schedule un '{}' significaría "sin días de apertura".
        price_min_raw = str(raw.get("price_min", "")).strip()
        price_max_raw = str(raw.get("price_max", "")).strip()
        lines.append(f"  {float(price_min_raw) if price_min_raw else 'null'},")
        lines.append(f"  {float(price_max_raw) if price_max_raw else 'null'},")
        schedule_sql = f"{sql_str(row.schedule_json)}::jsonb" if row.schedule_json else "null"
        lines.append(f"  {schedule_sql},")
        lines.append(f"  {sql_str(raw['description'].strip())},")
        tags_sql = "array[" + ", ".join(sql_str(t) for t in row.tags) + "]" if row.tags else "'{}'"
        lines.append(f"  {tags_sql},")
        lines.append("  false,")
        lines.append(f"  {sql_str(raw['source'].strip())},")
        verified_at, _ = validate_last_verified_at(raw["last_verified_at"])
        lines.append(f"  {sql_str(verified_at)}::timestamptz")
        lines.append(");")
        for position, url in enumerate(row.images):
            lines.append(
                f"insert into public.place_images (place_id, url, position) values "
                f"({sql_str(row.place_id)}::uuid, {sql_str(url)}, {position});"
            )
        lines.append("")
    lines.append("commit;")
    lines.append("")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("input", type=Path, help="Archivo CSV o JSON con los lugares a importar")
    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        help="Si se pasa, escribe el .sql de las filas válidas ahí. Sin esta opción, solo valida (dry run).",
    )
    args = parser.parse_args()

    if not args.input.exists():
        print(f"Error: no existe el archivo {args.input}", file=sys.stderr)
        return 2

    try:
        raw_rows = read_rows(args.input)
    except (json.JSONDecodeError, csv.Error, ValueError, OSError) as exc:
        print(f"Error leyendo {args.input}: {exc}", file=sys.stderr)
        return 2

    if not raw_rows:
        print("El archivo de entrada no tiene filas.", file=sys.stderr)
        return 2

    results = [validate_row(i + 1, row) for i, row in enumerate(raw_rows)]
    valid = [r for r in results if r.is_valid]
    invalid = [r for r in results if not r.is_valid]

    print(f"Total de filas: {len(results)}")
    print(f"Válidas: {len(valid)}")
    print(f"Rechazadas: {len(invalid)}")
    print()

    if invalid:
        print("--- Filas rechazadas ---")
        for row in invalid:
            label = row.raw.get("name", "").strip() or "(sin nombre)"
            print(f"  Fila {row.row_number} ({label}):")
            for err in row.errors:
                print(f"    - {err}")
        print()

    warned = [r for r in valid if r.warnings]
    if warned:
        print("--- Advertencias (no bloquean, revisar) ---")
        for row in warned:
            label = row.raw.get("name", "").strip()
            for warning in row.warnings:
                print(f"  Fila {row.row_number} ({label}): {warning}")
        print()

    if not valid:
        print("Ninguna fila válida -- no se genera SQL.")
        return 1 if invalid else 0

    if args.output:
        args.output.write_text(generate_sql(valid), encoding="utf-8")
        print(f"SQL de {len(valid)} fila(s) válida(s) escrito en {args.output}")
        print("Revisalo a mano antes de aplicarlo contra cualquier proyecto.")
    else:
        print("Dry run (sin --output): no se escribió ningún archivo.")

    return 0


if __name__ == "__main__":
    sys.exit(main())
