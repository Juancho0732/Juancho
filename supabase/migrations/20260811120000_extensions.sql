-- Extensiones necesarias. cube/earthdistance habilitan búsquedas por cercanía
-- (Haversine) sin depender de PostGIS, suficiente para una sola ciudad (MVP).
-- pg_trgm habilita búsqueda por texto simple (fallback sin IA) sobre nombre/descripción.
create extension if not exists cube;
create extension if not exists earthdistance;
create extension if not exists pg_trgm;
