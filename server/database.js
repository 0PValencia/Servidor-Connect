const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
    constructor() {
        this.db = new sqlite3.Database(path.join(__dirname, 'terra.db'), (err) => {
            if (err) {
                console.error('❌ Error conectando a la BD:', err);
            } else {
                console.log('✅ Conectado a terra.db');
                this.initTables();
            }
        });
    }

    initTables() {
        // Verificar/Crear tablas
        this.db.run(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                correo TEXT UNIQUE NOT NULL,
                apodo TEXT NOT NULL
            )
        `);

        this.db.run(`
            CREATE TABLE IF NOT EXISTS rastros (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER,
                departamento TEXT NOT NULL,
                lat REAL NOT NULL,
                lng REAL NOT NULL,
                fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
            )
        `, (err) => {
            if (err) {
                console.error('❌ Error creando tablas:', err);
            } else {
                console.log('✅ Tablas listas');
            }
        });
    }

    // Verificar si usuario existe
    usuarioExiste(correo, apodo, callback) {
        const sql = `SELECT * FROM usuarios WHERE correo = ? OR apodo = ?`;
        this.db.get(sql, [correo, apodo], callback);
    }

    // Crear nuevo usuario
    crearUsuario(correo, apodo, callback) {
        const sql = `INSERT INTO usuarios (correo, apodo) VALUES (?, ?)`;
        this.db.run(sql, [correo, apodo], function(err) {
            callback(err, this.lastID);
        });
    }

    // Registrar huella
    registrarHuella(usuarioId, departamento, lat, lng, callback) {
        const sql = `INSERT INTO rastros (usuario_id, departamento, lat, lng) VALUES (?, ?, ?, ?)`;
        this.db.run(sql, [usuarioId, departamento, lat, lng], callback);
    }

    // Obtener todas las huellas
    obtenerHuellas(callback) {
        const sql = `
            SELECT u.apodo, r.departamento, r.lat, r.lng, r.fecha 
            FROM rastros r 
            JOIN usuarios u ON r.usuario_id = u.id 
            ORDER BY r.fecha DESC
        `;
        this.db.all(sql, [], callback);
    }

    close() {
        this.db.close();
    }
}

module.exports = Database;