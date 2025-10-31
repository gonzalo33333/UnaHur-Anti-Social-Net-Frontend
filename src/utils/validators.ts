export const required = (v: string) => v.trim().length > 0;
export const minLength = (v: string, n = 3) => v.trim().length >= n;
