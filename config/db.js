const mongoose = require('mongoose');

require('dotenv').config({
    path: 'variables.env'
})

mongoose.connect(process.env.DATABASE);

mongoose.connection.on('error', (error) => { // en caso que haya un error, que lo muestre.
    console.log(error);
})


// Importar los modelos
require('../models/Vacantes');
require('../models/Usuarios');