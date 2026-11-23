# learn-mvave

Site para aprender teclado do zero com um controlador MIDI de 37 teclas (M-VAVE SMK-37), em português. Tem trilha de lições com módulos, 17 lições, um teclado virtual que também responde ao teclado de verdade (Web MIDI), metrônomo, leitura de partitura, escalas, acordes, progressões, músicas para praticar, treino de ouvido, monitor MIDI e um plano de estudo de 8 semanas.

Site estático: HTML, CSS e JavaScript puro. Sem build, sem dependências.

## Rodar no computador

```sh
cd learn-mvave
python3 -m http.server 8000
```

Abra `http://localhost:8000`. O MIDI do navegador funciona em `localhost` e em `https`.

## Publicar no GitHub Pages

1. Crie um repositório e envie estes arquivos na raiz:

   ```sh
   git init -b main
   git add .
   git commit -m "feat: add keyboard learning guide"
   gh repo create learn-mvave --public --source=. --push
   ```

2. No repositório, vá em **Settings > Pages**. Em **Build and deployment**, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)`. Salve.
3. Em um ou dois minutos o site fica em `https://SEU-USUARIO.github.io/learn-mvave/`.

O arquivo `.nojekyll` desliga o processamento do Jekyll. Todos os caminhos são relativos, então funciona em qualquer subpasta.

## Navegadores

- **Chrome, Edge, Opera:** tudo funciona, inclusive MIDI.
- **Firefox:** funciona, o MIDI pede uma permissão.
- **Safari e iPhone:** o site abre e toca com o mouse ou o toque, mas o navegador não suporta MIDI.

## Estrutura

```
index.html        página única
css/style.css     tema espacial (painéis de vidro, barra rosa, Poppins)
assets/           papel de parede (planeta, em 1920 e 3840 pixels) e estrelas
tools/            gerar-planeta.py recria o papel de parede por código (numpy e Pillow)
js/core.js        som, MIDI, teclado virtual, teoria musical
js/widgets.js     metrônomo, pauta, escalas, acordes, músicas, quizzes
js/lessons.js     o conteúdo das lições
js/app.js         espaço, rotas e telas (trilha, lição, concluída, prática livre, busca)
```

Cada lição é dividida em passos de uma tela (um passo por `h2`). Dá para ir direto a um passo, por exemplo `#/escalas/3`, e as setas do teclado trocam de passo.

Telas: `#/trilha` (lições e módulos), `#/<lição>` (por exemplo `#/escalas`), `#/ok/<lição>` (lição concluída), `#/livre` (prática livre) e `#/busca/<texto>`.

O progresso e as escolhas ficam no `localStorage` do navegador. Nada é enviado para fora.

## Mudar o conteúdo

- Texto das lições: `js/lessons.js`, na lista `PL.LESSONS`. Cada `group` vira um módulo na trilha.
- Músicas para praticar: `PL.SONGS` em `js/widgets.js`. Cada nota é `Nota:duração:dedo`, por exemplo `E4:1:3`.
- Progressões de acordes: `PL.PROGS` em `js/widgets.js`.
- Plano de 8 semanas: `PLAN` em `js/lessons.js`.

## Refazer o papel de parede

```sh
python3 tools/gerar-planeta.py 3840 assets/planeta-3840.jpg
```

O script desenha o planeta e o céu do zero, então dá para mudar a cor, o tamanho ou a posição no próprio arquivo e gerar de novo em qualquer resolução.
