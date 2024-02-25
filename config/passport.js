const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const Usuarios = mongoose.model('Usuarios');

passport.use(new LocalStrategy({
    // De nuestro modelo se autentificar con estos 2 campos.
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done)=>{ // Esta funcion interactua ocn la bd.
    const usuario = await Usuarios.findOne({ email: email })

    // Si no hay usuarios
    if(!usuario) return done(null, false, {      // null es el mensaje de error en caso de que haya error, el segundo es el Usuario, y el tercero son las opciones
        message: 'Usuario no existente.'
    }); 


    // El usuario existe, vamos a verificarlo
    const verificarPass = usuario.compararPassword(password)
    if(!verificarPass) return done(null, false, {
        message: 'Password Incorrecto'
    });


    // Usuario existe y el password es correecto
    return done(null, usuario)

}))

passport.serializeUser((usuario,done) => done(null, usuario._id) );
passport.deserializeUser(async (id,done) => {
    const usuario = await Usuarios.findById(id).exec();
    return done(null, usuario);
})

module.exports = passport;