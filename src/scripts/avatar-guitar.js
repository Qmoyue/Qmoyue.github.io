const avatar = document.querySelector(".hero-avatar");
const guitar = document.querySelector("[data-avatar-guitar]");
const speech = document.querySelector("[data-avatar-speech]");
let playingTimer;
let speechTimer;

function showSpeech() {
  if (!avatar || !guitar || !speech) return;

  guitar.classList.remove("is-strumming");
  void guitar.offsetWidth;
  guitar.classList.add("is-strumming");

  window.clearTimeout(playingTimer);
  playingTimer = window.setTimeout(() => guitar.classList.remove("is-strumming"), 720);

  speech.classList.remove("is-speaking");
  void speech.offsetWidth;
  speech.classList.add("is-speaking");

  window.clearTimeout(speechTimer);
  speechTimer = window.setTimeout(() => speech.classList.remove("is-speaking"), 2600);
}

if (guitar && avatar) {
  guitar.addEventListener("click", (event) => {
    event.stopPropagation();
    showSpeech();
  });
  avatar.addEventListener("click", showSpeech);
}