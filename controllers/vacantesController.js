    // const Vacante = require('../models/Vacantes.js');

    // Otra forma de importar el modelo
    const mongoose = require('mongoose');
    const Vacante = mongoose.model('Vacante');

    const multer = require('multer')
    const shortid = require('shortid');

    exports.formularioNuevaVacante = (req, res) => {
        res.render('nueva-vacante',{
            nombrePagina: 'Nueva Vacante',
            tagline: 'Llena el Formulario y publica tu vacante.',
            cerrarSesion: true,
            nombre: req.user.nombre,
            imagen: req.user.imagen
        })
    }

    // Agregar las vacantes a la base de datos
    exports.agregarVacante = async (req, res) => {
        // console.log(req.body);
        const vacante = new Vacante(req.body) //agrega todo los datos ingresados a la bd.


        // usuario autor de la vacante
        vacante.autor = req.user._id;


        // crear arreglo de habilidades (skills)
        vacante.skills = req.body.skills.split(',') //separa por , para cada skill.

        // almacenarlo en la base de datos
        const nuevaVacante = await vacante.save(); //guarda los cambios.


        // redireccionar
        res.redirect(`/vacantes/${nuevaVacante.url}`)
    }



    // Mostrar una vacante
    exports.mostrarVacante = async (req, res, next) => {

        const vacante = await Vacante.findOne({ url: req.params.url }).populate('autor');
        // console.log(vacante.autor.imagen);

        // si no hay resultados
        if(!vacante) return next();

        // console.log(vacante);

        res.render('vacante', {
            vacante,
            nombrePagina: vacante.titulo,
            barra: true 
        })

    }


    exports.formEditarVacante = async (req, res, next) => {
        const vacante = await Vacante.findOne({ url: req.params.url });

        if(!vacante) return next(); // si no existe la vacante.

        res.render('editar-vacante',{
            vacante,
            nombrePagina: `Editar - ${vacante.titulo}`,
            cerrarSesion: true,
            nombre: req.user.nombre,
            imagen: req.user.imagen
        })
    }


    exports.editarVacante = async (req, res, next) => {

        const vacanteActualizada = req.body


        vacanteActualizada.skills = req.body.skills.split(','); // para que las skills me lo tome como arreglo.


        // busca por la url, donde sea igual al de la bd y lo compara y lo trae, y el new true, retorna el nuevo valor actualizado que isimos el cambio.
        // O otra forma de decir  trae el req.params la url y busca si existe, y si existe actualizara.
        const vacante = await Vacante.findOneAndUpdate({ url: req.params.url }, vacanteActualizada, { new: true, runValidators: true }); 


        res.redirect(`/vacantes/${vacante.url}`)

    }


    // Validar y Sanitizar los campos de las nuevas vacantes.
    exports.validarVacante = (req, res, next) => {

        // sanitizar los campos
        req.sanitizeBody('titulo').escape();
        req.sanitizeBody('empresa').escape();
        req.sanitizeBody('ubicacion').escape();
        req.sanitizeBody('salario').escape();
        req.sanitizeBody('contrato').escape();
        req.sanitizeBody('skills').escape();


        // validar
        req.checkBody('titulo', 'El titulo es obligatorio').notEmpty();
        req.checkBody('empresa', 'La empresa es obligatoria').notEmpty();
        req.checkBody('ubicacion', 'La ubicacion es obligatoria').notEmpty();
        req.checkBody('contrato', 'El contrato es obligatorio').notEmpty();
        req.checkBody('skills', 'Las habilidades son obligatorias').notEmpty();


        const errores = req.validationErrors();

        if(errores){
            
            // Recarga la vista con los errores
            req.flash('error', errores.map(error => error.msg))

            res.render('nueva-vacante', {
                nombrePagina: 'Nueva Vacante',
                tagline: 'Llena el Formulario y publica tu vacante.',
                cerrarSesion: true,
                nombre: req.user.nombre,
            })

        }

        next();

    }


    exports.eliminarVacante = async ( req, res ) => {
        const { id } = req.params;
        // console.log(id);
        const vacante = await Vacante.findById(id);
        // console.log(vacante); 

        if(verificarAutor(vacante, req.user)){
            await Vacante.deleteOne({ _id : vacante._id });
            res.status(200).send('Vacante Eliminada Correctamente.')        
        }else{
            res.status(403).send(Error)
        }

    }


    const verificarAutor = (vacante = {}, usuario = {}) => {
        if(!vacante.autor.equals(usuario._id)){ // si es autor es diferente al que creo la vacante
            return false;
        }

        return true
    }



    // Subir archivos en PDF
    exports.subirCV = (req,res, next) => {
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
    
                res.redirect('back'); // back trata de hacer una peticion hacia una pagina, regresa a la pagina donde se origino el error.
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
            cb(null, __dirname + '../../public/uploads/cv')
        },
        filename: (req, file, cb) => {
            const extension = file.mimetype.split('/')[1]; //trae la extension del archivo.
            // console.log(`${shortid.generate()}.${extension}`);
            cb(null, `${shortid.generate()}.${extension}`) // almacena este archivo.
        }   
    }),
    fileFilter(req,file, cb){
        if(file.mimetype === 'application/pdf'){ // validacion si el formato es jpeg o png para poder ejecutar
            // el callback se ejecuta como true o false. true cuando la imagen se acepta.
            cb(null, true);
        }else{
            cb(new Error('Formato No Valido'), false);
            }
        }
    }

    const upload = multer(configuracionMulter).single('cv');


    // Almacenar los candidatos en la BD
    exports.cotactar = async (req, res, next) => {
        // console.log(req.params);
        const vacante = await Vacante.findOne({ url: req.params.url});

        if(!vacante) return next(); // si no existe la vacante.

        // si existe la vacante

        const nuevoCandidato = {
            nombre: req.body.nombre,
            email: req.body.email,
            cv: req.file.filename
        }


        // almacenar la vacante
        vacante.candidatos.push(nuevoCandidato); // de vacante accedemos a candidatos como es un arreglo usamos push para aregarlo a nuevo candidato.
        await vacante.save();


        // Mensaje flash y redireccion
        req.flash('correcto', 'Se envio tu Curriculum Correctamente')
        res.redirect('/')
    }


    exports.mostrarCandidatos = async (req, res, next) => {
        // console.log(req.params.id);
        const vacante = await Vacante.findById( req.params.id );

        // console.log(vacante.autor);
        // console.log(req.user._id);

        // console.log(typeof vacante.autor);
        // console.log(typeof req.user._id);


        if(vacante.autor != req.user._id.toString()){ // si no es igual
            return next();
        }

        if(!vacante) return next(); // si no hay vacante.

        res.render('candidatos', {
            nombrePagina: `Candidatos Vacante - ${vacante.titulo}`,
            cerrarSesion: true,
            nombre: req.user.nombre,
            imagen: req.user.imagen,
            candidatos: vacante.candidatos
        })

        // console.log(vacante);
    }


    // Buscador de Vacantes
    exports.buscarVacantes = async (req, res) => {
        const vacantes = await Vacante.find({
            $text: {
                $search: req.body.q
            }
        })

        // console.log(vacante);
        // Mostrar las vacantes
        res.render('home', {
            nombrePagina: `Resultados para la busqueda: ${req.body.q}`,
            barra: true,
            vacantes
        })
    }