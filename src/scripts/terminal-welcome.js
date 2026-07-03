const commandTarget = document.querySelector("[data-terminal-command]");
const outputTarget = document.querySelector("[data-terminal-output]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const command = "cat /flag";
const finalFlag = "flag{welcome_to_moyues_blog}";
const glyphs = "abcdefghijklmnopqrstuvwxyz0123456789_{}#$%&*@";

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function scrambleFrame(progress) {
  return finalFlag
    .split("")
    .map((char, index) => {
      if (char === "{" || char === "}" || char === "_") return char;
      if (index < progress) return finalFlag[index];
      return glyphs[Math.floor(Math.random() * glyphs.length)];
    })
    .join("");
}

async function typeCommand(target, text, delay = 46) {
  target.textContent = "";
  for (const char of text) {
    target.textContent += char;
    await wait(delay + Math.random() * 18);
  }
}

async function revealFlag() {
  for (let frame = 0; frame < 36; frame += 1) {
    const progress = Math.floor((frame / 35) * finalFlag.length);
    outputTarget.textContent = scrambleFrame(progress);
    await wait(42);
  }
  outputTarget.textContent = finalFlag;
}

async function runTerminal() {
  if (!commandTarget || !outputTarget) return;

  if (reduceMotion) {
    commandTarget.textContent = command;
    outputTarget.textContent = finalFlag;
    return;
  }

  await wait(4700);
  await typeCommand(commandTarget, command);
  await wait(220);
  await revealFlag();
}

runTerminal();
