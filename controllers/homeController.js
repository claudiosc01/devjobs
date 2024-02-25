// Otra forma de importar el modelo
const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');


exports.mostrarTrabajos = async (req, res, next) => {

    const vacantes = await Vacante.find() //trae todo los resultados de la BD.

    if(!vacantes) return next(); // si no hay vacantes, que vaya a la siguente pagina que sigue.

    res.render('home', {
        nombrePagina: 'devJobs',
        tagline: 'Encuentra y Publica Trabajos para Desarrolles Web',
        barra: true,
        boton: true,
        vacantes
    })
}


