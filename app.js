const windows = new Map();
let zIndex = 60;
let clockClicks = 0;
let typedBuffer = "";
let toastTimer;
let activeDragCleanup;
let activeResizeCleanup;
let commandHistory = [];
let historyIndex = -1;
let visitCount = null;
let visitCounterState = "loading";

const desktop = document.querySelector("#desktop");
const boot = document.querySelector("#boot");
const toast = document.querySelector("#toast");
const terminalOutput = document.querySelector("#terminal-output");
const terminalForm = document.querySelector("#terminal-form");
const terminalCommand = document.querySelector("#terminal-command");
const menuClock = document.querySelector("#menu-clock");
const languageSetup = document.querySelector("#language-setup");
const languageButtons = document.querySelectorAll("[data-language]");
const visitCounterContainers = document.querySelectorAll("[data-visit-counter]");
const visitCounterLabels = document.querySelectorAll("[data-visit-label]");
const visitCounterValues = document.querySelectorAll("[data-visit-count]");
const languageStorageKey = "leoos-language";
const visitStorageKey = "leoos-visit-counted";
let activeLanguage = "pt";

const i18n = {
  pt: {
    lang: "pt-BR",
    title: "Leonardo Penna de Lima - LeoOS",
    description: "Site pessoal de Leonardo Penna de Lima em formato de desktop Macintosh clássico.",
    boot: "Iniciando LeoOS...",
    setup: {
      title: "Escolha o idioma",
      copy: "Choose your language · Elige tu idioma",
      pt: "Continuar em português",
      en: "Continue in English",
      es: "Continuar en español",
    },
    aria: {
      menu: "Menu do LeoOS",
      windows: "Janelas",
      desktop: "Desktop pessoal de Leonardo",
      mobileHome: "LeoOS mobile",
      quickActions: "Atalhos principais",
      usefulFiles: "Arquivos úteis",
      icons: "Ícones do desktop",
      avatar: "Abrir sobre Leonardo",
      dock: "Dock",
    },
    menu: {
      about: "Sobre o LeoOS",
      language: "Idioma...",
      restart: "Reiniciar...",
      shutdown: "Desligar",
      file: "Arquivo",
      openAbout: "Abrir Sobre",
      openResume: "Abrir Currículo",
      openProjects: "Abrir Projetos",
      openClippings: "Abrir Recortes",
      openTerminal: "Abrir Terminal",
      close: "Fechar janela",
      closeAll: "Fechar tudo",
      resume: "Currículo",
      projects: "Projetos",
      clippings: "Recortes",
      special: "Especial",
      command: "Comando",
    },
    mobile: {
      kicker: "LeoOS Mobile",
      bio: "PM de produtos de IA que prototipa, mede qualidade e transforma demo em sistema.",
      cv: "CV",
      projects: "Projetos",
      clippings: "Recortes",
      contact: "Contato",
      terminal: "Terminal",
      terminalHint: "ajuda · interesses · abrir projetos",
      github: "GitHub",
      disks: "Discos",
    },
    icons: ["Sobre", "Currículo", "Projetos", "Recortes", "Terminal"],
    about: {
      title: "Sobre Leonardo",
      role: "PM Sênior · Produtos de IA",
      status: "Mercado Livre / São Paulo",
      terms: ["Foco", "Stack", "Base"],
      values: ["IA generativa e agentes", "Agentes de IA · MCP · Claude Code · OpenAI", "São Paulo, BR"],
      lead:
        "Product Manager que coda, prototipa com agentes e leva discussão técnica para perto da estratégia. O fio condutor: produtos de IA que saem do demo, medem qualidade e sobrevivem à produção.",
      capLabels: ["Sistemas de IA", "Qualidade de IA", "Produto & Craft"],
      capGroups: [
        ["Aplicações com LLM e IA generativa", "Prompt e engenharia de contexto", "Agentes de IA e workflows agênticos", "Human-in-the-loop", "RAG · Tool/function calling · MCP"],
        ["Avaliação de IA e LLM evals", "Observabilidade de IA", "Segurança e guardrails", "Mitigação de alucinação", "QA e governança de IA"],
        ["Gestão e estratégia de produtos de IA", "Desenvolvimento guiado por specs e PRDs", "Discovery e PM orientado por dados", "Experimentação, analytics e ciclos de aprendizado", "Claude Code, Cursor e Copilot", "OpenAI API, prototipação e automação", "Cross-functional · DevEx · SaaS", "Figma · Jira · GitHub · SQL"],
      ],
      personalFiles: "Arquivos pessoais",
      interests: ["Programação", "Impressão 3D", "Fotografia", "Relógios", "Futebol"],
      avatarAlt: "Foto de Leonardo Lima no GitHub",
    },
    resume: {
      title: "Currículo",
      eyebrow: "Trajetória",
      heading: "De experimentos com IA a sistemas em produção.",
      linkedIn: "Abrir LinkedIn",
      times: ["Mar 2025 - presente", "Jan 2023 - Mar 2025", "Abr 2022 - Set 2022", "Jan 2019 - Abr 2022"],
      roles: [
        "Mercado Livre - Senior Product Manager, IA & Pós-compra",
        "iFood - Senior Product Manager, IA, Onboarding & Crédito",
        "Revelo - Product Manager",
        "Sinch / Wavy Global - Product Analyst Jr. / Product Assistant / Intern",
      ],
      descriptions: [
        "Liderou assistente conversacional com LLM; co-implementou avaliação LLM-as-a-judge, governança de IA responsável e workflows agênticos.",
        "Construiu assistente de IA para atendimento, redesenhou onboarding e otimizou motor de crédito para crescimento de volume sem degradar qualidade.",
        "Reconstruiu plataforma de recrutamento internacional em inglês e conduziu discovery-to-launch com times técnicos e stakeholders.",
        "Liderou squad de soluções de mensageria, templates reutilizáveis e fluxos de comunicação para clientes enterprise, incluindo saúde.",
      ],
      education: "Formação",
      educationLines: ["MBA em Gestão de Negócios - USP / Esalq, 2024-2026.", "BSc em Sistemas de Informação - ESPM, 2020-2022.", "BSc em Ciência da Computação - UFSCar, 2016-2019."],
      recognition: "Certificações & reconhecimento",
      recognitionLines: ["Reforge Growth Series; Generative AI Products: From Idea to MVP.", "PM3, Tera Digital Product Leadership, AI Fluency, Claude Code in Action.", "Vice-campeão Hackatrouble na categoria Negócios."],
    },
    projects: {
      title: "Projetos",
      filters: ["Todos", "IA", "Produto", "Código"],
      descriptions: [
        "Website pessoal dark/minimalista em Next.js, Tailwind e TypeScript.",
        "Experimento single-file com multi-agent Q-Learning em plataformas.",
        "Concierge de moda com IA no Product Hunt, usando GPT-4 para sugestões de outfits.",
        "Sistema de filas virtuais premiado no Hackatrouble 2020 para reduzir aglomerações.",
        "Bot em Python para gerar texto e imagens com OpenAI API via Telegram.",
        "Projetos de faculdade em C++ com listas, pilhas e árvores.",
      ],
      clipping: "Recorte",
      repos: "Repositórios",
    },
    clippings: {
      title: "Recortes públicos",
      archive: "Arquivo",
      headings: ["Perfil no GitHub", "LookMate no Product Hunt", "Artigos de Product Management", "Hackatrouble / Fila Digital", "User Experience - Mais do que um app bonito", "about.me"],
      descriptions: [
        "Perfil público leop25 no GitHub: Product Manager no Mercado Livre, repositórios em TypeScript, HTML, Python e C++.",
        "App iOS de consultoria de moda com IA, lançado por Leonardo no Product Hunt.",
        "Textos sobre stakeholders, mudança de escopo e colaboração entre PMs e devs.",
        "Equipe Research ficou em segundo lugar na categoria Negócios com uma fila virtual para a pandemia.",
        "Artigo publicado pela CATI Jr., assinado por Leonardo Penna de Lima.",
        "Registro antigo como estudante e conversation designer em Santana de Parnaíba, com Wavy Global, UFSCar e ESPM.",
      ],
    },
    terminal: {
      title: "Terminal",
      intro: "LeoOS shell v1.0",
      hint: "Digite `help` para comandos indexados.",
      prompt: "leo@pm-mac:~$",
      help: "Comandos: whoami, resume, projects, sources, interests, contact, hackatrouble, lookmate, open <janela>, clear, sudo.",
      whoami: "Leonardo Penna de Lima - Senior Product Manager focado em produtos de IA, aplicações com LLM, agentes, avaliação de IA e estratégia.",
      resume: "Mercado Livre, iFood, Revelo, Sinch/Wavy. Formação: MBA USP/Esalq, Sistemas de Informação na ESPM, Ciência da Computação na UFSCar.",
      projects: "pessoal_website, ai-platform-qlearning, LookMate, Fila Digital, openai-telegram e projetos universitários em C++.",
      sources: "Fontes: LinkedIn, GitHub, Product Hunt, São Carlos em Rede, Medium, about.me e materiais locais.",
      interests: "Arquivos pessoais: programação, impressão 3D, fotografia, relógios e futebol.",
      contact: "Contato público: LinkedIn /in/leoplima e GitHub @leop25.",
      hackatrouble: "Hackatrouble 2020: Fila Digital, segundo lugar na categoria Negócios, criado para filas virtuais durante a pandemia.",
      lookmate: "LookMate: lançamento no Product Hunt de um concierge de moda com IA usando recomendações de outfits via GPT-4.",
      sudo: "Boa tentativa. Autoridade de produto exige alinhamento com stakeholders.",
      opened: (target) => `Abriu ${target}.`,
      notFound: "Janela não encontrada. Tente about, resume, projects, clippings ou terminal.",
      commandNotFound: (raw) => `Comando não encontrado: ${raw}`,
      agent: "Modo agente ativado. Ciclo de PoC comprimido.",
      doleo: "Senha aceita. Dados privados de contato continuam desmontados.",
    },
    toast: {
      languageSet: "Idioma definido.",
      restarted: "LeoOS reiniciado.",
      shutdown: "Desligado. Clique em qualquer lugar para reiniciar.",
      welcomeBack: "Bem-vindo de volta.",
      closed: "Janela fechada.",
      allClosed: "Todas as janelas fechadas.",
      special: "Especial: inversão de tela alternada.",
      watch: "Modo relógio montado.",
      konami: "Konami aceito.",
    },
    visits: {
      label: "Visitas",
      loading: "----",
      offline: "offline",
      ariaLoading: "Contador de visitas carregando.",
      ariaOffline: "Contador de visitas indisponível.",
      ariaReady: (count) => `Contador de visitas: ${count}.`,
    },
  },
  en: {
    lang: "en",
    title: "Leonardo Penna de Lima - LeoOS",
    description: "Personal site for Leonardo Penna de Lima as a classic Macintosh desktop.",
    boot: "Starting LeoOS...",
    setup: {
      title: "Choose language",
      copy: "Escolha o idioma · Elige tu idioma",
      pt: "Continuar em português",
      en: "Continue in English",
      es: "Continuar en español",
    },
    aria: {
      menu: "LeoOS menu",
      windows: "Windows",
      desktop: "Leonardo's personal desktop",
      mobileHome: "LeoOS mobile",
      quickActions: "Primary shortcuts",
      usefulFiles: "Useful files",
      icons: "Desktop icons",
      avatar: "Open about Leonardo",
      dock: "Dock",
    },
    menu: {
      about: "About LeoOS",
      language: "Language...",
      restart: "Restart...",
      shutdown: "Shut Down",
      file: "File",
      openAbout: "Open About",
      openResume: "Open Resume",
      openProjects: "Open Projects",
      openClippings: "Open Clippings",
      openTerminal: "Open Terminal",
      close: "Close Window",
      closeAll: "Close All",
      resume: "Resume",
      projects: "Projects",
      clippings: "Clippings",
      special: "Special",
      command: "Command",
    },
    mobile: {
      kicker: "LeoOS Mobile",
      bio: "AI product PM who prototypes, measures quality, and turns demos into systems.",
      cv: "Resume",
      projects: "Projects",
      clippings: "Clippings",
      contact: "Contact",
      terminal: "Terminal",
      terminalHint: "help · interests · open projects",
      github: "GitHub",
      disks: "Disks",
    },
    icons: ["About Leo", "Resume", "Projects", "Clippings", "Terminal"],
    about: {
      title: "About Leonardo",
      role: "Senior PM · AI Products",
      status: "Mercado Livre / São Paulo",
      terms: ["Focus", "Stack", "Base"],
      values: ["Generative AI and agents", "AI Agents · MCP · Claude Code · OpenAI", "São Paulo, BR"],
      lead: "Product Manager who codes, prototypes with agents, and brings technical discussion closer to strategy. The thread: AI products that move past demos, measure quality, and survive production.",
      capLabels: ["AI Systems", "AI Quality", "Product & Craft"],
      capGroups: [
        ["LLM applications and generative AI", "Prompt and context engineering", "AI agents and agentic workflows", "Human-in-the-loop", "RAG · Tool/function calling · MCP"],
        ["AI evaluation and LLM evals", "AI observability", "AI safety and guardrails", "Hallucination mitigation", "AI quality assurance and governance"],
        ["AI product management and strategy", "Spec-driven development and PRDs", "Product discovery and data-driven PM", "Experimentation, analytics, and learning loops", "Claude Code, Cursor, and Copilot", "OpenAI API, prototyping, and automation", "Cross-functional · DevEx · SaaS", "Figma · Jira · GitHub · SQL"],
      ],
      personalFiles: "Personal files",
      interests: ["Programming", "3D printing", "Photography", "Watches", "Football"],
      avatarAlt: "Photo of Leonardo Lima on GitHub",
    },
    resume: {
      title: "Resume",
      eyebrow: "Career path",
      heading: "From AI experiments to production systems.",
      linkedIn: "Open LinkedIn",
      times: ["Mar 2025 - Present", "Jan 2023 - Mar 2025", "Apr 2022 - Sep 2022", "Jan 2019 - Apr 2022"],
      roles: ["Mercado Livre - Senior Product Manager, AI & Post-Purchase", "iFood - Senior Product Manager, AI, Onboarding & Credit", "Revelo - Product Manager", "Sinch / Wavy Global - Product Analyst Jr. / Product Assistant / Intern"],
      descriptions: [
        "Led a conversational LLM assistant; co-implemented LLM-as-a-judge evaluation, responsible AI governance, and agentic workflows.",
        "Built an AI support assistant, redesigned onboarding, and optimized the credit engine for growth without degrading quality.",
        "Rebuilt an international recruiting platform in English and drove discovery-to-launch with technical teams and stakeholders.",
        "Led a messaging solutions squad, reusable templates, and communication flows for enterprise clients, including healthcare.",
      ],
      education: "Education",
      educationLines: ["MBA in Business Management - USP / Esalq, 2024-2026.", "BSc in Information Systems - ESPM, 2020-2022.", "BSc in Computer Science - UFSCar, 2016-2019."],
      recognition: "Certifications & recognition",
      recognitionLines: ["Reforge Growth Series; Generative AI Products: From Idea to MVP.", "PM3, Tera Digital Product Leadership, AI Fluency, Claude Code in Action.", "Runner-up at Hackatrouble in the Business category."],
    },
    projects: {
      title: "Projects",
      filters: ["All", "AI", "Product", "Code"],
      descriptions: [
        "Dark minimalist personal website built with Next.js, Tailwind, and TypeScript.",
        "Single-file experiment with multi-agent Q-Learning on platforms.",
        "AI fashion concierge launched on Product Hunt, using GPT-4 for outfit suggestions.",
        "Virtual queue system awarded at Hackatrouble 2020 to reduce crowds.",
        "Python bot for generating text and images with the OpenAI API through Telegram.",
        "College projects in C++ with lists, stacks, and trees.",
      ],
      clipping: "Clipping",
      repos: "Repos",
    },
    clippings: {
      title: "Public Clippings",
      archive: "Archive",
      headings: ["GitHub profile", "LookMate on Product Hunt", "Product Management articles", "Hackatrouble / Fila Digital", "User Experience - More than a pretty app", "about.me"],
      descriptions: [
        "Public GitHub profile leop25: Product Manager at Mercado Livre, with repositories in TypeScript, HTML, Python, and C++.",
        "AI fashion consulting iOS app launched by Leonardo on Product Hunt.",
        "Writing about stakeholders, scope changes, and collaboration between PMs and developers.",
        "Team Research placed second in the Business category with a virtual queue for the pandemic.",
        "Article published by CATI Jr., authored by Leonardo Penna de Lima.",
        "Older profile as a student and conversation designer in Santana de Parnaíba, with Wavy Global, UFSCar, and ESPM.",
      ],
    },
    terminal: {
      title: "Terminal",
      intro: "LeoOS shell v1.0",
      hint: "Type `help` for indexed commands.",
      prompt: "leo@pm-mac:~$",
      help: "Commands: whoami, resume, projects, sources, interests, contact, hackatrouble, lookmate, open <window>, clear, sudo.",
      whoami: "Leonardo Penna de Lima - Senior Product Manager focused on AI products, LLM applications, agents, AI evaluation, and strategy.",
      resume: "Mercado Livre, iFood, Revelo, Sinch/Wavy. Education: MBA USP/Esalq, Information Systems at ESPM, Computer Science at UFSCar.",
      projects: "pessoal_website, ai-platform-qlearning, LookMate, Fila Digital, openai-telegram, and college projects in C++.",
      sources: "Sources: LinkedIn, GitHub, Product Hunt, São Carlos em Rede, Medium, about.me, and local materials.",
      interests: "Personal files: programming, 3D printing, photography, watches, and football.",
      contact: "Public contact: LinkedIn /in/leoplima and GitHub @leop25.",
      hackatrouble: "Hackatrouble 2020: Fila Digital, second place in the Business category, built for virtual queues during the pandemic.",
      lookmate: "LookMate: Product Hunt launch of an AI fashion concierge using GPT-4 outfit recommendations.",
      sudo: "Good try. Product authority requires stakeholder alignment.",
      opened: (target) => `Opened ${target}.`,
      notFound: "Window not found. Try about, resume, projects, clippings, or terminal.",
      commandNotFound: (raw) => `Command not found: ${raw}`,
      agent: "Agent mode enabled. PoC cycle compressed.",
      doleo: "Passphrase accepted. Private contact data remains unmounted.",
    },
    toast: {
      languageSet: "Language set.",
      restarted: "LeoOS restarted.",
      shutdown: "Shut down. Click anywhere to restart.",
      welcomeBack: "Welcome back.",
      closed: "Window closed.",
      allClosed: "All windows closed.",
      special: "Special: screen inversion toggled.",
      watch: "Watch mode mounted.",
      konami: "Konami accepted.",
    },
    visits: {
      label: "Visits",
      loading: "----",
      offline: "offline",
      ariaLoading: "Visit counter loading.",
      ariaOffline: "Visit counter unavailable.",
      ariaReady: (count) => `Visit counter: ${count}.`,
    },
  },
  es: {
    lang: "es",
    title: "Leonardo Penna de Lima - LeoOS",
    description: "Sitio personal de Leonardo Penna de Lima con formato de escritorio Macintosh clásico.",
    boot: "Iniciando LeoOS...",
    setup: {
      title: "Elige el idioma",
      copy: "Escolha o idioma · Choose your language",
      pt: "Continuar em português",
      en: "Continue in English",
      es: "Continuar en español",
    },
    aria: {
      menu: "Menú de LeoOS",
      windows: "Ventanas",
      desktop: "Escritorio personal de Leonardo",
      mobileHome: "LeoOS móvil",
      quickActions: "Atajos principales",
      usefulFiles: "Archivos útiles",
      icons: "Iconos del escritorio",
      avatar: "Abrir sobre Leonardo",
      dock: "Dock",
    },
    menu: {
      about: "Acerca de LeoOS",
      language: "Idioma...",
      restart: "Reiniciar...",
      shutdown: "Apagar",
      file: "Archivo",
      openAbout: "Abrir Acerca de",
      openResume: "Abrir CV",
      openProjects: "Abrir Proyectos",
      openClippings: "Abrir Recortes",
      openTerminal: "Abrir Terminal",
      close: "Cerrar ventana",
      closeAll: "Cerrar todo",
      resume: "CV",
      projects: "Proyectos",
      clippings: "Recortes",
      special: "Especial",
      command: "Comando",
    },
    mobile: {
      kicker: "LeoOS Móvil",
      bio: "PM de productos de IA que prototipa, mide calidad y transforma demos en sistemas.",
      cv: "CV",
      projects: "Proyectos",
      clippings: "Recortes",
      contact: "Contacto",
      terminal: "Terminal",
      terminalHint: "ayuda · intereses · abrir proyectos",
      github: "GitHub",
      disks: "Discos",
    },
    icons: ["Acerca de", "CV", "Proyectos", "Recortes", "Terminal"],
    about: {
      title: "Acerca de Leonardo",
      role: "PM Senior · Productos de IA",
      status: "Mercado Livre / São Paulo",
      terms: ["Foco", "Stack", "Base"],
      values: ["IA generativa y agentes", "Agentes de IA · MCP · Claude Code · OpenAI", "São Paulo, BR"],
      lead: "Product Manager que programa, prototipa con agentes y acerca la discusión técnica a la estrategia. El hilo conductor: productos de IA que salen del demo, miden calidad y sobreviven en producción.",
      capLabels: ["Sistemas de IA", "Calidad de IA", "Producto & Craft"],
      capGroups: [
        ["Aplicaciones con LLM e IA generativa", "Prompt e ingeniería de contexto", "Agentes de IA y workflows agénticos", "Human-in-the-loop", "RAG · Tool/function calling · MCP"],
        ["Evaluación de IA y LLM evals", "Observabilidad de IA", "Seguridad y guardrails", "Mitigación de alucinaciones", "QA y gobernanza de IA"],
        ["Gestión y estrategia de productos de IA", "Desarrollo guiado por specs y PRDs", "Discovery de producto y PM orientado a datos", "Experimentación, analytics y ciclos de aprendizaje", "Claude Code, Cursor y Copilot", "OpenAI API, prototipado y automatización", "Cross-functional · DevEx · SaaS", "Figma · Jira · GitHub · SQL"],
      ],
      personalFiles: "Archivos personales",
      interests: ["Programación", "Impresión 3D", "Fotografía", "Relojes", "Fútbol"],
      avatarAlt: "Foto de Leonardo Lima en GitHub",
    },
    resume: {
      title: "CV",
      eyebrow: "Trayectoria",
      heading: "De experimentos con IA a sistemas en producción.",
      linkedIn: "Abrir LinkedIn",
      times: ["Mar 2025 - presente", "Ene 2023 - Mar 2025", "Abr 2022 - Sep 2022", "Ene 2019 - Abr 2022"],
      roles: ["Mercado Livre - Senior Product Manager, IA & Post-compra", "iFood - Senior Product Manager, IA, Onboarding & Crédito", "Revelo - Product Manager", "Sinch / Wavy Global - Product Analyst Jr. / Product Assistant / Intern"],
      descriptions: [
        "Lideró un asistente conversacional con LLM; co-implementó evaluación LLM-as-a-judge, gobernanza responsable de IA y workflows agénticos.",
        "Construyó un asistente de IA para soporte, rediseñó onboarding y optimizó el motor de crédito para crecer sin degradar calidad.",
        "Reconstruyó una plataforma internacional de reclutamiento en inglés y condujo discovery-to-launch con equipos técnicos y stakeholders.",
        "Lideró un squad de soluciones de mensajería, templates reutilizables y flujos de comunicación para clientes enterprise, incluyendo salud.",
      ],
      education: "Formación",
      educationLines: ["MBA en Gestión de Negocios - USP / Esalq, 2024-2026.", "BSc en Sistemas de Información - ESPM, 2020-2022.", "BSc en Ciencia de la Computación - UFSCar, 2016-2019."],
      recognition: "Certificaciones & reconocimiento",
      recognitionLines: ["Reforge Growth Series; Generative AI Products: From Idea to MVP.", "PM3, Tera Digital Product Leadership, AI Fluency, Claude Code in Action.", "Subcampeón de Hackatrouble en la categoría Negocios."],
    },
    projects: {
      title: "Proyectos",
      filters: ["Todos", "IA", "Producto", "Código"],
      descriptions: [
        "Website personal dark/minimalista en Next.js, Tailwind y TypeScript.",
        "Experimento single-file con multi-agent Q-Learning en plataformas.",
        "Concierge de moda con IA en Product Hunt, usando GPT-4 para sugerencias de outfits.",
        "Sistema de filas virtuales premiado en Hackatrouble 2020 para reducir aglomeraciones.",
        "Bot en Python para generar texto e imágenes con OpenAI API vía Telegram.",
        "Proyectos universitarios en C++ con listas, pilas y árboles.",
      ],
      clipping: "Recorte",
      repos: "Repositorios",
    },
    clippings: {
      title: "Recortes públicos",
      archive: "Archivo",
      headings: ["Perfil de GitHub", "LookMate en Product Hunt", "Artículos de Product Management", "Hackatrouble / Fila Digital", "User Experience - Más que una app bonita", "about.me"],
      descriptions: [
        "Perfil público leop25 en GitHub: Product Manager en Mercado Livre, repositorios en TypeScript, HTML, Python y C++.",
        "App iOS de consultoría de moda con IA, lanzada por Leonardo en Product Hunt.",
        "Textos sobre stakeholders, cambios de alcance y colaboración entre PMs y devs.",
        "El equipo Research quedó en segundo lugar en la categoría Negocios con una fila virtual para la pandemia.",
        "Artículo publicado por CATI Jr., firmado por Leonardo Penna de Lima.",
        "Registro antiguo como estudiante y conversation designer en Santana de Parnaíba, con Wavy Global, UFSCar y ESPM.",
      ],
    },
    terminal: {
      title: "Terminal",
      intro: "LeoOS shell v1.0",
      hint: "Escribe `help` para ver comandos indexados.",
      prompt: "leo@pm-mac:~$",
      help: "Comandos: whoami, resume, projects, sources, interests, contact, hackatrouble, lookmate, open <ventana>, clear, sudo.",
      whoami: "Leonardo Penna de Lima - Senior Product Manager enfocado en productos de IA, aplicaciones con LLM, agentes, evaluación de IA y estrategia.",
      resume: "Mercado Livre, iFood, Revelo, Sinch/Wavy. Formación: MBA USP/Esalq, Sistemas de Información en ESPM, Ciencia de la Computación en UFSCar.",
      projects: "pessoal_website, ai-platform-qlearning, LookMate, Fila Digital, openai-telegram y proyectos universitarios en C++.",
      sources: "Fuentes: LinkedIn, GitHub, Product Hunt, São Carlos em Rede, Medium, about.me y materiales locales.",
      interests: "Archivos personales: programación, impresión 3D, fotografía, relojes y fútbol.",
      contact: "Contacto público: LinkedIn /in/leoplima y GitHub @leop25.",
      hackatrouble: "Hackatrouble 2020: Fila Digital, segundo lugar en la categoría Negocios, creado para filas virtuales durante la pandemia.",
      lookmate: "LookMate: lanzamiento en Product Hunt de un concierge de moda con IA usando recomendaciones de outfits vía GPT-4.",
      sudo: "Buen intento. La autoridad de producto requiere alineación con stakeholders.",
      opened: (target) => `Abrió ${target}.`,
      notFound: "Ventana no encontrada. Prueba about, resume, projects, clippings o terminal.",
      commandNotFound: (raw) => `Comando no encontrado: ${raw}`,
      agent: "Modo agente activado. Ciclo de PoC comprimido.",
      doleo: "Contraseña aceptada. Los datos privados de contacto siguen desmontados.",
    },
    toast: {
      languageSet: "Idioma definido.",
      restarted: "LeoOS reiniciado.",
      shutdown: "Apagado. Haz clic en cualquier lugar para reiniciar.",
      welcomeBack: "Bienvenido de nuevo.",
      closed: "Ventana cerrada.",
      allClosed: "Todas las ventanas cerradas.",
      special: "Especial: inversión de pantalla alternada.",
      watch: "Modo reloj montado.",
      konami: "Konami aceptado.",
    },
    visits: {
      label: "Visitas",
      loading: "----",
      offline: "offline",
      ariaLoading: "Contador de visitas cargando.",
      ariaOffline: "Contador de visitas no disponible.",
      ariaReady: (count) => `Contador de visitas: ${count}.`,
    },
  },
};


document.querySelectorAll("[data-window]").forEach((windowNode) => {
  windows.set(windowNode.dataset.window, windowNode);
  windowNode.addEventListener("pointerdown", () => bringToFront(windowNode.dataset.window));

  const handle = document.createElement("div");
  handle.className = "resize-handle";
  handle.addEventListener("pointerdown", startResize);
  windowNode.appendChild(handle);
});

window.addEventListener("load", () => {
  setTimeout(() => boot.classList.add("is-hidden"), 1150);
  if (window.matchMedia("(max-width: 900px)").matches) {
    windows.get("about").hidden = true;
  }
  updateClock();
  setInterval(updateClock, 1000);
  initVisitCounter();
});

document.querySelectorAll("[data-open]").forEach((control) => {
  control.addEventListener("click", () => openWindow(control.dataset.open));
});

languageButtons.forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.language, true));
});

initLanguage();

document.querySelectorAll("[data-menu]").forEach((btn) => {
  btn.addEventListener("click", (event) => {
    event.stopPropagation();
    const dropdown = btn.closest(".menu-item").querySelector(".menu-dropdown");
    const isOpen = dropdown.classList.contains("is-open");
    closeAllDropdowns();
    if (!isOpen) dropdown.classList.add("is-open");
  });
});

document.querySelectorAll(".menu-dropdown button").forEach((item) => {
  item.addEventListener("click", (event) => {
    event.stopPropagation();
    const action = item.dataset.action;
    closeAllDropdowns();

    if (windows.has(action)) {
      openWindow(action);
    } else if (action === "language") {
      openLanguageSetup();
    } else if (action === "restart") {
      const bar = boot.querySelector(".boot-bar span");
      bar.style.animation = "none";
      void bar.offsetHeight;
      bar.style.animation = "";
      boot.classList.remove("is-hidden");
      setTimeout(() => {
        boot.classList.add("is-hidden");
        notify(t("toast.restarted"));
      }, 1250);
    } else if (action === "shutdown") {
      windows.forEach((win) => (win.hidden = true));
      desktop.classList.add("is-shutdown");
      notify(t("toast.shutdown"));
      const wake = () => {
        windows.forEach((win) => (win.hidden = false));
        desktop.classList.remove("is-shutdown");
        notify(t("toast.welcomeBack"));
        desktop.removeEventListener("click", wake);
      };
      setTimeout(() => desktop.addEventListener("click", wake), 200);
    } else if (action === "close") {
      const active = document.querySelector(".window.active");
      if (active) {
        active.hidden = true;
        notify(t("toast.closed"));
      }
    } else if (action === "closeall") {
      windows.forEach((win) => (win.hidden = true));
      notify(t("toast.allClosed"));
    }
  });
});

document.addEventListener("click", closeAllDropdowns);

function closeAllDropdowns() {
  document.querySelectorAll(".menu-dropdown.is-open").forEach((d) => d.classList.remove("is-open"));
}

function initLanguage() {
  const savedLanguage = getSavedLanguage();
  applyLanguage(savedLanguage || "pt");
  if (savedLanguage) {
    closeLanguageSetup();
  } else {
    openLanguageSetup(false);
  }
}

function getSavedLanguage() {
  try {
    const saved = sessionStorage.getItem(languageStorageKey);
    return i18n[saved] ? saved : "";
  } catch {
    return "";
  }
}

function setLanguage(language, persist = false) {
  if (!i18n[language]) return;
  applyLanguage(language);
  if (persist) {
    try {
      sessionStorage.setItem(languageStorageKey, language);
    } catch {}
    closeLanguageSetup();
    notify(t("toast.languageSet"));
  }
}

function openLanguageSetup(focusButton = true) {
  languageSetup.hidden = false;
  if (focusButton) {
    const selectedButton = languageSetup.querySelector(`[data-language="${activeLanguage}"]`);
    setTimeout(() => (selectedButton || languageButtons[0])?.focus(), 0);
  }
}

function closeLanguageSetup() {
  languageSetup.hidden = true;
}

function applyLanguage(language) {
  const copy = i18n[language] || i18n.pt;
  activeLanguage = language;
  document.documentElement.lang = copy.lang;
  document.title = copy.title;
  document.querySelector("meta[name='description']")?.setAttribute("content", copy.description);

  setText(".boot-card p", copy.boot);
  setText("#language-title", copy.setup.title);
  setText(".setup-copy", copy.setup.copy);
  setText('[data-language="pt"] span', copy.setup.pt);
  setText('[data-language="en"] span', copy.setup.en);
  setText('[data-language="es"] span', copy.setup.es);

  setAria(".menu-bar", copy.aria.menu);
  setAria(".menu-nav", copy.aria.windows);
  setAria(".screen", copy.aria.desktop);
  setAria(".mobile-home", copy.aria.mobileHome);
  setAria(".mobile-quick-actions", copy.aria.quickActions);
  setAria(".mobile-pocket-files", copy.aria.usefulFiles);
  setAria(".desktop-icons", copy.aria.icons);
  setAria(".mobile-avatar-button", copy.aria.avatar);
  setAria(".dock", copy.aria.dock);

  setText("#menu-apple [data-action='about']", copy.menu.about);
  setText("#menu-apple [data-action='language']", copy.menu.language);
  setText("#menu-apple [data-action='restart']", copy.menu.restart);
  setText("#menu-apple [data-action='shutdown']", copy.menu.shutdown);
  setText(".menu-nav [data-menu='file']", copy.menu.file);
  setText("#menu-file [data-action='about']", copy.menu.openAbout);
  setText("#menu-file [data-action='resume']", copy.menu.openResume);
  setText("#menu-file [data-action='projects']", copy.menu.openProjects);
  setText("#menu-file [data-action='clippings']", copy.menu.openClippings);
  setText("#menu-file [data-action='terminal']", copy.menu.openTerminal);
  setText("#menu-file [data-action='close']", copy.menu.close);
  setText("#menu-file [data-action='closeall']", copy.menu.closeAll);
  setText(".menu-nav > [data-open='resume']", copy.menu.resume);
  setText(".menu-nav > [data-open='projects']", copy.menu.projects);
  setText(".menu-nav > [data-open='clippings']", copy.menu.clippings);
  setText("[data-special='invert']", copy.menu.special);
  setText(".command-button", copy.menu.command);
  document.querySelectorAll("[data-close]").forEach((button) => button.setAttribute("aria-label", copy.menu.close));

  setText(".mobile-kicker", copy.mobile.kicker);
  setText(".mobile-hero-copy p:last-child", copy.mobile.bio);
  setText(".mobile-quick-actions [data-open='resume'] span:last-child", copy.mobile.cv);
  setText(".mobile-quick-actions [data-open='projects'] span:last-child", copy.mobile.projects);
  setText(".mobile-quick-actions [data-open='clippings'] span:last-child", copy.mobile.clippings);
  setText(".mobile-quick-actions a span:last-child", copy.mobile.contact);
  setText(".mobile-pocket-files [data-open='terminal'] span", copy.mobile.terminal);
  setText(".mobile-pocket-files [data-open='terminal'] strong", copy.mobile.terminalHint);
  setText(".mobile-pocket-files a span", copy.mobile.github);
  setText(".mobile-pocket-files a strong", "@leop25");
  document.querySelector(".desktop-icons")?.style.setProperty("--desktop-icons-label", JSON.stringify(copy.mobile.disks));
  setTextList(".desktop-icon span:last-child", copy.icons);

  setText("#window-about .title-bar strong", copy.about.title);
  setText(".profile-role", copy.about.role);
  setText(".status-led", copy.about.status, { preserveFirstChild: true });
  setTextList(".profile-info dt", copy.about.terms);
  setTextList(".profile-info dd", copy.about.values);
  setText(".avatar", copy.about.avatarAlt, { attribute: "alt" });
  setText(".lead", copy.about.lead);
  document.querySelectorAll("#window-about .cap-group").forEach((group, index) => {
    setTextWithin(group, ".cap-label", copy.about.capLabels[index]);
    setTextListWithin(group, ".cap-tree li", copy.about.capGroups[index]);
  });
  setText(".interests h2", copy.about.personalFiles);
  setTextList(".interest-card span", copy.about.interests);

  setText("#window-resume .title-bar strong", copy.resume.title);
  setText("#window-resume .eyebrow", copy.resume.eyebrow);
  setText("#window-resume .split-header h2", copy.resume.heading);
  setText("#window-resume .system-link", copy.resume.linkedIn);
  setTextList("#window-resume .timeline time", copy.resume.times);
  setTextList("#window-resume .timeline h3", copy.resume.roles);
  setTextList("#window-resume .timeline p", copy.resume.descriptions);
  const educationSections = document.querySelectorAll("#window-resume .education-grid section");
  setTextWithin(educationSections[0], "h3", copy.resume.education);
  setTextListWithin(educationSections[0], "p", copy.resume.educationLines);
  setTextWithin(educationSections[1], "h3", copy.resume.recognition);
  setTextListWithin(educationSections[1], "p", copy.resume.recognitionLines);

  setText("#window-projects .title-bar strong", copy.projects.title);
  setTextList(".finder-toolbar button", copy.projects.filters);
  setTextList(".project-card p", copy.projects.descriptions);
  setText(".project-card[data-kind='product'] a", copy.projects.clipping);
  setText(".project-card[data-kind='code'] a", copy.projects.repos);

  setText("#window-clippings .title-bar strong", copy.clippings.title);
  setText("#window-clippings article:last-child time", copy.clippings.archive);
  setTextList("#window-clippings h3", copy.clippings.headings);
  setTextList("#window-clippings p", copy.clippings.descriptions);

  setText("#window-terminal .title-bar strong", copy.terminal.title);
  setText("#terminal-output p:nth-child(1)", copy.terminal.intro);
  setText("#terminal-output p:nth-child(2)", copy.terminal.hint);
  setText(".terminal-input label", copy.terminal.prompt);
  updateVisitCounter(visitCount, visitCounterState);
}

function t(path) {
  const value = path.split(".").reduce((node, key) => node?.[key], i18n[activeLanguage]);
  return typeof value === "undefined" ? path : value;
}

function setText(selector, value, options = {}) {
  const node = document.querySelector(selector);
  if (!node || typeof value === "undefined") return;
  if (options.attribute) {
    node.setAttribute(options.attribute, value);
    return;
  }
  if (options.preserveFirstChild) {
    const firstChild = node.firstElementChild;
    node.textContent = "";
    if (firstChild) node.appendChild(firstChild);
    node.append(` ${value}`);
    return;
  }
  node.textContent = value;
}

function setTextWithin(root, selector, value) {
  if (!root || typeof value === "undefined") return;
  const node = root.querySelector(selector);
  if (node) node.textContent = value;
}

function setTextList(selector, values = []) {
  document.querySelectorAll(selector).forEach((node, index) => {
    if (typeof values[index] !== "undefined") node.textContent = values[index];
  });
}

function setTextListWithin(root, selector, values = []) {
  if (!root) return;
  root.querySelectorAll(selector).forEach((node, index) => {
    if (typeof values[index] !== "undefined") node.textContent = values[index];
  });
}

function setAria(selector, value) {
  const node = document.querySelector(selector);
  if (node && value) node.setAttribute("aria-label", value);
}

document.querySelectorAll("[data-close]").forEach((control) => {
  control.addEventListener("click", (event) => {
    event.stopPropagation();
    windows.get(control.dataset.close).hidden = true;
  });
});

document.querySelectorAll("[data-zoom]").forEach((control) => {
  control.addEventListener("click", (event) => {
    event.stopPropagation();
    const win = windows.get(control.dataset.zoom);
    win.classList.toggle("is-zoomed");
    bringToFront(control.dataset.zoom);
  });
});

document.querySelector("[data-special='invert']").addEventListener("click", () => {
  desktop.classList.toggle("is-inverted");
  notify(t("toast.special"));
});

menuClock.addEventListener("click", () => {
  clockClicks += 1;
  if (clockClicks === 3) {
    desktop.classList.add("is-watch-mode");
    notify(t("toast.watch"));
  }
});

document.querySelectorAll(".title-bar").forEach((bar) => {
  bar.addEventListener("pointerdown", startDrag);
});

document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => filterProjects(button));
});

terminalForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const raw = terminalCommand.value.trim();
  if (!raw) return;
  commandHistory.push(raw);
  historyIndex = commandHistory.length;
  terminalCommand.value = "";
  runCommand(raw);
});

terminalCommand.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp") {
    event.preventDefault();
    if (historyIndex > 0) historyIndex--;
    terminalCommand.value = commandHistory[historyIndex] || "";
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    if (historyIndex < commandHistory.length - 1) {
      historyIndex++;
      terminalCommand.value = commandHistory[historyIndex] || "";
    } else {
      historyIndex = commandHistory.length;
      terminalCommand.value = "";
    }
  }
});

document.addEventListener("keydown", (event) => {
  trackKonami(event.key);
  if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && document.activeElement !== terminalCommand) {
    typedBuffer = (typedBuffer + event.key.toLowerCase()).slice(-24);
    checkTypedEggs();
  }
});

function openWindow(id) {
  const win = windows.get(id);
  if (!win) return;
  win.hidden = false;
  bringToFront(id);
  if (id === "terminal") {
    setTimeout(() => terminalCommand.focus(), 0);
  }
}

function bringToFront(id) {
  const win = windows.get(id);
  if (!win) return;
  document.querySelectorAll(".window").forEach((node) => node.classList.remove("active"));
  win.classList.add("active");
  const mobileLayer = window.matchMedia("(max-width: 900px)").matches ? 3000 : 0;
  win.style.zIndex = String(mobileLayer + ++zIndex);
}

function startDrag(event) {
  const win = event.currentTarget.closest(".window");
  if (!win || window.matchMedia("(max-width: 900px)").matches) return;
  if (event.target.matches("button")) return;
  if (event.button !== 0 || !event.isPrimary) return;

  activeDragCleanup?.();
  bringToFront(win.dataset.window);
  event.preventDefault();

  const startX = event.clientX;
  const startY = event.clientY;
  const originalLeft = win.offsetLeft;
  const originalTop = win.offsetTop;
  const bar = event.currentTarget;
  const pointerId = event.pointerId;

  try {
    bar.setPointerCapture(pointerId);
  } catch {
    // Global listeners below still cover the drag in browsers without capture.
  }

  const move = (moveEvent) => {
    if (moveEvent.pointerId !== pointerId) return;
    const nextLeft = clamp(originalLeft + moveEvent.clientX - startX, 8, window.innerWidth - 140);
    const nextTop = clamp(originalTop + moveEvent.clientY - startY, 34, window.innerHeight - 80);
    win.style.left = `${nextLeft}px`;
    win.style.top = `${nextTop}px`;
  };

  const cleanup = () => {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", stop);
    window.removeEventListener("pointercancel", stop);
    window.removeEventListener("blur", cleanup);
    try {
      if (bar.hasPointerCapture(pointerId)) {
        bar.releasePointerCapture(pointerId);
      }
    } catch {
      // Capture can already be gone after pointer cancellation.
    }
    if (activeDragCleanup === cleanup) {
      activeDragCleanup = undefined;
    }
  };

  const stop = (stopEvent) => {
    if (stopEvent.pointerId !== pointerId) return;
    cleanup();
  };

  activeDragCleanup = cleanup;
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", stop);
  window.addEventListener("pointercancel", stop);
  window.addEventListener("blur", cleanup);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

function startResize(event) {
  const win = event.currentTarget.closest(".window");
  if (!win || window.matchMedia("(max-width: 900px)").matches) return;
  if (win.classList.contains("is-zoomed")) return;
  if (event.button !== 0 || !event.isPrimary) return;

  activeResizeCleanup?.();
  bringToFront(win.dataset.window);
  event.preventDefault();
  event.stopPropagation();

  const startX = event.clientX;
  const startY = event.clientY;
  const originalWidth = win.offsetWidth;
  const originalHeight = win.offsetHeight;
  const handle = event.currentTarget;
  const pointerId = event.pointerId;

  try {
    handle.setPointerCapture(pointerId);
  } catch {}

  const move = (moveEvent) => {
    if (moveEvent.pointerId !== pointerId) return;
    const nextWidth = clamp(
      originalWidth + moveEvent.clientX - startX,
      260,
      window.innerWidth - win.offsetLeft - 20
    );
    const nextHeight = clamp(
      originalHeight + moveEvent.clientY - startY,
      180,
      window.innerHeight - win.offsetTop - 52
    );
    win.style.width = `${nextWidth}px`;
    win.style.height = `${nextHeight}px`;
  };

  const cleanup = () => {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", stop);
    window.removeEventListener("pointercancel", stop);
    window.removeEventListener("blur", cleanup);
    try {
      if (handle.hasPointerCapture(pointerId)) {
        handle.releasePointerCapture(pointerId);
      }
    } catch {}
    if (activeResizeCleanup === cleanup) {
      activeResizeCleanup = undefined;
    }
  };

  const stop = (stopEvent) => {
    if (stopEvent.pointerId !== pointerId) return;
    cleanup();
  };

  activeResizeCleanup = cleanup;
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", stop);
  window.addEventListener("pointercancel", stop);
  window.addEventListener("blur", cleanup);
}

function updateClock() {
  const now = new Date();
  menuClock.textContent = now.toLocaleTimeString(i18n[activeLanguage].lang, { hour: "2-digit", minute: "2-digit" });
}

async function initVisitCounter() {
  updateVisitCounter(null, "loading");

  if (window.location.protocol === "file:") {
    updateVisitCounter(null, "offline");
    return;
  }

  let alreadyCounted = false;
  try {
    alreadyCounted = sessionStorage.getItem(visitStorageKey) === "1";
  } catch {}

  try {
    const response = await fetch("/api/visits", {
      method: alreadyCounted ? "GET" : "POST",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) throw new Error(`Visit counter failed with ${response.status}`);

    const payload = await response.json();
    const count = Number(payload.count);
    if (!Number.isFinite(count)) throw new Error("Invalid visit counter response");

    if (!alreadyCounted) {
      try {
        sessionStorage.setItem(visitStorageKey, "1");
      } catch {}
    }

    updateVisitCounter(count, "ready");
  } catch {
    updateVisitCounter(null, "offline");
  }
}

function updateVisitCounter(count = visitCount, state = visitCounterState) {
  visitCount = count;
  visitCounterState = state;

  const copy = i18n[activeLanguage].visits;
  const formattedCount = Number.isFinite(count)
    ? new Intl.NumberFormat(i18n[activeLanguage].lang).format(count)
    : "";
  const value =
    state === "ready" && formattedCount
      ? formattedCount
      : state === "offline"
        ? copy.offline
        : copy.loading;
  const aria =
    state === "ready" && formattedCount
      ? copy.ariaReady(formattedCount)
      : state === "offline"
        ? copy.ariaOffline
        : copy.ariaLoading;

  visitCounterLabels.forEach((node) => (node.textContent = copy.label));
  visitCounterValues.forEach((node) => (node.textContent = value));
  visitCounterContainers.forEach((node) => node.setAttribute("aria-label", aria));
}

function filterProjects(activeButton) {
  const filter = activeButton.dataset.filter;
  document.querySelectorAll("[data-filter]").forEach((button) => button.classList.remove("selected"));
  activeButton.classList.add("selected");
  document.querySelectorAll(".project-card").forEach((card) => {
    const visible = filter === "all" || card.dataset.kind.split(" ").includes(filter);
    card.classList.toggle("is-hidden", !visible);
  });
}

function runCommand(raw) {
  writeTerminal(`leo@pm-mac:~$ ${raw}`);
  const input = raw.toLowerCase();
  const [rawCommand, ...args] = input.split(/\s+/);
  const command = normalizeCommand(rawCommand);
  const responses = i18n[activeLanguage].terminal;

  if (command === "clear") {
    terminalOutput.innerHTML = "";
    return;
  }

  if (command === "open") {
    const target = normalizeWindowTarget(args[0]);
    if (windows.has(target)) {
      openWindow(target);
      writeTerminal(responses.opened(target));
    } else {
      writeTerminal(responses.notFound);
    }
    return;
  }

  if (input === "claude" || input === "codex" || input === "agent" || input === "agentic") {
    desktop.classList.add("is-agent-mode");
    writeTerminal(responses.agent);
    return;
  }

  if (input === "doleo") {
    writeTerminal(responses.doleo);
    return;
  }

  writeTerminal(responses[command] || responses.commandNotFound(raw));
}

function normalizeCommand(command) {
  const aliases = {
    ajuda: "help",
    ayuda: "help",
    abrir: "open",
    abre: "open",
    curriculo: "resume",
    currículo: "resume",
    cv: "resume",
    projetos: "projects",
    proyectos: "projects",
    fontes: "sources",
    fuentes: "sources",
    interesses: "interests",
    intereses: "interests",
    contato: "contact",
    contacto: "contact",
    limpar: "clear",
    borrar: "clear",
  };
  return aliases[command] || command;
}

function normalizeWindowTarget(target = "") {
  const aliases = {
    sobre: "about",
    acerca: "about",
    curriculo: "resume",
    currículo: "resume",
    cv: "resume",
    projetos: "projects",
    proyectos: "projects",
    recortes: "clippings",
  };
  return aliases[target] || target;
}

function writeTerminal(text) {
  const line = document.createElement("p");
  line.textContent = text;
  terminalOutput.appendChild(line);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function notify(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

const konami = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
let konamiProgress = 0;

function trackKonami(key) {
  const expected = konami[konamiProgress];
  if (key === expected) {
    konamiProgress += 1;
    if (konamiProgress === konami.length) {
      konamiProgress = 0;
      document.body.classList.toggle("konami");
      notify(t("toast.konami"));
    }
    return;
  }
  konamiProgress = key === konami[0] ? 1 : 0;
}

function checkTypedEggs() {
  const eggs = ["claude", "codex", "leop25", "lookmate", "fila", "watch"];

  eggs.forEach((needle) => {
    if (typedBuffer.endsWith(needle)) {
      if (needle === "claude" || needle === "codex") desktop.classList.add("is-agent-mode");
      if (needle === "watch") desktop.classList.add("is-watch-mode");
      typedBuffer = "";
    }
  });
}
