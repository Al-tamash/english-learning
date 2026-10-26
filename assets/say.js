/* Shared "Suno" text-to-speech buttons for weekly lessons. */
(function () {
  const buttons = document.querySelectorAll('[data-say]');
  const synth = window.speechSynthesis;
  const unavailableMessage = 'Is browser me voice available nahi hai.';

  if (!buttons.length) {
    return;
  }

  function disableButtons() {
    buttons.forEach((button) => {
      button.disabled = true;
      button.title = unavailableMessage;
    });
  }

  function enableButtons() {
    buttons.forEach((button) => {
      button.disabled = false;
      button.removeAttribute('title');
    });
  }

  if (
    !('speechSynthesis' in window) ||
    !synth ||
    typeof SpeechSynthesisUtterance === 'undefined'
  ) {
    disableButtons();
    return;
  }

  function pickVoice() {
    const voices = synth.getVoices();
    return (
      voices.find(
        (voice) => voice.lang === 'en-IN' && /male|ravi|prabhat|rishi/i.test(voice.name),
      ) ||
      voices.find((voice) => voice.lang === 'en-IN') ||
      voices.find((voice) => voice.lang && voice.lang.toLowerCase().startsWith('en')) ||
      null
    );
  }

  function refreshButtonState() {
    const voice = pickVoice();
    if (voice) {
      enableButtons();
    } else {
      disableButtons();
    }
    return voice;
  }

  refreshButtonState();

  if (typeof synth.addEventListener === 'function') {
    synth.addEventListener('voiceschanged', refreshButtonState);
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const voice = refreshButtonState();
      if (!voice) {
        return;
      }

      try {
        synth.cancel();
        const utterance = new SpeechSynthesisUtterance(button.dataset.say || '');
        utterance.lang = 'en-IN';
        utterance.rate = 0.88;
        utterance.voice = voice;
        synth.speak(utterance);
      } catch (error) {
        disableButtons();
      }
    });
  });
})();
