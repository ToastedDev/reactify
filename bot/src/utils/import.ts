export async function importDefault<T>(path: string): Promise<T> {
  const resolvedPath = import.meta.resolve(path);
  return import(resolvedPath).then((module) => module.default);
}
