const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('./database');

const app = express();
const PORT = 3001; // Cambiado a 3001
const db = new Database();

// Middleware - IMPORTANTE: CORS debe ir primero
app.use(cors());
app.use(express.json());

// Middleware de logging para debug
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Servir archivos estáticos desde Frontend
app.use(express.static(path.join(__dirname, '../Frontend')));

// 🔥 CORREGIR ENDPOINTS - mover antes de las rutas catch-all

// Endpoint para obtener huellas - GET
app.get('/api/huellas', (req, res) => {
    console.log('📥 Solicitando huellas...');
    db.obtenerHuellas((err, huellas) => {
        if (err) {
            console.error('❌ Error obteniendo huellas:', err);
            return res.status(500).json({ error: 'Error obteniendo huellas' });
        }
        console.log(`📊 Enviando ${huellas.length} huellas al cliente`);
        res.json(huellas);
    });
});

// Endpoint para registrar huella - POST
app.post('/api/huella', (req, res) => {
    const { correo, apodo, departamento, lat, lng } = req.body;
    
    console.log('📨 Recibiendo huella:', { correo, apodo, departamento, lat, lng });

    if (!correo || !apodo || !departamento || !lat || !lng) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // 1. Verificar si el usuario ya existe
    db.usuarioExiste(correo, apodo, (err, usuarioExistente) => {
        if (err) {
            console.error('❌ Error verificando usuario:', err);
            return res.status(500).json({ error: 'Error en la base de datos' });
        }
        
        if (usuarioExistente) {
            console.log('❌ Usuario ya existe:', { correo, apodo });
            return res.status(400).json({ 
                error: 'Ya existe un usuario con ese correo o apodo' 
            });
        }

        // 2. Crear nuevo usuario
        db.crearUsuario(correo, apodo, (err, usuarioId) => {
            if (err) {
                console.error('❌ Error creando usuario:', err);
                return res.status(500).json({ error: 'Error creando usuario' });
            }
            
            console.log('✅ Usuario creado ID:', usuarioId);
            
            // 3. Registrar la huella
            db.registrarHuella(usuarioId, departamento, lat, lng, (err) => {
                if (err) {
                    console.error('❌ Error registrando huella:', err);
                    return res.status(500).json({ error: 'Error registrando huella' });
                }
                
                console.log('✅ Huella registrada para usuario:', usuarioId);
                
                res.json({ 
                    success: true, 
                    message: 'Huella registrada exitosamente',
                    usuarioId: usuarioId
                });
            });
        });
    });
});

// Ruta para la página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/index.html'));
});

// Manejar rutas no encontradas para el API
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'Endpoint del API no encontrado' });
});

// Catch-all para SPA (debe ir al final)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en: http://localhost:${PORT}`);
    console.log(`📁 Sirviendo desde: ${path.join(__dirname, '../Frontend')}`);
});

process.on('SIGINT', () => {
    db.close();
    process.exit();
});