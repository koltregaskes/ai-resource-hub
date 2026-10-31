import assert from 'node:assert/strict';
import test from 'node:test';
import { getUpcomingEventWarnings, getUpcomingEvents } from './events-publication-gate';

const events = [
  { id: 'past', date_start: '2026-10-01', date_end: '2026-10-02' },
  { id: 'ignite', date_start: '2026-11-17', date_end: '2026-11-20' },
  { id: 'reinvent', date_start: '2026-11-30', date_end: '2026-12-04' },
  { id: 'neurips', date_start: '2026-12-06', date_end: '2026-12-12' },
  { id: 'aaai', date_start: '2027-01-20', date_end: '2027-01-27' },
];
const ces = { id: 'ces', date_start: '2027-01-06', date_end: '2027-01-09' };

test('counts only events that have not ended', () => {
  assert.deepEqual(getUpcomingEvents(events, '2026-10-26').map((e) => e.id), ['ignite', 'reinvent', 'neurips', 'aaai']);
});

test('warns early when the count will drop below 4 within 30 days', () => {
  const warnings = getUpcomingEventWarnings(events, { now: new Date('2026-10-26T12:00:00Z') });
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /drop to 3 upcoming event\(s\) on 2026-11-21/);
});

test('does not warn when the drop is outside the lookahead window', () => {
  assert.deepEqual(getUpcomingEventWarnings(events, { now: new Date('2026-10-01T12:00:00Z') }), []);
});

test('no warning when enough events remain after the next one ends', () => {
  assert.deepEqual(getUpcomingEventWarnings([...events, ces], { now: new Date('2026-10-26T12:00:00Z') }), []);
});

test('warns (never throws) when already below the target, including zero', () => {
  assert.match(getUpcomingEventWarnings(events, { now: new Date('2026-11-25T12:00:00Z') })[0], /has 3 upcoming/);
  assert.match(getUpcomingEventWarnings([], { now: new Date('2026-11-25T12:00:00Z') })[0], /has 0 upcoming/);
});
