// Pure Zero-Dependency Numerical Sanitizer Helper
export const safeNum = (val, defaultVal = 0) => {
  if (val === null || val === undefined || val === '') return defaultVal;
  const num = Number(val);
  return Number.isFinite(num) ? num : defaultVal;
};
