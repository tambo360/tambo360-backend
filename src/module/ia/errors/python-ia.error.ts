
export class PythonIAError extends Error {
  constructor(message: string, public readonly codigo: string, public readonly reintentable: boolean) 
  {
    super(message);
    this.name = "PythonIAError";
  }
}


export class EjecucionIAError extends Error {
    constructor(message: string, public readonly codigo: string) {
        super(message);
        this.name = "EjecucionIAError";
    }
}

