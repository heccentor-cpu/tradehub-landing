# Harness Engineering: Cómo Construir Software Cuando los Humanos Dirigen y los Agentes Ejecutan

**Ponente:** Ryan Lopopolo, OpenAI
**Video:** https://www.youtube.com/watch?v=am_oeAoUhew
**Duración:** 46:21

---

## FRAMEWORK: Pasos Exactos para Armar tu Harness

> Extraído de la charla de Ryan Lopopolo. Adaptado para que puedas alimentar tu base de conocimiento desde videos y documentación sin escribir tanto.

---

### PASO 1: Cambia tu mentalidad — El código es gratis

- La implementación ya no es el recurso escaso. El código es gratis de producir, refactorizar y borrar.
- Tu rol cambia de "escribir código" a **diseñar sistemas, delegar y orquestar**.
- Los recursos escasos ahora son: **tiempo humano**, **atención** (humana y del modelo), y **ventana de contexto**.
- Cada tarea P3 que nunca se haría, ahora se lanza en paralelo con agentes.

---

### PASO 2: Estructura tu repositorio para los agentes, no para ti

- **Un solo lenguaje**, una sola forma de escribir CI, una sola forma de hacer helpers.
- Organiza en **paquetes pequeños** aislados por dominio de negocio o capa del stack.
- El código en el filesystem ES texto = ES prompt para el agente. Si todo se ve igual, el agente transfiere contexto entre cualquier parte del repo.
- Limita archivos a ~350 líneas con un test que lo valide.
- Elimina duplicación de schemas (Zod, tipos, helpers async).

---

### PASO 3: Escribe documentación como prompts, no como prosa

Lo importante no es el código sino **el prompt y los guardrails que lo produjeron**:

1. **ADRs** (Architecture Decision Records) — por qué se tomó cada decisión.
2. **Documentación por persona** — qué significa "buen trabajo" desde cada ángulo:
   - Arquitecto frontend
   - Ingeniero de confiabilidad
   - Ingeniero de escalabilidad
   - Mente de producto
3. **Plan de QA** — documenta features, journeys críticos del usuario, y qué evidencia (screenshots, logs) debe acompañar cada PR.
4. **Skills** (5-10 máximo) — no vayas amplio, haz que los existentes sean mejores.

---

### PASO 4: Inyecta prompts en cada capa del proceso

Ryan identifica que cada avance viene de encontrar **nuevos puntos de inyección de prompts**:

| Punto de inyección | Qué hace |
|---|---|
| `CLAUDE.md` / `agents.md` | Instrucciones base al iniciar |
| **Skills** | Enseñan al agente a lanzar la app, levantar observabilidad, conectar DevTools |
| **Reglas ESLint custom** | Lints con mensajes de error que son prompts de remediación |
| **Tests sobre el código fuente** | No testean comportamiento, testean ESTRUCTURA (largo de archivos, privacidad de paquetes, duplicación) |
| **Agentes revisores en CI** | Se disparan en cada push, revisan contra la documentación de "qué es buen código" |
| **Comentarios en PR** | Feedback que el agente implementador debe abordar antes de proponer merge |

**Clave:** Los mensajes de error de lints y tests deben dar **pasos de remediación concretos**, no solo decir "falló".

---

### PASO 5: Ciclo de mejora continua — "Garbage Collection Day"

Cada viernes (o el día que elijas):

1. **Observa** — Revisa todo el "slop" (código mediocre) que viste en la semana.
2. **Categoriza** — Agrupa por tipo de falla (seguridad, confiabilidad, estructura, UX).
3. **Elimina la clase de error** — No corrijas la instancia, escribe un lint/test/doc que elimine esa categoría completa para siempre.
4. **Cierra el loop** — El feedback humano en code review → se convierte en documentación → se convierte en test/lint automático → el agente se auto-corrige.

---

### PASO 6: El flujo de trabajo diario

```
Ticket (Linear/GitHub Issue)
    ↓
Agente recibe ticket + skills relevantes
    ↓
Agente lanza la app (skill), levanta observabilidad (skill), abre DevTools (skill)
    ↓
Agente implementa, corre tests, itera
    ↓
Push → CI dispara agentes revisores (seguridad, confiabilidad, arquitectura)
    ↓
Agente implementador responde al feedback (acepta, difiere o rechaza)
    ↓
PR lista → merge rápido (no bloquear en review humano)
```

**Meta:** Cada vez que tengas que escribir "continue" al agente, es una falla del harness que debe corregirse.

---

### PASO 7: Escala — De 1 agente a 50

- No uses plan mode si no vas a leer el plan (le metes instrucciones basura).
- Si usas plan, súbelo como PR separado y revísalo línea por línea antes de ejecutar.
- Divide tu presupuesto de tokens en tercios: **⅓ planificación/tickets/docs**, **⅓ implementación**, **⅓ CI/review**.
- El futuro: defines el trabajo del trimestre, das métricas de éxito, y los agentes avanzan el producto sin intervención.

---

## TU PIPELINE: De Video → Base de Conocimiento → Harness

Para que no tengas que escribir tanto, este es el flujo que acabamos de validar:

```
1. VIDEO (YouTube, Loom, grabación)
      ↓
2. markitdown + youtube-transcript-api
      → Transcripción con timestamps
      ↓
3. Claude extrae:
      → Principios (como los 7 pasos arriba)
      → Decisiones de arquitectura (ADRs)
      → Patrones y anti-patrones
      → Skills necesarios
      ↓
4. Se guardan como archivos .md en el repo:
      → /docs/adrs/
      → /docs/personas/
      → /docs/qa-plans/
      → CLAUDE.md / AGENTS.md (actualizados)
      ↓
5. Lints y tests validan que el código siga los principios
      ↓
6. Agentes revisores en CI consumen esos docs automáticamente
```

---

## Transcripción Completa Traducida

**[00:00]** Nuestro siguiente ponente está aquí para hablar sobre harness engineering. Cómo construir software cuando los humanos dirigen y los agentes ejecutan. Acompáñenme a darle la bienvenida al escenario a un miembro del staff técnico de OpenAI, Ryan Lopopolo. [aplausos] Buenos días, Londres. [aplausos] Estoy súper emocionado de estar aquí hoy. Soy Ryan Lopopolo y durante los últimos nueve meses he tenido el privilegio de construir software exclusivamente con agentes. Soy un billonario en tokens y creo que para llegar a nuestro futuro de AGI,

**[01:02]** queremos que todos sean billonarios en tokens — que usen los modelos para hacer el trabajo completo. Lo que eso significa es adoptar la idea de que los modelos son capaces de ser un ingeniero de software completo. He vivido esa experiencia prohibiéndole a mi equipo siquiera tocar sus editores, obligándolos a trabajar a través de los modelos para hacer el trabajo. Hoy les voy a hablar un poco sobre lo que significa adoptar eso y operacionalizar la forma en que trabajan, los espacios de código en los que viven, y los procesos en sus equipos para que los agentes hagan el trabajo completo. Creo que aquí estoy predicando al coro cuando digo que la forma en que construimos software ha cambiado. En los últimos seis meses, hemos visto a los agentes de código apoderarse del mundo y la capacidad ha avanzado continuamente a un ritmo súper rápido para que estos modelos y los harnesses en los que viven tomen acciones más complejas, hagan trabajo más complicado con mayor confiabilidad

**[02:04]** durante horizontes de tiempo más largos. Y el punto al que hemos llegado es que la implementación ya no es el recurso escaso de lo que significa hacer el trabajo de ingeniería de software. El código es gratis. Tenemos abundancia de código para resolver los problemas que encontramos en nuestro día a día mientras dirigimos nuestros equipos, construimos software y resolvemos problemas de usuarios. Contratar las manos en los teclados como parte de nuestros equipos solo está limitado por la capacidad de GPU y presupuestos de tokens. Y cada ingeniero hoy en esta sala tiene acceso a cinco, 50 o 5,000 ingenieros de capacidad las 24/7 todos los días del año. Lo único que necesita pasar — nuestro rol — es descubrir cómo desplegar productivamente estos recursos en nuestro código y en nuestros equipos para aprovechar esta nueva capacidad. Y en este mundo, las habilidades se están moviendo más hacia el pensamiento sistémico,

**[03:04]** diseño de sistemas y delegación para aprovechar esta capacidad abundante de producir código para resolver problemas. Y hay tres razones por las que esto sucedió. Todas ocurrieron a finales de 2025. Para mí, el momento mágico fue GPT 5.2, que cuando salió fue capaz de hacer el trabajo completo de un ingeniero de software. Los modelos a este punto son lo suficientemente buenos donde son isomórficos a ti y a mí en términos de la capacidad de producir código de alta calidad que resuelve problemas reales de usuarios en bases de código reales. El código es gratis. Y sé que esto puede ser algo aterrador de escuchar porque el código carga con costo de mantenimiento, pero es gratis de producir, gratis de refactorizar, y ya no es algo en lo que debamos estancarnos. Pensamos en el código como carga porque es un drenaje sincrónico de atención en los ingenieros humanos de nuestro equipo. Pero los modelos son increíblemente pacientes. Son

**[04:04]** infinitamente paralelos. Así que la capacidad de producir, mantener, refactorizar y borrar código ya no es una función forzante para decidir cómo asignar recursos en tus equipos de ingeniería. Así que la "pastilla AGI" aquí es creer que los modelos son capaces de producir cada línea de código que podríamos necesitar, descubrir cuándo borrarlas, cuándo refactorizarlas o hacerlas más confiables. Y tu rol como ingeniero de software es descubrir cómo desbloquear a tu equipo de agentes y humanos que conducen esos agentes para poder llevarlos sobre trabajo de horizonte largo a hacer el trabajo completo. La idea aquí es que cada uno de ustedes es un staff engineer. Tienen tantos miembros de equipo como puedan conducir concurrentemente y tengan tokens para soportar, y necesitan mirar un día, una semana, seis meses hacia el futuro para descubrir qué estructuras necesitan poner en su lugar para productivamente aprovechar esta infinita

**[05:05]** capacidad de producir código. Los recursos escasos en este mundo que vemos hoy son tres cosas: tiempo humano, atención humana y del modelo, y ventana de contexto del modelo. En el mundo donde el tiempo y la atención humana son escasos, el rol es pensar en dónde se está yendo ese tiempo, descubrir formas de automatizarlo productivamente y mover ese tiempo humano sincrónico a actividades de mayor apalancamiento. En un mundo donde el tiempo humano es escaso y se requiere tiempo humano para producir código, tenemos un stack rank. Las cosas son P0 o P2. Esos P3 nunca se van a hacer. Sin embargo, en un mundo donde el código es gratis e infinitamente abundante, todos esos P3 se lanzan inmediatamente, quizás 4x en paralelo. Elegimos el que resuelve el problema y entra.

**[06:06]** He tenido el privilegio de construir un montón de agentes internamente en OpenAI para mejorar la productividad de mis compañeros. Y cuando el código es gratis, todas estas herramientas internas pueden tener buena localización e internacionalización desde el día uno. Puedo hacer herramientas que mis colegas en Londres, Dublín, París, Bruselas, Zúrich y Múnich puedan experimentar en sus idiomas nativos sin realmente tener que sacrificar la capacidad de mis otros equipos para hacer herramientas de alta calidad. Deberíamos trabajar con la suposición de que las mejores partes de la ingeniería de software que todos conocemos, vivimos y respiramos están disponibles en cualquier producto que podamos construir todo el tiempo. Los humanos ya no necesitan preocuparse por la implementación. Lo importante no es el código sino el prompt y los guardrails que te llevaron ahí. Por eso dejar migas de pan, documentación, ADRs, documentación orientada a personas

**[07:07]** sobre cómo se ve un buen trabajo. Todos los registros históricos de tickets y code reviews. Este es el proceso que te llevó a ti y a tus equipos al código y productos que tienen hoy. Y esto es lo que necesita pasar para llevar a tus agentes ahí también. Tu trabajo es construir sistemas, software y estructuras que permitan a tu equipo ser exitoso. Y para hacer eso, necesitamos hacerlos legibles para esos agentes que están conduciendo la implementación. Eso significa estructurarlos de una forma que sea nativa para los agentes. Escribirlos de una forma que respete el contexto escaso, que es este otro recurso escaso, y descubrir formas de hacer que los tokens requeridos para hacer el trabajo sean fáciles de predecir. Eso significa hacer las cosas lo más iguales posible para que podamos limitar la cantidad de atención que el modelo necesita activar para hacer el trabajo. La refactorización a gran escala en este mundo es gratis. Así que hacer las cosas iguales es algo que todos ustedes pueden hacer.

**[08:07]** Ya no va a haber una migración que se quede abierta por seis meses porque no puedes hacer que las últimas partes del codebase lo hagan — simplemente lanzas 15 agentes para completar ese trabajo. Esto es lo que significa tener una migración, ¿verdad? Ahora podemos terminarlas. [aplausos] Hay una especie de pregunta meta-epistemológica aquí sobre qué significa hacer un buen trabajo, y hacer un buen trabajo como ingeniero de software es difícil. Nos toma años en la industria para internalizar completamente qué significa escribir código de alta calidad, mantenible, confiable, que nuestros compañeros puedan construir sobre él y que vaya a acumular apalancamiento al codebase. Hacer un solo parche probablemente requiere 500 pequeñas decisiones alrededor de los requerimientos no funcionales sub-especificados que van en producir buen código. Los agentes, los modelos durante su entrenamiento han visto

**[09:09]** trillones de líneas de código que toman cada posible decisión de esos requerimientos no funcionales que podrías imaginar. Así que es nuestro trabajo especificar esos requerimientos no funcionales, escribirlos de una forma que los agentes puedan ver: esto es lo que significa hacer un buen trabajo aceptable que va a producir un parche mergeado. Y si los agentes no están haciendo eso, es nuestro trabajo descubrir formas de refinar y restringir su output para que el código que escriban sea aceptable. Simplemente puedes decir "no produzcas slop". No aceptes slop. No vas a tener slop en tu codebase. Pero hacer eso requiere tomar golpes a la velocidad en el corto plazo para retroceder o hacer doble clic en una tarea para descubrir con qué están luchando los agentes en tu entorno. Pon los guardrails para que dejen de cometer esos errores y luego descubre formas de dar un paso atrás y gastar tu tiempo en actividades de mayor apalancamiento una vez que resuelvas algunos de los bloqueadores en el corto plazo.

**[10:09]** Cuando pienso en empoderar a mi equipo de esta forma, cada uno es un experto en lo que trae. Tengo un equipo full stack diverso que son expertos en arquitectura frontend, escalabilidad backend, mentalidad de producto. Y cada una de esas diferentes personas enriquece el skill set de mi equipo trayendo un entendimiento diferente, un conjunto diferente de soluciones para esos requerimientos no funcionales. Hacer que los compañeros escriban eso realmente significa que cada ingeniero conduciendo agentes obtiene lo mejor de cada persona en mi equipo. No necesito bloquearme en code review de baja señal para aprender qué significa escribir un buen plan de QA. Que un ingeniero en mi equipo documente eso de forma durable significa que cada trayectoria de agente va a obtener un buen plan de QA. Y podemos hacer esto una vez de forma de alto apalancamiento sobre la cual podemos seguir apilando. ¿Cómo podemos hacer que los agentes hagan un buen trabajo? ¿Cuáles son algunas de las herramientas y técnicas que tenemos para

**[11:12]** esencialmente prompt-inyectar nuestros agentes y continuamente recordarles qué significa tomar esas decisiones específicas que esperamos alrededor de esos requerimientos no funcionales? Y hay varias formas de hacer esto. Podemos escribir buenos archivos agents.md. Sin embargo, con la auto-compactación, que es algo que ha continuado mejorando — GPT 5.4 y Codex son fantásticos en auto-compactación — esencialmente nunca tengo que escribir /new ya. Tengo algunas fotos en mi Twitter de mí amarrando mi laptop en el asiento trasero de mi carro para poder seguir corriendo inferencia mientras voy y vengo del trabajo. Y en este mundo, tienes que construir para esa expectativa de que el contexto se va a paginar con el tiempo. Necesitamos estar continuamente refrescando el contexto mientras el agente realiza una tarea. Y las formas en que podemos hacer eso son teniendo agentes revisores que miren el código a lo largo del camino a través del lente de qué significa ser exitoso. Tenemos agentes de revisión de seguridad y confiabilidad

**[12:12]** en nuestro codebase que están continuamente corriendo como parte de cada push y CI que miran esa documentación y el parche propuesto y hacen cosas simples como decir: ¿hay timeouts y retries en este código de red? ¿El código que se ha introducido tiene una interfaz segura que es imposible de mal usar? Estoy seguro de que todos aquí han sido paginados en algún momento por código de red que falló en producción causando una caída que podría haber sido remediada con un retry y un timeout. Y sé que soy culpable de poner ese retry y timeout, mergear el bug fix y de otra forma ignorarlo. No soy un revisor o autor confiable de código con respecto a este requerimiento no funcional. Sin embargo, tomar el tiempo de escribir algunos docs, escribir un lint que sea específico para mi codebase que vaya a mirar cada vez que llamo fetch para asegurarse de que haya un retry y un timeout envuelto significa que he resuelto este problema durablemente y puedo hacerlo porque me apoyo en este axioma de que el código es gratis,

**[13:15]** que los agentes son capaces de hacer un buen trabajo, que puedo migrar completamente el codebase para resolver este problema durablemente de una vez por todas. Y para operar de esta forma, necesitamos dar un paso atrás y mirar las clases durables de fallas que los agentes y los humanos en el codebase están cometiendo una y otra vez. Descubrir por qué estamos gastando tiempo en ello. Idear una solución para eliminar sistemáticamente esta clase de mal comportamiento y luego continuar observando, refinando y tomando decisiones adicionales sobre esos requerimientos no funcionales. Un truco muy bueno que uso aquí es que puedes escribir tests sobre el código fuente también, que son separados de los lints. Si sabemos que el contexto es limitado, podemos escribir un test que limite que los archivos no sean más largos de 350 líneas. Estamos adaptando nuestro codebase al harness, a los modelos, haciendo un poco de ingeniería para ser eficientes con el contexto y exprimir más jugo de

**[14:17]** la capacidad del modelo que tenemos hoy. Las otras cosas en las que podemos pensar son proveer buenos mensajes de error que den pasos reales de remediación al modelo y a los humanos sobre cómo proceder. No es suficiente decir que tenemos un fallo de lint porque estamos usando await en un loop o que tenemos un unknown en esta parte profunda del codebase. Lo que necesitamos hacer es proveer un prompt vía un lint o un fallo de test que diga: no, no, no, no deberías tener un unknown aquí porque parseamos, no validamos en el borde, y ciertamente tienes un tipo aquí que fue derivado de Zod — infraestructura clave para nuestro futuro de IA. Simplemente puedes promptear cosas. Lo que he hablado aquí hoy es un prompt. Puedes hacer esto sin tocar los pesos del modelo en absoluto.

**[15:19]** Una digresión graciosa aquí: parece que cada avance que hemos tenido en la complejidad de cómo escribimos código para interactuar con estos modelos viene tanto de la capacidad creciente en los modelos como de formas cada vez más nicho de inyectar prompts en esos modelos. Los prompts que seguramente conocen son: prompts de sistema, prompts de rules files, prompts de skills, estos mensajes de error de lint de los que hablo son prompts, agentes revisores que inyectan comentarios en el PR que requerimos que el agente aborde antes de que pueda proponerlo para merge — prompts. Vas a encontrar muchas formas de insertar prompts en tu código. Y una forma de hacerlo es embebiendo agent SDKs en tus tests que van a revisar el codebase para aceptabilidad usando prompts que se embeben en el código. Y si me encuentro gastando un montón de tiempo escribiendo prompts, también podemos delegar eso al agente. He apuntado a Codex a todos

**[16:23]** los cookbooks de prompting que tenemos en la guía de desarrolladores de OpenAI y le he dicho que sintetice un skill a partir de ellos sobre cómo escribir prompts. Lo que significa que cuando encuentro la necesidad de escribir prompts para mejorar el rendimiento de mi agente localmente en el código, uso el skill para escribir prompts que escribí con el agente mirando los prompts para escribir los prompts. [risas] Todo el apalancamiento que estás codificando en tu repositorio, tu equipo y los agentes de esta forma se apila increíblemente bien. Para volver a esta idea de que un solo ingeniero con mentalidad de producto en mi equipo fue capaz de darnos un gran impulso. Saben qué significa escribir un buen plan de QA. Para escribir un buen plan de QA, sin embargo, tienes que documentar todas las features que tienes, los journeys críticos del usuario, y cómo los usuarios interactúan con tus aplicaciones, web apps, APIs y servicios. Una vez que escribes eso sobre cómo escribir un buen plan de QA con la expectativa de que todo trabajo que toca al usuario tiene

**[17:24]** un plan de QA, ahora un agente revisor puede hacer valer expectativas sobre qué significa probar que has escrito la feature efectivamente. Un plan de QA indica qué media debería adjuntarse al PR para que los humanos y agentes sepan que hiciste un buen trabajo, lo que tiene la consecuencia de que yo confíe más en el output, necesite supervisar al agente menos, y me remueva del loop aún más para delegar más y más trabajo a los agentes. Y todo esto es simplemente asegurarse de que los agentes tengan las herramientas, tokens y contexto para hacer el trabajo completo, para removerme de la necesidad como conductor sincrónico. Los modelos anhelan tokens. Podemos operacionalizar nuestro codebase para darles tokens que los impulsen hacia adelante usando sub-agentes y todas estas otras técnicas para refinar el output del agente. Estoy emocionado de dejarles saber hoy que de la forma que todos lo hacen, simplemente pueden

**[18:24]** construir cosas. No duden en removerse del loop haciendo que los agentes hagan el trabajo completo porque pueden. Gracias.

---

### Sesión de Preguntas y Respuestas

**[18:24]** *Moderador:* Ryan acaba de dar la keynote. El hombre está full send hyperengineering en OpenAI. Es un billonario en tokens gastando más de un billón de tokens de output al día. Eso es como más de $1,000.

**[19:27]** *P: ¿Puedes mostrarnos tu setup de trabajo real?*
**R:** [muestra foto] Playa, margarita, Linear. La forma en que mi equipo y yo trabajamos es empezar con tickets. Tenemos chunks de trabajo que queremos hacer, features que queremos agregar. Le damos ese ticket a un agente junto con un par de skills que le permiten manipular nuestra app. Queremos que el punto de entrada al proceso de desarrollo sea Codex, no un entorno que construimos alrededor. Así que hacemos las cosas de afuera hacia adentro — Codex es el punto de entrada de la misma forma que tú lo serías. Le damos herramientas, le damos instrucciones de cómo cocinar. Tenemos un skill que enseña a Codex cómo lanzar la app, cómo levantar el stack de observabilidad local, cómo bootear Chrome DevTools y conectarse a la aplicación.

**[21:28]** Toda la forma en que hemos configurado el repositorio y las herramientas de dev local es para que Codex las invoque primero. Tenemos un gran paquete de reglas ESLint custom que se conectan a cada paquete PNPM en el workspace. Tenemos otro harness de dev local que permite agregar tests de nivel más alto que verifican la estructura del código en sí — como privacidad de paquetes, bordes de dependencias entre capas del stack, deduplicación de schemas Zod, una sola implementación canónica de helpers async. Porque hemos visto que los agentes a veces optimizan para coherencia local de un paquete en vez de usar las utilidades compartidas. Habiendo observado ese comportamiento, construimos pseudo-linters de verificación de código fuente que eliminan ese mal comportamiento.

**[22:28]** Centralizamos nuestro apalancamiento alrededor de 5 a 10 skills. No vamos súper amplio en skills, preferimos hacer que los existentes sean mejores. Al menos yo encuentro que la infraestructura dentro del repositorio cambia súper frecuentemente y no tengo el ancho de banda para mantener el paso. Escondemos toda esa complejidad debajo de los skills que el humano tiene que invocar y dejamos al agente que lo resuelva. Una cosa interesante: cuando nos movimos de usar Chrome DevTools Protocol directamente a tener esta cosa de daemon, ni siquiera supe que había pasado por como tres semanas. Fue totalmente bien porque Codex podía hacer la cosa con la documentación que teníamos.

**[23:30]** *P: ¿Cómo evitas sobre-ingeniar los harnesses?*
**R:** Haz el mínimo necesario de gestión de contexto para darle al agente los requerimientos para hacer un trabajo aceptable. El contexto nunca va a ser obsoletado — los modelos deben ser informados de los requerimientos de la tarea, a qué guardrails prestar atención. Un buen harness está operacionalizado alrededor de darle al modelo texto en el momento correcto. No quieres frontloadear todas las instrucciones porque abrumas al agente. Pero todos los requerimientos sobre qué es un buen trabajo necesitan atenderse durante todo el curso de un PR. Descubre formas de diferir o surfear just-in-time esas instrucciones.

**[25:31]** *Ejemplo concreto:* Si quieres que tus componentes React se descompongan para buenos snapshot tests, no cargues eso al inicio. Deja al agente cocinar y prototipar. Luego, al momento de lint o test, di: "Ya hiciste el trabajo. Para terminarlo, descompón esto para que tus componentes sean pequeños, lo más stateless posible, con dependencias locales en hooks en vez de prop drilling." El agente dirá: "Oh, esta es una nueva instrucción. Déjame modificar el parche para adherirse a ella." Y arriba va a GitHub.

**[26:32]** *P: ¿Qué opinas de los harnesses de Codex vs Claude Code vs Open Code?*
**R:** Los labs no solo están post-entrenando los modelos, sino post-entrenándolos en el contexto del harness en el que se despliegan. La herramienta apply-patch, la semántica específica de cómo invocar la herramienta bash — están en el loop del post-entrenamiento. Hay apalancamiento en depender de harnesses de primera parte. Mi trabajo puede moverse a pensar en diferencias de comportamiento del modelo entre releases en vez de entender profundamente las tuercas y tornillos del harness.

**[28:35]** *P: ¿Plataforma de colaboración recomendada?*
**R:** Archivos markdown en el repositorio y GitHub. Un PR tiene un propósito similar a un Google Doc — un ambiente limpio para un artefacto de trabajo donde agentes y humanos colaboran juntos. Optimizamos para throughput, no bloqueamos en ninguna contribución. El agente implementador puede aceptar, diferir o rechazar cualquier feedback. No pongas al modelo en una caja. No seas súper prescriptivo con "cada bit de feedback debe ser atendido" — eso tiene un modo de falla catastrófico donde tu agente de código es bullied por todos los revisores. Queremos sesgar hacia código aceptado, no perfecto.

**[29:36]** *P: ¿Cómo debería la gente empezar a usar agentes de código?*
**R:** Dos formas:
1. **Usa agentes para mejorar tu confianza en el código actual.** Más tests es bueno. Los agentes son excelentes mirando código existente con contexto de cómo se usa y escribiendo tests que verifican ese comportamiento. Esto también aumenta la capacidad del agente de navegar el código exitosamente.
2. **Mira dónde estás gastando tu tiempo.** ¿Mirando el editor escribiendo código? ¿Esperando que corran tests? ¿Esperando review humano? ¿CI es lento? ¿Tienes tests flaky? Usa los agentes para automatizar incrementalmente las partes donde gastas tu tiempo.

**[32:43]** *P: ¿Cómo trabajas con agentes en tu carro?*
**R:** Lanzo una tarea justo antes de salir de la oficina, conecto mi laptop al tethering de mi teléfono, la amarro en el asiento trasero, y la dejo cocinar los 30 minutos que me toma llegar a casa. Con los skills que invocamos que le dicen al agente "estás operando en una tarea, sigue hasta que los tests estén verdes", no tengo que estirarme para apretar "sí, continúa". El sueño es tener 50 agentes corriendo 24/7 sin tener que interactuar con ellos. **Cada vez que tengo que escribir "continue" al agente es una falla del harness para proveer suficiente contexto sobre qué significa continuar hasta la completación.**

**[33:44]** *P: ¿Cómo escalas el conocimiento organizacional?*
**R:** Empecé con un repo en blanco, create-electron-app, un solo paquete — y terminé con un desastre. Así que fuimos full 10,000-engineer org pesado en arquitectura: 750 paquetes en el workspace de PNPM, aislados por dominio de negocio o capa del stack, paquetes de utilidades pequeños e individuales que encapsulan funcionalidad reutilizable. Estructura tu código para que sea local a un subárbol del repositorio para la mayoría de formas en que interactuarías con ese sistema. Ten una sola forma de hacer cada cosa. Empodera a alguien en tu equipo para ser un "dictador" que diga: así se debe hacer.

**[36:49]** *P: ¿Cómo abordas code review con tanta velocidad?*
**R:** Con cada ingeniero produciendo 3-5 PRs por día, incluso en un equipo de tres, los merge conflicts eran miserables. Nos movimos en dos direcciones: arborizar más el código para minimizar conflictos, y minimizar el tiempo que los PRs estaban abiertos. El bloqueador era el review humano. Así que implementamos "Garbage Collection Day" los viernes: todo el trabajo era tomar cada bit de slop observado en la semana y descubrir formas de eliminarlo categóricamente. El feedback humano en code review → documentación en el repo → test/lint automático → el agente se auto-corrige. Categorizamos el feedback por persona (arquitecto frontend, ingeniero de confiabilidad, escalabilidad) y para cada persona, levantamos un agente revisor que se dispara en cada push.

**[39:54]** *P: ¿Cómo se distribuyen tus mil millones de tokens?*
**R:** Probablemente un tercio, un tercio, un tercio entre: planificación/curación de tickets/documentación, implementación, y cosas que corren en CI.

*P: ¿Usas plan mode?*
**R:** No realmente. Mi expectativa es que debería poder soltar un ticket y que haga el trabajo sin desviar por un plan. Porque la mayoría del tiempo nunca lo voy a leer. Si usas un plan y lo apruebas sin leerlo, estás codificando un montón de instrucciones que no necesariamente quieres que se sigan. Si vas a usar planes, mi recomendación es subirlos como PRs individuales con solo el plan, donde realmente tengas review humano de cada línea y bloquees en aprobación humana antes de que se mergeen y se lancen.

**[41:57]** *P: ¿El código es un artefacto de build desechable?*
**R:** Sí. Usar LLM como "compilador difuso" es un modelo mental interesante. Todo el contexto que ponemos en el codebase para harness engineering es efectivamente como constraints y pasadas de optimización sobre qué código es aceptable construir. Es similar al análisis estático y pasadas de optimización que algo como LLVM haría compilando código Rust. Cambiar un modelo por otro es como cambiar tu backend de generación de código de LLVM a Cranelift — esperarías que todas las reglas sobre qué es código Rust aceptable produzcan código máquina válido aunque el proceso de generación sea diferente.

**[43:01]** *P: ¿Qué futuro estás construyendo?*
**R:** El futuro que quiero construir es donde puedo tomar un presupuesto de tokens y un trimestre, medio año o un año de trabajo, tomar el input humano para rankear qué es más importante, métricas de éxito, métricas de confiabilidad, dárselo a las máquinas y que continuamente trabajen y avancen mi producto. Sin mis manos explícitamente en el volante. A medida que hemos pasado de prototipado muy temprano a alpha interno, beta interno, alpha externo, he sentido que nuevas partes del proceso de ingeniería de software han empezado de cero y hemos tenido que construir capacidad. Cuando llegamos a software desplegado por primera vez, la capacidad del agente para hacer QA y smoke testing en nuestros artefactos construidos era débil. No habíamos invertido tiempo en esto. No había docs. No había herramientas que los agentes pudieran usar para descargar el artefacto, lanzarlo, verificar los journeys críticos del usuario.

**[45:02]** Hay todo un universo de ingeniería de software fuera de escribir código. Estoy triageando feedback de usuarios. Estoy triageando alertas. Estoy asegurándome de que no haya PII fugándose en los logs en producción. Estoy asegurándome de que las vibes en Twitter estén bien. Que nuestro personal de operaciones de usuario esté soportado con runbooks bien escritos que les permitan triagear y mitigar problemas de alto volumen. Y luego mover eso al código para que no pasen en primer lugar. A medida que ya no tengo que producir código, mi mente puede moverse a estas actividades de nivel más alto o más "soft", pero los agentes son lo suficientemente buenos para hacer estas cosas también. Descubrir cómo escribir los procesos y los criterios de aceptación se convierte en la parte de meta-programación del trabajo usando estos agentes.

**[46:13]** *Moderador:* Qué futuro tan emocionante. Un aplauso para Ryan. [aplausos]
