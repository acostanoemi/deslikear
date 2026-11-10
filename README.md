# deslikear

Script de consola para sacar "Me gusta" de Instagram en tandas, desde la página oficial de actividad. Corre en tu propia sesión del navegador: no pide contraseña, no guarda tokens, no manda nada a ningún lado.

## Uso

1. Entrá a `https://www.instagram.com/your_activity/interactions/likes` con tu cuenta.
2. Tocá **Ordenar y filtrar**, elegí **más antiguo primero** y Aplicar. El script saca los primeros de la lista, así que con este orden arranca por los más viejos. Al recargar la página el orden vuelve al de siempre: ponelo de nuevo antes de cada corrida.
3. Abrí la consola: `F12` > pestaña **Console**. `Ctrl+L` la limpia.
4. La primera vez Chrome te pide escribir `allow pasting` antes de dejarte pegar. Escribilo a mano y Enter.
5. Pegá el contenido de `deslikear.js` y Enter.
6. Dejá la pestaña abierta hasta que diga `Terminé`. Para frenarlo antes: `frenarDeslikeo()`.

## Configuración

Los valores se cambian **en el archivo**, en el bloque `CONFIG` de arriba, antes de copiarlo. No se pegan sueltos en la consola: eso tira `SyntaxError`.

```js
porTanda: 50,                // cuántos marca por vez (Instagram permite hasta 100)
maxPorCorrida: 300,          // tope total por corrida
pausaEntreTandas: [90, 150], // segundos entre tandas
```

Para la primera prueba conviene `porTanda: 5` y `maxPorCorrida: 5`.

## Límites

Instagram frena las acciones masivas. Con los valores por defecto saca unos 300 en 15 minutos; correlo una vez por día. Si aparece el cartel de "Intentá de nuevo más tarde", el script corta solo. Al día siguiente bajá a `porTanda: 25`, `maxPorCorrida: 100` y pausas de `[180, 300]`.

## Si deja de andar

Instagram cambia su HTML seguido. El script te dice en qué paso falló:

- **No encuentra "Seleccionar" o "Ya no me gusta"**: fijate cómo dice el botón en tu cuenta y agregalo en `TEXTOS`.
- **No encuentra casillas**: click derecho sobre una casilla > Inspeccionar, copiá algún atributo identificable (`aria-label`, `data-testid`) y agregalo en `SELECTORES_CHECKBOX`.
- **"Toqué Ya no me gusta pero no pasó nada"**: cambió el cartel de confirmación. Fijate qué muestra la página en ese momento.

Los errores rojos de Instagram en la consola (`Permissions-Policy`, `ERR_NETWORK_CHANGED`, etc.) no son del script. Los mensajes propios empiezan con `[deslikear]`.

## Seguridad

Pegar código en la consola de un sitio donde estás logueado es exactamente lo que usan las estafas de "pegá esto y te doy seguidores". Este script es corto a propósito para que lo puedas leer entero antes de correrlo. No pegues versiones que te pase otra persona sin revisarlas.

## Aviso

Automatizar acciones va contra los términos de uso de Instagram. Usalo en tu propia cuenta, despacio y bajo tu responsabilidad.
