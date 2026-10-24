import { createCard, dueCards, schedule } from './srs';

const now = new Date('2026-10-24T08:00:00.000Z');

it('schedules a new Good card for tomorrow', () => {
  const next = schedule(createCard('w_developer', now), 'good', now);
  expect(next.intervalDays).toBe(1);
  expect(next.dueAt).toBe('2026-10-25T08:00:00.000Z');
});

it('schedules Again in ten minutes and counts a lapse', () => {
  const next = schedule(createCard('w_developer', now), 'again', now);
  expect(next.dueAt).toBe('2026-10-24T08:10:00.000Z');
  expect(next.lapses).toBe(1);
});

it('schedules a new Easy card in three days', () => {
  expect(schedule(createCard('x', now), 'easy', now).intervalDays).toBe(3);
});

it('advances Good one ladder step and Easy two', () => {
  const card = { ...createCard('x', now), intervalDays: 4, ease: 2.5 };
  expect(schedule(card, 'good', now).intervalDays).toBe(7);
  expect(schedule(card, 'easy', now).intervalDays).toBe(14);
});

it('holds the interval on Hard and never drops ease below 1.3', () => {
  const card = { ...createCard('x', now), intervalDays: 7, ease: 1.3 };
  expect(schedule(card, 'hard', now).intervalDays).toBe(7);
  expect(schedule(card, 'again', now).ease).toBe(1.3);
});

it('caps intervals at 60 days and due cards at 10', () => {
  const card = { ...createCard('x', now), intervalDays: 60, ease: 2.5 };
  expect(schedule(card, 'good', now).intervalDays).toBe(60);

  const cards = Object.fromEntries(
    Array.from({ length: 12 }, (_, i) => {
      const c = { ...createCard(`i${i}`, now), dueAt: new Date(now.getTime() - (12 - i) * 1000).toISOString() };
      return [c.itemId, c];
    }),
  );
  expect(dueCards(cards, now)).toHaveLength(10);
  expect(dueCards(cards, now)[0].itemId).toBe('i0');
});
