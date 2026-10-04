/* ClimaLab — scrollytelling local sin librerías externas */
(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  // Barra de progreso global.
  const pageProgress = $('#pageProgress');
  const updatePageProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    pageProgress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  };
  window.addEventListener('scroll', updatePageProgress, { passive: true });
  window.addEventListener('resize', updatePageProgress);
  updatePageProgress();

  // Navegación móvil.
  const menuToggle = $('#menuToggle');
  const nav = $('#mainNav');
  menuToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.textContent = open ? '×' : '☰';
  });
  $$('a', nav).forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.textContent = '☰';
  }));

  // Mantenimiento: el progreso de scroll activa una etapa y desplaza piezas ilustradas.
  const maintCards = $$('.step-card');
  const maintParts = {
    shell: $('.part-shell'), filter: $('.part-filter'), coil: $('.part-coil'),
    fan: $('.part-fan'), chassis: $('.part-chassis'), drain: $('.part-drain')
  };
  const maintOffsets = [
    {shell:[0,0,0],filter:[0,0,0],coil:[0,0,0],fan:[0,0,0],chassis:[0,0,0],drain:[0,0,0]},
    {shell:[-18,-115,-5],filter:[0,0,0],coil:[0,0,0],fan:[0,0,0],chassis:[0,0,0],drain:[0,0,0]},
    {shell:[-18,-115,-5],filter:[105,-30,9],coil:[0,0,0],fan:[0,0,0],chassis:[0,0,0],drain:[0,0,0]},
    {shell:[-18,-115,-5],filter:[105,-30,9],coil:[-105,10,-8],fan:[0,0,0],chassis:[0,0,0],drain:[0,0,0]},
    {shell:[-18,-115,-5],filter:[105,-30,9],coil:[-105,10,-8],fan:[125,40,10],chassis:[0,0,0],drain:[0,0,0]},
    {shell:[-18,-115,-5],filter:[105,-30,9],coil:[-105,10,-8],fan:[125,40,10],chassis:[0,115,0],drain:[0,160,0]}
  ];
  const stepNames = ['Preparación segura','Carcasa frontal','Filtros','Evaporador','Turbina','Interior expuesto'];
  let maintIndex = 0;
  function renderMaintenance(index) {
    maintIndex = clamp(index, 0, maintCards.length - 1);
    maintCards.forEach((card, i) => card.classList.toggle('active', i === maintIndex));
    Object.entries(maintParts).forEach(([name, el]) => {
      const [x,y,r] = maintOffsets[maintIndex][name];
      el.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${r}deg)`;
      el.style.opacity = (maintIndex === 5 && ['shell','filter','coil','fan'].includes(name)) ? '.9' : '1';
    });
    $('#maintenanceCounter').textContent = `${String(maintIndex + 1).padStart(2,'0')} / 06`;
    $('#maintProgress').style.width = `${((maintIndex + 1) / maintCards.length) * 100}%`;
    $$('.scene-callout').forEach((el, i) => el.style.opacity = maintIndex === 0 ? '.75' : (i === Math.min(maintIndex - 1, 2) ? '1' : '.25'));
  }
  const maintObserver = new IntersectionObserver(entries => {
    const visible = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) renderMaintenance(Number(visible.target.dataset.step));
  }, { rootMargin: '-22% 0px -22% 0px', threshold: [0.1,0.25,0.5] });
  maintCards.forEach(card => maintObserver.observe(card));
  $('#maintPrev').addEventListener('click', () => { const n = clamp(maintIndex - 1, 0, maintCards.length - 1); renderMaintenance(n); maintCards[n].scrollIntoView({behavior:'smooth', block:'center'}); });
  $('#maintNext').addEventListener('click', () => { const n = clamp(maintIndex + 1, 0, maintCards.length - 1); renderMaintenance(n); maintCards[n].scrollIntoView({behavior:'smooth', block:'center'}); });
  renderMaintenance(0);

  // Ensamblaje inverso: cada paso aproxima las capas a su lugar final.
  const assemblyStates = [
    {caption:'Comienza con el chasis y revisa los puntos de fijación.', offsets:{shell:[0,-120],filter:[0,-70],coil:[0,-28],fan:[0,24]}},
    {caption:'Coloca y fija la turbina en su alojamiento.', offsets:{shell:[0,-120],filter:[0,-70],coil:[0,-28],fan:[0,0]}},
    {caption:'Acomoda el serpentín sin doblar las aletas.', offsets:{shell:[0,-120],filter:[0,-70],coil:[0,0],fan:[0,0]}},
    {caption:'Instala los filtros limpios y completamente secos.', offsets:{shell:[0,-120],filter:[0,0],coil:[0,0],fan:[0,0]}},
    {caption:'Encaja la carcasa y verifica que todos los seguros cierren.', offsets:{shell:[0,0],filter:[0,0],coil:[0,0],fan:[0,0]}},
    {caption:'Equipo ilustrado ensamblado. Realiza las comprobaciones indicadas por el fabricante.', offsets:{shell:[0,0],filter:[0,0],coil:[0,0],fan:[0,0]}}
  ];
  let assemblyIndex = 0;
  function renderAssembly(index) {
    assemblyIndex = clamp(index,0,assemblyStates.length-1);
    const state = assemblyStates[assemblyIndex];
    const unit = $('#assemblyUnit');
    Object.entries(state.offsets).forEach(([name, [x,y]]) => {
      const el = $(`.as-${name}`, unit);
      if (el) el.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    });
    $('.as-chassis', unit).style.transform = 'translate(-50%,-50%)';
    $('#assemblyCount').textContent = `${String(assemblyIndex+1).padStart(2,'0')} / 06`;
    $('#assemblyCaption').textContent = state.caption;
    $('#assemblyPrev').disabled = assemblyIndex === 0;
    $('#assemblyNext').textContent = assemblyIndex === 5 ? 'Volver al inicio ↻' : 'Siguiente →';
  }
  $('#assemblyPrev').addEventListener('click', () => renderAssembly(assemblyIndex - 1));
  $('#assemblyNext').addEventListener('click', () => renderAssembly(assemblyIndex === 5 ? 0 : assemblyIndex + 1));
  renderAssembly(0);

  // Instalación: activa pasos con scroll y actualiza el diagrama de pared.
  const installCards = $$('.install-step');
  const installNames = ['Selección del lugar','Colocación del soporte','Unidad interior','Paso en muro','Tuberías y drenaje','Cableado','Unidad exterior','Conexiones frigoríficas','Vacío del sistema','Comprobación de fugas','Encendido y prueba'];
  let installIndex = 0;
  function renderInstall(index) {
    installIndex = clamp(index,0,installCards.length-1);
    installCards.forEach((card,i) => card.classList.toggle('active', i === installIndex));
    $('#installCounter').textContent = `${String(installIndex+1).padStart(2,'0')} / 11`;
    $('#installLabel').innerHTML = `<span>${String(installIndex+1).padStart(2,'0')} / 11</span><b>${installNames[installIndex]}</b>`;
    $('#installProgress').style.width = `${((installIndex+1)/installCards.length)*100}%`;
    const diagram = $('#installDiagram');
    diagram.dataset.stage = installIndex;
    const indoor = $('.indoor-unit', diagram), plate = $('.mount-plate', diagram);
    const pipeA = $('.pipe-a', diagram), pipeB = $('.pipe-b', diagram), wire = $('.wire', diagram), outdoor = $('.outdoor-unit', diagram);
    plate.style.opacity = installIndex >= 1 ? '1' : '.12';
    indoor.style.transform = installIndex >= 2 ? 'translateY(0)' : 'translateY(-35px)';
    indoor.style.opacity = installIndex >= 2 ? '1' : '.65';
    const pipesOn = installIndex >= 4;
    pipeA.style.opacity = pipeB.style.opacity = pipesOn ? '1' : '.12';
    pipeA.style.height = pipeB.style.height = installIndex >= 7 ? '140px' : '80px';
    wire.style.opacity = installIndex >= 5 ? '1' : '.12';
    outdoor.style.transform = installIndex >= 6 ? 'translateY(0)' : 'translateY(28px)';
    outdoor.style.opacity = installIndex >= 6 ? '1' : '.65';
    diagram.classList.toggle('system-active', installIndex >= 10);
    $('#installPrev').disabled = installIndex === 0;
    $('#installNext').disabled = installIndex === installCards.length-1;
  }
  const installObserver = new IntersectionObserver(entries => {
    const visible = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio-a.intersectionRatio)[0];
    if (visible) renderInstall(Number(visible.target.dataset.install));
  }, {rootMargin:'-25% 0px -25% 0px', threshold:[0.1,0.3,0.55]});
  installCards.forEach(card => installObserver.observe(card));
  $('#installPrev').addEventListener('click', () => {const n=clamp(installIndex-1,0,installCards.length-1);renderInstall(n);installCards[n].scrollIntoView({behavior:'smooth',block:'center'});});
  $('#installNext').addEventListener('click', () => {const n=clamp(installIndex+1,0,installCards.length-1);renderInstall(n);installCards[n].scrollIntoView({behavior:'smooth',block:'center'});});
  renderInstall(0);


  // Listas educativas de fallas: no sustituyen el diagnóstico profesional.
  const faultData = {
    conventional: [
      ['No enciende', 'Alimentación ausente, interruptor abierto, fusible o tarjeta dañada.'],
      ['Enciende pero no enfría', 'Filtros sucios, configuración incorrecta, carga térmica alta o problema frigorífico.'],
      ['Enfría poco', 'Serpentines sucios, flujo restringido, instalación inadecuada o falla de refrigerante.'],
      ['No calienta en modo bomba de calor', 'Modo no compatible, condiciones exteriores o problema de válvula inversora.'],
      ['Se apaga solo', 'Protección activada, temporizador, sensor o alimentación inestable.'],
      ['Parpadean luces', 'Código de diagnóstico; consultar la tabla del modelo.'],
      ['Mando no responde', 'Pilas agotadas, mando incorrecto, receptor obstruido o averiado.'],
      ['No acepta temperatura', 'Modo automático, límites de ajuste o control defectuoso.'],
      ['Ventilador interior no gira', 'Motor, capacitor si aplica, obstrucción o control eléctrico.'],
      ['Ventilador interior hace ruido', 'Suciedad, turbina desbalanceada, roce o soporte flojo.'],
      ['Flujo de aire débil', 'Filtros tapados, turbina sucia o entrada/salida bloqueada.'],
      ['Gotea por el frente', 'Drenaje obstruido, bandeja sucia o unidad desnivelada.'],
      ['Drenaje devuelve agua', 'Pendiente incorrecta, manguera doblada o descarga bloqueada.'],
      ['Olor desagradable', 'Biofilm en bandeja, filtros o serpentín sucios.'],
      ['Hielo en evaporador', 'Flujo de aire bajo, sensor, condición frigorífica o temperatura de operación.'],
      ['Tubería exterior escarchada', 'Flujo, condiciones de operación o circuito frigorífico requieren diagnóstico.'],
      ['Compresor no arranca', 'Protección térmica, capacitor en modelos que lo usan, alimentación o compresor.'],
      ['Compresor arranca y se detiene', 'Sobretemperatura, presión fuera de rango, capacitor o alimentación.'],
      ['Zumbido al arrancar', 'Componente eléctrico, motor trabado o vibración mecánica.'],
      ['Golpeteo en unidad interior', 'Turbina, carcasa, soporte o pieza suelta.'],
      ['Vibración excesiva', 'Fijación floja, base desnivelada o ventilador desbalanceado.'],
      ['Unidad exterior ruidosa', 'Ventilador, panel, base, soportes o compresor.'],
      ['Se dispara el interruptor', 'Cortocircuito, fuga eléctrica, sobrecarga o protección incorrecta.'],
      ['Cable o clavija se calienta', 'Conexión floja, cable inadecuado o circuito sobrecargado; detener uso.'],
      ['Olor a quemado', 'Posible sobrecalentamiento eléctrico; desconectar de forma segura y pedir servicio.'],
      ['Salta el diferencial', 'Posible fuga a tierra, humedad o aislamiento dañado.'],
      ['Lectura de temperatura incorrecta', 'Sensor, ubicación del sensor o flujo de aire afectado.'],
      ['No cambia velocidad de ventilador', 'Control, motor o selección de modo.'],
      ['Aletas no se mueven', 'Motor paso a paso, engranes o mecanismo trabado.'],
      ['Aletas hacen clic', 'Engranes dañados, suciedad o mecanismo desalineado.'],
      ['No obedece temporizador', 'Configuración, mando o tarjeta de control.'],
      ['Reinicio después de apagón', 'Comportamiento de memoria del modelo o alimentación inestable.'],
      ['Rendimiento empeora con calor', 'Capacidad insuficiente, condensador sucio o mala ventilación exterior.'],
      ['Unidad exterior se detiene', 'Protección, sensor, ventilación bloqueada o condición ambiental.'],
      ['Condensador exterior sucio', 'Polvo, pelusa o vegetación restringen intercambio térmico.'],
      ['Aletas exteriores dobladas', 'Impacto o limpieza inadecuada; reducir daño con herramientas apropiadas.'],
      ['Fuga de agua por tubería', 'Aislamiento incompleto, condensación o drenaje mal instalado.'],
      ['Aislamiento de cobre mojado', 'Aislamiento dañado, uniones sin sellar o humedad ambiental.'],
      ['Tuberías vibran', 'Fijaciones insuficientes, contacto con estructura o resonancia.'],
      ['Capacidad no alcanza', 'Equipo pequeño para carga térmica, infiltración o instalación deficiente.'],
      ['Consume demasiado', 'Filtros sucios, uso intensivo, equipo sobredimensionado o problema de rendimiento.'],
      ['No deshumidifica bien', 'Carga térmica, velocidad, configuración o dimensionamiento.'],
      ['Se congela tras limpieza', 'Filtros húmedos/incorrectos, flujo restringido o falla preexistente.'],
      ['Se escucha silbido', 'Flujo de aire, restricción o posible ruido en circuito; requiere evaluación.'],
      ['Control muestra batería pero no funciona', 'Pilas débiles, contactos corroídos o mando averiado.'],
      ['Receptor no detecta control', 'Receptor, interferencia o mando no compatible.'],
      ['No drena en modo frío', 'Manguera tapada, pendiente insuficiente o bandeja obstruida.'],
      ['Agua cae en pared', 'Pasamuros o drenaje sin sellar, pendiente o aislamiento deficiente.'],
      ['Corrosión en unidad exterior', 'Ambiente agresivo, protección insuficiente o mantenimiento inadecuado.'],
      ['Soporte se afloja', 'Anclaje inadecuado, sustrato débil o vibración.'],
      ['Descongelamiento frecuente', 'Condiciones ambientales, flujo de aire o circuito frigorífico.'],
      ['Calienta cuando debería enfriar', 'Modo incorrecto, control o válvula inversora en equipos con bomba de calor.'],
      ['No responde tras limpieza', 'Humedad en electrónica, conectores movidos o alimentación; no energizar si está mojado.'],
      ['Protección térmica repetida', 'Ventilación deficiente, suciedad, motor o compresor con problema.'],
      ['Lecturas de presión anómalas', 'Medición y diagnóstico por técnico con instrumentos adecuados.']
    ],
    inverter: [
      ['No enciende la unidad inverter', 'Alimentación, protección, placa principal o placa de potencia.'],
      ['Código de comunicación', 'Cableado de interconexión, terminales, interferencia o placas.'],
      ['Error de voltaje alto', 'Alimentación fuera de rango o circuito de detección; diagnóstico profesional.'],
      ['Error de voltaje bajo', 'Caída de tensión, suministro inestable o placa de potencia.'],
      ['Error de corriente del compresor', 'Sobrecarga, cableado, compresor o módulo inverter.'],
      ['Protección IPM', 'Módulo de potencia, disipación térmica, alimentación o compresor.'],
      ['Error de módulo PFC', 'Etapa de corrección de factor de potencia o circuito asociado.'],
      ['Bus DC anómalo', 'Rectificación, capacitores, medición o alimentación.'],
      ['Compresor no modula', 'Sensores, placa inverter, configuración o condiciones de carga.'],
      ['Compresor no arranca', 'Protecciones, módulo de potencia, compresor o sensores.'],
      ['Compresor arranca y se detiene', 'Protección por corriente, temperatura, tensión o comunicación.'],
      ['Frecuencia limitada', 'Condiciones exteriores, demanda, sensores o protecciones del equipo.'],
      ['Enfría poco a carga alta', 'Dimensionamiento, flujo de aire, intercambio térmico o circuito frigorífico.'],
      ['Ciclos de capacidad extraños', 'Sensores, configuración, carga térmica o control electrónico.'],
      ['Ventilador exterior no gira', 'Motor DC, cableado, sensor de posición o placa de control.'],
      ['Ventilador exterior gira a tirones', 'Motor, señal de control, conectores o placa.'],
      ['Ventilador interior no regula', 'Motor DC, señal de mando o placa interior.'],
      ['Error de sensor de descarga', 'Sensor fuera de rango, conector o ubicación.'],
      ['Error de sensor de serpentín', 'Termistor, conector, cableado o lectura fuera de rango.'],
      ['Error de sensor ambiente', 'Termistor, ubicación, cable o entrada de placa.'],
      ['Sensor de corriente anómalo', 'Circuito de medición, conectores o placa electrónica.'],
      ['Error de temperatura del módulo', 'Disipador sucio, ventilación, pasta térmica o módulo defectuoso.'],
      ['Sobretemperatura de compresor', 'Flujo de refrigerante, ventilación, carga térmica o sensor.'],
      ['Protección por alta presión', 'Condensador sucio, ventilación exterior o circuito frigorífico.'],
      ['Protección por baja presión', 'Fuga, obstrucción, condiciones de operación o sensor.'],
      ['Detección de fuga de refrigerante', 'Posible fuga o algoritmo de detección; confirmar con instrumentos.'],
      ['Error de válvula de expansión electrónica', 'Bobina, cableado, atasco o control de la válvula.'],
      ['Válvula no sigue el mando', 'Conector, bobina, mecanismo o placa.'],
      ['Válvula inversora no conmuta', 'Bobina, cableado, control o válvula mecánica.'],
      ['Error EEPROM o memoria', 'Datos almacenados, placa o conexión; requiere procedimiento del fabricante.'],
      ['Error de parámetros de placa', 'Placa incorrecta, configuración o reemplazo no programado.'],
      ['Error de sincronización del compresor', 'Control inverter, cableado o motor del compresor.'],
      ['Falla de posición del rotor', 'Motor, conexión de fases, sensores internos o módulo.'],
      ['Falla de fase del compresor', 'Conexiones, módulo de potencia o bobinado.'],
      ['Aislamiento del compresor bajo', 'Posible daño de aislamiento; no energizar hasta diagnóstico.'],
      ['Capacitor del bus deteriorado', 'Capacitores o etapa de potencia; servicio técnico especializado.'],
      ['Relé de precarga falla', 'Circuito de precarga, relé o resistencia asociados.'],
      ['Puente rectificador defectuoso', 'Etapa de entrada de potencia; diagnóstico con equipo adecuado.'],
      ['Ventilación de placa insuficiente', 'Polvo, disipador obstruido o ventilación comprometida.'],
      ['Interferencia electromagnética', 'Puesta a tierra, recorrido de cables, apantallamiento o instalación.'],
      ['Comunicación intermitente', 'Conectores, cableado, ruido eléctrico o placa.'],
      ['Se reinicia sin razón aparente', 'Caídas de tensión, protección interna, placa o conexiones.'],
      ['Consumo elevado en espera', 'Configuración, placa o comportamiento propio del modelo; comparar especificaciones.'],
      ['No alcanza consigna', 'Capacidad, sensores, carga térmica, circuito frigorífico o control.'],
      ['Oscila la temperatura', 'Ubicación del sensor, control, flujo o dimensionamiento.'],
      ['Descongelamiento anormal', 'Sensores, lógica de control, flujo de aire o circuito frigorífico.'],
      ['Unidad exterior se congela', 'Condiciones ambientales, sensores, flujo de aire o refrigerante.'],
      ['Ruido tonal del compresor', 'Frecuencia de operación, montaje, tuberías o componente mecánico.'],
      ['Vibración al cambiar frecuencia', 'Soportes, tuberías, resonancia o control del compresor.'],
      ['Error tras cambiar tarjeta', 'Repuesto no compatible, parámetros, cableado o configuración.'],
      ['El equipo no acepta modo', 'Control, configuración, comunicación o función no disponible en ese modelo.'],
      ['Pérdida de potencia en calor', 'Temperatura exterior, deshielo, dimensionamiento o falla de sensores.'],
      ['Se detiene con humedad alta', 'Drenaje, sensores, protección o electrónica afectada por humedad.'],
      ['Error de puesta a tierra', 'Instalación eléctrica o detección de protección; revisión profesional.'],
      ['Daño tras sobretensión', 'Protecciones de entrada, placa inverter o electrónica.']
    ]
  };

  let faultType = 'conventional';
  const faultList = $('#faultList');
  function renderFaults() {
    const term = ($('#faultSearch').value || '').trim().toLocaleLowerCase('es');
    const data = faultData[faultType].filter(([name, desc]) => `${name} ${desc}`.toLocaleLowerCase('es').includes(term));
    faultList.innerHTML = data.map(([name, desc]) => {
      const number = String(faultData[faultType].indexOf(faultData[faultType].find(x => x[0] === name)) + 1).padStart(2,'0');
      return `<article class="fault-item"><span>${number}</span><div><h4>${name}</h4><p>${desc}</p></div></article>`;
    }).join('');
    $('#faultCount').textContent = `${data.length} de ${faultData[faultType].length} posibles fallas mostradas`;
  }
  $$('.fault-tab').forEach(button => button.addEventListener('click', () => {
    faultType = button.dataset.faultType;
    $$('.fault-tab').forEach(b => b.classList.toggle('active', b === button));
    renderFaults();
  }));
  $('#faultSearch').addEventListener('input', renderFaults);
  renderFaults();

  // Calculadora orientativa por volumen y factores que aumentan la carga térmica.
  function calculateCapacity() {
    const length = Math.max(0, Number($('#roomLength').value) || 0);
    const width = Math.max(0, Number($('#roomWidth').value) || 0);
    const height = Math.max(0, Number($('#roomHeight').value) || 0);
    const volume = length * width * height;
    const sun = $('#sunExposure').value;
    const people = $('#occupants').value;
    const use = $('#roomUse').value;
    const factor = (sun === 'high' ? 1.18 : sun === 'low' ? .9 : 1) *
      (people === 'high' ? 1.12 : people === 'veryhigh' ? 1.25 : 1) *
      (use === 'office' ? 1.1 : use === 'kitchen' ? 1.3 : 1);
    const estimated = volume * 200 * factor; // regla gruesa ilustrativa, no cálculo de carga térmica.
    let recommendation;
    if (estimated <= 7000) recommendation = '6,000–9,000 BTU/h';
    else if (estimated <= 9500) recommendation = '9,000 BTU/h';
    else if (estimated <= 12500) recommendation = '9,000–12,000 BTU/h';
    else if (estimated <= 16000) recommendation = '12,000–18,000 BTU/h';
    else if (estimated <= 22000) recommendation = '18,000–24,000 BTU/h';
    else if (estimated <= 30000) recommendation = '24,000–30,000 BTU/h';
    else recommendation = 'Requiere cálculo técnico; evaluar 30,000+ BTU/h o varias zonas';
    $('#roomVolume').textContent = `${volume.toLocaleString('es-MX',{maximumFractionDigits:1})} m³`;
    $('#capacityResult').textContent = recommendation;
    $('#capacityAdvice').textContent = `Estimación orientativa para ${volume.toLocaleString('es-MX',{maximumFractionDigits:1})} m³ con factores de ajuste básicos. Solicita una evaluación en sitio antes de comprar.`;
  }
  $('#calculateCapacity').addEventListener('click', calculateCapacity);
  ['roomLength','roomWidth','roomHeight','sunExposure','occupants','roomUse'].forEach(id => $('#'+id).addEventListener('change', calculateCapacity));
  calculateCapacity();

  // Si el usuario prefiere menos movimiento, CSS respeta esa preferencia del sistema.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) document.body.classList.add('reduced-motion');
})();
