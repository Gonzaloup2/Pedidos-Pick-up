let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
let indexEdicion = null;

function guardarEnLocalStorage() {
  localStorage.setItem('pedidos', JSON.stringify(pedidos));
}

function guardarPedido() {
  const nombre = document.getElementById('nombre').value.trim();
  const numero = document.getElementById('numero').value.trim();
  const ubicacion = document.getElementById('ubicacion').value.trim();
  const fechaEntrega = document.getElementById('fechaEntrega').value;

  if (!nombre || !ubicacion) {
    alert("Nombre y ubicación son obligatorios.");
    return;
  }

  const nuevoPedido = { nombre, numero, ubicacion, fechaEntrega };

  if (indexEdicion !== null) {
    pedidos[indexEdicion] = nuevoPedido;
    indexEdicion = null;
  } else {
    pedidos.push(nuevoPedido);
  }

  guardarEnLocalStorage();
  mostrarPedidos();
  mostrarVista('lista');

  document.getElementById('nombre').value = '';
  document.getElementById('numero').value = '';
  document.getElementById('ubicacion').value = '';
  document.getElementById('fechaEntrega').value = '';
}

function mostrarPedidos(filtrados = pedidos) {
  const lista = document.getElementById('lista-pedidos');
  lista.innerHTML = '';

  filtrados.forEach((pedido, index) => {
    const div = document.createElement('div');
    div.className = 'pedido';
    div.innerHTML = `
      <div>
        <strong>${pedido.nombre}</strong><br>
        Pedido: ${pedido.numero || 'N/A'}<br>
        Ubicación: ${pedido.ubicacion}<br>
        Entrega: ${pedido.fechaEntrega || 'N/A'}
      </div>
      <button class="editar" onclick="editarPedido(${index})">Editar</button>
      <button class="eliminar" onclick="confirmarEliminacion(${index})">Eliminar</button>
    `;
    lista.appendChild(div);
  });
}

function editarPedido(index) {
  const pedido = pedidos[index];
  document.getElementById('nombre').value = pedido.nombre;
  document.getElementById('numero').value = pedido.numero;
  document.getElementById('ubicacion').value = pedido.ubicacion;
  document.getElementById('fechaEntrega').value = pedido.fechaEntrega;
  indexEdicion = index;
  mostrarVista('formulario');
}

function confirmarEliminacion(index) {
  if (confirm("¿Estás seguro de eliminar este pedido?")) {
    pedidos.splice(index, 1);
    guardarEnLocalStorage();
    mostrarPedidos();
  }
}

function filtrarPedidos() {
  const texto = document.getElementById('buscar').value.toLowerCase();
  const filtrados = pedidos.filter(p =>
    p.nombre.toLowerCase().includes(texto) ||
    p.numero?.toLowerCase().includes(texto) ||
    p.ubicacion.toLowerCase().includes(texto)
  );
  mostrarPedidos(filtrados);
}

function toggleMenu() {
  const menu = document.getElementById('menu');
  menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

function mostrarVista(vista) {
  document.getElementById('vista-lista').classList.add('hidden');
  document.getElementById('vista-formulario').classList.add('hidden');
  document.getElementById('menu').style.display = 'none';

  if (vista === 'lista') {
    document.getElementById('vista-lista').classList.remove('hidden');
  } else if (vista === 'formulario') {
    document.getElementById('vista-formulario').classList.remove('hidden');
  }
}

function formatearUbicacion(input) {
  let valor = input.value.replace(/\D/g, '');
  if (valor.length > 9) valor = valor.slice(0, 9);

  let bloques = [];
  for (let i = 0; i < valor.length; i += 3) {
    bloques.push(valor.slice(i, i + 3));
  }

  input.value = bloques.join('/');
}

function descargarExcel() {
  const data = pedidos.map(p => ({
    Nombre: p.nombre,
    Pedido: p.numero,
    Ubicación: p.ubicacion,
    'Fecha de Entrega': p.fechaEntrega
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Pedidos');
  XLSX.writeFile(wb, 'pedidos.xlsx');
}

function subirExcel(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet);

    pedidos = json.map(p => ({
      nombre: p.Nombre || '',
      numero: p.Pedido || '',
      ubicacion: p.Ubicación || '',
      fechaEntrega: p['Fecha de Entrega'] || ''
    }));

    guardarEnLocalStorage();
    mostrarPedidos();
  };

  reader.readAsArrayBuffer(file);
}

mostrarPedidos();
