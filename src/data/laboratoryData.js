export const laboratoryWorkTypes = [
  'Corona ceramica',
  'Protesis removible',
  'Protesis fija',
  'Carilla dental',
  'Placa de bruxismo',
  'Incrustacion',
  'Modelo diagnostico',
  'Retenedor',
]

export const dentalMaterials = [
  'Zirconio',
  'Disilicato de litio',
  'Resina',
  'Acrilico',
  'Metal porcelana',
  'Cera diagnostica',
]

export const toothShades = ['A1', 'A2', 'A3', 'A3.5', 'B1', 'B2', 'C1', 'C2', 'D2']

export const laboratoryStatusLabels = {
  received: 'Recibido',
  design: 'En diseño',
  manufacturing: 'En fabricacion',
  quality: 'Control de calidad',
  ready: 'Listo para entrega',
  delivered: 'Entregado',
  adjustment: 'Requiere ajuste',
}

export const laboratoryData = [
  {
    id: 'corona-cerámica',
    title: 'Corona Cerámica',
    duration: '5-7 días',
    description: 'Fabricación de coronas cerámicas de alta estética con tecnología CAD/CAM',
    steps: [
      {
        title: 'Recepción de moldes',
        description: 'Se reciben los moldes dentales y la prescripción del odontólogo con especificaciones de color y forma',
      },
      {
        title: 'Análisis y diseño',
        description: 'El técnico revisa los moldes y diseña la corona en CAD para asegurar un ajuste perfecto',
      },
      {
        title: 'Fresado de bloques cerámicos',
        description: 'Se utiliza la máquina de fresado CAD/CAM para crear la corona con precisión micrométrica',
      },
      {
        title: 'Cocción en horno',
        description: 'La corona se coloca en el horno a temperaturas controladas (900-1200°C) para endurecer el material',
      },
      {
        title: 'Glazed y color',
        description: 'Se aplican pigmentos especializados y esmalte para lograr el color natural y brillo deseado',
      },
      {
        title: 'Control de calidad',
        description: 'Se verifica la densidad, color, rugosidad y encaje con microscopio de 40x aumentos',
      },
      {
        title: 'Empaque y envío',
        description: 'La corona se empaca en caja estéril con documento de especificaciones técnicas',
      },
    ],
  },
  {
    id: 'prótesis-removible',
    title: 'Prótesis Removible (Dentadura)',
    duration: '10-14 días',
    description: 'Fabricación de prótesis completa o parcial removible con máxima comodidad y estética',
    steps: [
      {
        title: 'Revisión de moldes',
        description: 'Se analizan los moldes de alginato o silicona y se verifica la calidad de la impresión',
      },
      {
        title: 'Confección de modelo maestro',
        description: 'Se prepara un modelo de yeso tipo IV de alta precisión como base de trabajo',
      },
      {
        title: 'Diseño de la estructura',
        description: 'Se dibuja el diseño de paladar, sujetadores y conectores basado en anatomía y estética',
      },
      {
        title: 'Modelado en cera',
        description: 'Se crea un patrón en cera que replica exactamente la forma deseada de la dentadura',
      },
      {
        title: 'Proceso de encasquillado',
        description: 'Se coloca el patrón en molde refractario y se calienta para eliminar la cera',
      },
      {
        title: 'Inyección de acrílico',
        description: 'Se inyecta el acrílico termopolimerizable bajo presión y calor en el molde',
      },
      {
        title: 'Pulido y acabado',
        description: 'Se realiza pulido con piedra pómez, agua y disco de fieltro hasta obtener brillo espejo',
      },
      {
        title: 'Ajuste y control',
        description: 'Se verifican espacios, contactos y comodidad antes de empacar para envío',
      },
    ],
  },
  {
    id: 'carilla-dental',
    title: 'Carilla Dental de Porcelana',
    duration: '7-10 días',
    description: 'Carillas ultrafinas de porcelana para mejorar estética dental anterior',
    steps: [
      {
        title: 'Recepción de modelos',
        description: 'Se reciben los moldes con la preparación dental realizada por el odontólogo',
      },
      {
        title: 'Análisis estético',
        description: 'Se define la forma, tamaño y color basado en la anatomía facial del paciente',
      },
      {
        title: 'Modelado en yeso',
        description: 'Se prepara un patrón en cera o material modelable que sirva como guía',
      },
      {
        title: 'Aplicación de porcelana',
        description: 'Se aplica porcelana de feldespato en capas delgadas (0.5-0.7mm) con pigmentación gradual',
      },
      {
        title: 'Primera cocción',
        description: 'Se cuece a 1100°C durante 3-4 minutos para fusionar las primeras capas',
      },
      {
        title: 'Estratificación',
        description: 'Se añaden capas de diferentes tonos para lograr efecto natural y translucidez',
      },
      {
        title: 'Cocción final y glaseado',
        description: 'Cocción final a 900-950°C con aplicación de glaze para obtener acabado liso y brillante',
      },
      {
        title: 'Control y empaque',
        description: 'Se verifica el color, forma y encaje, luego se empaca en caja estéril',
      },
    ],
  },
  {
    id: 'placa-bruxismo',
    title: 'Placa de Bruxismo (Guardián Nocturno)',
    duration: '3-5 días',
    description: 'Placa oclusal personalizada para proteger dientes del rechinar nocturno',
    steps: [
      {
        title: 'Recepción de moldes',
        description: 'Se reciben moldes del maxilar superior o inferior según prescripción',
      },
      {
        title: 'Análisis de oclusión',
        description: 'Se analiza la relación de contactos y se marca la guía de movimiento',
      },
      {
        title: 'Adaptación del molde',
        description: 'Se calienta el material termoplástico y se adapta perfectamente al modelo',
      },
      {
        title: 'Modelado de altura',
        description: 'Se ajusta la altura del material para proporcionar máximo confort y protección',
      },
      {
        title: 'Pulido y suavizado',
        description: 'Se pulen todos los bordes y superficies para eliminar asperezas',
      },
      {
        title: 'Prueba de espesor',
        description: 'Se verifica que el espesor sea suficiente para absorber fuerzas de bruxismo',
      },
    ],
  },
  {
    id: 'incrustacion-dental',
    title: 'Incrustación (Inlay/Onlay)',
    duration: '5-7 días',
    description: 'Restauración de precisión para cavidades grandes en dientes posteriores',
    steps: [
      {
        title: 'Recepción de impresión',
        description: 'Se recibe la impresión con la preparación realizada por el odontólogo',
      },
      {
        title: 'Diseño y análisis',
        description: 'Se analiza la profundidad de la cavidad y se diseña la restauración',
      },
      {
        title: 'Modelado en cera',
        description: 'Se modela en cera un patrón exacto de la incrustación con todos los detalles',
      },
      {
        title: 'Encasquillado y cocción',
        description: 'Se realiza el proceso de encasquillado y cocción para eliminar la cera',
      },
      {
        title: 'Colado de cerámica',
        description: 'Se cuela la cerámica en alta temperatura para crear la incrustación',
      },
      {
        title: 'Ajuste y glaseado',
        description: 'Se ajusta el contacto y se aplica glaze para obtener superficie brillante',
      },
      {
        title: 'Pulido final',
        description: 'Se realiza pulido fino para asegurar la menor fricción y máxima durabilidad',
      },
    ],
  },
  {
    id: 'modelo-diagnostico',
    title: 'Modelo Diagnóstico (Wax-up)',
    duration: '2-3 días',
    description: 'Modelo en cera que simula el resultado final antes del tratamiento',
    steps: [
      {
        title: 'Recepción de moldes',
        description: 'Se reciben los moldes diagnosticados para planificar el tratamiento',
      },
      {
        title: 'Análisis de proporciones',
        description: 'Se analiza la sonrisa, proporciones dentales y simetría facial',
      },
      {
        title: 'Aplicación de cera',
        description: 'Se aplica cera de modelado sobre los dientes para simular cambios',
      },
      {
        title: 'Esculpido de detalles',
        description: 'Se esculpen los detalles anatómicos como surcos y ángulos',
      },
      {
        title: 'Refinamiento estético',
        description: 'Se ajustan los contornos para lograr máxima armonía estética',
      },
      {
        title: 'Entrega para presentación',
        description: 'El modelo se entrega al odontólogo para mostrar al paciente el resultado esperado',
      },
    ],
  },
]
