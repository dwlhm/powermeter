// Small async helpers used by the service layer to simulate network latency.

export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Simulate occasional failures so the UI error states are exercised.
export const withFailureRate = async <T>(fn: () => T, rate = 0): Promise<T> => {
  if (Math.random() < rate) throw new Error('Simulated network error');
  return fn();
};
