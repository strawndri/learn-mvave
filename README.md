# learn-mvave

An interactive guide for learning the M-VAVE SMK-37 MIDI keyboard from zero. Each lesson is a short sequence of steps: read a line, try it on the keyboard, move on. A drawing of the SMK-37 on the screen lights up the keys, pads, knobs and faders you need.

The lessons are written in Brazilian Portuguese.

## How to use

1. Serve the folder over HTTP (the site uses ES modules, so `file://` does not work):

   ```sh
   npm start
   ```

   Then open http://localhost:8000 in Chrome or Edge.

2. Click "Conectar teclado" to use your SMK-37 over USB (Web MIDI). Without one you can play with the mouse or the computer keyboard (`A W S E D F T G Y H U J K`, `Z` and `X` change octave).
3. Follow the lessons in order. Press Enter to go to the next step.

Progress is saved in your browser.

## Development

- `npm test` runs the unit and content checks.
- Lesson text and UI strings live in `src/content/pt-BR`; code lives in the other folders under `src`.
- `tools/` has optional Python scripts that generate the wallpaper and the vector art.

To publish, enable GitHub Pages for the branch that holds this folder.
