const express = require('express');
const multer = require('multer');
const { BlobServiceClient } = require('@azure/storage-blob');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = 3000;

// Configurar multer para subir archivos temporalmente al servidor
const upload = multer({ dest: 'uploads/' });

// Conexión a Azure Blob Storage
const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
const containerName = process.env.CONTAINER_NAME;

// Ruta para subir archivos
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).send('No se envió ningún archivo');
    }

    // Subir el archivo al contenedor de blobs
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(file.originalname);

    await blockBlobClient.uploadFile(file.path);

    res.status(200).send(`Archivo ${file.originalname} subido exitosamente`);
  } catch (err) {
    console.error('Error subiendo archivo:', err.message);
    res.status(500).send('Error subiendo el archivo');
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
