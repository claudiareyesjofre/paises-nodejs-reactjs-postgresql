const express = require('express');
const app = express();
const cors = require('cors'); // Importa el paquete cors

// Configura CORS para permitir solicitudes desde http://localhost:3000
app.use(cors());

const taskRoutes =  require('./routes/task.routes');
/* const countryModel = require('./basedate/paises'); */
// Middleware para recibir datos JSON y archivos desde el cliente
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(taskRoutes);

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});
app.use("/img", express.static(__dirname + "/img"));


// Iniciar servidor
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});