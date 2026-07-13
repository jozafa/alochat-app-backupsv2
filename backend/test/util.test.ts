import test from 'node:test';
import assert from 'node:assert/strict';
import {
  chatKey,
  cleaningIdRange,
  cronExpressionsFromSchedule,
  dateInFortaleza,
  parseTime,
} from '../src/util.js';

// ---- chaves S3 ----

test('chatKey monta backups/{YYYY}/{MM}/chat-{id}.json.gz com ano/mês em America/Fortaleza', () => {
  assert.equal(chatKey(123, '2024-05-10T12:00:00Z'), 'backups/2024/05/chat-123.json.gz');
});

test('chatKey na virada de mês: 01:00Z de 1º/jan é 22:00 de 31/dez em Fortaleza (UTC-3)', () => {
  assert.equal(chatKey(7, '2024-01-01T01:00:00Z'), 'backups/2023/12/chat-7.json.gz');
});

test('chatKey lança erro para data inválida', () => {
  assert.throws(() => chatKey(1, 'não-é-data'));
});

test('dateInFortaleza formata YYYY-MM-DD no fuso local', () => {
  assert.equal(dateInFortaleza(new Date('2024-01-01T01:00:00Z')), '2023-12-31');
  assert.equal(dateInFortaleza(new Date('2024-06-15T12:00:00Z')), '2024-06-15');
});

// ---- parser de agendamento ----

test('parseTime aceita HH:MM válido', () => {
  assert.deepEqual(parseTime('02:00'), { hour: 2, minute: 0 });
  assert.deepEqual(parseTime('23:59'), { hour: 23, minute: 59 });
  assert.deepEqual(parseTime('7:30'), { hour: 7, minute: 30 });
});

test('parseTime rejeita horários inválidos', () => {
  assert.equal(parseTime('24:00'), null);
  assert.equal(parseTime('12:60'), null);
  assert.equal(parseTime('abc'), null);
  assert.equal(parseTime(''), null);
});

test('cronExpressionsFromSchedule agrupa dias com o mesmo horário', () => {
  const exprs = cronExpressionsFromSchedule([
    { day_of_week: 1, enabled: 1, time: '02:00' },
    { day_of_week: 3, enabled: 1, time: '02:00' },
    { day_of_week: 5, enabled: 1, time: '18:30' },
  ]);
  assert.deepEqual(exprs.sort(), ['0 2 * * 1,3', '30 18 * * 5']);
});

test('cronExpressionsFromSchedule ignora dias desabilitados e horários inválidos', () => {
  const exprs = cronExpressionsFromSchedule([
    { day_of_week: 0, enabled: 0, time: '02:00' },
    { day_of_week: 2, enabled: 1, time: '99:99' },
  ]);
  assert.deepEqual(exprs, []);
});

// ---- cálculo de intervalo de limpeza ----

test('cleaningIdRange gera o intervalo inclusivo firstId..lastId', () => {
  assert.deepEqual(cleaningIdRange(5, 8), [5, 6, 7, 8]);
  assert.deepEqual(cleaningIdRange(3, 3), [3]);
});

test('cleaningIdRange retorna vazio para intervalo inválido', () => {
  assert.deepEqual(cleaningIdRange(10, 5), []);
  assert.deepEqual(cleaningIdRange(0, 5), []);
  assert.deepEqual(cleaningIdRange(1.5 as number, 3), []);
});
