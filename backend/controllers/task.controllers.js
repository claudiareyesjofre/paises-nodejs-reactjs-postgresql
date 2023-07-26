const paisesroute = require("../routes/task.routes");
const { pool } = require("../basedate/db");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs").promises;
const path = require('path');

// Configurar Multer para manejar la subida de imágenes
const storage = multer.memoryStorage();

const imagen_pais_post = async (req, res) => {
  try {
    const { nombre, titulo, descripcion } = req.body;
    const imagen = req.file;

    // Verificar que el campo 'nombre' no esté vacío
    if (!nombre) {
      return res.status(400).json({ error: "El campo 'nombre' es requerido." });
    }
    if (!titulo) {
      return res.status(400).json({ error: "El campo 'titulo' es requerido." });
    }
    if (!descripcion) {
      return res
        .status(400)
        .json({ error: "El campo 'descripcion' es requerido." });
    }
    if (!imagen) {
      return res.status(400).json({ error: "El campo 'imagen' es requerido." });
    }

    // Procesar la imagen y obtener las distintas resoluciones
    const imagenBuffer = await sharp(imagen.buffer).toBuffer();
    const imagen_icono = await sharp(imagenBuffer)
      .resize(50, 50, { fit: "contain", background: "transparent" })
      .webp({ quality: 90 })
      .toBuffer();
    const imagen_medio = await sharp(imagenBuffer)
      .resize(300, 300, { fit: "contain", background: "transparent" })
      .webp({ quality: 95 })
      .toBuffer();
    const imagen_alto = await sharp(imagenBuffer)
      .resize(600, 600, { fit: "contain", background: "transparent" })
      .webp({ quality: 95 })
      .toBuffer();
    const imagen_ultra = await sharp(imagenBuffer)
      .resize(1200, 1200, { fit: "contain", background: "transparent" })
      .webp({ quality: 95 })
      .toBuffer();

    // Guardar los datos en la base de datos
    const query = `
      INSERT INTO paises (nombre, imagen, imagen_icono, imagen_medio, imagen_alto, imagen_ultra, titulo, descripcion)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;
    const values = [
      nombre,
      imagenBuffer,
      imagen_icono,
      imagen_medio,
      imagen_alto,
      imagen_ultra,
      titulo,
      descripcion,
    ];
    const result = await pool.query(query, values);

    // Guardar las imágenes en archivos separados con nombres que incluyen la resolución
    await fs.writeFile(`img/imagen_${result.rows[0].id}.png`, imagenBuffer);
    await fs.writeFile(
      `img/imagen_icono_${result.rows[0].id}.png`,
      imagen_icono
    );
    await fs.writeFile(
      `img/imagen_medio_${result.rows[0].id}.png`,
      imagen_medio
    );
    await fs.writeFile(`img/imagen_alto_${result.rows[0].id}.png`, imagen_alto);
    await fs.writeFile(
      `img/imagen_ultra_${result.rows[0].id}.png`,
      imagen_ultra
    );

    // Enviar la URL de la imagen original al frontend
    const imageUrl = `http://localhost:4000/img/imagen_${result.rows[0].id}.png`;

    res.json({ 
      message: "Imagen de país creada y guardada correctamente",
      imageUrl: imageUrl  // Enviar la URL de la imagen al frontend
    });
  } catch (error) {
    console.error("Error al guardar la imagen y los datos:", error.message);
    res.status(500).json({ error: error.message });
  }
};

const get_all_paises = async (req, res) => {
  try {
    // Consultar la base de datos para obtener todos los países
    const query = "SELECT * FROM paises";
    const result = await pool.query(query);

    // Verificar si se encontraron países
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "No se encontraron países en la base de datos." });
    }

    // Crear un nuevo arreglo para almacenar la información de todos los países con las URLs de las imágenes en diferentes tamaños
    const paisesConImagenes = await Promise.all(
      result.rows.map(async (pais) => {
        // Crear un objeto con las URLs de las imágenes en diferentes tamaños para cada país
        const imageUrls = {
          imagen: `http://localhost:4000/pais/${pais.id}/imagen`,
          imagen_icono: `http://localhost:4000/pais/${pais.id}/imagen/icono`,
          imagen_medio: `http://localhost:4000/pais/${pais.id}/imagen/medio`,
          imagen_alto: `http://localhost:4000/pais/${pais.id}/imagen/alto`,
          imagen_ultra: `http://localhost:4000/pais/${pais.id}/imagen/ultra`,
        };

        // Agregar las URLs al objeto del país
        pais.imageUrls = imageUrls;

        return pais;
      })
    );

    res.json(paisesConImagenes);
  } catch (error) {
    console.error("Error al obtener la lista de países:", error.message);
    res.status(500).json({ error: "Error en el servidor" });
  }
};
const imagen_pais_get = async (req, res) => {
  try {
    const id = req.params.id;

    // Consultar la base de datos para obtener el país específico por su ID
    const query = "SELECT * FROM paises WHERE id = $1";
    const result = await pool.query(query, [id]);

    // Verificar si se encontró un país con el ID proporcionado
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No se encontró un país con ese ID." });
    }

    // Obtener el país desde la consulta
    const pais = result.rows[0];

    // Agregar un timestamp único a la URL de la imagen original
    const imagenUrl = `http://localhost:4000/pais/${pais.id}/imagen?${Date.now()}`;
    pais.imageUrls.imagen = imagenUrl;

    res.json(pais);
  } catch (error) {
    console.error("Error al obtener el país:", error.message);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

const imagen_banderapais_get = async (req, res) => {
  try {
    const id = req.params.id;
    const resolucion = req.params.resolucion;

    // Consultar la base de datos para obtener la imagen específica por su ID
    const query =
      "SELECT imagen, imagen_icono, imagen_medio, imagen_alto, imagen_ultra FROM paises WHERE id = $1";
    const result = await pool.query(query, [id]);

    // Verificar si se encontró un país con el ID proporcionado
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No se encontró un país con ese ID." });
    }

    // Obtener las imágenes desde la consulta
    const imagenes = result.rows[0];

    // Verificar si la resolución solicitada es la imagen original
    if (resolucion === undefined || resolucion === "original") {
      const imagenOriginal = imagenes.imagen;
      res.set("Content-Type", "image/jpeg");
      res.sendFile(`img/imagen_${id}.png`, { root: "." });
    } else {
      // Verificar si la resolución solicitada es una de las resoluciones adicionales (icono, medio, alto, ultra)
      if (!imagenes[`imagen_${resolucion}`]) {
        return res
          .status(404)
          .json({ error: "No se encontró la imagen en la resolución solicitada." });
      }

      const imagenResolucion = imagenes[`imagen_${resolucion}`];
      res.set("Content-Type", "image/jpeg");
      res.set("Cache-Control", "public, max-age=31536000"); // Cache de 1 año
      res.send(imagenResolucion);
    }
  } catch (error) {
    console.error("Error al obtener la imagen del país:", error.message);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

const imagen_pais_delete = async (req, res) => {
  try {
    const id = req.params.id;

    // Verificar si se encontró un país con el ID proporcionado
    const query = "SELECT * FROM paises WHERE id = $1";
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No se encontró un país con ese ID." });
    }

    // Obtener la ruta de las imágenes desde la consulta
    const pais = result.rows[0];
    const imagenOriginalPath = pais.imagen;
    const imagenIconoPath = pais.imagen_icono;
    const imagenMedioPath = pais.imagen_medio;
    const imagenAltoPath = pais.imagen_alto;
    const imagenUltraPath = pais.imagen_ultra;

    // Verificar si las imágenes existen en el servidor y eliminarlas
    if (imagenOriginalPath) {
      await eliminarImagen(imagenOriginalPath);
    }
    if (imagenIconoPath) {
      await eliminarImagen(imagenIconoPath);
    }
    if (imagenMedioPath) {
      await eliminarImagen(imagenMedioPath);
    }
    if (imagenAltoPath) {
      await eliminarImagen(imagenAltoPath);
    }
    if (imagenUltraPath) {
      await eliminarImagen(imagenUltraPath);
    }

    // Eliminar el país de la base de datos
    const deleteQuery = "DELETE FROM paises WHERE id = $1";
    await pool.query(deleteQuery, [id]);

    res.json({ message: "País y sus imágenes eliminados correctamente." });
  } catch (error) {
    console.error("Error al eliminar el país:", error.message);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

const eliminarImagen = async (imagenPath) => {
  // Verificar si la imagen existe en el servidor y eliminarla
  if (imagenPath) {
    try {
      // Obtener la ruta absoluta del archivo de imagen
      const imagePath = path.resolve(__dirname, "..", imagenPath);

      // Verificar si la imagen existe en el servidor y eliminarla
      await fs.access(imagePath);
      await fs.unlink(imagePath);
    } catch (error) {
      console.error("Error al eliminar la imagen:", error.message);
    }
  }
};
const imagen_pais_put = async (req, res) => {
  try {
    const id = req.params.id;
    const { nombre, titulo, descripcion } = req.body;
    const imagen = req.file;

    // Verificar que los campos no estén vacíos
    if (!nombre || !titulo || !descripcion || !imagen) {
      return res.status(400).json({ error: "Todos los campos son requeridos." });
    }

    // Procesar la nueva imagen y obtener su buffer
    const imagenBuffer = await sharp(imagen.buffer).toBuffer();
    console.log(imagenBuffer); // Mostrar el buffer en la consola

    // Obtener las distintas resoluciones de la imagen
    const imagen_icono = await sharp(imagenBuffer)
      .resize(50, 50, { fit: "contain", background: "transparent" })
      .webp({ quality: 90 })
      .toBuffer();
    const imagen_medio = await sharp(imagenBuffer)
      .resize(300, 300, { fit: "contain", background: "transparent" })
      .webp({ quality: 95 })
      .toBuffer();
    const imagen_alto = await sharp(imagenBuffer)
      .resize(600, 600, { fit: "contain", background: "transparent" })
      .webp({ quality: 95 })
      .toBuffer();
    const imagen_ultra = await sharp(imagenBuffer)
      .resize(1200, 1200, { fit: "contain", background: "transparent" })
      .webp({ quality: 95 })
      .toBuffer();

    // Guardar la nueva imagen y sus distintas resoluciones en la carpeta 'img'
    await fs.writeFile(`img/imagen_${id}.png`, imagenBuffer);
    await fs.writeFile(`img/imagen_icono_${id}.png`, imagen_icono);
    await fs.writeFile(`img/imagen_medio_${id}.png`, imagen_medio);
    await fs.writeFile(`img/imagen_alto_${id}.png`, imagen_alto);
    await fs.writeFile(`img/imagen_ultra_${id}.png`, imagen_ultra);

    // Actualizar los datos del país en la base de datos
    const updateQuery = `
      UPDATE paises
      SET nombre = $1, titulo = $2, descripcion = $3, imagen = $4
      WHERE id = $5
    `;
    const values = [nombre, titulo, descripcion, imagenBuffer, id];
    await pool.query(updateQuery, values);

    // Enviar la información del país actualizada al frontend, incluyendo la URL de la imagen
    res.json({
      message: "País actualizado correctamente.",
      id: id,
      nombre: nombre,
      titulo: titulo,
      descripcion: descripcion,
      imagen: `http://localhost:4000/img/imagen_${id}.png`, // URL de la imagen original
      imagen_icono: `http://localhost:4000/img/imagen_icono_${id}.png`, // URL de la imagen en formato icono
      imagen_medio: `http://localhost:4000/img/imagen_medio_${id}.png`, // URL de la imagen en formato medio
      imagen_alto: `http://localhost:4000/img/imagen_alto_${id}.png`, // URL de la imagen en formato alto
      imagen_ultra: `http://localhost:4000/img/imagen_ultra_${id}.png`, // URL de la imagen en formato ultra
    });
  } catch (error) {
    console.error("Error al actualizar el país:", error.message);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

module.exports = {
  imagen_pais_post,
  imagen_pais_get,
  imagen_pais_delete,
  imagen_pais_put,
  imagen_banderapais_get,
  get_all_paises,
  eliminarImagen
};