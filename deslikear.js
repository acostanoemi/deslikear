// deslikear.js
// Saca "Me gusta" en tandas desde instagram.com/your_activity/interactions/likes
// Se pega en la consola del navegador (F12 > Console) con la sesión ya abierta.
// No usa contraseñas ni tokens: hace clicks en tu propia sesión, como si fueras vos.
// Para frenarlo: escribí frenarDeslikeo() en la consola.

(() => {
  // ---------- Configuración ----------
  const CONFIG = {
    porTanda: 50,                // cuántos selecciona por vez (Instagram permite hasta 100)
    maxPorCorrida: 300,          // tope total por corrida, para no levantar sospechas
    pausaEntreTandas: [90, 150], // segundos, al azar entre min y max
    pausaEntreClicks: [300, 800] // milisegundos, al azar entre min y max
  };

  // Textos de los botones (español y inglés). Si tu Instagram dice otra cosa, agregalo acá.
  const TEXTOS = {
    seleccionar: ['Seleccionar', 'Select'],
    deslikear: ['Ya no me gusta', 'Unlike'],
    bloqueo: ['Inténtalo de nuevo más tarde', 'Intentá de nuevo más tarde', 'Try Again Later']
  };

  // Posibles selectores de las casillas de cada publicación.
  // Si falla, inspeccioná una casilla (click derecho > Inspeccionar) y agregá su selector.
  const SELECTORES_CHECKBOX = [
    '[data-testid="bulk_action_checkbox"]',
    '[aria-label="Toggle checkbox"]',
    '[aria-label="Activar o desactivar casilla"]'
  ];

  // ---------- Utilidades ----------
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const azar = ([min, max]) => min + Math.random() * (max - min);
  const log = (...a) => console.log('%c[deslikear]', 'color:#e1306c;font-weight:bold', ...a);

  let frenar = false;
  window.frenarDeslikeo = () => {
    frenar = true;
    log('Frenando al terminar el paso actual...');
  };

  const buscarPorTexto = (textos, raiz = document) => {
    for (const n of raiz.querySelectorAll('button, [role="button"], span')) {
      if (textos.includes(n.textContent.trim())) {
        return n.closest('button, [role="button"]') || n;
      }
    }
    return null;
  };

  const esperar = async (fn, timeout = 10000) => {
    const t0 = Date.now();
    while (Date.now() - t0 < timeout) {
      const r = fn();
      if (r) return r;
      await sleep(250);
    }
    return null;
  };

  const casillas = () => {
    for (const s of SELECTORES_CHECKBOX) {
      const lista = [...document.querySelectorAll(s)];
      if (lista.length) return lista;
    }
    return [];
  };

  const hayBloqueo = () => TEXTOS.bloqueo.some(t => document.body.innerText.includes(t));

  const pausa = async segundos => {
    for (let i = 0; i < segundos && !frenar; i++) await sleep(1000);
  };

  // ---------- Una tanda ----------
  async function tanda(n) {
    const sel = await esperar(() => buscarPorTexto(TEXTOS.seleccionar));
    if (!sel) throw new Error('No encontré "Seleccionar". ¿Estás en la página de Me gusta?');
    sel.click();
    await sleep(1000);

    let cajas = await esperar(() => (casillas().length ? casillas() : null));
    if (!cajas) throw new Error('No encontré casillas. O no quedan likes, o hay que ajustar SELECTORES_CHECKBOX.');

    // Si hay menos de las que queremos, bajamos para que cargue más
    for (let i = 0; i < 5 && cajas.length < n; i++) {
      cajas[cajas.length - 1].scrollIntoView();
      await sleep(1500);
      cajas = casillas();
    }

    const aMarcar = cajas.slice(0, n);
    for (const c of aMarcar) {
      if (frenar) break;
      c.click();
      await sleep(azar(CONFIG.pausaEntreClicks));
    }

    const boton = buscarPorTexto(TEXTOS.deslikear);
    if (!boton) throw new Error('No encontré el botón "Ya no me gusta".');
    boton.click();

    // Confirmación: buscamos un segundo botón "Ya no me gusta" en cualquier parte de la página
    // (distinto del que ya tocamos). Si Instagram no pide confirmar, vuelve a aparecer "Seleccionar".
    const esOtro = n => n !== boton && !boton.contains(n) && !n.contains(boton);
    const resultado = await esperar(() => {
      const candidatos = [...document.querySelectorAll('button, [role="button"], span')]
        .filter(n => TEXTOS.deslikear.includes(n.textContent.trim()) && esOtro(n));
      if (candidatos.length) return { confirmar: candidatos[candidatos.length - 1] };
      if (buscarPorTexto(TEXTOS.seleccionar)) return { sinConfirmar: true };
      return null;
    });
    if (!resultado) throw new Error('Toqué "Ya no me gusta" pero no pasó nada. Fijate qué muestra la página.');
    if (resultado.confirmar) {
      (resultado.confirmar.closest('button, [role="button"]') || resultado.confirmar).click();
    }

    // Esperamos a que Instagram termine y vuelva a mostrar "Seleccionar"
    await esperar(() => buscarPorTexto(TEXTOS.seleccionar), 15000);
    await sleep(2000);
    return aMarcar.length;
  }

  // ---------- Loop principal ----------
  async function main() {
    let total = 0;
    log(`Arranco. Tanda: ${CONFIG.porTanda}, tope: ${CONFIG.maxPorCorrida}. Para frenar: frenarDeslikeo()`);

    while (!frenar && total < CONFIG.maxPorCorrida) {
      if (hayBloqueo()) {
        log('Instagram pidió que esperes. Corto acá, seguí mañana.');
        break;
      }

      const n = Math.min(CONFIG.porTanda, CONFIG.maxPorCorrida - total);
      try {
        total += await tanda(n);
      } catch (e) {
        log('Paré:', e.message);
        break;
      }

      log(`Tanda lista. Total en esta corrida: ${total}`);
      if (frenar || total >= CONFIG.maxPorCorrida) break;

      const p = Math.round(azar(CONFIG.pausaEntreTandas));
      log(`Pausa de ${p}s...`);
      await pausa(p);
    }

    log(`Terminé. Deslikeados en esta corrida: ${total}`);
  }

  main();
})();
