# SkitStudio — vídeo promocional (60 s · 1920×1080)

Vídeo promocional do **SkitStudio** ("Crie apps Android no seu dispositivo"),
produzido como um projeto do **[Diffusion Studio](https://github.com/diffusionstudio/editor)**:
toda a composição, animação, câmera, tipografia, sincronização de áudio e a
renderização foram feitas com o motor do Diffusion Studio. O Diffusion Studio
é só a ferramenta — o vídeo fala exclusivamente do SkitStudio.

**Entregas**

- Vídeo: [`render/skitstudio-promo-1080p.mp4`](render/skitstudio-promo-1080p.mp4) —
  1920×1080, 30 fps, 60,000 s, H.264 High (CRF 14) + AAC 256 kbps 48 kHz,
  −14,4 LUFS integrado, pico −1,2 dBTP (pronto para o YouTube).
- Thumbnail do YouTube: [`render/skitstudio-promo-thumbnail.jpg`](render/skitstudio-promo-thumbnail.jpg)
  (e `.png`), 1920×1080 — cena `thumbnail` do mesmo projeto.

## Roteiro

| Tempo | Cena | O que acontece |
| --- | --- | --- |
| 0–6 s | Abertura | "Crie apps Android / direto do celular." Componentes flutuam e convergem; o ícone do SkitStudio cai no tempo forte da música (3 s), wordmark + slogan real; a câmera mergulha no ícone. |
| 6–12 s | Novo projeto | Tela "Projetos" recriada do app → toque em **Novo projeto** → card "Olá App" é criado → toque em editar → o card vira o **Editor de Layout**. |
| 12–24 s | Design | Paleta real (Layouts / Widgets / Listas): Imagem, TextView, EditText e Button arrastados para o canvas. Painel de propriedades (Basic): **Texto** → "Enviar", **Largura** → `match_parent`. |
| 24–30 s | Estrutura | Aba **Árvore** com a hierarquia; aba **Código** com o `activity_main.xml` gerado. |
| 30–38 s | Eventos + lógica | Aba **Event** do painel → `onClick` → `MainActivity.java`, digitando o `setOnClickListener` que troca o título. |
| 38–46 s | Visão geral + build | Parede em paralaxe com telas reais do app: "Design. Lógica. Desenvolvimento." ▶ **Compilar** → etapas reais do build (AAPT2, ECJ, D8…) → **Build concluído ✓**. |
| 46–54 s | Resultado | O app instalado: digita "Ana", toca **Enviar**, o título vira "Olá, Ana!". |
| 54–60 s | Encerramento | DESIGN · EVENTOS · LÓGICA · BUILD no ritmo, tudo converge e a marca entra no impacto final: **SkitStudio — Crie. Programe. Teste.** |

## Estrutura

```
skitstudio-promo/            projeto Diffusion Studio (abra esta pasta no app)
  index.tsx                  <stage> + <scene id="promo"> (60 s)
  lib/                       timeline (120 BPM, cenas em início de compasso), tema, curvas/câmera
  components/ui/             interface do SkitStudio recriada em vetor (dp): aparelho, Projetos,
                             Editor (abas, paleta, canvas), propriedades, Árvore, Código, Compilação, app final
  components/fx/             toque/arrasto, títulos, chuva de código, brilhos
  scenes/                    cenas 1–8 (a 2–5 é um plano contínuo com uma câmera só)
  scenes/Thumbnail.tsx       thumbnail do YouTube (segunda cena do projeto)
  audio/Soundtrack.tsx       trilha + folha de efeitos (CUES) sincronizados com as ações
  audio/cues.json            a folha de efeitos exportada (gera assets/audio/sfx-bed.wav)
  assets/images/brand/       ícone do SkitStudio (reconstrução vetorial em alta resolução)
  assets/images/screens/     telas reais do app (capturas e quadros da gravação de tela)
  assets/audio/              trilha original e efeitos (sintetizados, sem direitos de terceiros)
  fonts/                     Roboto, Sora, JetBrains Mono, Material Symbols (para render offline)
tools/ds-render/             renderizador headless do Diffusion Studio
tools/audio/                 síntese da trilha (music.py) e dos efeitos (sfx.py)
tools/assets/                ícone vetorial (logo.py), fundo (background.py)
render/                      vídeo final
```

## Editar no Diffusion Studio

Abra a pasta `skitstudio-promo` no app (`diffusion open skitstudio-promo`).
Todos os elementos são nós normais do editor: keyframes aparecem na timeline,
textos e cores podem ser alterados no canvas, e as alterações voltam para o
código. A exportação do app usa a entrada `diffusion.export.promo` do
`package.json` (1080p, H.264, AAC).

## Renderizar sem o app (headless)

O app desktop do Diffusion Studio é para macOS/Windows; para renderizar em
qualquer máquina, `tools/ds-render` roda o mesmo motor (runtime, reconciler e
encoder do Diffusion Studio) no Chromium headless:

```sh
tools/ds-render/setup.sh            # clona o Diffusion Studio no commit usado e instala
tools/ds-render/render-final.sh     # vídeo final: 4 trechos em paralelo + 1 passada de áudio contínua
# prévia rápida de um trecho:
node tools/ds-render/render.mjs --project skitstudio-promo --out render/previews/p.webm --res 540 --start 12 --end 24
# thumbnail:
node tools/ds-render/render.mjs --project skitstudio-promo --scene thumbnail --start 0 --end 0.2 --out render/previews/thumb.webm
```

O projeto é compilado com os mesmos passes de Babel do app desktop
(`apps/desktop/src/source.ts`), montado com `@diffusionstudio/reconciler` e
exportado com `@diffusionstudio/encoder`. O Chromium do ambiente não tem
encoder H.264/AAC no WebCodecs, então o master sai em VP9/Opus de alta taxa e
o MP4 de entrega é gerado com ffmpeg (x264 CRF 16, AAC 256 kbps).

Os trechos de vídeo são unidos com o filtro `concat` (contagem exata de
quadros, sem deriva nas emendas) e o áudio vem de uma passada única, então
áudio e vídeo ficam sincronizados no quadro.

**Áudio** (numpy/scipy/soundfile):

```sh
python3 tools/audio/music.py skitstudio-promo/assets/audio/music/skit-theme.wav   # trilha original, 120 BPM
python3 tools/audio/sfx.py skitstudio-promo/assets/audio/sfx                       # efeitos de interface
node tools/audio/export-cues.mjs skitstudio-promo/audio/cues.json                  # folha de efeitos → JSON
python3 tools/audio/sfx_bed.py skitstudio-promo/audio/cues.json skitstudio-promo/assets/audio/sfx skitstudio-promo/assets/audio/sfx-bed.wav
```

Os efeitos vão numa faixa única começando em 0 s (como a música): na
exportação offline do Diffusion Studio cada clipe de áudio é agendado quando
o loop de quadros chega nele, enquanto o mixer roda até ~1 s à frente — clipes
curtos no meio da timeline podiam ser cortados. Com a faixa única todos os 65
efeitos caem no sample exato (verificado com `tools/review/sfx_check.py`).

## Decisões

- **Nome:** o app nas telas se chama **SkitStudio** (wordmark, splash e slogan
  reais), então é essa a marca usada no vídeo.
- **Sem IA em destaque:** o vídeo mostra o fluxo nativo (projetos, editor
  visual, propriedades, árvore, código, eventos, build). A aba "Chat" aparece
  apenas como parte da barra de abas real, nunca é usada.
- **Blocos:** não há editor de blocos nas telas de referência (os projetos são
  "Android Studio (Java)"), então a lógica é mostrada no editor de código Java
  real em vez de blocos inventados.
- **Ícone:** o ícone original disponível tinha ~90 px; foi reconstruído em
  vetor (cubo isométrico com `</>`) para ficar nítido em 1080p. Para usar o
  arquivo oficial, substitua `assets/images/brand/skitstudio-*.png`.
- **Telas:** a interface foi recriada em vetor a partir das capturas (cores,
  textos, ícones e layout reais) para poder ser animada e ficar nítida; as
  capturas reais aparecem na montagem da cena 6.
