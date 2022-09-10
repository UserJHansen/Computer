import Instruction from "./Instruction";
import { BinaryElement, Type } from "./types";

export default class Macro implements BinaryElement {
  name: string;
  instructions: Instruction[];

  constructor({
    name,
    instructions,
  }: {
    name: string;
    instructions: Instruction[];
  }) {
    this.name = name;
    this.instructions = instructions;
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
    return this.instructions.length * 4;
  }
}
