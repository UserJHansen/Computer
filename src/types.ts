export enum InstructionMap {
  LDA,
  LDB,
  LDC,
  LDD,
  MV,
  SWP,
  SQR = 0b00010000,
  ADD,
  SUB,
  MUL,
  DIV,
  MOD,
  DIVR,
  MULBIG,
  SQRBIG,
  ADDD,
  SUBD,
  MULD,
  DIVD,
  MODD,
  DIVRD,
  MULBIGD,
  JMP = 0b00100000,
  JNZ,
  JG,
  JGE,
  JL,
  JLE,
  JEQ,
  JNEQ,
  JC,
  JNC,
  AND = 0b00110000,
  OR,
  XOR,
  NOT,
  SHL,
  SHR,
  ROL,
  ROR,
  ANDD,
  ORD,
  XORD,
  NOTD,
  SHLD,
  SHRD,
  ROLD,
  RORD,

  NOP = 0b11100000,
  HLT = 0b11111111,
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
