import Instruction from "./Instruction";
import { BinaryElement } from "./types";

export default class Macro implements BinaryElement {
  name: string;
  instructions: Instruction[];
  bitness: number;

  constructor({
    name,
    instructions,
    bitness,
  }: {
    name: string;
    instructions: Instruction[];
    bitness: number;
  }) {
    this.name = name;
    this.instructions = instructions;
    this.bitness = bitness;
  }
  toArray(): Uint8Array {
    const arr = new Uint8Array(this.length);
    let i = 0;
    for (const instruction of this.instructions) {
      arr.set(instruction.toArray(), i);
      i += instruction.length;
    }
    return arr;
  }

  get length() {
    return this.instructions.length * (this.bitness / 8 + 1);
  }
}
