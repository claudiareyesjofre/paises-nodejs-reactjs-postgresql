import React, { useState, useRef } from 'react';
import Dropzone from 'react-dropzone';
import Cropper from 'react-image-crop';
import "../../style/style home/home.css"

export const Paises = () => {
  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState({ aspect: 16 / 9 });
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [nombre, setNombre] = useState('');
  const [imageUrls, setImageUrls] = useState(null);
  const dropzoneRef = useRef();

  const handleImageChange = (acceptedFiles) => {
    const file = acceptedFiles[0];
    setImage(file);
  };

  const handleCropChange = (crop) => {
    setCrop(crop);
  };

  const handleCropComplete = (croppedArea, croppedAreaPixels) => {
    // Aquí puedes guardar las coordenadas de la selección para redimensionar la imagen
  };

  const handleButtonClick = () => {
    dropzoneRef.current.open();
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('imagen', image);
      formData.append('nombre', nombre);
      formData.append('titulo', title);
      formData.append('descripcion', description);

      const response = await fetch('http://localhost:4000/paiscrear', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setImageUrls(data.data.imageUrls); // Obtener las URLs de las imágenes en diferentes tamaños y actualizar el estado
        console.log('Imagen y datos guardados correctamente.');
      } else {
        console.error('Error al guardar la imagen y los datos.');
      }
    } catch (error) {
      console.error('Error al enviar la solicitud al servidor:', error.message);
    }
  };

  return (
    <section className='container'>
      <div className='form-container'>
        <form class="form">
          <h2>Formulario de País</h2>
          <p className='subtitulo'>Arrastra o suelta una imagen aquí o haz clic para seleccionar una</p>
          <Dropzone accept="image/*" onDrop={handleImageChange} ref={dropzoneRef}>
            {({ getRootProps, getInputProps }) => (
              <div className='diseño-imagen'{...getRootProps()}>
                <input className='imagenespaises' {...getInputProps()} />
                {image ? (
                  <>
                    <Cropper
                      src={URL.createObjectURL(image)}
                      crop={crop}
                      onChange={handleCropChange}
                      onComplete={handleCropComplete}
                    />
                    <h3>Vista previa de la imagen:</h3>
                    <img src={URL.createObjectURL(image)} alt='Vista previa' style={{ width: '100%', maxHeight: '300px' }} />
                  </>
                ) : (
                  <div className="input-div">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="1em"
                      height="1em"
                      stroke-linejoin="round"
                      stroke-linecap="round"
                      viewBox="0 0 24 24"
                      stroke-width="2"
                      fill="none"
                      stroke="currentColor"
                      className="icon"
                    >
                      <polyline points="16 16 12 12 8 16"></polyline>
                      <line y2="21" x2="12" y1="12" x1="12"></line>
                      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path>
                      <polyline points="16 16 12 12 8 16"></polyline>
                    </svg>
                  </div>
                )}
              </div>
            )}
          </Dropzone>
          {/* Campos de entrada para el título y la descripción */}
          <section className='formulario'>
            <label htmlFor="nombre">Nombre</label>
            <input
              type="text"
              className="input-form"
              placeholder="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />

            <label htmlFor="titulo">Titulo</label>
            <input
              type="text"
              className="input-form"
              placeholder="Titulo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <label htmlFor="descripcion">Descripcion</label>
            <input
              className="input-form"
              placeholder="Descripcion"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </section>
          {image && (
            <button class="signupBtn" onClick={handleSubmit}>
              Guardar
              <span class="arrow">
                <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 320 512" fill="rgb(183, 128, 255)">
                  <path d="M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z"></path>
                </svg>
              </span>
            </button>
          )}
        </form>
      </div>
    </section>
  );
};