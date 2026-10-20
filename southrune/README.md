# SOUTHRUNE — Chapter 1: The Emperor's Fountain

Um RPG de fã no estilo de **DELTARUNE** (Toby Fox), estrelando os garotos de **South Park**.
Funciona no navegador do iPhone, do iPad e do computador. Não precisa instalar nada.

O jogo é todo em **inglês** e cheio de piadas e bordões do desenho: "Oh my God, they killed Kenny!",
"Respect my authoritah!", "Screw you guys, I'm going home!", o "m'kay" do Sr. Mackey, o ManBearPig
"super cereal", o Butters dizendo "Oh, hamburgers!" e muito mais.

> Jogo de fã sem fins lucrativos. Não é oficial nem afiliado a Toby Fox, South Park Studios ou Nintendo.

## Como jogar

- **Arquivo único:** abra [`dist/southrune.html`](dist/southrune.html) no navegador (Safari, Chrome, Edge ou Firefox).
- **No iPhone/iPad:** abra o link do jogo no Safari, toque em compartilhar e escolha **Adicionar à Tela de Início** para jogar em tela cheia, como um app.
- O progresso fica salvo no próprio navegador quando você usa um ponto de salvamento (a estrela amarela).

### Controles

| Ação | Teclado | Toque |
| --- | --- | --- |
| Andar / mover a alma | Setas ou WASD | Direcional (cruz à esquerda) |
| Confirmar / falar / atacar no tempo certo | Z, Enter ou Espaço | Botão **Z** (ou tocar na tela) |
| Voltar / pular texto / correr (segurando) | X, Shift ou Esc | Botão **X** |
| Menu (ITEM, EQUIP, POWER, CONFIG) | C ou Ctrl | Botão **C** |

## A história

Stan e Kyle esperam o ônibus da escola, mas o Cartman sumiu. O Sr. Mackey diz que ele entrou no
armário de materiais e nunca saiu. Lá dentro, o chão desaparece e os garotos caem num **Dark World**,
onde o Cartman abriu uma **Dark Fountain** e se coroou Imperador da **Dark Cartmanland**.

| Personagem | Papel |
| --- | --- |
| **Stan** | O líder, *Beanie Knight*. Usa **ACT** e controla a alma nas batalhas. |
| **Kyle** | Desbloqueado ao chegar no Dark World. *Green Hat Mage*: Jersey Rage e Moral Speech. |
| **Kenny** | Desbloqueado depois da lenda. *Hooded Immortal*: Hell Prayer e Pacify. Morre e volta. |
| **Cartman** | O Imperador, chefão final. |
| **Sir Goomba** | Cavaleiro de capa do Imperador. Aparece pelo caminho e luta ao lado do Cartman no fim. |

Também aparecem o Sr. Mackey, o Oficial Barbrady, o Butters (dono da loja, que também é o Professor Chaos),
o ManBearPig, o Clyde Frog e o Mr. Hat, o fantoche do Sr. Garrison.

## O que tem de DELTARUNE

- Mundo da Luz e Mundo Sombrio, com troca de roupa dos heróis na queda.
- Batalha com **FIGHT / ACT / MAGIC / ITEM / SPARE / DEFEND**, barra de **TP**, raspão (graze),
  minigame de ataque com barras, **MERCY**, inimigos **TIRED**, ações em dupla e membros caídos (DOWN).
- Caixa de balas com a alma vermelha, padrões de ataque diferentes para cada inimigo.
- Diálogos com retratos e "voz" por personagem, pontos de salvamento, baús, quebra-cabeça,
  loja, menu de campo, game over com a alma se partindo e créditos.
- Dá para vencer o chefão lutando ou poupando todo mundo.

## Estrutura do código

Tudo é JavaScript puro desenhado num canvas de 320x240 ampliado em pixel art. Arte, músicas e sons
são gerados por código.

| Arquivo | Conteúdo |
| --- | --- |
| `src/00_core.js` | Laço principal, entrada (teclado e toque), tela, utilidades |
| `src/01_font*.js` | Fonte em pixel (GNU Unifont) e texto com cores e tremor |
| `src/02_audio.js` | Efeitos sonoros e sequenciador chiptune com as trilhas |
| `src/03_gfx_*.js` | Personagens, inimigos, retratos, cenários |
| `src/04_data.js` | Itens, magias, atributos e salvamento |
| `src/05_ui.js` | Caixas, diálogo, menus |
| `src/06_world.js` | Mapas, colisão, grupo que segue o líder, cutscenes |
| `src/07_battle.js`, `src/08_enemies.js` | Batalha, inimigos e padrões de balas |
| `src/09_rooms.js`, `src/10_scenes.js` | Salas, história, cenas especiais e loja |
| `src/11_main.js` | Gerenciador do jogo |

### Comandos

```bash
node tools/build.mjs                  # gera dist/southrune.html (arquivo único) e dist/artifact.html
node tools/play.mjs battle /tmp/shots # testes com capturas (precisa do Playwright)
node tools/fullrun.mjs /tmp/full      # jogada completa automática, do título aos créditos
```

Para desenvolver, abra `index.html` direto no navegador; ele carrega os arquivos de `src/`.

## Créditos

- Inspirado em DELTARUNE, de Toby Fox.
- South Park foi criado por Trey Parker e Matt Stone. Goomba é um personagem da Nintendo.
- Texto em [GNU Unifont](https://unifoundry.com/unifont/) (GPL-2.0+ com exceção para fontes / SIL OFL 1.1).
- Roteiro, arte em pixel, música e código feitos com Claude (Anthropic).
