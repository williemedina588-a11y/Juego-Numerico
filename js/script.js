// 1. Referencias a los elementos del HTML
const campoNumero = document.getElementById("campoNumero");
const btnAdivinar = document.getElementById("btnAdivinar");
const btnNueva = document.getElementById("btnNueva");
const mensaje = document.getElementById("mensaje");
const bolas = document.querySelectorAll(".bola");
const sinPartidas = document.getElementById("sinPartidas");
const listaPartidas = document.getElementById("listaPartidas");
const btnBorrar = document.getElementById("btnBorrar");

// 2. Variables del juego
let numeroSecreto;
let intentosRestantes;
let terminada;
let partidas = []; // historial de partidas terminadas

// 3. Historial: leer, guardar y mostrar
function cargarPartidas() {
  try {
    const guardado = localStorage.getItem("partidas");
    partidas = guardado ? JSON.parse(guardado) : [];
  } catch (error) {
    partidas = [];
  }
}

function guardarPartidas() {
  try {
    localStorage.setItem("partidas", JSON.stringify(partidas));
  } catch (error) {
    console.log("No se pudo guardar el historial");
  }
}

function pintarPartidas() {
  listaPartidas.innerHTML = "";

  partidas.forEach(function (partida) {
    const li = document.createElement("li");
    li.className = partida.gano ? "gano" : "perdio";

    if (partida.gano) {
      li.textContent = "El número era " + partida.numero + ". Ganaste en " +
        partida.intentos + (partida.intentos === 1 ? " intento." : " intentos.");
    } else {
      li.textContent = "El número era " + partida.numero + ". Perdiste.";
    }

    listaPartidas.appendChild(li);
  });

  sinPartidas.hidden = partidas.length > 0;
  btnBorrar.hidden = partidas.length === 0;
}

// Anota la partida que acaba de terminar
function registrarPartida(gano) {
  partidas.push({
    numero: numeroSecreto,
    intentos: 3 - intentosRestantes,
    gano: gano
  });
  guardarPartidas();
  pintarPartidas();
}

// Enciende o apaga las bolas según los intentos restantes
function pintarIntentos() {
  bolas.forEach(function (bola, i) {
    bola.classList.toggle("apagada", i >= intentosRestantes);
  });
}

// 4. Función que deja el juego listo para empezar
function nuevaPartida() {
  numeroSecreto = Math.floor(Math.random() * 10) + 1;
  intentosRestantes = 3;
  terminada = false;

  campoNumero.value = "";
  campoNumero.disabled = false;
  btnAdivinar.disabled = false;
  pintarIntentos();
  mensaje.textContent = "Escribe un número y pulsa Adivinar.";
  mensaje.className = "";

  // console.log("Número secreto (solo para pruebas):", numeroSecreto);
}

// Muestra un mensaje; "clase" puede ser "ok" (verde) o "mal" (rojo)
function mostrar(texto, clase) {
  mensaje.textContent = texto;
  mensaje.className = clase || "";
}

// Termina la partida: ya no se puede seguir adivinando
function terminar() {
  terminada = true;
  campoNumero.disabled = true;
  btnAdivinar.disabled = true;
}

// Se ejecuta al pulsar "Adivinar"
function adivinar() {
  if (terminada) return;

  const texto = campoNumero.value.trim();
  const numero = Number(texto);

  // Campo vacío: no consume intentos
  if (texto === "") {
    mostrar("Debes ingresar un número", "mal");
    return;
  }

  // Debe ser un entero entre 1 y 10: tampoco consume intentos
  if (!Number.isInteger(numero) || numero < 1 || numero > 10) {
    mostrar("Ingresa un número entero entre 1 y 10", "mal");
    campoNumero.value = "";
    return;
  }

  // Cada respuesta válida consume un intento
  intentosRestantes--;
  pintarIntentos();

  // Primero se comprueba el acierto, aunque sea el último intento
  if (numero === numeroSecreto) {
    mostrar("¡Felicidades! Adivinaste el número secreto", "ok");
    registrarPartida(true);
    terminar();
  } else if (intentosRestantes === 0) {
    mostrar("Has perdido. El número secreto era " + numeroSecreto, "mal");
    registrarPartida(false);
    terminar();
  } else if (numero < numeroSecreto) {
    mostrar("El número secreto es mayor.");
  } else {
    mostrar("El número secreto es menor.");
  }

  campoNumero.value = "";
  if (!terminada) campoNumero.focus();
}

// 5. Eventos e inicio
btnNueva.addEventListener("click", nuevaPartida);
btnAdivinar.addEventListener("click", adivinar);
campoNumero.addEventListener("keydown", function (e) {
  if (e.key === "Enter") adivinar();
});
btnBorrar.addEventListener("click", function () {
  if (confirm("¿Seguro que quieres borrar el historial?")) {
    partidas = [];
    guardarPartidas();
    pintarPartidas();
  }
});