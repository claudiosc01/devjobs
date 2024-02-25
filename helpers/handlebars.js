module.exports = {
    
    seleccionarSkills: (seleccionadas = [], opciones) => {
        
        // console.log(seleccionadas);
        // console.log(opciones.fn());

        const skills = ['HTML5', 'CSS3', 'CSSGrid', 'Flexbox', 'JavaScript', 'jQuery', 'Node', 'Angular', 'VueJS', 'ReactJS', 'React Hooks', 'Redux', 'Apollo', 'GraphQL', 'TypeScript', 'PHP', 'Laravel', 'Symfony', 'Python', 'Django', 'ORM', 'Sequelize', 'Mongoose', 'SQL', 'MVC', 'SASS', 'WordPress'];
        
        let html = '';
        skills.forEach(skill => {
            
            html += `
                <li ${seleccionadas.includes(skill) ? 'class="activo" ' : ''}>${skill}</li>
            `
        })

        return opciones.fn().html = html;

    
    },

    tipoContrato: (seleccionado, opciones) => {
        // console.log(seleccionado);
        // console.log(opciones.fn());

        return opciones.fn(this).replace( // Cuando encuentre seleccionado en los diferentes valores asi cada uno de las opciones va a estar comparando cual es igual a seleccionado.
            new RegExp(`value="${seleccionado}"`), '$& selected="selected"'   // el signo de $& signigica que va a insertar un string ahi. donde el selected debe estar seleccionado.
        ) 
    },

    // Para los errores es lo que haremos para que se muestren las alertas, y lo que viene siendo alertas es para inyectar el html final.
    mostrarAlertas: (errores= {}, alertas ) => {

        // console.log(errores);
        // console.log("===========");
        // console.log(alertas.fn());

        let html = ''
        const categoria = Object.keys(errores) // el object.keys nos trae la llave de los objetos.
        // console.log(errores[categoria]);
        if(categoria.length) { // si existe al menos 1 categoria.
            errores[categoria].forEach(error => {
                html += `
                    <div class="${categoria} alerta">
                        ${error}
                    </div>
                ` 
            })
        }

        // console.log(html);
        
        return alertas.fn().html = html;
        



    }
}