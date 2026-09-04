from dataclasses import dataclass, field
from enum import Enum
from typing import Callable


class Ritmo(Enum):
    BAIAO = [0, 2, 4, 6]
    XOTE = [0, 3, 6, 9]
    COCO = [0, 2, 3, 5]
    XAXADO = [0, 2, 5, 7]


@dataclass
class ArtistaForro:
    """Uma voz do forró entre rádio, salão e estrada."""
    nome: str
    cidade: str
    funcao: str
    geracao: str
    repertorio: list[str] = field(default_factory=list)

    def puxar_roda(self, ritmo: Ritmo = Ritmo.XOTE, bpm: int = 126) -> Callable[[], list[str]]:
        passos = ritmo.value

        def levada() -> list[str]:
            return [f"{self.nome}:{bpm + passo}" for passo in passos]

        return levada

    def adicionar_cancao(self, titulo: str, ano: int) -> None:
        self.repertorio.append(f"{titulo} ({ano})")
        print(f"♪ {self.nome} compartilha: {titulo}")


def abrir_roda(participantes: list[str]) -> None:
    pares = zip(participantes[::2], participantes[1::2])
    for esquerda, direita in pares:
        print(f"{esquerda} dança com {direita}")


# Different generations, regions and voices of forró.
artistas = {
    "Marinês": ArtistaForro("Marinês", "Campina Grande", "cantora", "pioneira"),
    "Anastácia": ArtistaForro("Anastácia", "Recife", "compositora", "legado"),
    "Dominguinhos": ArtistaForro("Dominguinhos", "Garanhuns", "sanfona", "ponte"),
    "Lucy Alves": ArtistaForro("Lucy Alves", "João Pessoa", "multi-instrumentista", "contemporânea"),
}

for artista in artistas.values():
    ritmo = Ritmo.BAIAO if artista.nome == "Dominguinhos" else Ritmo.XOTE
    print(artista.puxar_roda(ritmo, bpm=132)())

circuito = ["Recife", "Caruaru", "João Pessoa", "São Paulo"]
print(" -> ".join(circuito))
abrir_roda(["Lia", "Beto", "Cris", "Duda"])
