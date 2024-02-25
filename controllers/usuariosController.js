const mongoose = require('mongoose');
const multer = require('multer');
const Usuarios = mongoose.model('Usuarios');
const shortid = require('shortid');

exports.subirImagen = (req,res, next) => {
    upload(req, res, function(error){ // para subir una imagen
        // console.log(error);
        
        if(error) {
            // console.log(error);

            if(error instanceof multer.MulterError){
                if(error.code === 'LIMIT_FILE_SIZE'){
                    req.flash('error', 'El archivo es muy grande: Maximo 100kb.');
                }else{
                    req.flash('error', error.message)
                }
            }else{
                // console.log(error.message);
                req.flash('error', error.message)
            }

            res.redirect('/administracion');
            return;
        }else{
            return next();
        }
        
    })
}


// Opciones de Multer
const configuracionMulter = {
    limits: { fileSize: 100000 },
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, __dirname + '../../public/uploads/perfiles')
        },
        filename: (req, file, cb) => {
            const extension = file.mimetype.split('/')[1]; //trae la extension del archivo.
            // console.log(`${shortid.generate()}.${extension}`);
            cb(null, `${shortid.generate()}.${extension}`) // almacena este archivo.
        }
    }),
    fileFilter(req,file, cb){
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){ // validacion si el formato es jpeg o png para poder ejecutar
            // el callback se ejecuta como true o false. true cuando la imagen se acepta.
            cb(null, true);
        }else{
            cb(new Error('Formato No Valido'), false);
        }
    }
}

const upload = multer(configuracionMulter).single('imagen');

exports.formCrearCuenta = (req, res) => {
    res.render('crear-cuenta',{
        nombrePagina: 'Crea Tu Cuenta en DevJobs',
        tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta.'
    })
}




exports.validarRegistro = (req, res, next) => {

    // sanitizar los campos
    req.sanitizeBody('nombre').escape();
    req.sanitizeBody('email').escape();
    req.sanitizeBody('password').escape();
    req.sanitizeBody('confirmar').escape();


    // validar los campos
    req.checkBody('nombre', 'El nombre es obligatorio').notEmpty();
    req.checkBody('email', 'El email debe ser valido').isEmail();
    req.checkBody('password', 'El password no puede ir vacio').notEmpty();
    req.checkBody('confirmar', 'Confirmar Password no puede ir vacio').notEmpty();
    req.checkBody('confirmar', 'Las contraseñas no coinciden').equals(req.body.password);

    const errores = req.validationErrors();
    // console.log(errores);
    
    // Si no hay errores
    if(errores){
        // console.log(errores);

        req.flash('error', errores.map(error => error.msg)); //se asigna los mensajes a flash error.

        res.render('crear-cuenta',{
            nombrePagina: 'Crea Tu Cuenta en DevJobs',
            tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta.',
            mensajes: req.flash() // lo que tiene como errores el flash asignara aqui.
        });

        return;

    }

    // Si toda la validacion es correcta.
    next();
}



exports.crearUsuario = async (req, res, next) => {
    
    // Crear el Usuario.
    const usuario = new Usuarios(req.body); // Para que inserte todo lo obtenido al usuario. y crea ese objeto.
    // console.log(usuario);


    //const nuevoUsuario = await usuario.save();
    //if(!nuevoUsuario) return next(); // en caso que no se crea el nuevo usuario.
    // res.redirect('/iniciar-sesion') // en caso de que se haya creado redirecciona a iniciar-sesion

    // Otra forma para la creacion de usuario.
    try {
        await usuario.save();
        res.redirect('/iniciar-sesion') // en caso de que se haya creado redirecciona a iniciar-sesion

    } catch (error) {
        req.flash('error', error);
        res.redirect('/crear-cuenta')
    }
}



// Formulario para iniciar sesion
exports.formIniciarSesion = (req, res) => {
    res.render('iniciar-sesion', {
        nombrePagina: 'Iniciar Sesion DevJobs',

    })
}


// Form Editar Perfil
exports.formEditarPerfil = (req, res) => {
    res.render('editar-perfil', {
        nombrePagina: 'Edita tu perfil en DevJobs',
        usuario: req.user,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    })
}

// Guardar Cambios Editar Perfil
exports.editarPerfil = async (req, res) => {

    const usuario = await Usuarios.findById(req.user._id);
    // console.log(usuario);

    usuario.nombre = req.body.nombre;
    usuario.email = req.body.email;
    if(req.body.password){ // en caso se presente un password nuevo, lo guardamos
        usuario.password = req.body.password; 
    }

    // console.log(req.file); //trae la informacion del archivo.

    if(req.file){ // guarda la imagen en el usuario en el campo usuario y lo guarde en el servidor.
        usuario.imagen = req.file.filename;
    }


    await usuario.save();

    req.flash('correcto', 'Cambios Guardados Correctamente.') //alerta

    // redirect
    res.redirect('/administracion')

}



// sanitizar y validar formulario de editar Clientes perfiles.
exports.validarPerfil = (req, res, next) => {

    //sanitizar
    req.sanitizeBody('nombre').escape()
    req.sanitizeBody('email').escape()

    if(req.body.password){ // si existe el req.body
        req.sanitizeBody('password').escape()
    }

    // validar
    req.checkBody('nombre', 'El nombre no puede ir vacio').notEmpty();
    req.checkBody('email', 'El correo no puede ir vacio').notEmpty();   


    const errores = req.validationErrors();

    if(errores) { // si existe errores.
        req.flash('error', errores.map(error => error.msg))
        res.render('editar-perfil', {
            nombrePagina: 'Edita tu perfil en DevJobs',
            usuario: req.user,
            cerrarSesion: true,
            nombre: req.user.nombre,
            imagen: req.user.imagen,
            mensajes: req.flash()
        })
    }


    next();
}