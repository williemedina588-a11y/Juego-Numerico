// 1. Referencias a los elementos del HTML
const campoNumero = document.getElementById("campoNumero");
const btnAdivinar = document.getElementById("btnAdivinar");
const btnNueva = document.getElementById("btnNueva");
const mensaje = document.getElementById("mensaje");
const subtitulo = document.getElementById("subtitulo");
const selectNivel = document.getElementById("nivel");
const contBolas = document.getElementById("bolas");
const secreto = document.getElementById("secreto");
const probados = document.getElementById("probados");
const ganadasEl = document.getElementById("ganadas");
// const rachaEl = document.getElementById("racha");
const perdidasEl = document.getElementById("perdidas");
const mejorRachaEl = document.getElementById("mejorRacha");
const sinPartidas = document.getElementById("sinPartidas");
const listaPartidas = document.getElementById("listaPartidas");
const btnBorrar = document.getElementById("btnBorrar");

// 2. Niveles de dificultad
const NIVELES = {
  facil:   { nombre: "Fácil",   max: 10,  intentos: 3 },
  medio:   { nombre: "Medio",   max: 50,  intentos: 5 },
  dificil: { nombre: "Difícil", max: 100, intentos: 7 }
};

// 3. Variables del juego
let nivelActual = "facil";
let numeroSecreto;
let intentosTotales;
let intentosRestantes;
let terminada;
let numerosProbados = []; // números probados en la partida actual
let bolas = [];
let partidas = []; // historial de partidas terminadas

// 4. Historial: leer, guardar y mostrar
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

// Calcula ganadas, perdidas y mejor racha a partir del historial
function calcularEstadisticas() {
  let ganadas = 0;
  let perdidas = 0;
  let racha = 0;
  let mejorRacha = 0;

  partidas.forEach(function (partida) {
    if (partida.gano) {
      ganadas++;
      racha++;
      if (racha > mejorRacha) mejorRacha = racha;
    } else {
      perdidas++;
      racha = 0;
    }
  });

  return { ganadas: ganadas, perdidas: perdidas, mejorRacha: mejorRacha };
}

function pintarMarcador() {
  const stats = calcularEstadisticas();
  ganadasEl.textContent = stats.ganadas;
  perdidasEl.textContent = stats.perdidas;
  mejorRachaEl.textContent = stats.mejorRacha;
}

function pintarPartidas() {
  listaPartidas.innerHTML = "";

  partidas.forEach(function (partida) {
    const li = document.createElement("li");
    li.className = partida.gano ? "gano" : "perdio";

    // Las partidas viejas no tienen nivel: se muestran como Fácil
    const nivel = NIVELES[partida.nivel] || NIVELES.facil;
    let texto = "[" + nivel.nombre + "] El número era " + partida.numero + ". ";

    if (partida.gano) {
      texto += "Ganaste en " + partida.intentos +
        (partida.intentos === 1 ? " intento." : " intentos.");
    } else {
      texto += "Perdiste.";
    }

    li.textContent = texto;
    listaPartidas.appendChild(li);
  });

  sinPartidas.hidden = partidas.length > 0;
  btnBorrar.hidden = partidas.length === 0;
  pintarMarcador();
}

// Anota la partida que acaba de terminar
function registrarPartida(gano) {
  partidas.push({
    numero: numeroSecreto,
    intentos: intentosTotales - intentosRestantes,
    gano: gano,
    nivel: nivelActual
  });
  guardarPartidas();
  pintarPartidas();
}

// 5. Números probados en la partida actual
function pintarProbados() {
  const lista = numerosProbados.length ? numerosProbados.join(", ") : "—";
  probados.innerHTML = "Probados: <b>" + lista + "</b>";
}

// 6. Bolas de intentos
function crearBolas() {
  contBolas.innerHTML = "";
  bolas = [];

  for (let i = 0; i < intentosTotales; i++) {
    const bola = document.createElement("span");
    bola.className = "bola";
    contBolas.appendChild(bola);
    bolas.push(bola);
  }
}

// Enciende o apaga las bolas según los intentos restantes
function pintarIntentos() {
  bolas.forEach(function (bola, i) {
    bola.classList.toggle("apagada", i >= intentosRestantes);
  });
}

// 7. Deja el juego listo para empezar, según el nivel elegido
function nuevaPartida() {
  nivelActual = selectNivel.value;
  const nivel = NIVELES[nivelActual];

  numeroSecreto = Math.floor(Math.random() * nivel.max) + 1;
  intentosTotales = nivel.intentos;
  intentosRestantes = intentosTotales;
  terminada = false;
  numerosProbados = [];

  subtitulo.textContent = "Adivina un número del 1 al " + nivel.max +
    " en " + nivel.intentos + " intentos.";
  campoNumero.max = nivel.max;
  campoNumero.placeholder = "1 a " + nivel.max;

  campoNumero.value = "";
  campoNumero.disabled = false;
  btnAdivinar.disabled = false;

  secreto.textContent = "?";
  secreto.style.fontSize = "";
  secreto.classList.remove("reveal");

  crearBolas();
  pintarIntentos();
  pintarProbados();
  mensaje.textContent = "Escribe un número y pulsa Adivinar.";
  mensaje.className = "";

     console.log("Número secreto (solo para pruebas):", numeroSecreto);
}

// Muestra un mensaje; "clase" puede ser "ok" (verde) o "mal" (rojo)
function mostrar(texto, clase) {
  mensaje.textContent = texto;
  mensaje.className = clase || "";
}

// Termina la partida: se revela el número y ya no se puede adivinar
function terminar() {
  terminada = true;
  campoNumero.disabled = true;
  btnAdivinar.disabled = true;

  secreto.textContent = numeroSecreto;
  secreto.style.fontSize = numeroSecreto >= 100 ? "2.2rem" : "";
  secreto.classList.remove("reveal");
  void secreto.offsetWidth; // reinicia la animación
  secreto.classList.add("reveal");
}

// 8. Se ejecuta al pulsar "Adivinar"
function adivinar() {
  if (terminada) return;

  const max = NIVELES[nivelActual].max;
  const texto = campoNumero.value.trim();
  const numero = Number(texto);

  // Campo vacío: no consume intentos
  if (texto === "") {
    mostrar("Debes ingresar un número", "mal");
    return;
  }

  // Debe ser un entero dentro del rango del nivel: tampoco consume intentos
  if (!Number.isInteger(numero) || numero < 1 || numero > max) {
    mostrar("Ingresa un número entero entre 1 y " + max, "mal");
    campoNumero.value = "";
    return;
  }

  // Cada respuesta válida consume un intento y se anota como probada
  intentosRestantes--;
  numerosProbados.push(numero);
  pintarIntentos();
  pintarProbados();

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

// 9. Eventos e inicio
btnNueva.addEventListener("click", nuevaPartida);
selectNivel.addEventListener("change", nuevaPartida);
btnAdivinar.addEventListener("click", adivinar);
campoNumero.addEventListener("keydown", function (e) {
  if (e.key === "Enter") adivinar();
});
btnBorrar.addEventListener("click", function () {
  if (confirm("¿Seguro que quieres borrar el historial y las estadísticas?")) {
    partidas = [];
    guardarPartidas();
    pintarPartidas();
  }
});

cargarPartidas();
pintarPartidas();
nuevaPartida();