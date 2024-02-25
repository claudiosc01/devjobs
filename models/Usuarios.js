const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const bcrypt = require('bcrypt');

const usuariosSchema = new mongoose.Schema({

    email: {
        type: String,
        unique: true,
        lowercase: true, //convierte a minuscula
        trim: true // si hay espacios al inicio y al final no afecten
    },
    nombre: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    token: String,
    expira: Date,
    imagen: String
})


// Metodo para hashear los Passwords
usuariosSchema.pre('save', async function(next) {
    // si el password ya esta hasheado, no hacemos nada.
    if(!this.isModified('password'))  {  // verificar si el password ya esta hasheado. | este if dice si el password ya esta modificado(hasheado) no lo vuelvas a hashear.
        return next(); // va a la siguente vista.
    }

    // si no esta hasheado
    const hash = await bcrypt.hash(this.password, 12) //hasheamos el password, 12 caracteres.
    this.password = hash; // antes de que guarde en la bd, decimos que el password sea igual al hash.
    next();


});


// Envia alerta cuando un usuario ya esta registrado
//Previene que se inserte otro registro. Cuando queremos ingresar un elemento que ya existe.
usuariosSchema.post('save', function (error, doc, next) {
    if(error.name === 'MongoError' && error.code === 11000){
        next('Ese correo ya esta registrado');
    } else { // Pueden pasar muchos y otros errores por eso ponemos este else.
        next(error)
    }
})


// Autenticar Usuarios  - methos, sirve para agregar diferentes funciones.
usuariosSchema.methods = {
    compararPassword: function(password){
        return bcrypt.compareSync(password, this.password); // compara la contraseña que estamos pasando con la que existe en la bd.
    }
}

module.exports = mongoose.model('Usuarios', usuariosSchema);