function normalizeAnswer(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, ' ')
    .replace(/[.!?]+$/, '');
}

function initQuiz(root) {
  const input = root.querySelector('input[data-answer]');
  const button = root.querySelector('button[data-check]');
  const feedback = root.querySelector('[data-feedback]');

  if (!input || !button) {
    return;
  }

  const check = () => {
    const accepted = (input.dataset.answer || '')
      .split('|')
      .map(normalizeAnswer)
      .filter(Boolean);
    const correct = accepted.includes(normalizeAnswer(input.value));

    input.setAttribute('aria-invalid', String(!correct));

    if (feedback) {
      const parts = [correct ? 'Sahi' : 'Phir se'];
      const explanation = (input.dataset.explain || '').trim();
      const model = (input.dataset.model || '').trim();

      if (explanation) {
        parts.push(explanation);
      }
      if (!correct && model) {
        parts.push(`Model: ${model}`);
      }

      feedback.textContent = parts.join(' ');
      feedback.classList.toggle('correct', correct);
      feedback.classList.toggle('wrong', !correct);
    }
  };

  button.addEventListener('click', check);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      check();
    }
  });

  root.dataset.quizReady = 'true';
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-quiz]').forEach((root) => initQuiz(root));
});

window.initQuiz = initQuiz;
