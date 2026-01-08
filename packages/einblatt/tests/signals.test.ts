/**
 * Signal System Tests (using @preact/signals)
 */

import { describe, it, expect } from 'vitest';
import { signal, computed, effect } from '../src/signals';
import { asyncSignal } from '../src/engine';

describe('Signal (@preact/signals)', () => {
  it('should create a signal with initial value', () => {
    const count = signal(0);
    expect(count.value).toBe(0);
  });

  it('should update signal value', () => {
    const count = signal(0);
    count.value = 5;
    expect(count.value).toBe(5);
  });

  it('should peek value without tracking', () => {
    const count = signal(10);
    expect(count.peek()).toBe(10);
  });

  it('should notify effects when value changes', () => {
    const count = signal(0);
    let effectRuns = 0;

    effect(() => {
      count.value; // Read to track
      effectRuns++;
    });

    expect(effectRuns).toBe(1);

    count.value = 1;
    expect(effectRuns).toBe(2);

    count.value = 2;
    expect(effectRuns).toBe(3);
  });

  it('should not notify when value is the same', () => {
    const count = signal(5);
    let effectRuns = 0;

    effect(() => {
      count.value;
      effectRuns++;
    });

    expect(effectRuns).toBe(1);

    count.value = 5; // Same value
    expect(effectRuns).toBe(1); // Should not run again
  });
});

describe('Computed', () => {
  it('should create computed signal', () => {
    const count = signal(2);
    const doubled = computed(() => count.value * 2);

    expect(doubled.value).toBe(4);
  });

  it('should update when dependencies change', () => {
    const a = signal(2);
    const b = signal(3);
    const sum = computed(() => a.value + b.value);

    expect(sum.value).toBe(5);

    a.value = 10;
    expect(sum.value).toBe(13);

    b.value = 7;
    expect(sum.value).toBe(17);
  });

  it('should work with multiple computed signals', () => {
    const count = signal(5);
    const doubled = computed(() => count.value * 2);
    const quadrupled = computed(() => doubled.value * 2);

    expect(quadrupled.value).toBe(20);

    count.value = 10;
    expect(doubled.value).toBe(20);
    expect(quadrupled.value).toBe(40);
  });
});

describe('Effect (@preact/signals)', () => {
  it('should run immediately', () => {
    let ran = false;
    effect(() => {
      ran = true;
    });

    expect(ran).toBe(true);
  });

  it('should run when dependencies change', () => {
    const count = signal(0);
    const values: number[] = [];

    effect(() => {
      values.push(count.value);
    });

    expect(values).toEqual([0]);

    count.value = 1;
    expect(values).toEqual([0, 1]);

    count.value = 2;
    expect(values).toEqual([0, 1, 2]);
  });

  it('should track multiple dependencies', () => {
    const a = signal(1);
    const b = signal(2);
    let sum = 0;

    effect(() => {
      sum = a.value + b.value;
    });

    expect(sum).toBe(3);

    a.value = 5;
    expect(sum).toBe(7);

    b.value = 10;
    expect(sum).toBe(15);
  });

  it('should stop effect when dispose is called', () => {
    const count = signal(0);
    let runs = 0;

    const dispose = effect(() => {
      count.value;
      runs++;
    });

    expect(runs).toBe(1);

    count.value = 1;
    expect(runs).toBe(2);

    dispose();

    count.value = 2;
    expect(runs).toBe(2); // Should not run after dispose
  });
});

describe('AsyncSignal', () => {
  it('should set loading to true initially', () => {
    const async = asyncSignal(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      return 'data';
    });

    expect(async.loading.value).toBe(true);
    expect(async.data.value).toBe(null);
    expect(async.error.value).toBe(null);
  });

  it('should set data on successful fetch', async () => {
    const async = asyncSignal(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      return 'success';
    });

    expect(async.loading.value).toBe(true);

    // Wait for async operation
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(async.loading.value).toBe(false);
    expect(async.data.value).toBe('success');
    expect(async.error.value).toBe(null);
  });

  it('should set error on failed fetch', async () => {
    const async = asyncSignal(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      throw new Error('Fetch failed');
    });

    expect(async.loading.value).toBe(true);

    // Wait for async operation
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(async.loading.value).toBe(false);
    expect(async.data.value).toBe(null);
    expect(async.error.value).toBeInstanceOf(Error);
    expect(async.error.value?.message).toBe('Fetch failed');
  });

  it('should support refetch', async () => {
    let callCount = 0;
    const async = asyncSignal(async () => {
      callCount++;
      await new Promise(resolve => setTimeout(resolve, 10));
      return `data-${callCount}`;
    });

    // Wait for initial fetch
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(async.data.value).toBe('data-1');
    expect(callCount).toBe(1);

    // Refetch
    async.refetch();
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(async.data.value).toBe('data-2');
    expect(callCount).toBe(2);
  });
});
