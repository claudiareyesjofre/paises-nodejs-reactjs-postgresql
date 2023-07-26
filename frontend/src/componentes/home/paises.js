import React, { useState, useEffect } from "react";
import "../../style/style home/home.css";
import { GoTrash, GoPencil } from "react-icons/go";
import { EditarPaises } from "../editar_paises";

export const Allpaises = () => {
  const [paises, setPaises] = useState([]);
  const [showEditarPaises, setShowEditarPaises] = useState(false);
  const [selectedPais, setSelectedPais] = useState(null);
  const [selectedResolution, setSelectedResolution] = useState("original");

  const fetchPaises = async () => {
    try {
      const response = await fetch("http://localhost:4000/pais");
      const data = await response.json();
      const paisesConDimensiones = await Promise.all(
        data.map(async (pais) => {
          const imagenResponse = await fetch(
            `${pais.imageUrls.imagen}?${Date.now()}`
          );
          const imagenIconoResponse = await fetch(
            `${pais.imageUrls.imagen_icono}?${Date.now()}`
          );
          const imagenMedioResponse = await fetch(
            `${pais.imageUrls.imagen_medio}?${Date.now()}`
          );
          const imagenAltoResponse = await fetch(
            `${pais.imageUrls.imagen_alto}?${Date.now()}`
          );
          const imagenUltraResponse = await fetch(
            `${pais.imageUrls.imagen_ultra}?${Date.now()}`
          );

          const imagenUrl = URL.createObjectURL(await imagenResponse.blob());
          const imagenIconoUrl = URL.createObjectURL(
            await imagenIconoResponse.blob()
          );
          const imagenMedioUrl = URL.createObjectURL(
            await imagenMedioResponse.blob()
          );
          const imagenAltoUrl = URL.createObjectURL(
            await imagenAltoResponse.blob()
          );
          const imagenUltraUrl = URL.createObjectURL(
            await imagenUltraResponse.blob()
          );

          pais.imagen = imagenUrl;
          pais.imagen_icono = imagenIconoUrl;
          pais.imagen_medio = imagenMedioUrl;
          pais.imagen_alto = imagenAltoUrl;
          pais.imagen_ultra = imagenUltraUrl;

          return pais;
        })
      );

      setPaises(paisesConDimensiones);
    } catch (error) {
      console.error("Error al obtener la lista de países:", error);
    }
  };

  useEffect(() => {
    fetchPaises();
  }, []);

  const eliminarPais = async (id) => {
    try {
      const response = await fetch(`http://localhost:4000/paisdelete/${id}/imagen`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchPaises();
      } else {
        console.error("Error al eliminar el país:", response.statusText);
      }
    } catch (error) {
      console.error("Error al eliminar el país:", error.message);
    }
  };

  const handleEditarPais = (pais) => {
    setSelectedPais(pais);
    setShowEditarPaises(true);
  };

  return (
    <>
      <section className="container paises">
        <div className="row">
          {paises.map((pais) => (
            <div className="col paises" key={pais.id}>
              <section className="edicion-pais">
                <div className="row">
                  <div className="col editar">
                    <button
                      className="buton-editar"
                      onClick={() => handleEditarPais(pais)}
                    >
                      <GoPencil className="editar-pencil" />
                    </button>
                  </div>
                  <div className="col eliminar">
                    <button
                      className="buton-eliminar"
                      onClick={() => eliminarPais(pais.id)}
                    >
                      <GoTrash className="borrar" />
                    </button>
                  </div>
                 
                </div>
              </section>
              <div className="info-imagenes">
                <div>
                  <h1 className="info-pais">{pais.nombre}</h1>
                </div>
                <div>
                  <h2 className="info-pais">{pais.titulo}</h2>
                </div>
                <div>
                  <h3 className="info-pais">{pais.descripcion}</h3>
                </div>
                <div className="resolution-select">
                    <select
                    className="select-resolucion"
                      value={selectedResolution}
                      onChange={(e) => setSelectedResolution(e.target.value)}
                    >
                      <option value="original">Original</option>
                      <option value="icono">Icono</option>
                      <option value="medio">Medio</option>
                      <option value="alto">Alto</option>
                      <option value="ultra">Ultra</option>
                    </select>
                  </div>
                <div className="container imagenes">
                  <div className="row imagenes">
                    <div className="col">
                      {selectedResolution === "original" && (
                        <img src={pais.imagen} alt={pais.nombre} />
                      )}
                      {selectedResolution === "icono" && (
                        <img src={pais.imagen_icono} alt={pais.nombre} />
                      )}
                      {selectedResolution === "medio" && (
                        <img src={pais.imagen_medio} alt={pais.nombre} />
                      )}
                      {selectedResolution === "alto" && (
                        <img src={pais.imagen_alto} alt={pais.nombre} />
                      )}
                      {selectedResolution === "ultra" && (
                        <img src={pais.imagen_ultra} alt={pais.nombre} />
                      )}
                      <h2>{selectedResolution}</h2>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {showEditarPaises && (
        <div className="popup">
          <div className="popup-content">
            <button className="close-button" onClick={() => setShowEditarPaises(false)}>
              X
            </button>
            <div className="edit">
              <EditarPaises pais={selectedPais} onClose={() => setShowEditarPaises(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
