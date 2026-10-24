export const BENCHMARK_PROMPTS = [
  {
    id: 'b_intro',
    en: 'Introduce yourself in 30 seconds.',
    hi: 'Apna naam, city, role aur company batao.',
  },
  {
    id: 'b_work',
    en: 'Describe your work in 30 seconds.',
    hi: 'Aap kya banate ho aur kis ke liye, ye batao.',
  },
  {
    id: 'b_weekend',
    en: 'Talk about last weekend in 30 seconds.',
    hi: 'Pichhle weekend kya kiya, simple past me batao.',
  },
  {
    id: 'b_deadline',
    en: 'Respond to: “Can you do it by Friday?”',
    hi: 'Haan/na bolo, deadline confirm karo, aur ek next step batao.',
  },
] as const;

export type BenchmarkPrompt = (typeof BENCHMARK_PROMPTS)[number];
