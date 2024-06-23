export class DuplicateMethodError extends Error {
  private methods: string[];

  constructor(message: string, methods: string[]) {
    super(message);
    this.methods = methods;
    this.name = DuplicateMethodError.name;
  }

  public getMethods(): string[] {
    return this.methods;
  }
}
