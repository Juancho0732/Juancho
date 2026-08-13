#!/usr/bin/env python3
"""
Pruebas del importador de lugares reales (Prioridad 1 de la auditoría de
beta-readiness). Sin dependencias externas -- usa unittest de la librería
estándar, igual que el resto de las herramientas de supabase/seed/.

Uso: python3 -m unittest supabase.seed.test_import_real_places -v
     (o, parado en supabase/seed/: python3 -m unittest test_import_real_places -v)
"""

import sys
import unittest
from datetime import date, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from import_real_places import (  # noqa: E402
    generate_sql,
    parse_schedule,
    resolve_category,
    validate_last_verified_at,
    validate_row,
    validate_source,
)


def valid_raw_row(**overrides) -> dict:
    row = {
        "name": "Café de Prueba",
        "category": "Cafés",
        "address": "Calle 72 # 10-20",
        "locality": "Chapinero",
        "lat": "4.65",
        "lng": "-74.05",
        "price_min": "10000",
        "price_max": "20000",
        "schedule": "lun_vie=07:00-20:00",
        "description": "Un café tranquilo con buen espacio para trabajar y estudiar.",
        "images": "",
        "tags": "",
        "source": "https://www.instagram.com/cafedepruebaoficial/",
        "last_verified_at": "2026-01-15",
    }
    row.update(overrides)
    return row


class ValidateSourceTests(unittest.TestCase):
    def test_acepta_url_http(self):
        ok, err = validate_source("https://maps.google.com/?cid=123")
        self.assertTrue(ok, err)

    def test_acepta_descripcion_especifica(self):
        ok, err = validate_source("Visita presencial el 2026-03-01")
        self.assertTrue(ok, err)

    def test_rechaza_internet(self):
        ok, err = validate_source("internet")
        self.assertFalse(ok)
        self.assertIn("genérico", err)

    def test_rechaza_google_solo(self):
        ok, err = validate_source("Google")
        self.assertFalse(ok)

    def test_rechaza_vacio(self):
        ok, err = validate_source("   ")
        self.assertFalse(ok)

    def test_rechaza_texto_corto_no_url(self):
        ok, err = validate_source("visto")
        self.assertFalse(ok)


class ValidateLastVerifiedAtTests(unittest.TestCase):
    def test_rechaza_vacio_no_completa_automaticamente(self):
        value, err = validate_last_verified_at("")
        self.assertIsNone(value)
        self.assertIn("obligatoria", err)

    def test_rechaza_formato_invalido(self):
        value, err = validate_last_verified_at("15 de enero")
        self.assertIsNone(value)
        self.assertTrue(err)

    def test_rechaza_fecha_futura(self):
        future = (date.today() + timedelta(days=5)).isoformat()
        value, err = validate_last_verified_at(future)
        self.assertIsNone(value)
        self.assertIn("futura", err)

    def test_acepta_fecha_iso_valida(self):
        value, err = validate_last_verified_at("2026-01-15")
        self.assertEqual(value, "2026-01-15")
        self.assertEqual(err, "")


class ResolveCategoryTests(unittest.TestCase):
    def test_matchea_por_nombre(self):
        name, err = resolve_category("Cafés")
        self.assertEqual(name, "Cafés")

    def test_matchea_por_slug_case_insensitive(self):
        name, err = resolve_category("RESTAURANTES")
        self.assertEqual(name, "Restaurantes")

    def test_rechaza_categoria_inexistente(self):
        name, err = resolve_category("Categoria Inventada")
        self.assertIsNone(name)
        self.assertIn("no coincide", err)


class ParseScheduleTests(unittest.TestCase):
    def test_formato_corto(self):
        json_str, warnings, err = parse_schedule("lun_vie=12:00-22:00;sab_dom=10:00-23:00")
        self.assertEqual(err, "")
        self.assertIn("12:00-22:00", json_str)
        self.assertEqual(warnings, [])

    def test_json_directo(self):
        json_str, warnings, err = parse_schedule('{"lun_vie": "12:00-22:00"}')
        self.assertEqual(err, "")
        self.assertIn("12:00-22:00", json_str)

    def test_rechaza_vacio(self):
        json_str, warnings, err = parse_schedule("")
        self.assertIsNone(json_str)
        self.assertTrue(err)

    def test_advierte_formato_de_horario_raro(self):
        json_str, warnings, err = parse_schedule("lun_vie=todo el día")
        self.assertEqual(err, "")
        self.assertTrue(warnings)


class ValidateRowTests(unittest.TestCase):
    def test_fila_completa_valida(self):
        result = validate_row(1, valid_raw_row())
        self.assertTrue(result.is_valid, result.errors)
        self.assertTrue(result.place_id)

    def test_rechaza_sin_last_verified_at(self):
        result = validate_row(1, valid_raw_row(last_verified_at=""))
        self.assertFalse(result.is_valid)
        self.assertTrue(any("last_verified_at" in e for e in result.errors))

    def test_rechaza_source_generico(self):
        result = validate_row(1, valid_raw_row(source="internet"))
        self.assertFalse(result.is_valid)
        self.assertTrue(any("source" in e for e in result.errors))

    def test_rechaza_coordenadas_fuera_de_bogota(self):
        result = validate_row(1, valid_raw_row(lat="40.7128", lng="-74.0060"))
        self.assertFalse(result.is_valid)

    def test_acepta_schedule_y_precio_vacios(self):
        """Hay lugares reales que no publican horario ni precio en ninguna fuente."""
        result = validate_row(1, valid_raw_row(schedule="", price_min="", price_max=""))
        self.assertTrue(result.is_valid, result.errors)

    def test_schedule_y_precio_vacios_generan_null_y_no_cero(self):
        """Vacío significa 'no se sabe', nunca 'gratis' ni 'sin días de apertura'."""
        result = validate_row(1, valid_raw_row(schedule="", price_min="", price_max=""))
        sql = generate_sql([result])
        self.assertIn("null", sql)
        self.assertNotIn("0.0,", sql)
        self.assertNotIn("'{}'::jsonb", sql)

    def test_rechaza_precio_min_mayor_a_max(self):
        result = validate_row(1, valid_raw_row(price_min="90000", price_max="10000"))
        self.assertFalse(result.is_valid)

    def test_rechaza_descripcion_corta(self):
        result = validate_row(1, valid_raw_row(description="Corta"))
        self.assertFalse(result.is_valid)

    def test_rechaza_categoria_desconocida(self):
        result = validate_row(1, valid_raw_row(category="No Existe"))
        self.assertFalse(result.is_valid)

    def test_advierte_localidad_no_curada_pero_no_rechaza(self):
        result = validate_row(1, valid_raw_row(locality="Kennedy"))
        self.assertTrue(result.is_valid, result.errors)
        self.assertTrue(result.warnings)

    def test_rechaza_imagen_invalida(self):
        result = validate_row(1, valid_raw_row(images="no-es-una-url"))
        self.assertFalse(result.is_valid)

    def test_acepta_imagenes_y_tags_validos(self):
        result = validate_row(
            1,
            valid_raw_row(images="https://a.com/1.jpg|https://a.com/2.jpg", tags="wifi|quiet"),
        )
        self.assertTrue(result.is_valid, result.errors)
        self.assertEqual(len(result.images), 2)
        self.assertEqual(result.tags, ["wifi", "quiet"])

    # --- Resistencia a intentos de "colar" datos ficticios como reales ---

    def test_no_inventa_categoria_para_texto_libre(self):
        """El importador nunca crea categorías nuevas -- si no matchea, se rechaza."""
        result = validate_row(1, valid_raw_row(category="Lo que sea"))
        self.assertFalse(result.is_valid)

    def test_no_asume_verificado_por_traer_fecha_de_hoy_en_otro_campo(self):
        """Que 'description' mencione una fecha no cuenta como last_verified_at."""
        result = validate_row(
            1,
            valid_raw_row(
                description=f"Verificado hoy {date.today().isoformat()} en persona, todo bien",
                last_verified_at="",
            ),
        )
        self.assertFalse(result.is_valid)
        self.assertTrue(any("last_verified_at" in e for e in result.errors))


if __name__ == "__main__":
    unittest.main()
