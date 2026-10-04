CLIMALAB — CARPETA DE RECURSOS

La primera versión funciona sin imágenes, modelos 3D ni conexión a internet. Las unidades minisplit y sus piezas están dibujadas con HTML y CSS.

Para una futura versión con imágenes por capas:
- Guarda aquí archivos PNG transparentes (por ejemplo: carcasa.png, filtros.png, evaporador.png, turbina.png y chasis.png).
- Usa imágenes de tamaño y perspectiva consistentes para que las piezas encajen.
- Después sustituye las piezas CSS de .exploded-scene en index.html por elementos <img> y ajusta sus posiciones en js/script.js.

Para un modelo 3D:
- Puedes colocar un archivo .glb/.gltf aquí, por ejemplo assets/minisplit.glb.
- La versión actual no requiere Three.js ni un servidor local. Cargar módulos o recursos 3D desde file:// puede estar limitado por el navegador; para integrar un GLB con Three.js de forma fiable normalmente se recomienda servir la carpeta con un servidor local estático. Eso no implica PHP ni base de datos, pero sí cambia el requisito de abrir directamente index.html.
