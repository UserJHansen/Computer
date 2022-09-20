import { InstructionMap, safeNumberT } from "./types";

export function safeNumber(i: number, bitness: number): safeNumberT {
  if (i >= 0 && i < 2 ** bitness) {
    return i;
  }
  console.error(
    "Bad data, it should be above 0 and below",
    2 ** bitness,
    "Number: ",
    i
  );
  throw new Error("Bad data, failed to parse: " + i);
}

export function getInstruction(instruction: string): InstructionMap {
  if (instruction in InstructionMap) {
    return InstructionMap[instruction as keyof typeof InstructionMap];
  }
  return InstructionMap.NOP;
}

export function parseNumber(
  int: string,
  vars: { [variable: string]: string }
): number {
  var radix = 10;

  if (int.startsWith("0b")) {
    int = int.slice(2);
    radix = 2;
  } else if (int.startsWith("0x")) {
    int = int.slice(2);
    radix = 16;
  } else if (int.startsWith("$")) {
    int = vars[int.slice(1)] || "0";
  }

  return parseInt(int, radix);
}
