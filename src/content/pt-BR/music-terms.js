// Portuguese display text for the music theory data in src/theory.

export const SCALE_TEXT = {
  major: { label: 'Maior', pattern: 'T T S T T T S', feel: 'alegre e estável. É a escala base da música ocidental.' },
  minor: { label: 'Menor natural', pattern: 'T S T T S T T', feel: 'triste ou sério. Usa as mesmas notas da maior que começa 3 teclas acima.' },
  harmonicMinor: { label: 'Menor harmônica', pattern: 'T S T T S 1½ S', feel: 'som dramático, clássico ou árabe. A sétima nota sobe meio tom.' },
  melodicMinor: { label: 'Menor melódica (subindo)', pattern: 'T S T T T T S', feel: 'suave. Muito usada no jazz.' },
  majorPentatonic: { label: 'Pentatônica maior', pattern: 'T T 1½ T 1½', feel: 'cinco notas que quase nunca soam erradas. Ótima para improvisar.' },
  minorPentatonic: { label: 'Pentatônica menor', pattern: '1½ T T 1½ T', feel: 'rock e blues. Também é difícil errar.' },
  blues: { label: 'Blues', pattern: '1½ T S S 1½ T', feel: 'a pentatônica menor com a "nota azul" (quinta bemol).' },
  dorian: { label: 'Modo dórico', pattern: 'T S T T T S T', feel: 'menor, mas mais aberto. Aparece em muito pop e jazz.' },
  mixolydian: { label: 'Modo mixolídio', pattern: 'T T S T T S T', feel: 'maior com um toque de blues e rock.' },
  chromatic: { label: 'Cromática', pattern: 'S S S S S S S S S S S S', feel: 'todas as 12 notas, uma tecla de cada vez.' },
};

export const CHORD_TEXT = {
  major: { label: 'Maior', feel: 'alegre e estável.' },
  minor: { label: 'Menor', feel: 'triste ou sério.' },
  diminished: { label: 'Diminuto', feel: 'tenso e instável.' },
  augmented: { label: 'Aumentado', feel: 'misterioso, parece flutuar.' },
  sus2: { label: 'Sus2', feel: 'aberto, sem terça (nem alegre, nem triste).' },
  sus4: { label: 'Sus4', feel: 'suspenso, pede para resolver no acorde maior.' },
  dominant7: { label: 'Sétima (dominante)', feel: 'cheio de blues, pede para ir ao acorde seguinte.' },
  major7: { label: 'Sétima maior', feel: 'suave e sofisticado.' },
  minor7: { label: 'Menor com sétima', feel: 'macio, comum em jazz e soul.' },
  halfDiminished: { label: 'Meio diminuto', feel: 'sombrio.' },
};

// Indexed by semitones, 0 (unison) to 12 (octave).
export const INTERVAL_TEXT = [
  { short: '1J', name: 'Uníssono', reference: null },
  { short: '2m', name: 'Segunda menor', reference: 'Tema de Tubarão' },
  { short: '2M', name: 'Segunda maior', reference: 'Mestre Jacques (as duas primeiras notas)' },
  { short: '3m', name: 'Terça menor', reference: 'Greensleeves (começo)' },
  { short: '3M', name: 'Terça maior', reference: 'When the Saints Go Marching In (começo)' },
  { short: '4J', name: 'Quarta justa', reference: 'Marcha nupcial ("Here comes the bride")' },
  { short: '4aum', name: 'Trítono (quarta aumentada)', reference: 'Maria (West Side Story)' },
  { short: '5J', name: 'Quinta justa', reference: 'Tema de Star Wars (as duas primeiras notas)' },
  { short: '6m', name: 'Sexta menor', reference: null },
  { short: '6M', name: 'Sexta maior', reference: 'My Bonnie Lies over the Ocean' },
  { short: '7m', name: 'Sétima menor', reference: null },
  { short: '7M', name: 'Sétima maior', reference: null },
  { short: '8J', name: 'Oitava justa', reference: 'Somewhere Over the Rainbow (as duas primeiras notas)' },
];
