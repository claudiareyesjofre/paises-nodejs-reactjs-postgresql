import React, { useState, useEffect } from "react";

export const EditarPaises = ({ pais, onClose }) => {
  const [nombre, setNombre] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagen, setImagen] = useState(null);

  useEffect(() => {
    // Llenar los campos con los datos actuales del país cuando el componente se monte
    if (pais) {
      setNombre(pais.nombre);
      setTitulo(pais.titulo);
      setDescripcion(pais.descripcion);
    }
  }, [pais]);

  // Función para manejar el envío del formulario y actualizar el país
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      // Crear un objeto FormData para enviar los datos que incluyen el archivo de imagen
      const formData = new FormData();
      formData.append("nombre", nombre);
      formData.append("titulo", titulo);
      formData.append("descripcion", descripcion);
      formData.append("imagen", imagen);
  
      // Enviar la solicitud PUT para actualizar el país con los nuevos datos y la imagen
      const response = await fetch(`http://localhost:4000/paiseditar/${pais.id}`, {
        method: "PUT",
        body: formData,
      });
  
      if (response.ok) {
        // Cierre del pop-up después de guardar correctamente los cambios
        onClose();
      } else {
        console.error("Error al actualizar el país:", response.statusText);
      }
    } catch (error) {
      console.error("Error al actualizar el país:", error.message);
    }
  };

  // Función para manejar el cambio en el campo de imagen
  const handleImagenChange = (e) => {
    setImagen(e.target.files[0]);
  };

  return (
    <section>
      <form onSubmit={handleSubmit}>
        <div className="pais">
         <div className="imagen-pais">{pais && <img src={pais.imagen} alt={pais.nombre} />} </div>
         <label>imagen</label>
          <input  className="pais" type="file" onChange={handleImagenChange} />
          
        </div>
        <div className="pais">
          <label>nombre</label>
          <input  className="pais" type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </div>
        <div className="pais">
          <label>Titulo</label>
          <input className="pais" type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        </div>
        <div className="pais">
          <label>Descripcion</label>
          <input className="pais" type="text" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        </div>
        <button  class="signupBtn" type="submit">Guardar
        <span class="arrow">
                <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 320 512" fill="rgb(183, 128, 255)">
                  <path d="M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z"></path>
                </svg>
              </span></button>
      </form>
    </section>
  );
};
