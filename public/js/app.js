import axios from 'axios';
import Swal from 'sweetalert2';


document.addEventListener('DOMContentLoaded', () => {
    const skills = document.querySelector('.lista-conocimientos');

    // Limpiar las alertas
    let alertas = document.querySelector('.alertas');

    if(alertas){ // si existen alertas
        limpiarAlertas()
    }



    if(skills){
        skills.addEventListener('click', agregarSkills);

        // una ves que estamos en editar, llamar la funcion
        skillsSeleccionados();
    }


    const vacantesListado = document.querySelector('.panel-administracion');

    if(vacantesListado){
        vacantesListado.addEventListener('click', accionesListado)
    }

})


const skills = new Set();

const agregarSkills = e => {
    // console.log(e.target);
    if(e.target.tagName === 'LI'){

        // console.log(e.target.textContent);

        if(e.target.classList.contains('activo')){

            // quitar la clase activo y quitar del Set
            e.target.classList.remove('activo')
            skills.delete(e.target.textContent)

        }else{ // Agregarlo al set y la clase activo.
            skills.add(e.target.textContent);
            e.target.classList.add('activo')
        }

    }

    // console.log(skills);
    const skillsArray = [...skills] //creamos una copia de skills y esta convertido en un arreglo.
    document.querySelector('#skills').value = skillsArray
}

const skillsSeleccionados = () => {
    const seleccionadas = Array.from(document.querySelectorAll('.lista-conocimientos .activo')) //el array se usa para que venga como arreglo para poder iterarlo.
    
    // console.log(seleccionadas);  
    seleccionadas.forEach(seleccionada => { // va a llenar el Set.
        skills.add(seleccionada.textContent);
    })


    // inyectarlo en el input hidden.
    const skillsArray = [...skills] //creamos una copia de skills y esta convertido en un arreglo.
    document.querySelector('#skills').value = skillsArray
}


const limpiarAlertas = () => {

    const alertas = document.querySelector('.alertas')

    const interval = setInterval(() => {

        if(alertas.children.length > 0) {
            alertas.removeChild(alertas.children[0])
        } else if (alertas.children.length === 0) {
            alertas.parentElement.removeChild(alertas) // elimina el div padre.
            clearInterval(interval)
        }

    }, 1300)

}


// Eliminar vacantes
const accionesListado = e => {
    // console.log(e.target);

    e.preventDefault();

    if(e.target.dataset.eliminar){
        // eliminar por axios
        // const url = `${location.origin}/vacantes/eliminar/${e.targ   et.dataset.eliminar}`;
        // console.log(url);



        Swal.fire({
            title: "Confirmar Eliminacion?",
            text: "Una vez eliminada, no se puede recuperar",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Si, Eliminar",
            cancelButtonText: "No, Cancelar"
          }).then((result) => {
            if (result.isConfirmed) {

                // enviar la peticion con axios
                const url = `${location.origin}/vacantes/eliminar/${e.target.dataset.eliminar}`;

                // Axios para eliminar el registro
                axios.delete(url, { params: {url}})
                    .then(function(respuesta){
                        // console.log(respuesta);
                        if(respuesta.status === 200){
                            Swal.fire({
                                title: "Eliminado",
                                text: respuesta.data,
                                icon: "success"
                            });

                            // console.log(e.target);
                            e.target.parentElement.parentElement.parentElement.removeChild(e.target.parentElement.parentElement)
                        }
                    })

                    .catch(()=> {
                        Swal.fire({
                            type: "error",
                            title: "Ocurrio un error.",
                            text: "No se pudo eliminar"
                        })
                    })
            }
          });
    }else if(e.target.tagName === 'A'){
        console.log(e.target.tagName)
        window.location.href = e.target.href
    }

}