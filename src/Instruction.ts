import { InstructionMap as InstructionMap, SafeNumberT } from "./types";

export default class Instruction {
  instruction: InstructionMap;
  data: SafeNumberT | string;
  length: number;

  constructor({
    instruction,
    data,
    bitness,
  }: {
    instruction: InstructionMap;
    data?: SafeNumberT | string;
    bitness: number;
  }) {
    this.instruction = instruction;
    this.instructionName = InstructionMap[this.instruction];
    this.data = data ?? 0;
    this.length = bitness / 8 + 1;
  }

  toArray(): Uint8Array {
    if (typeof this.data === "string") {
      throw new Error(
        "Please make sure that all data is parsed before converting to array"
      );
    }

    const arr = new Uint8Array(this.length);
    for (let i = 1; i <= this.length; i++) {
      arr[i] = (this.data >> ((i - 1) * 8)) & 0xff;
    }
    arr[0] = this.instruction & 0xff;
    return arr;
  }

  instructionName: string;
}
