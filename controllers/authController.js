const passport = require('passport')
const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');
const Usuarios = mongoose.model('Usuarios');
const crypto = require('crypto');
const enviarEmail = require('../handlers/email')

exports.autenticarUsuario = passport.authenticate('local',{ // va a autenticar.
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion', // si la autentifacion no es correcta nos lleva aqui
    failureFlash: true,
    badRequestMessage: 'Ambos campos son Obligatorios'
})


// Revisar si el usuario esta autenticado o no.
exports.verificarUsuario = (req,res,next) => {
    
    //revisar el usuario
    if(req.isAuthenticated()) {
        return next(); //estan autenticados.
    }


    // else - caso contrario
    res.redirect('/iniciar-sesion');

} 


exports.mostrarPanel = async (req, res) => {

    // Consultar el usuario autenticado
    const vacantes = await Vacante.find( { autor: req.user._id} ) //filtramos por el autor.
    // console.log(vacantes);

    res.render('administracion',{
        nombrePagina: 'Panel de Administracion',
        tagline: 'Crea y Administra tus vacantes desde aqui.',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        vacantes
    })
}


exports.cerrarSesion = (req, res, next) => {
    req.logout(function(err){
        if(err) {
            return next(err);
        }
        req.flash('correcto', 'Cerraste Sesion Correctamente')
        return res.redirect('/iniciar-sesion')
    });
}


// Formulario para reiniciar el password
exports.formReestablecerPassword = (req, res) => {
    res.render('reestablecer-password', {
        nombrePagina: 'Reestablece tu Password',
        tagline: 'Si ya tienes una cuenta pero olvidaste tu Password, coloca tu Email'
    })
}

// Genera el token en la tabla del usuario
exports.enviarToken = async (req, res) => {
    const usuario = await Usuarios.findOne({ email: req.body.email })

    if(!usuario) { // si el usuario no existe.
        req.flash('error', 'No existe esa cuenta')
        return res.redirect('/iniciar-sesion')
    }


    // si el usuario existe, generar token
    usuario.token = crypto.randomBytes(20).toString('hex');
    usuario.expira = Date.now() + 3600000;

    // Guardar el usuario.
    await usuario.save();
    const resetUrl = `http://${req.headers.host}/reestablecer-password/${usuario.token}`


    // para buscar TDO : Enviar notificacion por email.
    await enviarEmail.enviar({
        usuario,
        subject: 'Password Reset',
        resetUrl,
        archivo: 'reset'
    })



    req.flash('correcto', 'Revisa tu email para las Indicaciones')
    res.redirect('/iniciar-sesion')
}


// Valida si el token es valido , muestra al vista. 
exports.restablecerPassword = async (req, res) => {
    const usuario = await Usuarios.findOne({ 
        token: req.params.token,
        expira: {
            $gt: Date.now()
        }
    })

    if(!usuario){ // Si no existe el usuario
        req.flash('error', 'El formulario ya no es valido. Intenta denuevo')
        return res.redirect('/reestablecer-password')
    }


    //Mostrar el formulario si pasamos las validaciones
    res.render('nuevo-password', {
        nombrePagina: 'Nuevo Password'
    })
}

// Almacena el nuevo Password en la Base de datos.
exports.guardarPassword = async (req, res) => {
    const usuario = await Usuarios.findOne({ 
        token: req.params.token,
        expira: {
            $gt: Date.now()
        }
    })

    // no existe el usuario o el token ya es invalido.
    if(!usuario){ // Si no existe el usuario
        req.flash('error', 'El formulario ya no es valido. Intenta denuevo')
        return res.redirect('/reestablecer-password')
    }

    // Asignar el nuevo password, limpiar valores previos
    usuario.password = req.body.password;
    usuario.token = undefined;
    usuario.expira = undefined


    // Agregar y eliminar valores del objeto
    await usuario.save();

    //redirigir 
    req.flash('correcto', 'Password Modificado Correctamente')
    res.redirect('/iniciar-sesion')
    
}