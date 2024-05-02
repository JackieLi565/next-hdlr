export function mergeConfigs<T>(
  defaultConfig: T,
  overrideConfig: Partial<T> | undefined
): T {
  return { ...defaultConfig, ...overrideConfig };
}
