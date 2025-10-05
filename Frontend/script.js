let huellaMarkers = [];
function submitHuella(event) {
    event.preventDefault();
    
    const nick = document.getElementById('userNick').value;
    const email = document.getElementById('userEmail').value;
    
    // Preparar datos para SQLite (estructura lista para BD)
    const huellaRecord = {
        departamento: currentDepartment,
        nick: nick,
        email: email,
        fecha: new Date().toISOString(),
        timestamp: Date.now()
    };
    
    // Guardar en array temporal (aquí conectarás SQLite)
    huellaData.push(huellaRecord);
    
    // Marcar como visitado
    visitedDepartments[currentDepartment] = true;
    
    const path = document.querySelector(`path[data-name="${currentDepartment}"]`);
    if (path) {
        path.classList.add('visitado');
    }
    
    // Mostrar datos en consola (para verificar estructura)
    console.log('Datos preparados para SQLite:', huellaRecord);
    console.log('Todos los registros:', huellaData);
    
    // Mensaje de éxito
    alert(`✅ ¡Huella registrada exitosamente!\n\n` +
          `Nick: ${nick}\n` +
          `Email: ${email}\n` +
          `Departamento: ${currentDepartment}\n\n` +
          `Departamentos visitados: ${Object.keys(visitedDepartments).length}/9`);
    
    closeHuellaForm();
}