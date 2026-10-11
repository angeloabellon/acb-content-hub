export type CommunitySpaceSlug = "acb" | "bcl";

export type CommunitySpace = {
  slug: CommunitySpaceSlug;
  eyebrow: string;
  title: string;
  description: string;
  detail: string;
};

export type CommunityMessage = {
  author: string;
  username?: string;
  initials: string;
  publishedAt: string;
  body: string;
  /** Public usernames resolved from the message; unresolved text stays plain. */
  mentionUsernames?: string[];
};

export type CommunityTopic = {
  id?: string;
  slug: string;
  space: CommunitySpaceSlug;
  title: string;
  excerpt: string;
  author: string;
  authorUsername?: string;
  initials: string;
  replies: number;
  following?: boolean;
  unreadReplies?: number;
  mentionUsernames?: string[];
  lastActivity: string;
  messages: CommunityMessage[];
};

export const communitySpaces: CommunitySpace[] = [
  {
    slug: "acb",
    eyebrow: "Liga Endesa",
    title: "UCAM Murcia en ACB",
    description:
      "El día a día del equipo en Liga Endesa: partidos, plantilla, sensaciones y conversación de grada.",
    detail:
      "Un lugar para comentar la temporada del UCAM Murcia en ACB con calma, criterio y pasión por el baloncesto.",
  },
  {
    slug: "bcl",
    eyebrow: "Basketball Champions League",
    title: "UCAM Murcia en BCL",
    description:
      "La aventura europea del UCAM Murcia: previas, análisis, desplazamientos y noches de Basketball Champions League.",
    detail:
      "Todo lo que acompaña al UCAM Murcia en Europa, desde la previa hasta el último comentario tras el partido.",
  },
];

export const communityTopics: CommunityTopic[] = [
  {
    slug: "que-esperais-del-proximo-partido-en-acb",
    space: "acb",
    title: "¿Qué esperáis del próximo partido en ACB?",
    excerpt:
      "Un punto de encuentro para compartir sensaciones antes de volver a ver al UCAM Murcia en la pista.",
    author: "Pabellón Norte",
    initials: "PN",
    replies: 12,
    lastActivity: "Hace 28 min",
    messages: [
      {
        author: "Pabellón Norte",
        initials: "PN",
        publishedAt: "Hoy, 12:16",
        body:
          "Me apetece ver un partido con más ritmo desde el inicio. Si el equipo encuentra continuidad atrás, tendremos muchas opciones de competir hasta el final.",
      },
      {
        author: "Rojo y Universitario",
        initials: "RU",
        publishedAt: "Hoy, 12:34",
        body:
          "Estoy de acuerdo. La clave para mí estará en no regalar segundas oportunidades y en correr cuando haya rebote defensivo.",
      },
      {
        author: "Silla 14",
        initials: "S14",
        publishedAt: "Hoy, 12:48",
        body:
          "Y paciencia en ataque. Cuando se mueve bien el balón el Palacio se engancha enseguida al partido.",
      },
    ],
  },
  {
    slug: "rotacion-y-minutos-para-las-proximas-jornadas",
    space: "acb",
    title: "Rotación y minutos para las próximas jornadas",
    excerpt:
      "Debate sobre los ajustes que pueden ayudar al equipo a sostener la intensidad durante toda la semana.",
    author: "Murcia Basket",
    initials: "MB",
    replies: 8,
    lastActivity: "Ayer",
    messages: [
      {
        author: "Murcia Basket",
        initials: "MB",
        publishedAt: "Ayer, 20:42",
        body:
          "La acumulación de partidos obliga a mirar también el largo plazo. Me interesa ver cómo se reparte la energía en los tramos decisivos.",
      },
      {
        author: "La Curva",
        initials: "LC",
        publishedAt: "Ayer, 21:07",
        body:
          "Más allá de los nombres, me parece importante que cada quinteto tenga una identidad clara en pista.",
      },
    ],
  },
  {
    slug: "la-defensa-como-punto-de-partida",
    space: "acb",
    title: "La defensa como punto de partida",
    excerpt:
      "Ideas y lecturas sobre el rasgo que más ha definido al UCAM Murcia en sus mejores noches.",
    author: "Tiempo Muerto",
    initials: "TM",
    replies: 15,
    lastActivity: "Hace 2 días",
    messages: [
      {
        author: "Tiempo Muerto",
        initials: "TM",
        publishedAt: "Lunes, 19:03",
        body:
          "Cuando el equipo aprieta en primera línea, todo el partido cambia de tono. Esa energía es una de las cosas más reconocibles del UCAM Murcia.",
      },
      {
        author: "Fondo Rojo",
        initials: "FR",
        publishedAt: "Lunes, 19:31",
        body:
          "Además, permite jugar más libre después. Defender bien también genera confianza para atacar.",
      },
    ],
  },
  {
    slug: "una-noche-europea-para-recordar",
    space: "bcl",
    title: "Una noche europea para recordar",
    excerpt:
      "La conversación después de una de esas citas BCL que dejan al Palacio con ganas de más.",
    author: "Viajando con el UCAM",
    initials: "VU",
    replies: 19,
    lastActivity: "Hace 1 h",
    messages: [
      {
        author: "Viajando con el UCAM",
        initials: "VU",
        publishedAt: "Hoy, 11:22",
        body:
          "Hay noches europeas que se viven de otra manera. Desde la presentación hasta el último minuto se notó algo especial en la grada.",
      },
      {
        author: "Europa en Rojo",
        initials: "ER",
        publishedAt: "Hoy, 11:48",
        body:
          "La BCL le da un contexto distinto a cada detalle. Disfrutar de estas eliminatorias también es parte del camino.",
      },
      {
        author: "Canasta Murcia",
        initials: "CM",
        publishedAt: "Hoy, 12:04",
        body:
          "Ojalá sigamos sumando noches así. La mezcla de baloncesto y ambiente fue espectacular.",
      },
    ],
  },
  {
    slug: "claves-para-la-proxima-cita-de-bcl",
    space: "bcl",
    title: "Claves para la próxima cita de BCL",
    excerpt:
      "Qué detalles pueden marcar la diferencia en el siguiente compromiso europeo del UCAM Murcia.",
    author: "Zona 2-3",
    initials: "Z23",
    replies: 6,
    lastActivity: "Ayer",
    messages: [
      {
        author: "Zona 2-3",
        initials: "Z23",
        publishedAt: "Ayer, 18:15",
        body:
          "En Europa los partidos se deciden a menudo en posesiones muy cortas. Cuidar el rebote y las pérdidas será fundamental.",
      },
      {
        author: "Palacio 3",
        initials: "P3",
        publishedAt: "Ayer, 18:52",
        body:
          "Y aprovechar el ambiente de casa. En estos partidos cada parcial cuenta mucho.",
      },
    ],
  },
  {
    slug: "como-se-vive-la-bcl-desde-la-grada",
    space: "bcl",
    title: "¿Cómo se vive la BCL desde la grada?",
    excerpt:
      "Experiencias, rutinas y recuerdos alrededor de los partidos europeos en Murcia.",
    author: "Grada Universitaria",
    initials: "GU",
    replies: 11,
    lastActivity: "Hace 3 días",
    messages: [
      {
        author: "Grada Universitaria",
        initials: "GU",
        publishedAt: "Domingo, 18:26",
        body:
          "La sensación de una cita europea en el Palacio empieza mucho antes del salto inicial. Se nota en la gente y en la forma de mirar el partido.",
      },
      {
        author: "Rojo Europa",
        initials: "RE",
        publishedAt: "Domingo, 19:02",
        body:
          "Para mí es la oportunidad de seguir descubriendo rivales y estilos. Cada partido tiene una historia distinta.",
      },
    ],
  },
];

export function getCommunitySpace(slug: string) {
  return communitySpaces.find((space) => space.slug === slug);
}

export function getCommunityTopic(slug: string) {
  return communityTopics.find((topic) => topic.slug === slug);
}

export function getCommunityTopicsBySpace(slug: CommunitySpaceSlug) {
  return communityTopics.filter((topic) => topic.space === slug);
}
