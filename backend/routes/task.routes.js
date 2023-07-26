const { Router } = require("express");
const multer = require('multer');

const {
  get_all_paises,
  imagen_pais_post,
  imagen_pais_put,
  imagen_pais_delete,
  imagen_pais_get,
 imagen_banderapais_get,
 eliminarImagen

} = require("../controllers/task.controllers");

// Configurar Multer para manejar la subida de imágenes
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Tipo de archivo no válido. Solo se permiten imágenes en formato JPEG, PNG o JPG."));
    }
  },
});
const router = Router();
router.post("/paiscrear", upload.single('imagen'), imagen_pais_post);
router.get("/pais", get_all_paises);
router.get("/pais/:id", imagen_pais_get);
router.get("/pais/:id/imagen", imagen_banderapais_get);
router.get('/pais/:id/imagen/:resolucion', imagen_banderapais_get);  
router.delete("/paisdelete/:id/imagen", imagen_pais_delete);

router.put("/paiseditar/:id", upload.single("imagen"), imagen_pais_put);


module.exports = router;