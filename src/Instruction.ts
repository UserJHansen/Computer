import { InstructionMap as InstructionMap, safeNumberT, Type } from "./types";

export default class Instruction {
  instruction: InstructionMap;
  data: safeNumberT;
  type: Type = Type.Command;
  length: number;

  constructor({
    instruction,
    data,
    bitness,
  }: {
    instruction: InstructionMap;
    data?: safeNumberT;
    bitness: number;
  }) {
    this.instruction = instruction;
    this.data = data ?? 0;
    this.length = bitness / 8;
  }

  toArray(): Uint8Array {
    const arr = new Uint8Array(this.length);
    for (let i = 1; i < this.length; i++) {
      arr[i] = (this.data >> ((i - 1) * 8)) & 0xff;
    }
    arr[this.length - 1] = this.instruction & 0xff;
    return arr;
  }
}
