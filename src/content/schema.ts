import { z } from 'zod';
import type { DayContent } from './types';

const wordSchema = z.object({
  id: z.string().min(1),
  term: z.string().min(1),
  hi: z.string().min(1),
  collocation: z.string().min(1),
  example_en: z.string().min(1),
  example_hi: z.string().min(1),
  tags: z.array(z.string().min(1)),
});

const patternSchema = z.object({
  id: z.string().min(1),
  frame: z.string().min(1),
  forms: z.object({
    positive: z.string().min(1),
    negative: z.string().min(1),
    question: z.string().min(1),
  }),
  note_hi: z.string().min(1),
  examples: z
    .array(
      z.object({
        en: z.string().min(1),
        hi: z.string().min(1),
      }),
    )
    .min(4)
    .max(6),
});

const dialogueSchema = z.object({
  title: z.string().min(1),
  context_hi: z.string().min(1),
  lines: z
    .array(
      z.object({
        speaker: z.enum(['A', 'B']),
        en: z.string().min(1),
        hi: z.string().min(1),
      }),
    )
    .length(6),
  sound_focus: z.object({
    tip_hi: z.string().min(1),
    pairs: z.array(z.string().min(1)).min(1),
  }),
});

const scenarioSchema = z.object({
  id: z.string().min(1),
  title_hi: z.string().min(1),
  setting_hi: z.string().min(1),
  turns: z
    .array(
      z.object({
        prompt_en: z.string().min(1),
        hint_hi: z.string().min(1),
        keywords: z.array(z.string().min(1)).min(2),
        model_en: z.string().min(1),
      }),
    )
    .length(4),
});

const quizSchema = z.object({
  type: z.enum(['fill', 'choice']),
  prompt: z.string().min(1),
  answer: z.string().min(1),
  options: z.array(z.string().min(1)).min(2).optional(),
});

const missionSchema = z.object({
  id: z.string().min(1).optional(),
  title_hi: z.string().min(1),
  steps_hi: z.array(z.string().min(1)).min(1),
});

export const daySchema = z
  .object({
    id: z.string().min(1),
    week: z.number().int().positive(),
    day: z.number().int().min(1).max(7),
    type: z.enum(['learning', 'review']),
    theme: z.string().min(1),
    title: z.string().min(1),
    goal_hi: z.string().min(1),
    pattern: patternSchema.nullable(),
    words: z.array(wordSchema),
    dialogue: dialogueSchema.nullable(),
    scenario: scenarioSchema.nullable(),
    quiz: z.array(quizSchema).length(3),
    mission: missionSchema.nullable(),
  })
  .superRefine((day, ctx) => {
    if (day.type === 'learning' && day.words.length !== 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['words'],
        message: 'learning days must have exactly 5 words',
      });
    }
    if (day.type === 'review' && day.words.length !== 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['words'],
        message: 'review days must not introduce new words',
      });
    }
    if (day.type === 'learning' && day.pattern === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['pattern'],
        message: 'learning days must have a pattern',
      });
    }
  }) satisfies z.ZodType<DayContent>;
