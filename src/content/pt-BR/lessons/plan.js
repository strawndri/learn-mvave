// Lesson: Plano de 8 semanas
export default {
  id: 'plan',
  module: 'practice',
  title: 'Plano de 8 semanas',
  minutes: 5,
  steps: [
    {
      title: 'Rotina de 20 minutos',
      body: `<table class="table">
  <tr><th>Tempo</th><th>O que fazer</th></tr>
  <tr><td>3 min</td><td>Aquecer: cinco dedos, devagar</td></tr>
  <tr><td>5 min</td><td>Escalas e acordes da semana</td></tr>
  <tr><td>3 min</td><td>Um quiz</td></tr>
  <tr><td>7 min</td><td>Música nova, em pedaços</td></tr>
  <tr><td>2 min</td><td>Uma música que você já sabe</td></tr>
</table>`
    },
    {
      title: '8 semanas',
      body: '<p class="muted">Marque o que já fez. Fica salvo neste navegador.</p>',
      widget: { name: 'studyPlan', props: {} }
    }
  ]
};
