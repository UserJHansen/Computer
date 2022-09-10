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
    throw new Error("Method not implemented.");
  }

  get length() {
    return this.instructions.length * 4;
  }
}
