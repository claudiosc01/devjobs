const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slug'); 
const shortid = require('shortid');

const vacantesSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: 'El nombre de la vacante es obligatorio',
        trim: true // quita los espacios
    },
    empresa: {
        type: String,
        trim: true
    },
    ubicacion: {
        type: String,
        trim: true,
        required: 'La ubicacion es obligatoria'
    },
    salario: {
        type: String,
        default: 0,
        trim: true
    },
    contrato: {
        type: String,
        trim: true
    },
    descripcion: {
        type: String,
        trim: true
    },
    url: {
        type: String,
        lowercase: true, //convierte a minuscula
        trim: true
    },
    skills: [String], // Un arreglo, que venga multiples valores de tipo string.
    candidatos: [{ //Arreglo de objetos.
        nombre: String,
        email: String,
        cv: String
    }],
    autor: {
        type: mongoose.Schema.ObjectId,
        ref: 'Usuarios',
        required: 'El autor es Obligatorio'
    }
})

vacantesSchema.pre('save', function(next){

    // Crear la Url.
    const url = slug(this.titulo) // Si la url es React Developer el slug quita el espacio y pone: React-developer
    this.url = `${url}-${shortid.generate()} ` //Esto genera un id ejemplo ya con el slug convertido es asi: React-developer con el shortid genera un id unico algo asi: React-developer-15184848

    next();
})


// Crear un indice
vacantesSchema.index({ titulo: 'text' })


module.exports = mongoose.model('Vacante', vacantesSchema)