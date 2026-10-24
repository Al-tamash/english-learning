export type Stage = 'warmup' | 'pattern' | 'words' | 'shadow' | 'scenario' | 'wrap';

export type DayType = 'learning' | 'review';

export interface WordItem {
  id: string;
  term: string;
  hi: string;
  collocation: string;
  example_en: string;
  example_hi: string;
  tags: string[];
}

export interface PatternExample {
  en: string;
  hi: string;
}

export interface PatternContent {
  id: string;
  frame: string;
  forms: {
    positive: string;
    negative: string;
    question: string;
  };
  note_hi: string;
  examples: PatternExample[];
}

export interface DialogueLine {
  speaker: 'A' | 'B';
  en: string;
  hi: string;
}

export interface DialogueContent {
  title: string;
  context_hi: string;
  lines: DialogueLine[];
  sound_focus: {
    tip_hi: string;
    pairs: string[];
  };
}

export interface ScenarioTurn {
  prompt_en: string;
  hint_hi: string;
  keywords: string[];
  model_en: string;
}

export interface ScenarioContent {
  id: string;
  title_hi: string;
  setting_hi: string;
  turns: ScenarioTurn[];
}

export interface QuizItem {
  type: 'fill' | 'choice';
  prompt: string;
  answer: string;
  options?: string[];
}

export interface Mission {
  id?: string;
  title_hi: string;
  steps_hi: string[];
}

export interface DayContent {
  id: string;
  week: number;
  day: number;
  type: DayType;
  theme: string;
  title: string;
  goal_hi: string;
  pattern: PatternContent | null;
  words: WordItem[];
  dialogue: DialogueContent | null;
  scenario: ScenarioContent | null;
  quiz: QuizItem[];
  mission: Mission | null;
}
