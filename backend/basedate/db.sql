CREATE DATABASE paises


CREATE TABLE paises (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  imagen BYTEA NOT NULL,
  titulo VARCHAR(255) UNIQUE,
  descripcion VARCHAR(255),
  imagen_icono BYTEA NOT NULL,
  imagen_medio BYTEA NOT NULL,
  imagen_alto BYTEA NOT NULL,
  imagen_ultra BYTEA NOT NULL
);

