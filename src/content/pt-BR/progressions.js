// Chord progressions, written with scale degrees so they work in any key.
// `degree`: position of the chord root in the major scale (1..7); `roman`: how it is written in a score.

export const PROGRESSIONS = [
  {
    id: 'pop', name: 'I V vi IV (a mais usada no pop)', note: 'A mais usada no pop.',
    chords: [{ degree: 1, chord: 'major', roman: 'I' }, { degree: 5, chord: 'major', roman: 'V' }, { degree: 6, chord: 'minor', roman: 'vi' }, { degree: 4, chord: 'major', roman: 'IV' }],
  },
  {
    id: 'fifties', name: 'I vi IV V (anos 50)', note: 'Som de música antiga e romântica.',
    chords: [{ degree: 1, chord: 'major', roman: 'I' }, { degree: 6, chord: 'minor', roman: 'vi' }, { degree: 4, chord: 'major', roman: 'IV' }, { degree: 5, chord: 'major', roman: 'V' }],
  },
  {
    id: 'basic', name: 'I IV V I (a base de tudo)', note: 'Os três acordes principais de um tom.',
    chords: [{ degree: 1, chord: 'major', roman: 'I' }, { degree: 4, chord: 'major', roman: 'IV' }, { degree: 5, chord: 'major', roman: 'V' }, { degree: 1, chord: 'major', roman: 'I' }],
  },
  {
    id: 'emotional', name: 'vi IV I V (emocionante)', note: 'A primeira, começando no acorde menor.',
    chords: [{ degree: 6, chord: 'minor', roman: 'vi' }, { degree: 4, chord: 'major', roman: 'IV' }, { degree: 1, chord: 'major', roman: 'I' }, { degree: 5, chord: 'major', roman: 'V' }],
  },
  {
    id: 'canon', name: 'Cânone de Pachelbel', note: 'Oito acordes que descem passo a passo.',
    chords: [
      { degree: 1, chord: 'major', roman: 'I' }, { degree: 5, chord: 'major', roman: 'V' }, { degree: 6, chord: 'minor', roman: 'vi' }, { degree: 3, chord: 'minor', roman: 'iii' },
      { degree: 4, chord: 'major', roman: 'IV' }, { degree: 1, chord: 'major', roman: 'I' }, { degree: 4, chord: 'major', roman: 'IV' }, { degree: 5, chord: 'major', roman: 'V' },
    ],
  },
  {
    id: 'jazz', name: 'ii V I (o clichê do jazz)', note: 'Comum no jazz. Usa acordes com sétima.',
    chords: [{ degree: 2, chord: 'minor7', roman: 'ii7' }, { degree: 5, chord: 'dominant7', roman: 'V7' }, { degree: 1, chord: 'major7', roman: 'Imaj7' }],
  },
  {
    id: 'blues', name: 'Blues de 12 compassos', note: 'A base do blues e do rock antigo.',
    chords: [
      ...Array.from({ length: 4 }, () => ({ degree: 1, chord: 'dominant7', roman: 'I7' })),
      { degree: 4, chord: 'dominant7', roman: 'IV7' }, { degree: 4, chord: 'dominant7', roman: 'IV7' },
      { degree: 1, chord: 'dominant7', roman: 'I7' }, { degree: 1, chord: 'dominant7', roman: 'I7' },
      { degree: 5, chord: 'dominant7', roman: 'V7' }, { degree: 4, chord: 'dominant7', roman: 'IV7' },
      { degree: 1, chord: 'dominant7', roman: 'I7' }, { degree: 5, chord: 'dominant7', roman: 'V7' },
    ],
  },
];
