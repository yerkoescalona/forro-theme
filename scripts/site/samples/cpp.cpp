#include <array>
#include <iostream>
#include <string>
#include <vector>

struct Encontro {
    std::string titulo;
    std::string artista;
    std::string cidade;
    int casais;

    double giros_por_minuto(double bpm) const {
        return casais > 0 ? bpm / (casais / 2.0) : bpm;
    }

    friend std::ostream& operator<<(std::ostream& os, const Encontro& e) {
        return os << e.titulo << " - " << e.artista << " em " << e.cidade
                  << " (" << e.casais << " casais)";
    }
};

class CenaForro {
    std::string nome_;
    std::vector<int> pulsos_;
    double bpm_;

public:
    static constexpr std::array<int, 4> XOTE = {0, 3, 6, 9};

    explicit CenaForro(std::string nome, double bpm = 126.0)
        : nome_(nome)
        , pulsos_(XOTE.begin(), XOTE.end())
        , bpm_(bpm) {}

    Encontro abrir_salao(
        const std::string& titulo,
        const std::string& artista,
        const std::string& cidade,
        int casais
    ) const {
        return {titulo, artista, cidade, casais};
    }

    void imprimir_pulso() const {
        std::cout << "♪ " << nome_ << "\n";
        for (size_t i = 0; i < pulsos_.size(); ++i) {
            std::cout << "  pulso " << i << ": " << pulsos_[i] + bpm_ / 60.0 << "\n";
        }
    }
};

int main() {
    // Rhythms and melodies carried across generations.
    CenaForro eu_so_quero_um_xodo("Eu Só Quero um Xodó", 126.0);
    CenaForro feira_de_mangaio("Feira de Mangaio", 132.0);

    eu_so_quero_um_xodo.imprimir_pulso();
    feira_de_mangaio.imprimir_pulso();

    auto salao = feira_de_mangaio.abrir_salao(
        "Feira de Mangaio",
        "Anastácia, Lucy Alves e Juliana Linhares",
        "São Paulo",
        24
    );
    std::cout << "Pista em movimento: " << salao << "\n";
    std::cout << "Giros por minuto: " << salao.giros_por_minuto(132.0) << "\n";
    return 0;
}
