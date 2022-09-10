export enum InstructionMap {
  LDA,
  LDB,
  LDC,
  LDD,
  JMP,
  JNZ,
  ADD,
  SUB,
  MUL,
  DIV,
  DIVR,
  SWP,
  NOP = 0xfe,
  HLT = 0xff,
}
export enum Type {
  Command,
  Macro,
}

export type safeNumberT = Partial<number>;

export interface BinaryElement {
  length: number;
  toArray(): Uint8Array;
}
