function initQuiz(root) {
  const input = root.querySelector('input[data-answer]');
  const button = root.querySelector('button[data-check]');
  const feedback = root.querySelector('[data-feedback]');

  if (!input || !button) {
    return;
  }

  const check = () => {
    const expected = (input.dataset.answer || '').trim().toLowerCase();
    const actual = input.value.trim().toLowerCase();
    const correct = actual === expected;

    input.setAttribute('aria-invalid', String(!correct));

    if (feedback) {
      feedback.textContent = correct ? 'Sahi' : 'Phir se';
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
