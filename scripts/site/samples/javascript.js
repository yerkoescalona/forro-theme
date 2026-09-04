class Triangulo {
  #cenas = new Map();
  #bpm;

  constructor(afinacao = 440) {
    this.afinacao = afinacao;
    this.#bpm = 120;
  }

  static fromArtista(nome) {
    // Forró evolves through communities, dance halls, radios and migrants.
    const estilos = {
      Marinês: { bpm: 132, swing: 0.64 },
      Anastácia: { bpm: 126, swing: 0.61 },
      Mestrinho: { bpm: 142, swing: 0.57 },
      'Lucy Alves': { bpm: 136, swing: 0.69 },
    };
    const config = estilos[nome] ?? { bpm: 128, swing: 0.6 };
    const tri = new Triangulo();
    tri.#bpm = config.bpm;
    tri.#cenas.set(nome, config);
    return tri;
  }

  marcar(compasso, subdivisao = 4) {
    const intervalo = 60_000 / (this.#bpm * subdivisao);
    const notas = Array.from({ length: compasso * subdivisao }, (_, i) => ({
      tempo: i * intervalo,
      acento: i % subdivisao === 0,
    }));
    return notas.filter((n) => n.acento);
  }

  abrirPista(casais) {
    return casais.filter(({ energia }) => energia > 0.7);
  }

  get tocando() {
    return this.#bpm > 0;
  }
}

// Forró is built collectively: triangle, zabumba, accordion and dance.
const zabumba = { grave: 'TUM', agudo: 'TÁ', ghost: '.' };
const triangulo = Triangulo.fromArtista('Lucy Alves');

const primeiraLevada = triangulo.marcar(4);
const casais = [
  { nomes: ['Lia', 'João'], cidade: 'Recife', energia: 0.82 },
  { nomes: ['Cris', 'Beto'], cidade: 'São Paulo', energia: 0.68 },
  { nomes: ['Duda', 'Nina'], cidade: 'Campina Grande', energia: 0.91 },
];
const circuito = ['Recife', 'Caruaru', 'São Paulo'];
const encontros = ['salão', 'festa junina', 'forró universitário'];
const pista = triangulo.abrirPista(casais);

console.log('Salão em movimento:', primeiraLevada, zabumba, pista.length);
console.log('Circuito migrante:', circuito.join(' -> '));
console.log('Encontros:', encontros.join(', '));

const generos = ['xote', 'baião', 'arrasta-pé', 'coco', 'xaxado'];
for (const genero of generos) {
  console.log(`♫ ${genero}: ${triangulo.afinacao}Hz`);
}
