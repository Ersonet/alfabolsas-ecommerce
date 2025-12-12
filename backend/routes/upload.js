// ===== ENDPOINT PARA SUBIR IMÁGENES =====
// Archivo: routes/upload.js o puedes agregarlo a tu server.js principal

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ===== CONFIGURACIÓN 1: GUARDAR EN CARPETA LOCAL =====

// Crear carpeta de uploads si no existe
const uploadDir = path.join(__dirname, '../uploads/productos');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configurar almacenamiento de multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generar nombre único: timestamp + nombre original
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const nombre = file.fieldname + '-' + uniqueSuffix + ext;
        cb(null, nombre);
    }
});

// Filtrar solo imágenes
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Formato de imagen no válido. Solo JPG, PNG, WEBP o GIF.'), false);
    }
};

// Configurar multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB máximo
    }
});

// ===== ENDPOINT DE SUBIDA =====
router.post('/upload', 
    upload.fields([
        { name: 'imagenPrincipal', maxCount: 1 },
        { name: 'imagenesAdicionales', maxCount: 5 }
    ]),
    async (req, res) => {
        try {
            console.log('📤 Recibiendo archivos...');
            console.log('Files:', req.files);
            
            const resultado = {
                imagenPrincipal: null,
                imagenesAdicionales: []
            };
            
            // Procesar imagen principal
            if (req.files.imagenPrincipal && req.files.imagenPrincipal[0]) {
                const file = req.files.imagenPrincipal[0];
                // URL relativa para acceder a la imagen
                resultado.imagenPrincipal = `/uploads/productos/${file.filename}`;
                console.log('✅ Imagen principal:', resultado.imagenPrincipal);
            }
            
            // Procesar imágenes adicionales
            if (req.files.imagenesAdicionales) {
                req.files.imagenesAdicionales.forEach(file => {
                    resultado.imagenesAdicionales.push(`/uploads/productos/${file.filename}`);
                });
                console.log('✅ Imágenes adicionales:', resultado.imagenesAdicionales.length);
            }
            
            res.status(200).json(resultado);
            
        } catch (error) {
            console.error('❌ Error al subir imágenes:', error);
            res.status(500).json({ 
                error: 'Error al subir imágenes',
                detalle: error.message 
            });
        }
    }
);

// ===== ENDPOINT PARA ELIMINAR IMAGEN =====
router.delete('/upload/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(uploadDir, filename);
        
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log('🗑️ Imagen eliminada:', filename);
            res.status(200).json({ mensaje: 'Imagen eliminada exitosamente' });
        } else {
            res.status(404).json({ error: 'Imagen no encontrada' });
        }
    } catch (error) {
        console.error('❌ Error al eliminar imagen:', error);
        res.status(500).json({ error: 'Error al eliminar imagen' });
    }
});

module.exports = router;