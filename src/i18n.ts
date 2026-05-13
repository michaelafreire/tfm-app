import i18n from "i18next";
import { initReactI18next } from "react-i18next";

export type ExperimentLanguage = "en" | "es" | "ca";

export const languageOptions: Array<{ value: ExperimentLanguage; labelKey: string }> = [
  { value: "en", labelKey: "language.english" },
  { value: "es", labelKey: "language.spanish" },
  { value: "ca", labelKey: "language.catalan" },
];

const resources = {
  en: {
    translation: {
      language: {
        english: "English",
        spanish: "Spanish",
        catalan: "Catalan",
      },
      common: {
        startExperiment: "Start Experiment",
        startGame: "Start game",
        skipBreak: "Skip break",
        resetPong: "Reset Pong",
        continue: "Continue",
        ok: "OK",
        recalibrate: "Recalibrate",
        next: "Next",
        back: "Back",
        submit: "Submit",
      },
      form: {
        required: "Required",
        selectMonthYear: "Select month and year",
        stronglyDisagree: "Strongly disagree",
        stronglyAgree: "Strongly agree",
        notTrueAtAll: "not true\nat all",
        somewhatTrue: "somewhat\ntrue",
        veryTrue: "very true",
        finishedReading: "I have finished reading",
        clickToQuestions: "Click to continue to the questions. You will no longer be able to view the text.",
      },
      attentionProbe: {
        title: "Attention Check",
        prompt: "Just before this, were you:",
        options: {
          "task-focused": "task-focused",
          "distracted by thoughts": "distracted by thoughts",
          other: "other",
        },
      },
      adaptive: {
        readingLabel: "Reading {{number}}",
        completedOfTotal: "{{completed}} of {{total}}",
        preparingPlan: "Preparing your checkpoint plan.",
        planReady: "Your checkpoint plan is ready.",
        reviewingPlan: "The AI is reviewing the reading structure and ASRS profile.",
        planReadySubtitle: "You can keep the recommended plan or make one small change before starting.",
        aiLabel: "AI",
        aiPreparing: "I am preparing a checkpoint recommendation.",
        aiRecommendation: "For these readings, I recommend {{count}} checkpoints at natural topic breaks.",
        aiDefaultReason: "Based on the text length, structure, and your ASRS profile.",
        aiTakesSeconds: "This usually takes a few seconds.",
        numberOfCheckpoints: "Number of checkpoints",
        checkpoints: "checkpoints",
        recommendedForReadings: "{{count}} checkpoints recommended for {{readings}} readings.",
        markerStyle: "Marker style",
        optional: "(optional)",
        markers: {
          diamond: "Diamonds",
          heart: "Hearts",
          star: "Stars",
        },
        preview: "Preview",
        previewStart: "Start",
        previewKeyIdea: "Key idea {{number}}",
        previewSummary: "Summary",
        previewDescription: "Checkpoints are placed at natural topic boundaries to support focus and comprehension.",
        checkpointText: "Checkpoint {{number}}",
        keyIdeaComplete: "key idea complete",
        readingComplete: "reading complete",
        planLooksRight: "Your checkpoint plan looks about right for this reading.",
        addCheckpoint: "Add Checkpoint",
        useFewerCheckpoints: "Use Fewer Checkpoints",
        doneAdded: "Done. I added one checkpoint so the rest is split into smaller sections.",
        doneReduced: "Done. I reduced the checkpoints so the reading has fewer interruptions.",
      },
      intro: {
        title: "AI for Reading Comprehension",
        welcome:
          "Welcome to the experiment! In this study, we are exploring the use of AI in reading comprehension. You will be asked to read passages and answer some questions about them. The experiment will take approximately 1 hour to complete. Please make sure to enter your group number, participant code and language before starting the experiment.",
        footer:
          "Michaela Freire Griffith | TIDE Research Group on Interactive and Distributed Technologies for Education",
        groupNumber: "Group Number",
        participantCode: "Participant Code",
        experimentLanguage: "Language",
        groupNumberError: "Enter a number from 1 to 4.",
        groupNumberAlert: "Please enter a group number between 1 and 4.",
        duplicateNoProgress:
          "This participant code has already been used, and no local progress was found on this browser.",
        saveError: "There was a problem saving your answers. Please contact the researcher.",
      },
      part: {
        one: "Part 1/4",
        two: "Part 2/4",
        three: "Part 3/4",
        four: "Part 4/4",
      },
      instructions: {
        title: "Before You Begin",
        intro:
          "Please read these instructions carefully before starting the experiment. The experiment has four parts: a pre and post questionnaire, and two reading experiences with a 5-minute break between them.",
        whatWillYouDo: "What will you do?",
        fourParts: "The experiment has four parts.",
        preTitle: "Pre-experiment questionnaire",
        preDescription:
          "Answer a consent form, a few questions about yourself, and an adult ADHD self-report questionnaire.",
        experienceATitle: "Reading Experience A",
        experienceBTitle: "Reading Experience B",
        calibrate: "Calibrate eye tracking",
        readingRounds: "Reading rounds",
        readQuestions: "Read + 4 questions",
        threePassages: "3 passages",
        experienceQuestionnaire: "Experience questionnaire",
        experienceADescription:
          "This experience involves eye tracking, so you will begin with a calibration using your cámara web. Then, you will complete 3 reading rounds. Each round has one passage and 4 comprehension questions. Afterwards, you will complete a brief questionnaire about your experience.",
        breakTitle: "5-minute break",
        breakLabel: "Break",
        breakTimer: "Break timer",
        breakBody:
          "Time for a 5-minute break. Feel free to play PONG on the screen, go to the bathroom, have some water or just take some time to yourself. If you do not want a break, just click \"Skip break\".",
        breakOver: "Break is over. Click next to start Experience B.",
        breakDescription: "Approx. 5 min",
        experienceBDescription:
          "You will calibrate again. Then, complete 3 more reading rounds with 4 questions after each passage. You will then answer another brief questionnaire about your experience.",
        postTitle: "Post-experiment questionnaire",
        postDescription: "Answer a few final questions about your experience in the experiment.",
        important: "Important",
        keepHeadStill: "Keep your head as still as possible during eye tracking calibration and the reading experiences.",
        stopResearcher: "If you need to stop, let the researcher know.",
        cannotGoBack: "You cannot go back to change previous answers.",
      },
      experienceIntro: {
        titleA: "Reading Experience A",
        titleB: "Reading Experience B",
        introA:
          "You will start with eye-tracking calibration, then complete 3 reading rounds and a brief questionnaire about this experience.",
        introB:
          "You will calibrate again, then complete 3 reading rounds and a brief questionnaire about this experience.",
        startA: "Start Experience A",
        startB: "Start Experience B",
      },
      calibration: {
        invalidAccess: "Invalid access. Please restart the experiment.",
        prepareError: "The eye tracker could not be prepared. Please refresh the page and try again.",
        webcamError: "The webcam preview did not finish loading. Please allow camera access and refresh the page.",
        warmingUp: "The eye tracker is still warming up. Please wait a moment and try again.",
        scoreNotReady: "Calibration finished, but the validation score could not be computed because the tracker is not ready yet.",
        noPredictions: "Calibration completed, but no stable gaze predictions were available for scoring. You can recalibrate and try again.",
        accuracyMessage: "Your accuracy is {{accuracy}}%. Continue to {{experience}}, or recalibrate if you want a better result.",
        keepEyesFixed: "Keep your eyes fixed on each purple dot until the measurement finishes.",
        preparing: "Preparing webcam and tracker...",
        averageError: "Average validation error: about {{pixels}}px.",
        startTitle: "Calibration will begin",
        startBody:
          "Click each dot 5 times while looking directly at it and keeping your head still. The next dot will appear automatically after each set of clicks.",
        promptTitle: "Measure Calibration Accuracy",
        promptBody:
          "Four dots will appear one at a time. Keep your eyes on each purple dot until the measurement finishes.",
        clickDots: "Click each dot 5 times while keeping your head still. {{count}} click(s) left on the current dot.",
      },
      pre: {
        consent: {
          label: "Consent Form",
          initials: "Please provide your initials:",
          description: `## AI Reading Comprehension Study
Master's Thesis in Cognitive Systems and Interactive Media — Universitat Pompeu Fabra

**Researcher:** Michaela Freire Griffith
**Supervisors:** Davinia Hernández-Leo & Marta Manzanares

## What is this study about?
This study examines how people interact with AI systems during reading comprehension tasks. You will read passages on a screen, answer questions about them, and complete short questionnaires about your experience. During the reading experiences, your eye movements will be estimated using cámara web-based eye tracking.

## What will you be asked to do?
* Answer a few questions about yourself
* Complete a 6-question adult ADHD self-report questionnaire
* Complete two reading experiences consisting of reading three reading passages in each and answering four reading comprehension questions after each passage
* Complete brief questionnaires about your experience
* Keep your head as still as possible during eye tracking calibration and reading experiences

## Eye tracking
* A standard cámara web is used during the study
* The cámara web **does not record video or images**
* Only **screen gaze coordinates (x/y positions)** are collected

## What data will be collected?
* Questionnaire responses
* Reading comprehension answers
* Interaction logs during the experiment
* Gaze coordinates during the reading experiences
* **No video, images, or directly identifiable personal information** will be stored with your data

## How will your data be used?
Your data will be anonymized and used for research purposes only. The ASRS questionnaire is used only as a self-report research measure. **No diagnosis, labeling, or clinical classification** will be made. The cámara web records only gaze coordinates on the screen during calibration and reading experiences, and does not record video or images.

## Is participation voluntary?
Yes. Participation is entirely voluntary. You may stop at any time without penalty. If you need to stop, please let the researcher know.

## Declaration of consent
By continuing, you confirm that you have read and understood the information above, agree to participate voluntarily, understand that cámara web use only records gaze coordinates and not images or video, and understand that the ASRS is not a diagnostic tool.`,
        },
        about: {
          label: "About you",
          description: "Please answer the following questions about yourself.",
          degree: "What degree are you <strong>currently pursuing</strong>?",
          birthDate: "What is your <strong>date of birth</strong>?",
          nationality: "What is your <strong>nationality</strong>?",
          residence: "In which country is your <strong>current residence</strong>?",
        },
        degree: {
          bachelor: "Bachelor's Degree",
          master: "Master's Degree",
          phd: "PhD",
        },
        asrsChoices: {
          never: "Never",
          rarely: "Rarely",
          sometimes: "Sometimes",
          often: "Often",
          veryOften: "Very Often",
        },
        asrs: {
          label: "Adult Self-Report Scale",
          description: "Check the box that best describes how you have felt and conducted yourself over the past 6 months.",
          q1: "1. How often do you have trouble wrapping up the final details of a project, once the challenging parts have been done?",
          q2: "2. How often do you have difficulty getting things in order when you have to do a task that requires organization?",
          q3: "3. How often do you have problems remembering appointments or obligations?",
          q4: "4. When you have a task that requires a lot of thought, how often do you avoid or delay getting started?",
          q5: "5. How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?",
          q6: "6. How often do you feel overly active and compelled to do things, like you were driven by a motor?",
        },
      },
      post: {
        experience: {
          label: "Cognitive Test",
          description: "Please answer the following questions about your experience during the experiment.",
          stress: "Stress levels?",
          feelings: "How do you feel?",
        },
        next: {
          label: "Next Steps",
          description: "Thank you for participating! Please click \"Next\" to complete the experiment and receive further instructions.",
          keepInTouch: "Should we keep in touch?",
        },
      },
    },
  },
  es: {
    translation: {
      language: {
        english: "Inglés",
        spanish: "Español",
        catalan: "Catalán",
      },
      common: {
        startExperiment: "Empezar experimento",
        startGame: "Empezar juego",
        skipBreak: "Saltar descanso",
        resetPong: "Reiniciar Pong",
        continue: "Continuar",
        ok: "OK",
        recalibrate: "Recalibrar",
        next: "Siguiente",
        back: "Atrás",
        submit: "Enviar",
      },
      form: {
        required: "Obligatorio",
        selectMonthYear: "Selecciona mes y año",
        stronglyDisagree: "Totalmente en desacuerdo",
        stronglyAgree: "Totalmente de acuerdo",
        notTrueAtAll: "nada\ncierto",
        somewhatTrue: "algo\ncierto",
        veryTrue: "muy cierto",
        finishedReading: "He terminado de leer",
        clickToQuestions: "Haz clic para continuar con las preguntas. Ya no podrás volver a ver el texto.",
      },
      attentionProbe: {
        title: "Comprobación de atención",
        prompt: "Justo antes de esto, ¿estabas:",
        options: {
          "task-focused": "concentrado/a en la tarea",
          "distracted by thoughts": "distraído/a por pensamientos",
          other: "otra cosa",
        },
      },
      adaptive: {
        readingLabel: "Lectura {{number}}",
        completedOfTotal: "{{completed}} de {{total}}",
        preparingPlan: "Preparando tu plan de checkpoints.",
        planReady: "Tu plan de checkpoints está listo.",
        reviewingPlan: "La IA está revisando la estructura de la lectura y el perfil ASRS.",
        planReadySubtitle: "Puedes mantener el plan recomendado o hacer un pequeño cambio antes de empezar.",
        aiLabel: "IA",
        aiPreparing: "Estoy preparando una recomendación de checkpoints.",
        aiRecommendation: "Para estas lecturas, recomiendo {{count}} checkpoints en pausas temáticas naturales.",
        aiDefaultReason: "Basado en la longitud del texto, la estructura y tu perfil ASRS.",
        aiTakesSeconds: "Normalmente tarda unos segundos.",
        numberOfCheckpoints: "Número de checkpoints",
        checkpoints: "checkpoints",
        recommendedForReadings: "{{count}} checkpoints recomendados para {{readings}} lecturas.",
        markerStyle: "Estilo de marcador",
        optional: "(opcional)",
        markers: {
          diamond: "Diamantes",
          heart: "Corazones",
          star: "Estrellas",
        },
        preview: "Vista previa",
        previewStart: "Inicio",
        previewKeyIdea: "Idea clave {{number}}",
        previewSummary: "Resumen",
        previewDescription: "Los checkpoints se colocan en pausas temáticas naturales para apoyar la concentración y la comprensión.",
        checkpointText: "Checkpoint {{number}}",
        keyIdeaComplete: "idea clave completada",
        readingComplete: "lectura completada",
        planLooksRight: "Tu plan de checkpoints parece adecuado para esta lectura.",
        addCheckpoint: "Añadir checkpoint",
        useFewerCheckpoints: "Usar menos checkpoints",
        doneAdded: "He añadido un checkpoint para dividir el resto en secciones más pequeñas.",
        doneReduced: "He reducido los checkpoints para que la lectura tenga menos interrupciones.",
      },
      intro: {
        title: "IA para la comprensión lectora",
        welcome:
          "Bienvenida/o al experimento. En este estudio exploramos el uso de la IA en la comprensión lectora. Leerás textos y responderás algunas preguntas sobre ellos. El experimento durará aproximadamente 1 hora. Antes de empezar, introduce tu número de grupo, código de participante e idioma.",
        footer:
          "Michaela Freire Griffith | Grupo de investigación TIDE sobre tecnologías interactivas y distribuidas para la educación",
        groupNumber: "Número de grupo",
        participantCode: "Código de participante",
        experimentLanguage: "Idioma",
        groupNumberError: "Introduce un número del 1 al 4.",
        groupNumberAlert: "Introduce un número de grupo entre 1 y 4.",
        duplicateNoProgress:
          "Este código de participante ya se ha usado y no se encontró progreso local en este navegador.",
        saveError: "Hubo un problema al guardar tus respuestas. Contacta con la investigadora.",
      },
      part: {
        one: "Parte 1/4",
        two: "Parte 2/4",
        three: "Parte 3/4",
        four: "Parte 4/4",
      },
      instructions: {
        title: "Antes de empezar",
        intro:
          "Lee estas instrucciones con atención antes de empezar el experimento. El experimento tiene cuatro partes: un cuestionario pre y post, y dos experiencias de lectura con un descanso de 5 minutos entre ellas.",
        whatWillYouDo: "¿Qué harás?",
        fourParts: "El experimento tiene cuatro partes.",
        preTitle: "Cuestionario pre-experimento",
        preDescription:
          "Responde un formulario de consentimiento, algunas preguntas sobre ti y un cuestionario de autoinforme sobre TDAH en adultos.",
        experienceATitle: "Experiencia de Lectura A",
        experienceBTitle: "Experiencia de Lectura B",
        calibrate: "Calibrar eye tracking",
        readingRounds: "Rondas de lectura",
        readQuestions: "Leer + 4 preguntas",
        threePassages: "3 textos",
        experienceQuestionnaire: "Cuestionario de experiencia",
        experienceADescription:
          "Esta experiencia incluye eye tracking, así que empezarás con una calibración usando tu cámara web. Después, completarás 3 rondas de lectura. Cada ronda tiene un texto y 4 preguntas de comprensión. Luego, completarás un breve cuestionario sobre tu experiencia.",
        breakTitle: "Descanso de 5 minutos",
        breakLabel: "Descanso",
        breakTimer: "Temporizador",
        breakBody:
          "Es momento de hacer un descanso de 5 minutos. Puedes jugar a PONG en la pantalla, ir al baño, beber agua o simplemente tomarte un momento. Si no quieres hacer descanso, haz clic en \"Saltar descanso\".",
        breakOver: "El descanso ha terminado. Haz clic en siguiente para empezar la Experiencia B.",
        breakDescription: "Aprox. 5 min",
        experienceBDescription:
          "Calibrarás de nuevo. Después, completarás 3 rondas más de lectura con 4 preguntas después de cada texto. Luego, responderás otro breve cuestionario sobre tu experiencia.",
        postTitle: "Cuestionario post-experimento",
        postDescription: "Responde unas preguntas finales sobre tu experiencia en el experimento.",
        important: "Importante",
        keepHeadStill: "Mantén la cabeza lo más quieta posible durante la calibración del eye tracking y las experiencias de lectura.",
        stopResearcher: "Si necesitas parar, avisa a la investigadora.",
        cannotGoBack: "No podrás volver atrás para cambiar respuestas anteriores.",
      },
      experienceIntro: {
        titleA: "Experiencia de Lectura A",
        titleB: "Experiencia de Lectura B",
        introA:
          "Empezarás con la calibración del eye tracking, después completarás 3 rondas de lectura y un breve cuestionario sobre esta experiencia.",
        introB:
          "Calibrarás de nuevo, después completarás 3 rondas de lectura y un breve cuestionario sobre esta experiencia.",
        startA: "Empezar experiencia A",
        startB: "Empezar experiencia B",
      },
      calibration: {
        invalidAccess: "Acceso no válido. Reinicia el experimento.",
        prepareError: "No se pudo preparar el seguimiento ocular. Actualiza la página e inténtalo de nuevo.",
        webcamError: "La vista previa de la webcam no terminó de cargar. Permite el acceso a la cámara y actualiza la página.",
        warmingUp: "El seguimiento ocular todavía se está preparando. Espera un momento e inténtalo de nuevo.",
        scoreNotReady: "La calibración terminó, pero no se pudo calcular la puntuación de validación porque el sistema aún no está listo.",
        noPredictions: "La calibración se completó, pero no hubo predicciones de mirada estables para calcular la puntuación. Puedes recalibrar e intentarlo de nuevo.",
        accuracyMessage: "Tu precisión es del {{accuracy}} %. Continúa a {{experience}} o recalibra si quieres obtener un mejor resultado.",
        keepEyesFixed: "Mantén la mirada fija en cada punto morado hasta que termine la medición.",
        preparing: "Preparando webcam y seguimiento ocular...",
        averageError: "Error medio de validación: aproximadamente {{pixels}} px.",
        startTitle: "La calibración va a empezar",
        startBody:
          "Haz clic en cada punto 5 veces mientras lo miras directamente y mantienes la cabeza quieta. El siguiente punto aparecerá automáticamente después de cada serie de clics.",
        promptTitle: "Medir precisión de calibración",
        promptBody:
          "Aparecerán cuatro puntos, uno a uno. Mantén la mirada en cada punto morado hasta que termine la medición.",
        clickDots: "Haz clic en cada punto 5 veces manteniendo la cabeza quieta. Quedan {{count}} clic(s) en el punto actual.",
      },
      pre: {
        consent: {
          label: "Formulario de consentimiento",
          initials: "Por favor, escribe tus iniciales:",
          description: `## Estudio de IA para la comprensión lectora
Trabajo de fin de máster en Sistemas Cognitivos y Medios Interactivos — Universitat Pompeu Fabra

**Investigadora:** Michaela Freire Griffith
**Supervisoras:** Davinia Hernández-Leo y Marta Manzanares

## ¿De qué trata este estudio?
Este estudio examina cómo las personas interactúan con sistemas de IA durante tareas de comprensión lectora. Leerás textos en una pantalla, responderás preguntas sobre ellos y completarás cuestionarios breves sobre tu experiencia. Durante las experiencias de lectura, tus movimientos oculares se estimarán mediante eye tracking basado en cámara web.

## ¿Qué se te pedirá que hagas?
* Responder algunas preguntas sobre ti
* Completar un cuestionario de autoinforme de 6 preguntas sobre TDAH en adultos
* Completar dos experiencias de lectura que consisten en leer tres textos en cada una y responder cuatro preguntas de comprensión lectora después de cada texto
* Completar cuestionarios breves sobre tu experiencia
* Mantener la cabeza lo más quieta posible durante la calibración del eye tracking y las experiencias de lectura

## Eye tracking
* Durante el estudio se usa una cámara web estándar
* La cámara web **no graba vídeo ni imágenes**
* Solo se recogen **coordenadas de mirada en pantalla (posiciones x/y)**

## ¿Qué datos se recogerán?
* Respuestas a cuestionarios
* Respuestas de comprensión lectora
* Registros de interacción durante el experimento
* Coordenadas de mirada durante las experiencias de lectura
* **No se almacenarán videos, imágenes ni información personal directamente identificable**

## ¿Cómo se usarán tus datos?
Tus datos se anonimizarán y se usarán solo con fines de investigación. El cuestionario ASRS se usa únicamente como medida de autoinforme para investigación. **No se realizará ningún diagnóstico, etiquetado ni clasificación clínica**. La cámara web registra únicamente coordenadas de mirada en la pantalla durante la calibración y las experiencias de lectura, y no graba vídeo ni imágenes.

## ¿La participación es voluntaria?
Sí. La participación es completamente voluntaria. Puedes parar en cualquier momento sin penalización. Si necesitas parar, avisa a la investigadora.

## Declaración de consentimiento
Al continuar, confirmas que has leído y entendido la información anterior, que aceptas participar voluntariamente, que entiendes que el uso de la cámara web solo registra coordenadas de mirada y no imágenes ni vídeo, y que entiendes que el ASRS no es una herramienta diagnóstica.`,
        },
        about: {
          label: "Sobre ti",
          description: "Por favor, responde las siguientes preguntas sobre ti.",
          degree: "¿Qué titulación estás <strong>cursando actualmente</strong>?",
          birthDate: "¿Cuál es tu <strong>fecha de nacimiento</strong>?",
          nationality: "¿Cuál es tu <strong>nacionalidad</strong>?",
          residence: "¿En qué país está tu <strong>residencia actual</strong>?",
        },
        degree: {
          bachelor: "Grado",
          master: "Máster",
          phd: "Doctorado",
        },
        asrsChoices: {
          never: "Nunca",
          rarely: "Rara vez",
          sometimes: "A veces",
          often: "A menudo",
          veryOften: "Muy a menudo",
        },
        asrs: {
          label: "Escala de autoinforme para adultos",
          description: "Marca la opción que mejor describe cómo te has sentido y comportado durante los últimos 6 meses.",
          q1: "1. ¿Con qué frecuencia tienes dificultades para terminar los últimos detalles de un proyecto, una vez que ya has hecho las partes más difíciles?",
          q2: "2. ¿Con qué frecuencia tienes dificultad para poner las cosas en orden cuando tienes que hacer una tarea que requiere organización?",
          q3: "3. ¿Con qué frecuencia tienes problemas para recordar citas u obligaciones?",
          q4: "4. Cuando tienes una tarea que requiere pensar mucho, ¿con qué frecuencia evitas o retrasas empezarla?",
          q5: "5. ¿Con qué frecuencia mueves inquietamente las manos o los pies, o te remueves en el asiento, cuando tienes que estar sentado/a durante mucho tiempo?",
          q6: "6. ¿Con qué frecuencia te sientes demasiado activo/a y obligado/a a hacer cosas, como si te impulsara un motor?",
        },
      },
      post: {
        experience: {
          label: "Prueba cognitiva",
          description: "Por favor, responde las siguientes preguntas sobre tu experiencia durante el experimento.",
          stress: "¿Nivel de estrés?",
          feelings: "¿Cómo te sientes?",
        },
        next: {
          label: "Siguientes pasos",
          description: "¡Gracias por participar! Haz clic en \"Siguiente\" para completar el experimento y recibir más instrucciones.",
          keepInTouch: "¿Deberíamos mantener el contacto?",
        },
      },
    },
  },
  ca: {
    translation: {
      language: {
        english: "Anglès",
        spanish: "Castellà",
        catalan: "Català",
      },
      common: {
        startExperiment: "Començar experiment",
        startGame: "Començar joc",
        skipBreak: "Saltar descans",
        resetPong: "Reiniciar Pong",
        continue: "Continuar",
        ok: "OK",
        recalibrate: "Recalibrar",
        next: "Següent",
        back: "Enrere",
        submit: "Enviar",
      },
      form: {
        required: "Obligatori",
        selectMonthYear: "Selecciona mes i any",
        stronglyDisagree: "Totalment en desacord",
        stronglyAgree: "Totalment d'acord",
        notTrueAtAll: "gens\ncert",
        somewhatTrue: "una mica\ncert",
        veryTrue: "molt cert",
        finishedReading: "He acabat de llegir",
        clickToQuestions: "Fes clic per continuar amb les preguntes. Ja no podràs tornar a veure el text.",
      },
      attentionProbe: {
        title: "Comprovació d'atenció",
        prompt: "Just abans d'això, estaves:",
        options: {
          "task-focused": "concentrat/ada en la tasca",
          "distracted by thoughts": "distret/a per pensaments",
          other: "una altra cosa",
        },
      },
      adaptive: {
        readingLabel: "Lectura {{number}}",
        completedOfTotal: "{{completed}} de {{total}}",
        preparingPlan: "Preparant el teu pla de checkpoints.",
        planReady: "El teu pla de checkpoints està a punt.",
        reviewingPlan: "La IA està revisant l'estructura de la lectura i el perfil ASRS.",
        planReadySubtitle: "Pots mantenir el pla recomanat o fer un petit canvi abans de començar.",
        aiLabel: "IA",
        aiPreparing: "Estic preparant una recomanació de checkpoints.",
        aiRecommendation: "Per a aquestes lectures, recomano {{count}} checkpoints en pauses temàtiques naturals.",
        aiDefaultReason: "Basat en la llargada del text, l'estructura i el teu perfil ASRS.",
        aiTakesSeconds: "Normalment triga uns segons.",
        numberOfCheckpoints: "Nombre de checkpoints",
        checkpoints: "checkpoints",
        recommendedForReadings: "{{count}} checkpoints recomanats per a {{readings}} lectures.",
        markerStyle: "Estil de marcador",
        optional: "(opcional)",
        markers: {
          diamond: "Diamants",
          heart: "Cors",
          star: "Estrelles",
        },
        preview: "Vista prèvia",
        previewStart: "Inici",
        previewKeyIdea: "Idea clau {{number}}",
        previewSummary: "Resum",
        previewDescription: "Els checkpoints es col·loquen en pauses temàtiques naturals per donar suport a la concentració i la comprensió.",
        checkpointText: "Checkpoint {{number}}",
        keyIdeaComplete: "idea clau completada",
        readingComplete: "lectura completada",
        planLooksRight: "El teu pla de checkpoints sembla adequat per a aquesta lectura.",
        addCheckpoint: "Afegir checkpoint",
        useFewerCheckpoints: "Fer servir menys checkpoints",
        doneAdded: "He afegit un checkpoint perquè la resta quedi dividida en seccions més petites.",
        doneReduced: "He reduït els checkpoints perquè la lectura tingui menys interrupcions.",
      },
      intro: {
        title: "IA per a la comprensió lectora",
        welcome:
          "Benvinguda/ut a l'experiment. En aquest estudi explorem l'ús de la IA en la comprensió lectora. Llegiràs textos i respondràs algunes preguntes sobre ells. L'experiment durarà aproximadament 1 hora. Abans de començar, introdueix el número de grup, el codi de participant i l'idioma.",
        footer:
          "Michaela Freire Griffith | Grup de recerca TIDE sobre tecnologies interactives i distribuïdes per a l'educació",
        groupNumber: "Número de grup",
        participantCode: "Codi de participant",
        experimentLanguage: "Idioma",
        groupNumberError: "Introdueix un número de l'1 al 4.",
        groupNumberAlert: "Introdueix un número de grup entre 1 i 4.",
        duplicateNoProgress:
          "Aquest codi de participant ja s'ha fet servir i no s'ha trobat progrés local en aquest navegador.",
        saveError: "Hi ha hagut un problema en desar les respostes. Contacta amb la investigadora.",
      },
      part: {
        one: "Part 1/4",
        two: "Part 2/4",
        three: "Part 3/4",
        four: "Part 4/4",
      },
      instructions: {
        title: "Abans de començar",
        intro:
          "Llegeix aquestes instruccions amb atenció abans de començar l'experiment. L'experiment té quatre parts: un qüestionari pre i post, i dues experiències de lectura amb un descans de 5 minuts entre elles.",
        whatWillYouDo: "Què faràs?",
        fourParts: "L'experiment té quatre parts.",
        preTitle: "Qüestionari pre-experiment",
        preDescription:
          "Respon un formulari de consentiment, algunes preguntes sobre tu i un qüestionari d'autoinforme sobre TDAH en adults.",
        experienceATitle: "Experiència de lectura A",
        experienceBTitle: "Experiència de lectura B",
        calibrate: "Calibrar eye tracking",
        readingRounds: "Rondes de lectura",
        readQuestions: "Llegir + 4 preguntes",
        threePassages: "3 textos",
        experienceQuestionnaire: "Qüestionari d'experiència",
        experienceADescription:
          "Aquesta experiència inclou eye tracking, així que començaràs amb una calibració utilitzant la teva càmera web. Després completaràs 3 rondes de lectura. Cada ronda té un text i 4 preguntes de comprensió. Després completaràs un breu qüestionari sobre la teva experiència.",
        breakTitle: "Descans de 5 minuts",
        breakLabel: "Descans",
        breakTimer: "Temporitzador",
        breakBody:
          "És moment de fer un descans de 5 minuts. Pots jugar a PONG a la pantalla, anar al bany, beure aigua o simplement prendre't un moment. Si no vols fer descans, fes clic a \"Saltar descans\".",
        breakOver: "El descans ha acabat. Fes clic a següent per començar l'Experiència B.",
        breakDescription: "Aprox. 5 min",
        experienceBDescription:
          "Calibraràs de nou. Després, completaràs 3 rondes més de lectura amb 4 preguntes després de cada text. Després respondràs un altre breu qüestionari sobre la teva experiència.",
        postTitle: "Qüestionari post-experiment",
        postDescription: "Respon unes preguntes finals sobre la teva experiència en l'experiment.",
        important: "Important",
        keepHeadStill: "Mantén el cap tan quiet com sigui possible durant la calibració del eye tracking i les experiències de lectura.",
        stopResearcher: "Si necessites parar, avisa la investigadora.",
        cannotGoBack: "No podràs tornar enrere per canviar respostes anteriors.",
      },
      experienceIntro: {
        titleA: "Experiència de Lectura A",
        titleB: "Experiència de Lectura B",
        introA:
          "Començaràs amb la calibració del eye tracking, després completaràs 3 rondes de lectura i un breu qüestionari sobre aquesta experiència.",
        introB:
          "Calibraràs de nou, després completaràs 3 rondes de lectura i un breu qüestionari sobre aquesta experiència.",
        startA: "Començar experiència A",
        startB: "Començar experiència B",
      },
      calibration: {
        invalidAccess: "Accés no vàlid. Reinicia l'experiment.",
        prepareError: "No s'ha pogut preparar el seguiment ocular. Actualitza la pàgina i torna-ho a provar.",
        webcamError: "La vista prèvia de la webcam no ha acabat de carregar. Permet l'accés a la càmera i actualitza la pàgina.",
        warmingUp: "El seguiment ocular encara s'està preparant. Espera un moment i torna-ho a provar.",
        scoreNotReady: "La calibració ha acabat, però no s'ha pogut calcular la puntuació de validació perquè el sistema encara no està llest.",
        noPredictions: "La calibració s'ha completat, però no hi ha hagut prediccions de mirada estables per calcular la puntuació. Pots recalibrar i tornar-ho a provar.",
        accuracyMessage: "La teva precisió és del {{accuracy}} %. Continua a {{experience}} o recalibra si vols obtenir un resultat millor.",
        keepEyesFixed: "Mantén la mirada fixa en cada punt morat fins que acabi la mesura.",
        preparing: "Preparant webcam i seguiment ocular...",
        averageError: "Error mitjà de validació: aproximadament {{pixels}} px.",
        startTitle: "La calibració començarà",
        startBody:
          "Fes clic a cada punt 5 vegades mentre el mires directament i mantens el cap quiet. El punt següent apareixerà automàticament després de cada sèrie de clics.",
        promptTitle: "Mesurar precisió de calibració",
        promptBody:
          "Apareixeran quatre punts, un a un. Mantén la mirada en cada punt morat fins que acabi la mesura.",
        clickDots: "Fes clic a cada punt 5 vegades mantenint el cap quiet. Queden {{count}} clic(s) en el punt actual.",
      },
      pre: {
        consent: {
          label: "Formulari de consentiment",
          initials: "Si us plau, escriu les teves inicials:",
          description: `## Estudi d'IA per a la comprensió lectora
Treball de fi de màster en Sistemes Cognitius i Mitjans Interactius — Universitat Pompeu Fabra

**Investigadora:** Michaela Freire Griffith
**Supervisores:** Davinia Hernández-Leo i Marta Manzanares

## De què tracta aquest estudi?
Aquest estudi examina com les persones interactuen amb sistemes d'IA durant tasques de comprensió lectora. Llegiràs textos en una pantalla, respondràs preguntes sobre ells i completaràs qüestionaris breus sobre la teva experiència. Durant les experiències de lectura, els teus moviments oculars s'estimaran mitjançant eye tracking basat en càmera web.

## Què se't demanarà que facis?
* Respondre algunes preguntes sobre tu
* Completar un qüestionari d'autoinforme de 6 preguntes sobre TDAH en adults
* Completar dues experiències de lectura que consisteixen a llegir tres textos en cadascuna i respondre quatre preguntes de comprensió lectora després de cada text
* Completar qüestionaris breus sobre la teva experiència
* Mantenir el cap tan quiet com sigui possible durant la calibració del eye tracking i les experiències de lectura

## Eye Tracking
* Durant l'estudi s'utilitza una càmera web estàndard
* La càmera web **no grava vídeo ni imatges**
* Només es recullen **coordenades de mirada en pantalla (posicions x/y)**

## Quines dades es recolliran?
* Respostes a qüestionaris
* Respostes de comprensió lectora
* Registres d'interacció durant l'experiment
* Coordenades de mirada durant les experiències de lectura
* **No s'emmagatzemaran amb les teves dades vídeo, imatges ni informació personal directament identificable**

## Com s'utilitzaran les teves dades?
Les teves dades s'anonimitzaran i s'utilitzaran només amb finalitats de recerca. El qüestionari ASRS s'utilitza únicament com a mesura d'autoinforme per a recerca. **No es farà cap diagnòstic, etiquetatge ni classificació clínica**. La càmera web registra únicament coordenades de mirada a la pantalla durant la calibració i les experiències de lectura, i no grava vídeo ni imatges.

## La participació és voluntària?
Sí. La participació és completament voluntària. Pots parar en qualsevol moment sense penalització. Si necessites parar, avisa la investigadora.

## Declaració de consentiment
En continuar, confirmes que has llegit i entès la informació anterior, que acceptes participar voluntàriament, que entens que l'ús de la càmera web només registra coordenades de mirada i no imatges ni vídeo, i que entens que l'ASRS no és una eina diagnòstica.`,
        },
        about: {
          label: "Sobre tu",
          description: "Si us plau, respon les preguntes següents sobre tu.",
          degree: "Quina titulació estàs <strong>cursant actualment</strong>?",
          birthDate: "Quina és la teva <strong>data de naixement</strong>?",
          nationality: "Quina és la teva <strong>nacionalitat</strong>?",
          residence: "En quin país és la teva <strong>residència actual</strong>?",
        },
        degree: {
          bachelor: "Grau",
          master: "Màster",
          phd: "Doctorat",
        },
        asrsChoices: {
          never: "Mai",
          rarely: "Rarament",
          sometimes: "A vegades",
          often: "Sovint",
          veryOften: "Molt sovint",
        },
        asrs: {
          label: "Escala d'autoinforme per a adults",
          description: "Marca l'opció que millor descriu com t'has sentit i comportat durant els darrers 6 mesos.",
          q1: "1. Amb quina freqüència tens dificultats per acabar els últims detalls d'un projecte, un cop ja has fet les parts més difícils?",
          q2: "2. Amb quina freqüència tens dificultat per posar les coses en ordre quan has de fer una tasca que requereix organització?",
          q3: "3. Amb quina freqüència tens problemes per recordar cites o obligacions?",
          q4: "4. Quan tens una tasca que requereix pensar molt, amb quina freqüència evites o retardes començar-la?",
          q5: "5. Amb quina freqüència mous inquietament les mans o els peus, o et remous al seient, quan has d'estar assegut/uda durant molt de temps?",
          q6: "6. Amb quina freqüència et sents massa actiu/iva i obligat/ada a fer coses, com si t'impulsés un motor?",
        },
      },
      post: {
        experience: {
          label: "Prova cognitiva",
          description: "Si us plau, respon les preguntes següents sobre la teva experiència durant l'experiment.",
          stress: "Nivell d'estrès?",
          feelings: "Com et sents?",
        },
        next: {
          label: "Passos següents",
          description: "Gràcies per participar! Fes clic a \"Següent\" per completar l'experiment i rebre més instruccions.",
          keepInTouch: "Hauríem de mantenir el contacte?",
        },
      },
    },
  },
};

void i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
