import { InstructionMap as InstructionMap, safeNumberT, Type } from "./types";

export default class Instruction {
  instruction: InstructionMap;
  data: safeNumberT;
  type: Type = Type.Command;
  length = 4;

  constructor({
    instruction,
    data,
  }: {
    instruction: InstructionMap;
    data?: safeNumberT;
  }) {
    this.instruction = instruction;
    this.data = data ?? 0;
  }

  toArray(): Uint8Array {
    const arr = new Uint8Array(4);
    arr[0] = (this.data >> 16) & 0xff;
    arr[1] = (this.data >> 8) & 0xff;
    arr[2] = this.data & 0xff;
    arr[3] = this.instruction & 0xff;
    return arr;
  }
}
