import { getDay } from '../content';
import { getWarmupItems } from './warmup';

it('returns exactly five warm-up items', () => {
  expect(getWarmupItems(getDay('w01d01'), null)).toHaveLength(5);
  expect(getWarmupItems(getDay('w01d02'), getDay('w01d01'))).toHaveLength(5);
});
