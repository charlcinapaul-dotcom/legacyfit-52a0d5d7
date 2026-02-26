export type StillMoment = "before" | "during" | "after";

export interface StillAffirmation {
  text: string;
  queen: string;
}

export interface SpokenWord {
  queen: string;
  domain: string;
  text: string;
  mile: string;
  word: string;
  mileLabel: string;
}

export interface ReflectionPrompt {
  question: string;
}

export interface BreathPhase {
  word: string;
  max: number;
}

export const BREATH_PHASES: BreathPhase[] = [
  { word: "Inhale", max: 4 },
  { word: "Hold", max: 4 },
  { word: "Exhale", max: 6 },
];

export const AFFIRMATIONS_BEFORE: StillAffirmation[] = [
  { text: "I am not afraid of storms, for I am learning how to sail my ship.", queen: "Sojourner Truth" },
  { text: "Never underestimate the power of dreams and the influence of the human spirit.", queen: "Wilma Rudolph" },
  { text: "The way to right wrongs is to turn the light of truth upon them.", queen: "Ida B. Wells" },
  { text: "I'm sick and tired of being sick and tired — and I've decided to walk through it anyway.", queen: "Fannie Lou Hamer" },
  { text: "If you have some power, then your job is to empower somebody else.", queen: "Toni Morrison" },
  { text: "Like what you do, and then you will do your best.", queen: "Katherine Johnson" },
  { text: "You may not control all the events that happen to you, but you can decide not to be reduced by them.", queen: "Maya Angelou" },
  { text: "One child, one teacher, one book, one pen can change the world.", queen: "Malala Yousafzai" },
  { text: "Fight for the things that you care about, but do it in a way that will lead others to join you.", queen: "Ruth Bader Ginsburg" },
  { text: "No one can make you feel inferior without your consent.", queen: "Eleanor Roosevelt" },
  { text: "What you do makes a difference, and you have to decide what kind of difference you want to make.", queen: "Jane Goodall" },
];

export const INTENTION_OPTIONS = [
  "Clarity I haven't been able to find.",
  "Permission to feel what I've been holding.",
  "Strength I forgot I already have.",
  "Nothing. Just movement. That's enough.",
];

const RAW_SPOKEN: { queen: string; domain: string; text: string; mile: string }[] = [
  { queen: "Sojourner Truth", domain: "Resistance", text: "Ain't I a woman? I have ploughed and planted and gathered into barns — and no man could head me.", mile: "Mile 1" },
  { queen: "Fannie Lou Hamer", domain: "Voice", text: "I'm sick and tired of being sick and tired. And I've decided to walk through it anyway.", mile: "Mile 2" },
  { queen: "Toni Morrison", domain: "Story", text: "Definitions belong to the definers — not the defined.", mile: "Mile 3" },
  { queen: "Katherine Johnson", domain: "Precision", text: "We will always have STEM with us. Some things will drop out of the public eye — but there will always be science.", mile: "Mile 4" },
  { queen: "Maya Angelou", domain: "Rising", text: "You may encounter many defeats, but you must not be defeated. It may even be necessary to encounter the defeat, so you can know who you are.", mile: "Mile 5" },
];

export const SPOKEN_WORDS: SpokenWord[] = RAW_SPOKEN.map((s) => ({
  ...s,
  word: s.text,
  mileLabel: s.mile,
}));

export const REFLECTION_PROMPTS: ReflectionPrompt[] = [
  { question: "What did your body tell you that your mind wasn't ready to hear?" },
  { question: "Which queen walked closest to you today? What did she give you?" },
  { question: "What are you putting down now that you picked up before the walk?" },
];

export const AFFIRMATIONS_CLOSE: StillAffirmation[] = [
  { text: "If you are always trying to be normal, you will never know how amazing you can be.", queen: "Maya Angelou" },
  { text: "I am not going to die, I'm going home like a shooting star.", queen: "Sojourner Truth" },
  { text: "The triumph can't be had without the struggle.", queen: "Wilma Rudolph" },
  { text: "You are your best thing.", queen: "Toni Morrison" },
  { text: "Real change, enduring change, happens one step at a time.", queen: "Ruth Bader Ginsburg" },
  { text: "You gain strength, courage, and confidence by every experience in which you really stop to look fear in the face.", queen: "Eleanor Roosevelt" },
  { text: "I had already determined to sell my life as dearly as possible if attacked.", queen: "Ida B. Wells" },
  { text: "Nobody's free until everybody's free.", queen: "Fannie Lou Hamer" },
  { text: "Girls are capable of doing everything men are capable of doing.", queen: "Katherine Johnson" },
  { text: "When the whole world is silent, even one voice becomes powerful.", queen: "Malala Yousafzai" },
  { text: "Every individual matters. Every individual has a role to play. Every individual makes a difference.", queen: "Jane Goodall" },
];

export const DEFAULT_CLOSING: StillAffirmation = {
  text: "You walked. You carried. You arrived.",
  queen: "Walk With Queens",
};
