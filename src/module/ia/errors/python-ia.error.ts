
export class PythonIAError extends Error {
  constructor(message: string, public readonly codigo: string, public readonly reintentable: boolean) 
  {
    super(message);
    this.name = "PythonIAError";
  }
}
