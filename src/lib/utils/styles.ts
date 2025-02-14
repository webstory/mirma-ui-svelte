type Nullable<T> = T | undefined | null;

export function cssStringify(obj: Nullable<Record<string, Nullable<string | number>> | string>): string {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;

  return Object.entries(obj)
    .filter(([, value]) => (!value ? false : true))
    .map(([key, value]) => {
      if (typeof value === 'number') return `${key}:${value}px;`;
      return `${key}:${value};`;
    })
    .join('');
};

export function isSnakeCase(str: string): boolean {
  return str.includes('-');
}

export function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
}

export function toStyle(styleObject: Record<string, string|number>): string {
  return Object.entries(styleObject)
    .map(([key, value]) => `${isSnakeCase(key) ? key : toSnakeCase(key)}: ${value}`)
    .join(';')
}

