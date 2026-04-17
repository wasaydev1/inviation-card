/** Same passages as frontend `src/lib/typing-texts.ts` — keep in sync when changing content. */
const TYPING_TEXTS: string[] = [
  "The neon city pulses with electric energy as racers line up at the starting grid, fingers hovering above their keyboards waiting for the signal to launch.",
  "Speed and accuracy are the twin engines of a champion typist; without one the other becomes meaningless in the heat of competition.",
  "Every keystroke is a heartbeat, every word a step closer to victory in this digital arena where milliseconds decide legends.",
  "Code flows like water through the fingers of those who practice daily, turning chaos into elegant patterns of precise execution.",
  "The future belongs to those who can think and type at the speed of thought, weaving language into instant action across the wire.",
  "Rain falls on the chrome streets while inside the arcade, glowing screens reflect the focused eyes of competitors chasing a perfect run.",
  "Practice transforms the impossible into routine; what once felt like sprinting through molasses becomes a smooth glide through familiar terrain.",
  "Champions are not born in single moments of glory but forged through countless quiet hours of deliberate, patient repetition.",
];

export function getRandomText(): string {
  return TYPING_TEXTS[Math.floor(Math.random() * TYPING_TEXTS.length)]!;
}
