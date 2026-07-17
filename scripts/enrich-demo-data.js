const fs = require("fs");
const path = require("path");
const { createSqliteDatabase } = require("../database-sqlite");

const ROOT = path.join(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data");
const SEED_FILE = path.join(DATA_DIR, "db.json");
const SQLITE_FILE = path.join(DATA_DIR, "gameplayn.sqlite");

const demoUsers = [
  { id: "u5", name: "Bianca Souza", username: "bia", password: "bia123", role: "user", bio: "Curte sandbox, construcao, sobrevivencia e comunidades criativas." },
  { id: "u8", name: "Pedro Nascimento", username: "pedro", password: "pedro123", role: "user", bio: "Jogador de corrida, futebol, Rocket League e jogos cooperativos." },
  { id: "u9", name: "Julia Fernandes", username: "julia", password: "julia123", role: "user", bio: "Fas de RPG, simuladores e jogos com escolhas narrativas." },
  { id: "u10", name: "Mateus Lima", username: "mateus", password: "mateus123", role: "user", bio: "Gosta de jogos competitivos, treino mecanico e analise de meta." },
  { id: "u11", name: "Ana Clara", username: "anaclara", password: "anaclara123", role: "user", bio: "Prefere jogos relaxantes, cooperativos e experiencias acessiveis." },
  { id: "u12", name: "Bruno Pereira", username: "bruno", password: "bruno123", role: "user", bio: "Joga FPS tatico, survival horror e qualquer coisa com gerenciamento de recursos." },
  { id: "u13", name: "Sofia Mendes", username: "sofia", password: "sofia123", role: "user", bio: "Apaixonada por roguelikes, metroidvanias e trilhas sonoras marcantes." },
  { id: "u14", name: "Thiago Ramos", username: "thiago", password: "thiago123", role: "user", bio: "Explora mapas, chefes opcionais, builds estranhas e segredos escondidos." },
  { id: "u15", name: "Lara Oliveira", username: "lara", password: "lara123", role: "user", bio: "Gosta de terror, narrativa cinematografica e direcao de arte." },
  { id: "u16", name: "Vinicius Castro", username: "vini", password: "vini123", role: "user", bio: "Focado em performance no PC, mundo aberto e jogos futuristas." },
  { id: "u17", name: "Nina Barbosa", username: "nina", password: "nina123", role: "user", bio: "Curte indies, puzzles, jogos curtos e recomendacoes fora do obvio." },
  { id: "u18", name: "Gustavo Henrique", username: "gustavo", password: "gustavo123", role: "user", bio: "Joga cooperativo, survival, esporte e jogos para reunir amigos." }
];

const demoGames = [
  { id: "g7", name: "Counter-Strike 2", genre: "FPS Tatico", platform: "PC", pinned: false },
  { id: "g11", name: "Baldur's Gate 3", genre: "RPG", platform: "PC, PlayStation, Xbox", pinned: false },
  { id: "g12", name: "Cyberpunk 2077", genre: "RPG, Mundo Aberto", platform: "PC, PlayStation, Xbox", pinned: false },
  { id: "g13", name: "Stardew Valley", genre: "Simulador, Fazenda", platform: "Multiplataforma", pinned: false },
  { id: "g14", name: "Hades", genre: "Roguelike, Acao", platform: "Multiplataforma", pinned: false },
  { id: "g15", name: "Hollow Knight", genre: "Metroidvania, Indie", platform: "Multiplataforma", pinned: false },
  { id: "g16", name: "Forza Horizon 5", genre: "Corrida", platform: "PC, Xbox", pinned: false },
  { id: "g17", name: "Resident Evil 4 Remake", genre: "Terror, Acao", platform: "PC, PlayStation, Xbox", pinned: false },
  { id: "g18", name: "Terraria", genre: "Sandbox, Sobrevivencia", platform: "Multiplataforma", pinned: false },
  { id: "g19", name: "Apex Legends", genre: "Battle Royale, FPS", platform: "Multiplataforma", pinned: false },
  { id: "g20", name: "Rocket League", genre: "Esporte, Competitivo", platform: "Multiplataforma", pinned: false }
];

function post(id, gameId, userId, title, content, createdAt, likes, comments = []) {
  return {
    id,
    gameId,
    userId,
    title,
    content,
    imageData: "",
    createdAt,
    pinned: false,
    likes,
    comments
  };
}

function comment(id, userId, content, createdAt, likes = []) {
  return { id, userId, content, createdAt, likes };
}

const demoPosts = [
  post("pdemo-cs2-economia-01", "g7", "u12", "Economia no Counter-Strike 2 decide muito round", "Muita partida e perdida porque o time compra separado. Guardar uma rodada para comprar junto costuma valer mais que forcar arma ruim.", "2026-07-17T09:10:00.000Z", ["u4", "u8", "u10"], [
    comment("cdemo-cs2-economia-01", "u4", "Quando o time sincroniza granada e colete, o jogo muda bastante.", "2026-07-17T09:32:00.000Z", ["u12"])
  ]),
  post("pdemo-cs2-smokes-01", "g7", "u4", "Smokes simples ja melhoram muito o CS2", "Nao precisa decorar vinte lineups no comeco. Duas smokes por mapa e uma flash bem usada ja ajudam o time a entrar melhor.", "2026-07-16T20:45:00.000Z", ["u12", "u16"], [
    comment("cdemo-cs2-smokes-01", "u10", "Boa pauta para iniciantes que acham que tudo depende so de mira.", "2026-07-16T21:06:00.000Z")
  ]),
  post("pdemo-bg3-escolhas-01", "g11", "u9", "Baldur's Gate 3 faz escolhas pequenas parecerem importantes", "O legal e que uma conversa aparentemente simples pode mudar combate, relacionamento e caminho de missao horas depois.", "2026-07-17T08:35:00.000Z", ["u3", "u11", "u15"], [
    comment("cdemo-bg3-escolhas-01", "u11", "Isso deixa a campanha com cara de mesa de RPG mesmo.", "2026-07-17T08:58:00.000Z", ["u9"])
  ]),
  post("pdemo-bg3-coop-01", "g11", "u3", "Coop em Baldur's Gate 3 vira caos organizado", "Jogar com amigos cria decisoes absurdas, mas tambem momentos que uma campanha solo nunca teria.", "2026-07-15T18:20:00.000Z", ["u9", "u18"], [
    comment("cdemo-bg3-coop-01", "u18", "O melhor e quando alguem inicia conversa enquanto outro rouba tudo ao redor.", "2026-07-15T18:43:00.000Z")
  ]),
  post("pdemo-bg3-builds-01", "g11", "u11", "Build de suporte tambem carrega campanha em RPG", "Curar, controlar terreno e dar vantagem nos testes pode parecer menos chamativo, mas muda completamente encontros dificeis.", "2026-07-13T14:50:00.000Z", ["u9", "u13"], []),
  post("pdemo-cyberpunk-performance-01", "g12", "u16", "Cyberpunk 2077 ficou bem mais estavel no PC", "Depois das atualizacoes, o jogo virou outro exemplo de como performance e polimento mudam a percepcao de um mundo aberto.", "2026-07-16T19:30:00.000Z", ["u1", "u15", "u8"], [
    comment("cdemo-cyberpunk-performance-01", "u1", "Tambem e bom assunto para falar de lancamento problematico e recuperacao depois.", "2026-07-16T19:48:00.000Z")
  ]),
  post("pdemo-cyberpunk-nightcity-01", "g12", "u15", "Night City funciona melhor nas missoes pequenas", "As side quests com personagens especificos deixam a cidade mais viva do que simplesmente atravessar o mapa correndo.", "2026-07-15T16:05:00.000Z", ["u3", "u16"], []),
  post("pdemo-cyberpunk-builds-01", "g12", "u2", "Cyberpunk permite discutir estilo de jogo", "Da para comparar build de hack, katana, furtividade e arma pesada no mesmo topico sem a conversa ficar repetitiva.", "2026-07-12T10:15:00.000Z", ["u16", "u12"], [
    comment("cdemo-cyberpunk-builds-01", "u12", "Build de hack muda o ritmo do combate completamente.", "2026-07-12T10:38:00.000Z")
  ]),
  post("pdemo-stardew-rotina-01", "g13", "u5", "Stardew Valley e relaxante porque deixa criar rotina", "Plantar, minerar, pescar e conversar com moradores cria um ciclo simples, mas sempre tem algo pequeno para melhorar.", "2026-07-17T07:25:00.000Z", ["u9", "u11", "u18"], [
    comment("cdemo-stardew-rotina-01", "u11", "E um dos melhores jogos para mostrar comunidade mais tranquila.", "2026-07-17T07:44:00.000Z", ["u5"])
  ]),
  post("pdemo-stardew-coop-01", "g13", "u9", "Fazenda coop em Stardew muda a experiencia", "Quando cada pessoa assume uma tarefa, o jogo fica quase uma rotina de equipe: alguem pesca, outro minera e outro cuida da plantacao.", "2026-07-14T12:40:00.000Z", ["u5", "u18"], []),
  post("pdemo-stardew-iniciantes-01", "g13", "u11", "Stardew e bom para quem nao joga muito", "Ele nao exige reflexo rapido nem punicao pesada. A pessoa aprende no proprio ritmo e ainda sente progresso todo dia.", "2026-07-11T09:10:00.000Z", ["u5", "u17"], [
    comment("cdemo-stardew-iniciantes-01", "u17", "Tambem e facil recomendar para quem quer sair de jogo competitivo.", "2026-07-11T09:29:00.000Z")
  ]),
  post("pdemo-hades-builds-01", "g14", "u13", "Hades fica viciante por causa das combinacoes", "Cada tentativa muda conforme os boons aparecem. Mesmo perdendo, voce aprende um combo novo e ja quer tentar de novo.", "2026-07-16T13:25:00.000Z", ["u14", "u15", "u17"], [
    comment("cdemo-hades-builds-01", "u14", "O jogo faz derrota parecer parte natural da evolucao.", "2026-07-16T13:47:00.000Z")
  ]),
  post("pdemo-hades-narrativa-01", "g14", "u15", "Hades usa repeticao para contar historia", "A ideia de morrer e voltar combina com a narrativa. Cada run entrega dialogo novo sem quebrar o ritmo.", "2026-07-13T20:10:00.000Z", ["u13", "u9"], []),
  post("pdemo-hades-acessivel-01", "g14", "u17", "Hades e uma boa porta de entrada para roguelike", "Ele tem acao rapida, mas explica bem a progressao. Mesmo quem nao conhece o genero entende por que repetir faz sentido.", "2026-07-10T11:05:00.000Z", ["u13", "u11"], []),
  post("pdemo-hollow-mapa-01", "g15", "u14", "Hollow Knight usa mapa como recompensa", "Comprar mapa, achar banco e descobrir atalho faz a exploracao parecer perigosa sem ser injusta.", "2026-07-15T22:15:00.000Z", ["u6", "u13"], [
    comment("cdemo-hollow-mapa-01", "u13", "A trilha tambem ajuda muito a marcar cada area.", "2026-07-15T22:39:00.000Z")
  ]),
  post("pdemo-hollow-chefes-01", "g15", "u6", "Chefes opcionais em Hollow Knight ensinam paciencia", "A luta dificil parece impossivel ate voce entender padrao, distancia e momento certo de curar.", "2026-07-12T18:55:00.000Z", ["u14", "u1"], []),
  post("pdemo-hollow-trilha-01", "g15", "u13", "A trilha de Hollow Knight vende a melancolia do mundo", "O jogo nao precisa explicar tudo quando musica, cenario e inimigos ja passam a sensacao de reino abandonado.", "2026-07-09T16:20:00.000Z", ["u15", "u17"], []),
  post("pdemo-forza-controle-01", "g16", "u10", "Forza Horizon 5 fica muito melhor no controle", "No teclado da para jogar, mas controle deixa aceleracao e curva bem mais suaves. Para corrida arcade isso muda bastante.", "2026-07-17T06:50:00.000Z", ["u8", "u16"], [
    comment("cdemo-forza-controle-01", "u8", "Controle ajuda principalmente em carro mais forte.", "2026-07-17T07:05:00.000Z")
  ]),
  post("pdemo-forza-mapa-01", "g16", "u16", "O mapa do Mexico em Forza e otimo para variedade", "Tem estrada, terra, cidade, selva e deserto. Isso ajuda a corrida nao parecer sempre a mesma prova.", "2026-07-14T17:35:00.000Z", ["u8", "u10"], []),
  post("pdemo-forza-online-01", "g16", "u8", "Corrida online precisa de etiqueta tambem", "Nao adianta ser rapido e bater em todo mundo na primeira curva. Comunidade de corrida tambem precisa discutir comportamento.", "2026-07-10T19:15:00.000Z", ["u10", "u18"], []),
  post("pdemo-re4-recursos-01", "g17", "u12", "Resident Evil 4 Remake trabalha bem a tensao dos recursos", "A decisao de gastar municao agora ou guardar para depois cria medo mesmo quando voce ja conhece o inimigo.", "2026-07-16T22:05:00.000Z", ["u15", "u14"], [
    comment("cdemo-re4-recursos-01", "u15", "O inventario vira parte do terror, nao so menu.", "2026-07-16T22:20:00.000Z")
  ]),
  post("pdemo-re4-atmosfera-01", "g17", "u15", "O remake de RE4 equilibra acao e terror", "Ele e mais cinematografico, mas ainda segura tensao com som, ritmo e inimigos pressionando o jogador.", "2026-07-13T21:40:00.000Z", ["u12", "u17"], []),
  post("pdemo-re4-chefes-01", "g17", "u14", "Chefes de RE4 funcionam porque mudam regra da sala", "A luta fica memoravel quando o espaco, municao e movimento obrigam voce a pensar diferente.", "2026-07-08T15:50:00.000Z", ["u12", "u15"], []),
  post("pdemo-terraria-progressao-01", "g18", "u5", "Terraria tem uma progressao enorme para um jogo 2D", "Voce comeca cortando arvore e termina enfrentando boss gigante com arena preparada. A escala cresce muito bem.", "2026-07-16T12:30:00.000Z", ["u6", "u18", "u14"], [
    comment("cdemo-terraria-progressao-01", "u18", "Preparar arena com amigos e metade da graca.", "2026-07-16T12:55:00.000Z")
  ]),
  post("pdemo-terraria-coop-01", "g18", "u18", "Terraria coop vira divisao natural de tarefas", "Um minera, outro constroi, outro procura boss. Quando todo mundo volta para base, parece que o mundo andou.", "2026-07-12T13:30:00.000Z", ["u5", "u6"], []),
  post("pdemo-terraria-exploracao-01", "g18", "u6", "Explorar caverna em Terraria sempre rende surpresa", "Mesmo depois de conhecer o jogo, cair em bioma estranho ou achar item raro continua criando historia boa.", "2026-07-07T18:15:00.000Z", ["u5", "u14"], []),
  post("pdemo-apex-movimento-01", "g19", "u7", "Apex Legends se diferencia pelo movimento", "Deslizar, escalar e reposicionar rapido faz a troca de tiro parecer mais dinamica que em muitos battle royales.", "2026-07-15T11:25:00.000Z", ["u10", "u12"], [
    comment("cdemo-apex-movimento-01", "u10", "E por isso personagem com mobilidade muda tanto o meta.", "2026-07-15T11:41:00.000Z")
  ]),
  post("pdemo-apex-ranked-01", "g19", "u12", "Ranked em Apex precisa de chamada curta", "Informacao demais confunde. Falar dano, posicao e decisao de recuar ja resolve metade da comunicacao.", "2026-07-11T20:05:00.000Z", ["u7", "u4"], []),
  post("pdemo-apex-lendas-01", "g19", "u10", "Balancear lendas em Apex e dificil porque tudo afeta trio", "Uma habilidade forte sozinha ja pesa, mas o verdadeiro problema e quando combina com outras duas lendas.", "2026-07-06T14:35:00.000Z", ["u7", "u12"], []),
  post("pdemo-rocket-treino-01", "g20", "u8", "Rocket League prova que mecanica simples pode ser profunda", "E so carro, bola e gol, mas controle aereo, rotacao e leitura de quique criam uma curva de aprendizado enorme.", "2026-07-17T05:55:00.000Z", ["u10", "u18"], [
    comment("cdemo-rocket-treino-01", "u10", "Treinar rotacao ajuda mais que tentar fazer freestyle cedo.", "2026-07-17T06:17:00.000Z", ["u8"])
  ]),
  post("pdemo-rocket-fisica-01", "g20", "u10", "A fisica de Rocket League deixa cada gol diferente", "Mesmo com poucas regras, a bola nunca parece exatamente igual. Isso cria jogada improvisada o tempo todo.", "2026-07-13T08:45:00.000Z", ["u8", "u18"], []),
  post("pdemo-rocket-casual-01", "g20", "u18", "Rocket League casual e perfeito para jogar com amigos", "Partidas curtas ajudam a entrar e sair sem compromisso, mas ainda da para levar a serio quando o grupo quer competir.", "2026-07-09T20:30:00.000Z", ["u8", "u11"], []),
  post("pdemo-minecraft-mods-01", "g2", "u5", "Mods fazem Minecraft virar varios jogos diferentes", "Com modpack certo, o jogo pode virar automacao, RPG, exploracao ou desafio tecnico. Isso explica por que ele dura tanto.", "2026-07-14T09:30:00.000Z", ["u1", "u18", "u11"], [
    comment("cdemo-minecraft-mods-01", "u1", "Esse e um bom exemplo para mostrar comunidade criando conteudo.", "2026-07-14T09:52:00.000Z")
  ]),
  post("pdemo-elden-dlc-builds-01", "g3", "u14", "Elden Ring incentiva testar arma estranha", "As melhores descobertas aparecem quando voce para de copiar build pronta e tenta uma arma que parece ruim no comeco.", "2026-07-12T22:10:00.000Z", ["u3", "u6", "u13"], []),
  post("pdemo-gta6-expectativa-01", "g473f81d0f6a0", "u16", "GTA VI precisa equilibrar realismo e diversao", "Grafico impressiona, mas o jogo precisa ser divertido fora das missoes principais: transito, lojas, policia e atividades precisam reagir bem.", "2026-07-11T18:00:00.000Z", ["u1", "u2", "u8"], []),
  post("pdemo-sims-construcao-01", "ge4c53072a7aa", "u11", "The Sims 4 tem um publico forte de construcao", "Tem gente que quase nao joga com os Sims e passa horas montando casa. Isso tambem e uma forma valida de jogar.", "2026-07-08T10:40:00.000Z", ["u3", "u5", "u7"], []),
  post("pdemo-lol-toxicidade-01", "g6", "u10", "League of Legends precisa de ferramentas contra toxicidade", "Como a partida depende de equipe, comportamento ruim estraga o jogo mesmo quando o balanceamento esta bom.", "2026-07-07T21:10:00.000Z", ["u7", "u4"], [
    comment("cdemo-lol-toxicidade-01", "u7", "Esse assunto combina muito com painel de moderacao.", "2026-07-07T21:33:00.000Z")
  ]),
  post("pdemo-valorant-utilidade-01", "g10", "u12", "Valorant ensina que utilidade tambem e habilidade", "Usar smoke, flash e molotov no tempo certo exige tanto treino quanto mirar. A diferenca e que o time inteiro sente o impacto.", "2026-07-06T19:25:00.000Z", ["u4", "u10"], []),
  post("pdemo-deathstranding-social-01", "g0c19395a3a70", "u17", "Death Stranding tem multiplayer sem pressao direta", "Ajudar outros jogadores com ponte, placa e recurso cria uma sensacao social diferente, sem precisar conversar em tempo real.", "2026-07-05T12:15:00.000Z", ["u6", "u3", "u2"], []),
  post("pdemo-rdr2-detalhes-01", "g9", "u15", "Red Dead Redemption 2 impressiona nos detalhes pequenos", "Animacoes, clima, dialogos aleatorios e rotina dos NPCs fazem o mundo parecer vivo mesmo quando nada grande esta acontecendo.", "2026-07-04T17:10:00.000Z", ["u3", "u6", "u16"], [])
];

function loadJson(file) {
  if (!fs.existsSync(file)) {
    return { users: [], games: [], posts: [] };
  }

  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function mergeById(existingItems, newItems) {
  const items = Array.isArray(existingItems) ? [...existingItems] : [];
  const existingIds = new Set(items.map(item => item.id));

  for (const item of newItems) {
    if (!existingIds.has(item.id)) {
      items.push(item);
      existingIds.add(item.id);
    }
  }

  return items;
}

function sanitizeData(data) {
  const users = Array.isArray(data.users) ? data.users : [];
  const games = Array.isArray(data.games) ? data.games : [];
  const validUserIds = new Set(users.map(user => user.id));
  const validGameIds = new Set(games.map(game => game.id));

  users.forEach(user => {
    user.bio = user.bio || "";
    user.role = user.username === "lorenzo" ? "admin" : user.role || "user";
  });

  games.forEach(game => {
    game.genre = game.genre || "Nao informado";
    game.platform = game.platform || "Nao informado";
    game.pinned = Boolean(game.pinned);
  });

  data.posts = (Array.isArray(data.posts) ? data.posts : [])
    .filter(postItem => validUserIds.has(postItem.userId) && validGameIds.has(postItem.gameId))
    .map(postItem => ({
      ...postItem,
      imageData: postItem.imageData || "",
      pinned: Boolean(postItem.pinned),
      likes: unique(postItem.likes || []).filter(userId => validUserIds.has(userId)),
      comments: (postItem.comments || [])
        .filter(item => validUserIds.has(item.userId))
        .map(item => ({
          ...item,
          likes: unique(item.likes || []).filter(userId => validUserIds.has(userId))
        }))
    }));

  return data;
}

function unique(values) {
  return [...new Set(values)];
}

function mergeDemoData(data) {
  const merged = {
    users: mergeById(data.users, demoUsers),
    games: mergeById(data.games, demoGames),
    posts: mergeById(data.posts, demoPosts)
  };

  return sanitizeData(merged);
}

function applyToSeed() {
  const data = mergeDemoData(loadJson(SEED_FILE));
  writeJson(SEED_FILE, data);
  return data;
}

function applyToSqlite() {
  if (!fs.existsSync(SQLITE_FILE)) return null;

  const database = createSqliteDatabase(SQLITE_FILE, SEED_FILE);
  try {
    database.initDb();
    const data = mergeDemoData(database.readDb());
    database.writeDb(data);
    return data;
  } finally {
    database.close();
  }
}

const seedData = applyToSeed();
const sqliteData = applyToSqlite();
const activeData = sqliteData || seedData;

console.log(`Seed atualizado: ${seedData.users.length} usuarios, ${seedData.games.length} topicos, ${seedData.posts.length} posts.`);
if (sqliteData) {
  console.log(`SQLite atualizado: ${sqliteData.users.length} usuarios, ${sqliteData.games.length} topicos, ${sqliteData.posts.length} posts.`);
} else {
  console.log("SQLite ainda nao existe; ele sera criado com o seed atualizado na proxima execucao da API.");
}
console.log(`Admins: ${activeData.users.filter(user => user.role === "admin").map(user => user.username).join(", ") || "nenhum"}`);
