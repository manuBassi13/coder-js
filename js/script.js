
let lista_gastos = [];
let categorias = [];
var DateTime = luxon.DateTime;
let errorContenido = ``;
let miGrafico = "";
let idGasto = 0;

//Importacion
const contenedorCategorias = document.getElementById("categorias");
const contenedorGastos = document.getElementById("gastos");
const contenedorDataGastos = document.getElementById("data-gastos");
const btnConvertirUSD = document.getElementById("convertirUSD")
const contenedorError = document.getElementById("error");
const btnExportarExcel = document.getElementById("exportarExcel");
const divGrafico = document.getElementById("div-grafico")
const canvasGrafico = document.getElementById('graf-gastos');

fetch("js/categorias.json")
.then(response => response.json())
.then(data => {
    categorias = data;
    renderizarCategorias(categorias);
})

//Renderizar categorias
function renderizarCategorias(categoriasJson){
    contenedorCategorias.innerHTML = "";
    categoriasJson.forEach(categoria => {
        const div = document.createElement("div");
        div.classList.add("col");
        div.innerHTML = `
        <button type="button" class="" data-id="${categoria.id}"><i class="fa-solid fa-xl ${categoria.icono}" data-id="${categoria.id}" style="color: ${categoria.color}"></i></button>
            <h3 class="categoria-nombre">${categoria.nombre}</h3>
        `;
        contenedorCategorias.append(div);
    })
}

//Traer lista de gastos JSON
fetch("js/gastos.json")
.then(response => response.json())
.then(data => {
    lista_gastos = data;
    renderizarGastos(lista_gastos);
    activarBtnEliminar();
    actualizarLocalStorage();
})


//Renderizar lista de gastos
function renderizarGastos(gastosJson){
    contenedorGastos.innerHTML = "";
    gastosJson.forEach(gasto => {
        const div = document.createElement("div");
        div.classList.add("gasto");
        div.innerHTML = `
            <div class="gasto-${gasto.id}">
                <tr>
                    <td class="categoria-gasto"><b>${gasto.categoria}</b></td>
                    <br>
                    <p class="valorAR">${Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(gasto.valor)} ||</p>
                    <p class="valorUS">${Intl.NumberFormat("us-US", { style: "currency", currency: "USD" }).format(gasto.valorUS)} ||</p>
                    
                    <td>${gasto.descripcion}</td>
                    <span style="float:right">
                        <td>${gasto.fecha} ||</td>
                        <i id="${gasto.id}" class="boton-eliminar" title="Eliminar">⛔️</button>
                    </span>
                </tr>
            </div>
        `;
        contenedorGastos.append(div); 
    })
}

//Probando Luxon - Traigo fecha actual
const now = DateTime.now();
dt = now.toISODate();

//Selecciona Categoría de Gasto a Cargar
contenedorCategorias.addEventListener('click', (event) => {
    const id = event.target.dataset.id;
    if(id){
        popupGasto(id);
    }
});

//Contenedor Completar Data Gasto
function popupGasto(id){
    const categoriaGasto = categorias[id-1];
    let icono = categoriaGasto.icono;
    let color = categoriaGasto.color;
    let categoria = categoriaGasto.nombre;
    contenedorDataGastos.style.display="block";
    contenedorDataGastos.innerHTML = "";

    const div = document.createElement("div");
    div.classList.add("dataGasto");
    div.innerHTML = `
    <div>

        <div class="container">
        <div class="mb-3">
            <h4 class="">Cargar gasto de ${categoria}</h4>
            <i class="fa-solid fa-2xl ${icono}" style="color:${color}"></i>
        </div>
            <div class="input-group mb-3">
                <span class="input-group-text">$</span>
                <input class="form-control" type="number" name="" id="montoGasto" placeholder="Ingrese el monto">
            </div>
            <div class="input-group mb-3">
                <input class="form-control" type="text" name="" id="descripcionGasto" placeholder="Ingrese una descripción">
            </div>
            <div class="input-group mb-3">
                <input class="form-control" type="date" name="" id="fechaGasto" value="${dt}">
            </div>
            <button class="btn btn-primary" id="cargarGasto">Cargar gasto</button>
            <span style="float:right"><i id="cerrarPopup" class="fa-solid fa-arrow-up fa-2xl"></i></span>
        </div>
     </div>           
    `;
    contenedorDataGastos.append(div);
    
    const descripcion = document.getElementById("descripcionGasto");
    const monto = document.getElementById("montoGasto");
    const fecha = document.getElementById("fechaGasto");
    const botonCargaGasto = document.getElementById("cargarGasto");
    const botonCerrar = document.getElementById("cerrarPopup");
    
    //Boton Cargar Nuevo Gasto
    botonCargaGasto.addEventListener('click', () => {
        cargaGasto(categoria, descripcion, monto, fecha);
    });

    //Boton Cerrar Contenedor Data Gasto
    botonCerrar.addEventListener('click', () => {
        limpiarDataGasto();
    });
}

//Cargar Nuevo Gasto
function cargaGasto(categoria, descripcion, monto, fecha){
    if (lista_gastos.length > 0) {
        idGasto = lista_gastos[lista_gastos.length-1].id + 1
    }
    const nuevoGasto = {
        id: idGasto,
        categoria: categoria,
        descripcion: descripcion.value,
        valor: monto.value,
        valorUS: null,
        fecha: fecha.value
    }
    lista_gastos.push(nuevoGasto);
                                        //CAMBIAR ALERT
    alert("Gasto cargado");
    renderizarGastos(lista_gastos);
    actualizarLocalStorage();
    activarBtnEliminar();
    limpiarDataGasto();
    miGrafico.destroy();
    mostrarGrafico(lista_gastos);
}

//Limpiar datos Nuevo Gasto
function limpiarDataGasto(){
    contenedorDataGastos.style.display="none";
    document.getElementById("descripcionGasto").value = "";
    document.getElementById("montoGasto").value = "";
    document.getElementById("fechaGasto").value = dt;
}

//Eliminar Gasto ------------------- REVISAR
function eliminarGasto(id){
    const i = lista_gastos.findIndex((gasto) => gasto.id === parseInt(id))
    lista_gastos.splice(i, 1);
    renderizarGastos(lista_gastos);
    activarBtnEliminar();
    actualizarLocalStorage();
    miGrafico.destroy();
    mostrarGrafico(lista_gastos);
}

//Activar boton Eliminar Gasto
function activarBtnEliminar(){
    const botonesEliminar = document.querySelectorAll("i.boton-eliminar");
    if (botonesEliminar.length > 0) {
        botonesEliminar.forEach((botonEliminar)=> {
            botonEliminar.addEventListener("click", () => eliminarGasto(botonEliminar.id))
        });
    }
}

//Boton Exportar a Excel - Evento
btnExportarExcel.addEventListener("click", () => {
    contenedorError.innerHTML="";
    errorContenido = `<h3 class="text-red">Error al exportar.</h3>`;
    try{
        const worksheet = XLSX.utils.json_to_sheet(lista_gastos);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Gastos");
        XLSX.writeFile(workbook, "Gastos.xlsx", { compression: true });
    } catch(err){
        contenedorError.innerHTML = errorContenido;
    }
});

//Boton convertir a USD - Evento ---------------------- Agregar gif procesando
btnConvertirUSD.addEventListener("click", () => {
    convertirAusd();
});

//Funcion ASYNC convertir a USD
const convertirAusd = async () => {
    let URL='https://dolarapi.com/v1/dolares/blue';
    contenedorError.innerHTML="";
    errorContenido = `<h2 class="text-red">Error al convertir valores.</h2>`;
    try{
        let peticion = await fetch(URL);
        let respuesta = await peticion.json();
        const USDBlueVenta = respuesta.venta;
        actualizarValores(USDBlueVenta);
        renderizarGastos(lista_gastos);
        activarBtnEliminar();  
    } catch(err) {
        contenedorError.innerHTML = errorContenido;
    }
}

//Actualizar valores USD de lista
function actualizarValores(USDBlue){
    lista_gastos.forEach(gasto => {
        gasto.valorUS = gasto.valor / USDBlue;
    });
}

//Gráfico
const mostrarGrafico = (lista) => {
    if (lista.length === 0) divGrafico.style.display = "none";
    else divGrafico.style.display = "block";
    miGrafico = new Chart(
        canvasGrafico,
        {
          type: 'doughnut',
          data: {
            labels: lista.map(row => row.categoria),
            datasets: [
              {
                label: 'Gastos por categoría',
                data: lista.map(row => row.valor)
              }
            ]
          }
        }
      );
};
mostrarGrafico(lista_gastos);

//Al cargar página
window.onload = () => {
    traerLocalStorage();
    renderizarCategorias(categorias);
    renderizarGastos(lista_gastos);
    activarBtnEliminar();
    miGrafico.destroy();
    mostrarGrafico(lista_gastos);
};

