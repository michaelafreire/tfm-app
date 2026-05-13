import type { ExperimentLanguage } from "../i18n";
import type { Step } from "./experienceStepsA";

type Choice = string | { value: string; label: string };

type PassageTranslation = {
  label: string;
  description: string;
  questions: string[];
  choices: string[][];
};

const answerHeader = {
  es: "<strong>Responde las siguientes preguntas:</strong>",
  ca: "<strong>Respon les preguntes següents:</strong>",
};

const imiRows = {
  es: [
    "1. Mientras leía este material, pensaba en cuánto lo estaba disfrutando.",
    "2. No me sentí nada nervioso/a mientras leía.",
    "3. Este material no mantuvo mi atención en absoluto.",
    "4. Creo que entendí este material bastante bien.",
    "5. Describiría este material como muy interesante.",
    "6. Creo que entendí este material muy bien, en comparación con otros estudiantes.",
    "7. Disfruté mucho leyendo este material.",
    "8. Me sentí muy tenso/a mientras leía este material.",
    "9. Este material fue divertido de leer.",
  ],
  ca: [
    "1. Mentre llegia aquest material, pensava en fins a quin punt el gaudia.",
    "2. No em vaig sentir gens nerviós/osa mentre llegia.",
    "3. Aquest material no va mantenir gens la meva atenció.",
    "4. Crec que vaig entendre aquest material força bé.",
    "5. Descriuria aquest material com a molt interessant.",
    "6. Crec que vaig entendre aquest material molt bé, en comparació amb altres estudiants.",
    "7. Vaig gaudir molt llegint aquest material.",
    "8. Em vaig sentir molt tens/a mentre llegia aquest material.",
    "9. Aquest material va ser divertit de llegir.",
  ],
};

const commonChoices = {
  es: {
    trueFalse: ["Verdadero", "Falso"],
    trueFalseNotGiven: ["Verdadero", "Falso", "No se indica"],
  },
  ca: {
    trueFalse: ["Cert", "Fals"],
    trueFalseNotGiven: ["Cert", "Fals", "No s'indica"],
  },
};

const translations: Record<Exclude<ExperimentLanguage, "en">, Record<string, PassageTranslation>> = {
  es: {
    positiveBooks: {
      label: "Cuatro libros positivos sobre el mundo",
      description: `
        <strong>Factfulness – Hans Rosling con Ola Rosling y Anna Rosling Rönnlund</strong>

        En Factfulness, el profesor Hans Rosling, junto con dos colaboradores, plantea preguntas sencillas sobre el mundo. Preguntas como «¿cuántas niñas terminan la escuela?» y «¿qué porcentaje de la población mundial es pobre?». Resulta que la mayoría de nosotros responde a estas preguntas de forma completamente equivocada. ¿Por qué ocurre esto? Factfulness intenta explicar por qué, mostrando que los seres humanos tenemos varios instintos que distorsionan nuestra perspectiva.

        Por ejemplo, la mayoría de las personas divide el mundo entre NOSOTROS y ELLOS. Además, a menudo creemos que las cosas están empeorando. Y consumimos grandes cantidades de medios que usan un modelo de ventas basado en hacernos sentir miedo.

        Pero, según los autores, el mundo no está tan mal como pensamos. Sí, hay preocupaciones reales. Pero deberíamos adoptar una mentalidad de factfulness: mantener solo opiniones respaldadas por hechos sólidos. Este libro no se ocupa de las razones profundas de la pobreza o el progreso, ni de lo que debería hacerse respecto a estos problemas. Se centra en nuestros sesgos instintivos y ofrece consejos prácticos para ayudarnos a ver lo bueno y lo malo del mundo.

        <strong>Enlightenment Now – Steven Pinker</strong>

        ¿Las cosas empeoran cada día? ¿Es el progreso una meta imposible? En Enlightenment Now, Steven Pinker observa el panorama general del progreso humano y encuentra buenas noticias. Vivimos vidas más largas, saludables, libres y felices. Pinker nos pide que dejemos de prestar tanta atención a los titulares negativos y a las noticias que anuncian el fin del mundo. En cambio, nos muestra datos cuidadosamente seleccionados. En 75 gráficos sorprendentes, vemos que la seguridad, la paz, el conocimiento y la salud están mejorando en todo el mundo. Sin embargo, cuando la evidencia no apoya su argumento, la descarta. La desigualdad económica, afirma, no es realmente un problema, porque en realidad no es tan importante para el bienestar humano. Es inevitable preguntarse cuántas personas que viven realmente en la pobreza estarían de acuerdo.

        El verdadero problema, argumenta Pinker, es que los valores ilustrados de la razón y la ciencia están bajo ataque. Cuando comentaristas y demagogos apelan al tribalismo, al fatalismo y a la desconfianza de la gente, corremos el riesgo de causar daños irreparables a instituciones importantes como la democracia y la cooperación mundial.

        <strong>The Rational Optimist – Matt Ridley</strong>

        Durante más de doscientos años, los pesimistas han ganado el debate público. Nos dicen que las cosas están empeorando. Pero, de hecho, la vida está mejorando. Los ingresos, la disponibilidad de alimentos y la esperanza de vida aumentan; las enfermedades, la violencia y la mortalidad infantil disminuyen. Estas tendencias ocurren en todo el mundo. África está saliendo lentamente de la pobreza, igual que Asia lo hizo antes. Internet, los teléfonos móviles y el comercio mundial están mejorando mucho la vida de millones de personas.

        El autor superventas Matt Ridley no solo explica cómo están mejorando las cosas; también nos da razones de por qué. Muestra cómo la cultura humana evoluciona en una dirección positiva gracias al intercambio de ideas y a la especialización. Este libro audaz examina toda la historia humana, desde la Edad de Piedra hasta el siglo XXI, y cambia la idea de que todo va cuesta abajo. El vaso está realmente medio lleno.

        <strong>The Great Surge – Steven Radelet</strong>

        La mayoría de las personas cree que los países en desarrollo se encuentran en una situación terrible: sufren una pobreza increíble, están gobernados por dictadores y tienen pocas esperanzas de un cambio significativo. Pero, sorprendentemente, esto está lejos de la realidad. La realidad es que se está produciendo una gran transformación. Durante los últimos 20 años, más de 700 millones de personas han aumentado sus ingresos y han salido de la pobreza. Además, cada año mueren seis millones menos de niños por enfermedades, millones de niñas más van a la escuela y millones de personas tienen acceso a agua limpia.

        Esto ocurre en países en desarrollo de todo el mundo. El fin de la Guerra Fría, el desarrollo de nuevas tecnologías y un liderazgo nuevo y valiente han ayudado a mejorar la vida de cientos de millones de personas en países pobres.

        The Great Surge describe cómo está ocurriendo todo esto y, lo que es más importante, nos muestra cómo podemos acelerar el proceso.
      `,
      questions: [
        `${answerHeader.es}\n\n1. ¿Qué libro habla de cómo podemos seguir haciendo que las cosas mejoren aún más?`,
        "2. ¿Qué libro cubre un largo período de la historia humana?",
        "3. ¿Qué libro afirma que la intuición humana afecta negativamente a la manera en que las personas piensan sobre el mundo?",
        "4. ¿Qué libro dice que las instituciones actuales están amenazadas por la política?",
      ],
      choices: [
        ["Factfulness", "Enlightenment Now", "The Rational Optimist", "The Great Surge"],
        ["Factfulness", "Enlightenment Now", "The Rational Optimist", "The Great Surge"],
        ["Factfulness", "Enlightenment Now", "The Rational Optimist", "The Great Surge"],
        ["Factfulness", "Enlightenment Now", "The Rational Optimist", "The Great Surge"],
      ],
    },
    languageEvolution: {
      label: "Cómo evolucionó el lenguaje humano",
      description: `
        <strong>A</strong>

        Gracias al campo de la lingüística sabemos mucho sobre el desarrollo de las más de 5.000 lenguas que existen hoy. Podemos describir su gramática y pronunciación y ver cómo sus formas habladas y escritas han cambiado con el tiempo. Por ejemplo, entendemos los orígenes del grupo de lenguas indoeuropeas, que incluye el noruego, el hindi y el inglés, y podemos rastrearlas hasta tribus de Europa oriental alrededor del año 3000 a. C.

        Así pues, hemos trazado gran parte de la historia del lenguaje, pero todavía hay áreas sobre las que sabemos poco. Los expertos están empezando a acudir al campo de la biología evolutiva para averiguar cómo se desarrolló la especie humana hasta ser capaz de usar el lenguaje. Hasta ahora, hay muchas más preguntas y medias teorías que respuestas.

        <strong>B</strong>

        Sabemos que el lenguaje humano es mucho más complejo que el de incluso nuestros parientes más cercanos e inteligentes, como los chimpancés. Podemos expresar pensamientos complejos, transmitir emociones sutiles y comunicarnos sobre conceptos abstractos como el pasado y el futuro. Y lo hacemos siguiendo un conjunto de reglas estructurales, conocidas como gramática. ¿Solo los humanos usamos un sistema innato de reglas para gobernar el orden de las palabras? Quizá no, ya que algunas investigaciones podrían sugerir que los delfines comparten esta capacidad porque son capaces de reconocer cuándo se rompen estas reglas.

        <strong>C</strong>

        Si queremos saber de dónde procede nuestra capacidad para el lenguaje complejo, debemos observar en qué se diferencian nuestros cerebros de los de otros animales. Esto se relaciona con algo más que el tamaño del cerebro; es importante qué otras cosas puede hacer nuestro cerebro y cuándo y por qué evolucionó de esa manera. Y para esto hay muy pocas pistas físicas; los artefactos dejados por nuestros antepasados no nos dicen qué tipo de habla eran capaces de producir. Una cosa que sí podemos ver en los restos de los primeros humanos, sin embargo, es el desarrollo de la boca, la garganta y la lengua. Hacia hace unos 100.000 años, los humanos habían evolucionado la capacidad de crear sonidos complejos. Antes de eso, los biólogos evolutivos solo pueden suponer si los primeros humanos se comunicaban o no usando sonidos más básicos.

        <strong>D</strong>

        Otra pregunta es qué hubo en los cerebros humanos que permitió que el lenguaje evolucionara de una manera que no ocurrió en otros primates. En algún momento, nuestros cerebros fueron capaces de hacer que nuestras bocas produjeran sonidos vocálicos y consonánticos, y desarrollamos la capacidad de inventar palabras para nombrar las cosas que nos rodeaban. Estos fueron los ingredientes básicos del lenguaje complejo. El siguiente cambio habría sido poner esas palabras en oraciones, de forma similar al «protolenguaje» que usan los niños cuando aprenden a hablar. Nadie sabe si el siguiente paso —añadir gramática para indicar pasado, presente y futuro, por ejemplo, o plurales y oraciones relativas— requirió un desarrollo adicional del cerebro humano o fue simplemente una respuesta a nuestra forma cada vez más civilizada de vivir juntos.

        Entre hace 100.000 y 50.000 años, sin embargo, empezamos a ver evidencia de la civilización humana temprana, por ejemplo a través de pinturas rupestres; nadie sabe cuál es la conexión entre esto y el lenguaje. Los cerebros no se hicieron de repente más grandes, pero los humanos sí se volvieron más complejos e inteligentes. ¿Fue el uso del lenguaje lo que hizo que sus cerebros se desarrollaran? ¿O sus cerebros más complejos empezaron a producir lenguaje?

        <strong>E</strong>

        Hay más preguntas al observar la influencia de la genética en el desarrollo del cerebro y del lenguaje. ¿Hay genes que mutaron y nos dieron la capacidad lingüística? Los investigadores han encontrado una mutación genética que ocurrió entre hace 200.000 y 100.000 años, que parece tener conexión con el habla y con la forma en que nuestros cerebros controlan la boca y la cara. Los monos tienen un gen similar, pero no sufrió esta mutación. Es demasiado pronto para decir cuánta influencia tienen los genes en el lenguaje, pero quizá algún día las respuestas se encuentren en nuestro ADN.
      `,
      questions: [
        `${answerHeader.es}\n\n1. Los expertos comprenden por completo cómo se desarrolló la lengua hindi.`,
        "2. La gramática del lenguaje de los delfines sigue las mismas reglas que el lenguaje humano.",
        "3. El tamaño del cerebro no es el único factor para determinar la capacidad lingüística.",
        "4. El lenguaje de los niños muy pequeños tiene algo en común con la forma en que podrían haber hablado nuestros antepasados prehistóricos.",
      ],
      choices: [
        commonChoices.es.trueFalse,
        commonChoices.es.trueFalse,
        commonChoices.es.trueFalse,
        commonChoices.es.trueFalse,
      ],
    },
    stateWorld: {
      label: "El estado del mundo",
      description: `
      Si tu visión del mundo viene de ver las noticias y leer periódicos, se te podría perdonar que te quedaras despierto/a por la noche preocupándote por el futuro. Al parecer, el aumento de la violencia y de las tasas de población significa que los humanos nos estamos matando unos a otros en cantidades cada vez mayores y que estamos naciendo a ritmos que los recursos del mundo no pueden sostener. Para empeorar las cosas, toda la riqueza se concentra en un puñado de personas en los países más ricos del mundo. Las personas de países de bajos ingresos viven en la pobreza mientras Occidente se enriquece. Deprimente, ¿verdad?

      Pero ¿apoyan las estadísticas nuestra visión negativa del mundo o el mundo está mejorando realmente?

      Tomemos primero la población mundial. Ahora ronda los 7.000 millones, en línea con las cifras predichas por la ONU en 1958. Para el año 2100, los mismos expertos predicen que rondará los 11.000 millones. Pero ¿sabías que probablemente 11.000 millones será el máximo al que llegará esa cifra? La tasa de aumento se ralentizará en la segunda mitad de este siglo gracias a la caída actual de las tasas de natalidad.

      ¿Caída de las tasas de natalidad? Sí, así es.

      En los dos últimos siglos, las mejoras en tecnología y salud hicieron que murieran menos niños pequeños, impulsando un rápido crecimiento de la población. Estas familias numerosas produjeron aún más hijos que sobrevivieron hasta la edad adulta y tuvieron sus propios hijos. Pero con la mayor disponibilidad de anticonceptivos en la década de 1960, el número medio mundial de bebés por mujer ha disminuido de seis bebés por mujer a tan solo dos.

      El mayor factor en la mortalidad infantil es la pobreza. Y aunque sigue siendo cierto que solo el 20 por ciento del mundo recibe alrededor del 74 por ciento de los ingresos mundiales, el 60 por ciento del mundo pertenece ahora a un grupo de ingresos medios, y el 11,6 por ciento —la menor cantidad de personas de la historia— sigue viviendo en condiciones de pobreza extrema. Si la mayoría de las personas del mundo tiene dinero, la ayuda internacional podría lograr de forma realista el objetivo de la ONU de erradicar la pobreza para 2030. A medida que la pobreza disminuye, la esperanza de vida aumenta, las tasas de natalidad bajan porque los padres pueden esperar que sus hijos existentes sobrevivan, y la población mundial se estabiliza.

      En cuanto a las noticias que nos hacen pensar que el mundo es un lugar cada vez más violento, también hay motivos para cierto optimismo. Entre el final de la Segunda Guerra Mundial y 1990, hubo 30 guerras que mataron a más de 100.000 personas. Hoy todavía hay guerras civiles, pero los países coexisten en general de forma más pacífica que en el pasado. Sin embargo, el terrorismo ha aumentado mucho en los últimos años y, desde la Segunda Guerra Mundial, las guerras han matado a muchos más civiles que soldados. Incluso para los civiles, sin embargo, las estadísticas no son del todo malas. Aunque las muertes tienen nueve veces más probabilidades de ser resultado de un crimen violento que de un conflicto político, la tasa mundial de homicidios bajó ligeramente, de 8 por cada 100.000 personas en 2000 a aproximadamente 5,3 en 2015.

      Por supuesto, nada de esto significa que el mundo sea perfecto, y que te afecten personalmente la guerra y la pobreza a menudo depende de la lotería del lugar donde naces. Además, seguimos enfrentándonos a enormes problemas creados por nosotros mismos, especialmente ambientales como el calentamiento global, y la riqueza y los recursos naturales deben distribuirse de manera más justa. Pero no todas las noticias son malas, diga lo que diga la televisión o los periódicos.
      `,
      questions: [
        `${answerHeader.es}\n\n1. ¿Qué nos dice la palabra «apparently» en el primer párrafo sobre el aumento de la violencia que vemos en las noticias?`,
        "2. ¿Qué afirmación sobre los niveles de población es correcta?",
        "3. ¿Qué factor NO hace que caiga la tasa de natalidad?",
        "4. Uno de los objetivos de la ONU para 2030 es...",
      ],
      choices: [
        ["El aumento es obviamente cierto", "El aumento parece cierto, pero la evidencia podría mostrar que no lo es", "El aumento parece falso, pero la evidencia podría mostrar que es cierto"],
        ["Hace unos doscientos años, la tasa de mortalidad infantil empezó a caer significativamente", "La tasa está creciendo de forma constante ahora", "La tasa empezará a bajar en el año 2100"],
        ["Mejoras en la atención sanitaria", "La disponibilidad de anticonceptivos", "La pobreza"],
        ["acabar con la pobreza", "aumentar la esperanza de vida", "hacer que los niveles de población sean estables"],
      ],
    },
    culturalBusiness: {
      label: "Comportamiento cultural en los negocios",
      description: `
        Gran parte de los negocios actuales se realiza a través de fronteras internacionales y, aunque la mayoría de la comunidad empresarial mundial puede compartir el uso del inglés como lengua común, los matices y expectativas de la comunicación empresarial pueden diferir enormemente de una cultura a otra. La falta de comprensión de las normas y prácticas culturales de nuestros conocidos de negocios puede dar lugar a juicios injustos, malentendidos y fallos de comunicación. Aquí hay tres áreas básicas de diferencias en la etiqueta empresarial alrededor del mundo que podrían ayudarte cuando vuelvas a trabajar con alguien de una cultura diferente.

        <strong>Dirigirse a alguien</strong>

        Al tratar este tema en un curso de formación, un aprendiz alemán y un aprendiz británico tuvieron un intenso debate sobre si era apropiado que alguien con un doctorado usara el título correspondiente en su tarjeta de visita. El aprendiz británico sostenía que cualquiera que no fuera médico y esperara que se le llamara «Dr.» era desagradablemente pomposo y creído. El aprendiz alemán, sin embargo, argumentaba que el esfuerzo y los años de educación dedicados a obtener ese doctorado deberían dar pleno derecho a esperar que se le llamara «Dr.».

        Esta marcada diferencia de opinión sobre algo que podría considerarse menor y, por tanto, fácil de pasar por alto, demuestra que a menudo atribuimos significado incluso a las prácticas más cotidianas. Cuando las cosas a las que estamos acostumbrados se hacen de manera diferente, pueden provocar en nosotros las reacciones más fuertes. Mientras que muchos europeos continentales y latinoamericanos prefieren que se les trate con un título, por ejemplo Sr. o Sra. y su apellido, al conocer a alguien en un contexto empresarial por primera vez, los estadounidenses, y cada vez más los británicos, tienden ahora a preferir usar el nombre de pila. Lo mejor es escuchar y observar cómo se dirige a ti tu interlocutor y, si aún tienes dudas, no tener miedo de preguntarle cómo le gustaría que le llamaras.

        <strong>Sonreír</strong>

        Una llamada «sonrisa de respeto» se considera poco sincera y a menudo se ve con sospecha en Rusia. Un famoso proverbio ruso incluso afirma que «reír sin motivo es señal de idiotez». Sin embargo, en países como Estados Unidos, Australia y Gran Bretaña, sonreír suele interpretarse como señal de apertura, amistad y respeto, y se usa con frecuencia para romper el hielo.

        En una investigación sobre sonrisas entre culturas, los investigadores encontraron que las personas sonrientes eran consideradas más inteligentes que las no sonrientes en países como Alemania, Suiza, China y Malasia. Sin embargo, en países como Rusia, Japón, Corea del Sur e Irán, las imágenes de rostros sonrientes fueron calificadas como menos inteligentes que las de rostros no sonrientes. Mientras tanto, en países como India, Argentina y Maldivas, sonreír se asociaba con deshonestidad.

        <strong>Contacto visual</strong>

        Una persona estadounidense o británica podría mirar a su cliente a los ojos para mostrar que presta plena atención a lo que se dice, pero si ese cliente es de Japón o Corea, podría encontrar el contacto visual directo incómodo o incluso irrespetuoso. En partes de Sudamérica y África, el contacto visual prolongado también podría verse como un desafío a la autoridad. En Oriente Medio, el contacto visual entre géneros se considera inapropiado, aunque el contacto visual dentro del mismo género podría significar honestidad y veracidad.

        Tener una mayor conciencia de las posibles diferencias en expectativas y comportamiento puede ayudarnos a evitar casos de mala comunicación, pero es vital que recordemos también que los estereotipos culturales pueden ser perjudiciales para construir buenas relaciones empresariales. Aunque las culturas nacionales podrían influir en la forma en que nos comportamos y pensamos, también estamos muy influidos por la región de la que procedemos, las comunidades con las que nos relacionamos, nuestra edad y género, nuestra cultura corporativa y nuestras experiencias individuales del mundo. El conocimiento de las posibles diferencias debería ser, por tanto, algo que mantengamos en mente, y no algo que usemos para encasillar a los individuos de una nación entera.
      `,
      questions: [
        `${answerHeader.es}\n\n1. El aprendiz británico pensaba que las personas que quieren que se les llame «Dr.» deben ser...`,
        "2. Si no sabes con seguridad cómo dirigirte a alguien, deberías...",
        "3. Podría haber un malentendido si un estadounidense sonríe a un socio comercial ruso porque el ruso podría pensar que el estadounidense está...",
        "4. Los japoneses, surcoreanos e iraníes podrían interpretar una cara sonriente como...",
      ],
      choices: [
        ["trabajadoras", "engreídas y arrogantes", "estudiando medicina", "de Alemania"],
        ["usar el título que ves en su tarjeta de visita", "tomar tu decisión basándote en estereotipos culturales sobre su país", "dirigirte a ellos como te gustaría que se dirigieran a ti", "preguntarles cómo les gustaría que les llamaras"],
        ["siendo falso", "desafiando su autoridad", "intentando romper el hielo", "siendo irrespetuoso"],
        ["más amable", "menos abierta", "no tan inteligente", "deshonesta"],
      ],
    },
    kilian: {
      label: "Una biografía de Kilian Jornet",
      description: `
      Cuando imaginas a alpinistas escalando el monte Everest, probablemente piensas en equipos de escaladores con guías sherpas que los conducen a la cima, equipados con máscaras de oxígeno, provisiones y tiendas. Y en la mayoría de los casos tendrías razón, ya que el 97 por ciento de los escaladores usa oxígeno para ascender a la cumbre del Everest, a 8.850 metros sobre el nivel del mar. El aire fino a gran altitud deja sin aliento a la mayoría de las personas a 3.500 metros, y la gran mayoría de los escaladores usa oxígeno por encima de los 7.000 metros. Un grupo típico de escalada tendrá entre 8 y 15 personas, con casi el mismo número de guías, y pasará semanas para llegar a la cima después de alcanzar el Campo Base.

      Pero el corredor de montaña y ultradistancia Kilian Jornet Burgada ascendió la montaña en mayo de 2017 solo, sin máscara de oxígeno ni cuerdas fijas para escalar.

      Ah, y lo hizo en 26 horas.

      Con una intoxicación alimentaria.

      Y luego, cinco días después, lo hizo otra vez, esta vez en solo 17 horas.

      Nacido en 1987, Kilian ha estado entrenando para el Everest toda su vida. Y eso significa realmente toda su vida, ya que creció a 2.000 metros sobre el nivel del mar en los Pirineos, en la estación de esquí de Lles de Cerdanya, en Cataluña, al noreste de España. Mientras otros niños de su edad aprendían a caminar, Kilian iba sobre esquís. Con un año y medio hizo una caminata de cinco horas con su madre, completamente por sus propios medios. Dejó aún más atrás a sus compañeros cuando subió su primera montaña y compitió en su primera carrera de esquí de fondo a los tres años. A los siete años ya había escalado un pico de 4.000 metros y, a los diez, hizo una travesía de 42 días por los Pirineos.

      Tenía 13 años cuando dice que empezó a tomárselo «en serio» y entrenó con el Centre de Tecnificació d'Esquí de Muntanya de Catalunya (CTEMC), participando en competiciones y trabajando con un entrenador. A los 18, asumió su propio entrenamiento de esquí de montaña y carrera por senderos, con un calendario que solo permite un par de semanas de descanso al año. Realiza hasta 1.140 horas de entrenamiento de resistencia al año, además de entrenamiento de fuerza y ejercicios técnicos, así como entrenamiento específico la semana anterior a una carrera. Para su ascenso y descenso récord del Matterhorn, se preparó subiendo la montaña diez veces hasta conocer cada detalle, incluso dónde brillaría el sol en cada parte del día.

      Durmiendo solo siete horas por noche, Kilian Jornet parece casi sobrehumano. Su ritmo cardíaco en reposo es extremadamente bajo, 33 latidos por minuto, en comparación con los 60 por minuto del hombre promedio o los 40 por minuto de un atleta. También respira con más eficiencia que la gente promedio, tomando más oxígeno por respiración, y tiene un tiempo de recuperación mucho más rápido después del ejercicio, ya que su cuerpo descompone rápidamente el ácido láctico, el ácido en los músculos que causa dolor después del ejercicio.

      Todo esto se debe a su infancia en las montañas y a la genética, pero es su fuerza mental lo que lo distingue. A menudo se plantea retos para ver cuánto tiempo puede soportar condiciones difíciles y así comprender de verdad lo que su cuerpo y su mente pueden afrontar. Por ejemplo, estuvo a punto de provocarse una insuficiencia renal tras beber solo 3,5 litros de agua en una carrera de 100 km con temperaturas de alrededor de 40 °C.

      Haría falta un libro para enumerar todas las carreras y premios que ha ganado y las montañas que ha escalado. E incluso aquí los logros de Kilian superan a los de una persona promedio, ya que, de alguna manera, encuentra tiempo para registrar su carrera en su blog y ha escrito tres libros: Run or Die, The Invisible Border y Summits of My Life.
      `,
      questions: [
        `${answerHeader.es}\n\n1. La mayoría de los escaladores en el Everest...`,
        "2. Kilian Jornet es diferente de la mayoría de escaladores del Everest porque...",
        "3. En su entrenamiento actual, Kilian...",
        "4. Kilian debe en parte su increíble forma física a...",
      ],
      choices: [
        ["necesitan oxígeno para terminar su ascenso", "van acompañados", "avanzan lentamente hasta la cima", "todas las anteriores"],
        ["es un escalador profesional", "ascendió más rápido", "encontró difícil la escalada", "todas las anteriores"],
        ["se exige mucho a sí mismo", "toma muchos períodos de descanso", "usa un entrenador", "ninguna de las anteriores"],
        ["la forma en que saca tiempo extra para dormir", "su capacidad para recuperarse de lesiones", "el lugar donde creció", "todas las anteriores"],
      ],
    },
    mars: {
      label: "Vida en Marte",
      description: `
      Un nuevo estudio publicado en la revista Science muestra evidencia definitiva de materia orgánica en la superficie de Marte. Los datos fueron recogidos por el rover Curiosity de la NASA, de propulsión nuclear. Confirma hallazgos anteriores de que el Planeta Rojo contuvo en otro tiempo compuestos basados en carbono. Estos compuestos, también llamados moléculas orgánicas, son ingredientes esenciales para la vida tal como la entienden los científicos.

      Las moléculas orgánicas se encontraron en el cráter Gale de Marte, una gran zona que pudo haber sido un lago con agua hace más de tres mil millones de años. El rover encontró rastros de la molécula en rocas extraídas de la zona. Las rocas también contienen azufre, que los científicos especulan que ayudó a preservar los compuestos orgánicos incluso cuando las rocas estuvieron expuestas a la dura radiación de la superficie del planeta.

      Los científicos se apresuran a afirmar que la presencia de estas moléculas orgánicas no es prueba suficiente de vida antigua en Marte, ya que las moléculas podrían haberse formado mediante procesos no vivos. Pero sigue siendo uno de los descubrimientos más asombrosos, que podría conducir a futuras revelaciones. Especialmente si se considera el otro hallazgo sorprendente que Curiosity descubrió hace unos cinco años.

      El rover analiza periódicamente el aire a su alrededor, y en 2014 encontró que el aire contenía otra de las moléculas orgánicas más básicas y un ingrediente clave del gas natural: metano. Una de las características del metano es que solo sobrevive unos cientos de años. Esto significa que algo, en algún lugar de Marte, está reponiendo el suministro. Según la NASA, Marte emite miles de toneladas de metano cada vez. El nivel de metano sube y baja en intervalos estacionales durante el año, casi como si el planeta lo respirara.

      La NASA sospecha que el metano procede de las profundidades bajo la superficie del planeta. Las variaciones de temperatura en la superficie de Marte hacen que la molécula fluya hacia arriba en niveles más altos o más bajos. Por ejemplo, en el invierno marciano el gas podría quedar atrapado en cristales helados subterráneos. Estos cristales, llamados clatratos, se derriten en verano y liberan el gas. Sin embargo, la fuente del metano sigue siendo un completo misterio.

      El mundo de la astrobiología considera ambos estudios como hitos históricos. Según esta información, Marte no es un planeta muerto. Al contrario, está bastante activo y puede estar cambiando y volviéndose más habitable.

      Por supuesto, esto significa que es necesaria más investigación. Los científicos dicen que necesitan enviar nuevos equipos a Marte, equipos capaces de medir el aire y el suelo con más precisión. Ya hay misiones en marcha. La nave ExoMars de la Agencia Espacial Europea aterriza en 2020 y podrá perforar el suelo de Marte para analizar lo que encuentre. Además, la NASA enviará otro rover a Marte ese mismo año para recoger muestras de suelo marciano y devolverlas a la Tierra.

      La posibilidad de vida en Marte ha fascinado a los humanos durante generaciones. Ha sido el tema de innumerables novelas y películas de ciencia ficción. ¿Estamos solos en el universo o ha habido otras formas de vida dentro de nuestro Sistema Solar? Si las misiones actuales al Planeta Rojo continúan, parece que podríamos descubrir la respuesta muy pronto.
      `,
      questions: [
        `${answerHeader.es}\n\n1. El estudio de la revista Science fue escrito por científicos de la NASA.`,
        "2. Este no es el primer estudio que sugiere que existió vida en Marte en el pasado.",
        "3. Un vehículo científico encontró elementos muy pequeños de una molécula orgánica dentro de agua extraída del planeta.",
        "4. Se cree que esto prueba de forma concluyente que alguna vez hubo vida en el planeta.",
      ],
      choices: [
        commonChoices.es.trueFalseNotGiven,
        commonChoices.es.trueFalseNotGiven,
        commonChoices.es.trueFalseNotGiven,
        commonChoices.es.trueFalseNotGiven,
      ],
    },
  },
  ca: {} as Record<string, PassageTranslation>,
};

translations.ca = {
  positiveBooks: {
    ...translations.es.positiveBooks,
    label: "Quatre llibres positius sobre el món",
    description: `
        <strong>Factfulness – Hans Rosling amb Ola Rosling i Anna Rosling Rönnlund</strong>

        A Factfulness, el professor Hans Rosling, juntament amb dos col·laboradors, planteja preguntes senzilles sobre el món. Preguntes com ara «quantes nenes acaben l'escola?» i «quin percentatge de la població mundial és pobre?». Resulta que la majoria de nosaltres responem aquestes preguntes de manera completament equivocada. Per què passa això? Factfulness intenta explicar-ho mostrant que els éssers humans tenim diversos instints que distorsionen la nostra perspectiva.

        Per exemple, la majoria de persones divideix el món entre NOSALTRES i ELLS. A més, sovint creiem que les coses estan empitjorant. I consumim grans quantitats de mitjans que utilitzen un model de vendes basat a fer-nos sentir por.

        Però, segons els autors, el món no està tan malament com pensem. Sí, hi ha preocupacions reals. Però hauríem d'adoptar una mentalitat de factfulness: mantenir només opinions recolzades per fets sòlids. Aquest llibre no tracta les raons profundes de la pobresa o el progrés, ni què s'hauria de fer respecte d'aquests problemes. Se centra en els nostres biaixos instintius i ofereix consells pràctics per ajudar-nos a veure el bo i el dolent del món.

        <strong>Enlightenment Now – Steven Pinker</strong>

        Les coses empitjoren cada dia? El progrés és una meta impossible? A Enlightenment Now, Steven Pinker observa el panorama general del progrés humà i hi troba bones notícies. Vivim vides més llargues, saludables, lliures i felices. Pinker ens demana que deixem de prestar tanta atenció als titulars negatius i a les notícies que anuncien la fi del món. En canvi, ens mostra dades seleccionades amb cura. En 75 gràfics sorprenents, veiem que la seguretat, la pau, el coneixement i la salut milloren arreu del món. Tanmateix, quan l'evidència no dona suport al seu argument, la descarta. La desigualtat econòmica, afirma, no és realment un problema, perquè en realitat no és tan important per al benestar humà. És inevitable preguntar-se quantes persones que viuen realment en la pobresa hi estarien d'acord.

        El problema real, argumenta Pinker, és que els valors il·lustrats de la raó i la ciència estan sota atac. Quan comentaristes i demagogs apel·len al tribalisme, al fatalisme i a la desconfiança de la gent, correm el risc de causar danys irreparables a institucions importants com la democràcia i la cooperació mundial.

        <strong>The Rational Optimist – Matt Ridley</strong>

        Durant més de dos-cents anys, els pessimistes han guanyat el debat públic. Ens diuen que les coses estan empitjorant. Però, de fet, la vida està millorant. Els ingressos, la disponibilitat d'aliments i l'esperança de vida augmenten; les malalties, la violència i la mortalitat infantil disminueixen. Aquestes tendències passen arreu del món. Àfrica està sortint lentament de la pobresa, igual que Àsia ho va fer abans. Internet, els telèfons mòbils i el comerç mundial estan millorant molt la vida de milions de persones.

        L'autor supervendes Matt Ridley no només explica com estan millorant les coses; també ens dona raons de per què. Mostra com la cultura humana evoluciona en una direcció positiva gràcies a l'intercanvi d'idees i a l'especialització. Aquest llibre valent examina tota la història humana, des de l'edat de pedra fins al segle XXI, i canvia la idea que tot va costa avall. El got és realment mig ple.

        <strong>The Great Surge – Steven Radelet</strong>

        La majoria de persones creu que els països en desenvolupament es troben en una situació terrible: pateixen una pobresa increïble, estan governats per dictadors i tenen poques esperances d'un canvi significatiu. Però, sorprenentment, això és lluny de la realitat. La realitat és que s'està produint una gran transformació. Durant els últims 20 anys, més de 700 milions de persones han augmentat els seus ingressos i han sortit de la pobresa. A més, cada any moren sis milions menys d'infants per malalties, milions de nenes més van a l'escola i milions de persones tenen accés a aigua neta.

        Això passa en països en desenvolupament de tot el món. El final de la Guerra Freda, el desenvolupament de noves tecnologies i un lideratge nou i valent han ajudat a millorar la vida de centenars de milions de persones en països pobres.

        The Great Surge descriu com està passant tot això i, encara més important, ens mostra com podem accelerar el procés.
      `,
    questions: [
      `${answerHeader.ca}\n\n1. Quin llibre parla de com podem continuar fent que les coses millorin encara més?`,
      "2. Quin llibre cobreix un llarg període de la història humana?",
      "3. Quin llibre afirma que la intuïció humana afecta negativament la manera com les persones pensen sobre el món?",
      "4. Quin llibre diu que les institucions actuals estan amenaçades per la política?",
    ],
  },
  languageEvolution: {
    ...translations.es.languageEvolution,
    label: "Com va evolucionar el llenguatge humà",
    description: `
        <strong>A</strong>

        Gràcies al camp de la lingüística sabem molt sobre el desenvolupament de les més de 5.000 llengües que existeixen avui. Podem descriure'n la gramàtica i la pronunciació i veure com les seves formes parlades i escrites han canviat amb el temps. Per exemple, entenem els orígens del grup de llengües indoeuropees, que inclou el noruec, l'hindi i l'anglès, i podem rastrejar-les fins a tribus de l'Europa oriental cap a l'any 3000 aC.

        Així doncs, hem traçat una gran part de la història del llenguatge, però encara hi ha àrees sobre les quals sabem poc. Els experts comencen a recórrer al camp de la biologia evolutiva per descobrir com es va desenvolupar l'espècie humana fins a ser capaç d'utilitzar el llenguatge. Fins ara, hi ha moltes més preguntes i mitges teories que respostes.

        <strong>B</strong>

        Sabem que el llenguatge humà és molt més complex que el dels nostres parents més propers i intel·ligents, com els ximpanzés. Podem expressar pensaments complexos, transmetre emocions subtils i comunicar-nos sobre conceptes abstractes com el passat i el futur. I ho fem seguint un conjunt de regles estructurals, conegudes com a gramàtica. Només els humans fem servir un sistema innat de regles per governar l'ordre de les paraules? Potser no, ja que algunes investigacions podrien suggerir que els dofins comparteixen aquesta capacitat perquè són capaços de reconèixer quan es trenquen aquestes regles.

        <strong>C</strong>

        Si volem saber d'on prové la nostra capacitat per al llenguatge complex, hem d'observar en què es diferencien els nostres cervells dels d'altres animals. Això es relaciona amb alguna cosa més que la mida del cervell; és important què més pot fer el nostre cervell i quan i per què va evolucionar d'aquesta manera. I per a això hi ha molt poques pistes físiques; els artefactes deixats pels nostres avantpassats no ens diuen quin tipus de parla eren capaços de produir. Una cosa que sí que podem veure en les restes dels primers humans, però, és el desenvolupament de la boca, la gola i la llengua. Fa uns 100.000 anys, els humans havien evolucionat la capacitat de crear sons complexos. Abans d'això, els biòlegs evolutius només poden suposar si els primers humans es comunicaven o no amb sons més bàsics.

        <strong>D</strong>

        Una altra pregunta és què hi havia en els cervells humans que va permetre que el llenguatge evolucionés d'una manera que no va ocórrer en altres primats. En algun moment, els nostres cervells van ser capaços de fer que les nostres boques produïssin sons vocàlics i consonàntics, i vam desenvolupar la capacitat d'inventar paraules per anomenar les coses que ens envoltaven. Aquests van ser els ingredients bàsics del llenguatge complex. El canvi següent hauria estat posar aquestes paraules en oracions, de manera semblant al «protolenguatge» que fan servir els infants quan aprenen a parlar. Ningú sap si el pas següent —afegir gramàtica per indicar passat, present i futur, per exemple, o plurals i oracions relatives— va requerir un desenvolupament addicional del cervell humà o va ser simplement una resposta a la nostra manera cada vegada més civilitzada de viure junts.

        Entre fa 100.000 i 50.000 anys, però, comencem a veure evidència de la civilització humana primerenca, per exemple a través de pintures rupestres; ningú sap quina és la connexió entre això i el llenguatge. Els cervells no es van fer de sobte més grans, però els humans sí que es van tornar més complexos i intel·ligents. Va ser l'ús del llenguatge el que va fer que els seus cervells es desenvolupessin? O els seus cervells més complexos van començar a produir llenguatge?

        <strong>E</strong>

        Hi ha més preguntes quan observem la influència de la genètica en el desenvolupament del cervell i del llenguatge. Hi ha gens que van mutar i ens van donar la capacitat lingüística? Els investigadors han trobat una mutació genètica que va ocórrer entre fa 200.000 i 100.000 anys, que sembla tenir connexió amb la parla i amb la manera com els nostres cervells controlen la boca i la cara. Els micos tenen un gen similar, però no va patir aquesta mutació. És massa aviat per dir quanta influència tenen els gens en el llenguatge, però potser algun dia les respostes es trobaran en el nostre ADN.
      `,
    questions: [
      `${answerHeader.ca}\n\n1. Els experts entenen completament com es va desenvolupar la llengua hindi.`,
      "2. La gramàtica del llenguatge dels dofins segueix les mateixes regles que el llenguatge humà.",
      "3. La mida del cervell no és l'únic factor per determinar la capacitat lingüística.",
      "4. El llenguatge dels infants molt petits té alguna cosa en comú amb la manera com podrien haver parlat els nostres avantpassats prehistòrics.",
    ],
    choices: [
      commonChoices.ca.trueFalse,
      commonChoices.ca.trueFalse,
      commonChoices.ca.trueFalse,
      commonChoices.ca.trueFalse,
    ],
  },
  stateWorld: {
    ...translations.es.stateWorld,
    label: "L'estat del món",
    description: `
      Si la teva visió del món ve de mirar les notícies i llegir diaris, se't podria perdonar que et quedessis despert/a a la nit preocupant-te pel futur. Pel que sembla, l'augment de la violència i de les taxes de població significa que els humans ens estem matant els uns als altres en quantitats cada vegada més grans i que estem naixent a ritmes que els recursos del món no poden sostenir. Per empitjorar les coses, tota la riquesa es concentra en un grapat de persones als països més rics del món. Les persones de països amb ingressos baixos viuen en la pobresa mentre Occident s'enriqueix. Depriment, oi?

      Però les estadístiques donen suport a la nostra visió negativa del món o el món està millorant realment?

      Prenem primer la població mundial. Ara ronda els 7.000 milions, d'acord amb les xifres predites per l'ONU el 1958. Per a l'any 2100, els mateixos experts prediuen que rondarà els 11.000 milions. Però sabies que probablement 11.000 milions serà el màxim al qual arribarà aquesta xifra? La taxa d'augment s'alentirà en la segona meitat d'aquest segle gràcies a la caiguda actual de les taxes de natalitat.

      Caiguda de les taxes de natalitat? Sí, és així.

      En els dos darrers segles, les millores en tecnologia i salut van fer que morissin menys infants petits, impulsant un creixement ràpid de la població. Aquestes famílies nombroses van produir encara més fills que van sobreviure fins a l'edat adulta i van tenir els seus propis fills. Però amb la major disponibilitat d'anticonceptius a la dècada de 1960, el nombre mitjà mundial de nadons per dona ha disminuït de sis nadons per dona a només dos.

      El factor més important en la mortalitat infantil és la pobresa. I encara que continua sent cert que només el 20 per cent del món rep aproximadament el 74 per cent dels ingressos mundials, el 60 per cent del món pertany ara a un grup d'ingressos mitjans, i l'11,6 per cent —la menor quantitat de persones de la història— encara viu en condicions de pobresa extrema. Si la majoria de persones del món té diners, l'ajuda internacional podria assolir de manera realista l'objectiu de l'ONU d'erradicar la pobresa per al 2030. A mesura que la pobresa disminueix, l'esperança de vida augmenta, les taxes de natalitat baixen perquè els pares poden esperar que els fills existents sobrevisquin, i la població mundial s'estabilitza.

      Pel que fa a les notícies que ens fan pensar que el món és un lloc cada vegada més violent, també hi ha motius per a un cert optimisme. Entre el final de la Segona Guerra Mundial i 1990, hi va haver 30 guerres que van matar més de 100.000 persones. Avui encara hi ha guerres civils, però els països conviuen en general de manera més pacífica que en el passat. Tanmateix, el terrorisme ha augmentat molt en els darrers anys i, des de la Segona Guerra Mundial, les guerres han matat molts més civils que soldats. Fins i tot per als civils, però, les estadístiques no són del tot dolentes. Encara que les morts tenen nou vegades més probabilitats de ser resultat d'un crim violent que d'un conflicte polític, la taxa mundial d'homicidis va baixar lleugerament, de 8 per cada 100.000 persones l'any 2000 a aproximadament 5,3 el 2015.

      Per descomptat, res d'això significa que el món sigui perfecte, i que t'afectin personalment la guerra i la pobresa sovint depèn de la loteria del lloc on neixes. A més, continuem afrontant problemes enormes creats per nosaltres mateixos, especialment ambientals com l'escalfament global, i la riquesa i els recursos naturals s'han de distribuir de manera més justa. Però no totes les notícies són dolentes, digui el que digui la televisió o els diaris.
      `,
    questions: [
      `${answerHeader.ca}\n\n1. Què ens diu la paraula «apparently» al primer paràgraf sobre l'augment de la violència que veiem a les notícies?`,
      "2. Quina afirmació sobre els nivells de població és correcta?",
      "3. Quin factor NO fa que baixi la taxa de natalitat?",
      "4. Un dels objectius de l'ONU per al 2030 és...",
    ],
    choices: [
      ["L'augment és òbviament cert", "L'augment sembla cert, però l'evidència podria mostrar que no ho és", "L'augment sembla fals, però l'evidència podria mostrar que és cert"],
      ["Fa uns dos-cents anys, la taxa de mortalitat infantil va començar a baixar significativament", "La taxa està creixent de manera constant ara", "La taxa començarà a baixar l'any 2100"],
      ["Millores en l'atenció sanitària", "La disponibilitat d'anticonceptius", "La pobresa"],
      ["acabar amb la pobresa", "augmentar l'esperança de vida", "fer que els nivells de població siguin estables"],
    ],
  },
  culturalBusiness: {
    ...translations.es.culturalBusiness,
    label: "Comportament cultural en els negocis",
    description: `
        Gran part dels negocis actuals es fa a través de fronteres internacionals i, encara que la majoria de la comunitat empresarial mundial pot compartir l'ús de l'anglès com a llengua comuna, els matisos i les expectatives de la comunicació empresarial poden diferir enormement d'una cultura a una altra. La manca de comprensió de les normes i pràctiques culturals dels nostres coneguts de negocis pot donar lloc a judicis injustos, malentesos i errors de comunicació. Aquí hi ha tres àrees bàsiques de diferències en l'etiqueta empresarial arreu del món que et podrien ajudar quan tornis a treballar amb algú d'una cultura diferent.

        <strong>Adreçar-se a algú</strong>

        En tractar aquest tema en un curs de formació, un aprenent alemany i un aprenent britànic van tenir un debat intens sobre si era apropiat que algú amb un doctorat utilitzés el títol corresponent a la seva targeta de visita. L'aprenent britànic sostenia que qualsevol persona que no fos metge i esperés que se l'anomenés «Dr.» era desagradablement presumptuosa i creguda. L'aprenent alemany, però, argumentava que l'esforç i els anys d'educació dedicats a obtenir aquell doctorat haurien de donar ple dret a esperar que se l'anomenés «Dr.».

        Aquesta marcada diferència d'opinió sobre una cosa que es podria considerar menor i, per tant, fàcil de passar per alt, demostra que sovint atribuïm significat fins i tot a les pràctiques més quotidianes. Quan les coses a què estem acostumats es fan de manera diferent, poden provocar en nosaltres les reaccions més fortes. Mentre que molts europeus continentals i llatinoamericans prefereixen que se'ls tracti amb un títol, per exemple Sr. o Sra. i el cognom, en conèixer algú en un context empresarial per primera vegada, els estatunidencs, i cada vegada més els britànics, tendeixen ara a preferir utilitzar el nom de pila. El millor és escoltar i observar com s'adreça a tu l'interlocutor i, si encara tens dubtes, no tenir por de preguntar-li com li agradaria que l'anomenessis.

        <strong>Somriure</strong>

        Una anomenada «somriure de respecte» es considera poc sincera i sovint es veu amb sospita a Rússia. Un proverbi rus famós fins i tot afirma que «riure sense motiu és senyal d'idiotesa». Tanmateix, en països com els Estats Units, Austràlia i la Gran Bretanya, somriure se sol interpretar com a senyal d'obertura, amistat i respecte, i s'utilitza sovint per trencar el gel.

        En una investigació sobre somriures entre cultures, els investigadors van trobar que les persones somrients eren considerades més intel·ligents que les no somrients en països com Alemanya, Suïssa, la Xina i Malàisia. Tanmateix, en països com Rússia, el Japó, Corea del Sud i l'Iran, les imatges de rostres somrients van ser qualificades com a menys intel·ligents que les de rostres no somrients. Mentrestant, en països com l'Índia, l'Argentina i les Maldives, somriure s'associava amb deshonestedat.

        <strong>Contacte visual</strong>

        Una persona estatunidenca o britànica podria mirar el seu client als ulls per mostrar que presta plena atenció al que es diu, però si aquest client és del Japó o de Corea, podria trobar el contacte visual directe incòmode o fins i tot irrespectuós. En parts de Sud-amèrica i Àfrica, el contacte visual prolongat també podria veure's com un desafiament a l'autoritat. A l'Orient Mitjà, el contacte visual entre gèneres es considera inapropiat, encara que el contacte visual dins del mateix gènere podria significar honestedat i veracitat.

        Tenir una major consciència de les possibles diferències en expectatives i comportament ens pot ajudar a evitar casos de mala comunicació, però és vital recordar també que els estereotips culturals poden ser perjudicials per construir bones relacions empresarials. Encara que les cultures nacionals podrien influir en la manera com ens comportem i pensem, també estem molt influïts per la regió d'on venim, les comunitats amb què ens relacionem, la nostra edat i gènere, la nostra cultura corporativa i les nostres experiències individuals del món. El coneixement de les possibles diferències hauria de ser, per tant, una cosa que mantinguem present, i no una cosa que utilitzem per encasellar els individus d'una nació sencera.
      `,
    questions: [
      `${answerHeader.ca}\n\n1. L'aprenent britànic pensava que les persones que volen que se'ls digui «Dr.» han de ser...`,
      "2. Si no saps segur com adreçar-te a algú, hauries de...",
      "3. Podria haver-hi un malentès si un estatunidenc somriu a un soci comercial rus perquè el rus podria pensar que l'estatunidenc està...",
      "4. Els japonesos, sud-coreans i iranians podrien interpretar una cara somrient com...",
    ],
    choices: [
      ["treballadores", "cregudes i arrogants", "estudiant medicina", "d'Alemanya"],
      ["utilitzar el títol que veus a la seva targeta de visita", "prendre la decisió basant-te en estereotips culturals sobre el seu país", "adreçar-t'hi com t'agradaria que s'adrecessin a tu", "preguntar-los com els agradaria que els anomenessis"],
      ["sent fals", "desafiant la seva autoritat", "intentant trencar el gel", "sent irrespectuós"],
      ["més amable", "menys oberta", "no tan intel·ligent", "deshonesta"],
    ],
  },
  kilian: {
    ...translations.es.kilian,
    label: "Una biografia de Kilian Jornet",
    description: `
      Quan imagines alpinistes escalant l'Everest, probablement penses en equips d'escaladors amb guies xerpes que els condueixen fins al cim, equipats amb màscares d'oxigen, provisions i tendes. I en la majoria dels casos tindries raó, ja que el 97 per cent dels escaladors utilitza oxigen per ascendir al cim de l'Everest, a 8.850 metres sobre el nivell del mar. L'aire prim a gran altitud deixa sense alè la majoria de persones a 3.500 metres, i la gran majoria d'escaladors utilitza oxigen per sobre dels 7.000 metres. Un grup típic d'escalada tindrà entre 8 i 15 persones, amb gairebé el mateix nombre de guies, i passarà setmanes per arribar al cim després d'assolir el Camp Base.

      Però el corredor de muntanya i ultradistància Kilian Jornet Burgada va ascendir la muntanya el maig de 2017 sol, sense màscara d'oxigen ni cordes fixes per escalar.

      Ah, i ho va fer en 26 hores.

      Amb una intoxicació alimentària.

      I després, cinc dies més tard, ho va tornar a fer, aquesta vegada en només 17 hores.

      Nascut el 1987, Kilian ha estat entrenant per a l'Everest tota la vida. I això vol dir realment tota la vida, ja que va créixer a 2.000 metres sobre el nivell del mar als Pirineus, a l'estació d'esquí de Lles de Cerdanya, a Catalunya, al nord-est d'Espanya. Mentre altres infants de la seva edat aprenien a caminar, Kilian anava amb esquís. Amb un any i mig va fer una caminada de cinc hores amb la seva mare, completament pels seus propis mitjans. Va deixar encara més enrere els seus companys quan va pujar la seva primera muntanya i va competir en la seva primera cursa d'esquí de fons als tres anys. Als set anys ja havia escalat un cim de 4.000 metres i, als deu, va fer una travessa de 42 dies pels Pirineus.

      Tenia 13 anys quan diu que va començar a prendre-s'ho «seriosament» i va entrenar amb el Centre de Tecnificació d'Esquí de Muntanya de Catalunya (CTEMC), participant en competicions i treballant amb un entrenador. Als 18, va assumir el seu propi entrenament d'esquí de muntanya i cursa per senders, amb un calendari que només permet un parell de setmanes de descans a l'any. Fa fins a 1.140 hores d'entrenament de resistència a l'any, a més d'entrenament de força i exercicis tècnics, així com entrenament específic la setmana anterior a una cursa. Per al seu ascens i descens rècord del Matterhorn, es va preparar pujant la muntanya deu vegades fins a conèixer-ne cada detall, fins i tot on brillaria el sol a cada part del dia.

      Dormint només set hores per nit, Kilian Jornet sembla gairebé sobrehumà. El seu ritme cardíac en repòs és extremadament baix, 33 batecs per minut, en comparació amb els 60 per minut de l'home mitjà o els 40 per minut d'un atleta. També respira amb més eficiència que la gent mitjana, prenent més oxigen per respiració, i té un temps de recuperació molt més ràpid després de l'exercici, ja que el seu cos descompon ràpidament l'àcid làctic, l'àcid dels músculs que causa dolor després de l'exercici.

      Tot això es deu a la seva infantesa a les muntanyes i a la genètica, però és la seva força mental el que el distingeix. Sovint es planteja reptes per veure quant de temps pot suportar condicions difícils i així comprendre de veritat què poden afrontar el seu cos i la seva ment. Per exemple, va estar a punt de provocar-se una insuficiència renal després de beure només 3,5 litres d'aigua en una cursa de 100 km amb temperatures d'uns 40 °C.

      Caldria un llibre per enumerar totes les curses i premis que ha guanyat i les muntanyes que ha escalat. I fins i tot aquí els assoliments de Kilian superen els d'una persona mitjana, ja que, d'alguna manera, troba temps per registrar la seva carrera al seu blog i ha escrit tres llibres: Run or Die, The Invisible Border i Summits of My Life.
      `,
    questions: [
      `${answerHeader.ca}\n\n1. La majoria d'escaladors a l'Everest...`,
      "2. Kilian Jornet és diferent de la majoria d'escaladors de l'Everest perquè...",
      "3. En el seu entrenament actual, Kilian...",
      "4. Kilian deu en part la seva increïble forma física a...",
    ],
    choices: [
      ["necessiten oxigen per acabar l'ascens", "van acompanyats", "avancen lentament fins al cim", "totes les anteriors"],
      ["és un escalador professional", "va ascendir més ràpid", "va trobar difícil l'ascens", "totes les anteriors"],
      ["s'exigeix molt a si mateix", "fa molts períodes de descans", "utilitza un entrenador", "cap de les anteriors"],
      ["la manera com troba temps extra per dormir", "la seva capacitat per recuperar-se de lesions", "el lloc on va créixer", "totes les anteriors"],
    ],
  },
  mars: {
    ...translations.es.mars,
    label: "Vida a Mart",
    description: `
      Un nou estudi publicat a la revista Science mostra evidència definitiva de matèria orgànica a la superfície de Mart. Les dades van ser recollides pel rover Curiosity de la NASA, de propulsió nuclear. Confirma troballes anteriors que indicaven que el Planeta Roig havia contingut en un altre temps compostos basats en carboni. Aquests compostos, també anomenats molècules orgàniques, són ingredients essencials per a la vida tal com l'entenen els científics.

      Les molècules orgàniques es van trobar al cràter Gale de Mart, una gran zona que podria haver estat un llac amb aigua fa més de tres mil milions d'anys. El rover va trobar rastres de la molècula en roques extretes de la zona. Les roques també contenen sofre, que els científics especulen que va ajudar a preservar els compostos orgànics fins i tot quan les roques van estar exposades a la dura radiació de la superfície del planeta.

      Els científics s'afanyen a afirmar que la presència d'aquestes molècules orgàniques no és prova suficient de vida antiga a Mart, ja que les molècules podrien haver-se format mitjançant processos no vius. Però continua sent un dels descobriments més sorprenents, que podria conduir a futures revelacions. Especialment si es considera l'altra troballa sorprenent que Curiosity va descobrir fa uns cinc anys.

      El rover analitza periòdicament l'aire al seu voltant, i el 2014 va trobar que l'aire contenia una altra de les molècules orgàniques més bàsiques i un ingredient clau del gas natural: metà. Una de les característiques del metà és que només sobreviu uns quants centenars d'anys. Això significa que alguna cosa, en algun lloc de Mart, n'està reposant el subministrament. Segons la NASA, Mart emet milers de tones de metà cada vegada. El nivell de metà puja i baixa en intervals estacionals durant l'any, gairebé com si el planeta respirés.

      La NASA sospita que el metà prové de les profunditats sota la superfície del planeta. Les variacions de temperatura a la superfície de Mart fan que la molècula flueixi cap amunt en nivells més alts o més baixos. Per exemple, a l'hivern marcià el gas podria quedar atrapat en cristalls gelats subterranis. Aquests cristalls, anomenats clatrats, es fonen a l'estiu i alliberen el gas. Tanmateix, la font del metà continua sent un misteri complet.

      El món de l'astrobiologia considera tots dos estudis com a fites històriques. Segons aquesta informació, Mart no és un planeta mort. Al contrari, és força actiu i pot estar canviant i tornant-se més habitable.

      Per descomptat, això significa que cal més recerca. Els científics diuen que necessiten enviar nous equips a Mart, equips capaços de mesurar l'aire i el sòl amb més precisió. Ja hi ha missions en marxa. La nau ExoMars de l'Agència Espacial Europea aterra el 2020 i podrà perforar el sòl de Mart per analitzar el que hi trobi. A més, la NASA enviarà un altre rover a Mart aquell mateix any per recollir mostres de sòl marcià i retornar-les a la Terra.

      La possibilitat de vida a Mart ha fascinat els humans durant generacions. Ha estat el tema d'innombrables novel·les i pel·lícules de ciència-ficció. Estem sols a l'univers o hi ha hagut altres formes de vida dins del nostre Sistema Solar? Si les missions actuals al Planeta Roig continuen, sembla que podríem descobrir la resposta molt aviat.
      `,
    questions: [
      `${answerHeader.ca}\n\n1. L'estudi de la revista Science va ser escrit per científics de la NASA.`,
      "2. Aquest no és el primer estudi que suggereix que va existir vida a Mart en el passat.",
      "3. Un vehicle científic va trobar elements molt petits d'una molècula orgànica dins d'aigua extreta del planeta.",
      "4. Es creu que això prova de manera concloent que alguna vegada hi va haver vida al planeta.",
    ],
    choices: [
      commonChoices.ca.trueFalseNotGiven,
      commonChoices.ca.trueFalseNotGiven,
      commonChoices.ca.trueFalseNotGiven,
      commonChoices.ca.trueFalseNotGiven,
    ],
  },
};

const passageKeyByLabel: Record<string, keyof typeof translations.es> = {
  "Four positive books about the world": "positiveBooks",
  "How humans evolved language": "languageEvolution",
  "The state of the world": "stateWorld",
  "Cultural behaviour in business": "culturalBusiness",
  "A biography of Kilian Jornet": "kilian",
  "Life on Mars": "mars",
};

const localizedDescriptions: Record<Exclude<ExperimentLanguage, "en">, Record<1 | 2, string>> = {
  es: {
    1: "Esta es la Experiencia de Lectura A. En la siguiente sección leerás tres textos. Lee cada texto hasta que te sientas preparado/a para responder las preguntas de comprensión, luego marca el texto como completado. Una vez que un texto se marque como completado, ya no podrás volver a verlo y pasarás directamente a cuatro preguntas sobre el texto. Después de terminar los tres textos, responderás un breve cuestionario sobre tu experiencia en la Experiencia de Lectura A.",
    2: "Esta es la Experiencia de Lectura B. En la siguiente sección leerás tres textos. Lee cada texto hasta que te sientas preparado/a para responder las preguntas de comprensión, luego marca el texto como completado. Una vez que un texto se marque como completado, ya no podrás volver a verlo y pasarás directamente a cuatro preguntas sobre el texto. Después de terminar los tres textos, responderás un breve cuestionario sobre tu experiencia en la Experiencia de Lectura B.",
  },
  ca: {
    1: "Aquesta és l'Experiència de Lectura A. A la secció següent llegiràs tres textos. Llegeix cada text fins que et sentis preparat/ada per respondre les preguntes de comprensió, després marca el text com a completat. Un cop un text es marqui com a completat, ja no el podràs tornar a veure i passaràs directament a quatre preguntes sobre el text. Després d'acabar els tres textos, respondràs un breu qüestionari sobre la teva experiència en l'Experiència de Lectura A.",
    2: "Aquesta és l'Experiència de Lectura B. A la secció següent llegiràs tres textos. Llegeix cada text fins que et sentis preparat/ada per respondre les preguntes de comprensió, després marca el text com a completat. Un cop un text es marqui com a completat, ja no el podràs tornar a veure i passaràs directament a quatre preguntes sobre el text. Després d'acabar els tres textos, respondràs un breu qüestionari sobre la teva experiència en l'Experiència de Lectura B.",
  },
};

function labelChoices(original: Choice[] | undefined, translated: string[] | undefined): Choice[] | undefined {
  if (!original || !translated) return original;
  return original.map((choice, index) => ({
    value: typeof choice === "string" ? choice : choice.value,
    label: translated[index] ?? (typeof choice === "string" ? choice : choice.label),
  }));
}

function localizePassageStep(step: Step, language: Exclude<ExperimentLanguage, "en">): Step {
  const key = passageKeyByLabel[step.label];
  const translation = key ? translations[language][key] : undefined;
  if (!translation) return step;

  return {
    ...step,
    label: translation.label,
    description: translation.description,
    question: step.question.map((question, index) => ({
      ...question,
      label: translation.questions[index] ?? question.label,
      choice: labelChoices(question.choice, translation.choices[index]),
    })),
  };
}

export function translateExperienceSteps(
  steps: Step[],
  language: ExperimentLanguage | string | undefined,
  experienceNumber: 1 | 2,
): Step[] {
  if (language !== "es" && language !== "ca") return steps;

  return steps.map((step) => {
    if (step.label === "Instructions") {
      return {
        ...step,
        label: language === "es" ? "Instrucciones" : "Instruccions",
        description: localizedDescriptions[language][experienceNumber],
      };
    }

    if (step.label === "IMI Questions") {
      return {
        ...step,
        label: language === "es" ? "Preguntas IMI" : "Preguntes IMI",
        question: step.question.map((question) => ({
          ...question,
          label: answerHeader[language],
          likertRows: question.likertRows?.map((row, index) => ({
            ...row,
            label: imiRows[language][index] ?? row.label,
          })),
        })),
      };
    }

    return localizePassageStep(step, language);
  });
}
