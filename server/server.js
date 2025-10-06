const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('./database');

const app = express();
const PORT = process.env.PORT || 3000; // 3000 para desarrollo local
const db = new Database();

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde Frontend
app.use(express.static(path.join(__dirname, '../Frontend')));

// Endpoint para obtener huellas
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

// Endpoint para registrar huella
app.post('/api/huella', (req, res) => {
    const { correo, apodo, departamento, lat, lng } = req.body;
    
    console.log('📨 Recibiendo huella:', { apodo, departamento, lat, lng });

    if (!correo || !apodo || !departamento || !lat || !lng) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    db.usuarioExiste(correo, apodo, (err, usuarioExistente) => {
        if (err) {
            console.error('❌ Error verificando usuario:', err);
            return res.status(500).json({ error: 'Error en la base de datos' });
        }
        
        if (usuarioExistente) {
            return res.status(400).json({ 
                error: 'Ya existe un usuario con ese correo o apodo' 
            });
        }

        db.crearUsuario(correo, apodo, (err, usuarioId) => {
            if (err) {
                console.error('❌ Error creando usuario:', err);
                return res.status(500).json({ error: 'Error creando usuario' });
            }
            
            db.registrarHuella(usuarioId, departamento, lat, lng, (err) => {
                if (err) {
                    console.error('❌ Error registrando huella:', err);
                    return res.status(500).json({ error: 'Error registrando huella' });
                }
                
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

// Ruta adicional para SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor en producción - Puerto: ${PORT}`);
    console.log(`🌍 Accesible desde: https://servidor-connect.onrender.com`);
});