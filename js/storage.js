// Actualizar el local storage
const actualizarLocalStorage = () => {
    localStorage.setItem('lista_gastos', JSON.stringify(lista_gastos));
};

// Cargar gastos desde el local storage
const traerLocalStorage = () => {
lista_gastos = JSON.parse(localStorage.getItem('lista_gastos')) || [];
};