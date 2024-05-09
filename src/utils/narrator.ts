import { formatName } from "./formatName";

window.speechSynthesis.speak(new SpeechSynthesisUtterance());

export function getCommentary(name: string, userIndex: number, userCount: number): SpeechSynthesisUtterance {
  const formattedName = formatName(name);
  if (userCount > 1) {
    if (userIndex === 0) {
      const utterance = new SpeechSynthesisUtterance(`first up today we have ${formattedName}`);
      utterance.rate = 0.6;
      return utterance;
    }
    else if (userIndex === userCount - 1) {
      const utterance = new SpeechSynthesisUtterance(`and finally ${formattedName}`);
      utterance.rate = 0.6;
      return utterance;
    }
  }

  const utterance = new SpeechSynthesisUtterance(formattedName);
  utterance.rate = 0.6;
  return utterance;
}

export function commentate(name: string, userIndex: number, userCount: number) {
  const commentary = getCommentary(name, userIndex, userCount);
  window.speechSynthesis.speak(commentary);
}
