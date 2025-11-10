declare module 'wav' {
  interface WavOptions {
    channels?: number;
    sampleRate?: number;
    bitDepth?: number;
  }

  interface WavWriter {
    write(buffer: Buffer): void;
    end(): void;
    on(event: string, callback: Function): void;
  }

  class Writer {
    constructor(options?: WavOptions);
    write(buffer: Buffer): void;
    end(): void;
    on(event: string, callback: Function): void;
  }

  function createWriter(options?: WavOptions): WavWriter;
  
  export = {
    Writer: Writer,
    createWriter: createWriter
  };
}
