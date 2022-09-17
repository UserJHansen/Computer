import { getInstruction, parseNumber, safeNumber } from "./helper";
import Instruction from "./Instruction";
import Macro from "./Macro";
import macroMap from "./macroMap";
import { InstructionMap } from "./types";

const exceptions = ["MV", "SWP"];

export default function parseInstruction(
  text: string,
  vars: { [variable: string]: string } = {},
  jmpoffset: number[] = []
) {
  const parts = text.split(" ");
  if (parts.length === 0 || parts[0] == ";" || parts[0] == "") {
    return null;
  }
  if (parts[0] in InstructionMap) {
    var [instruction, _data] = parts,
      data = exceptions.includes(instruction)
        ? 0
        : safeNumber(parseNumber(_data || "0", vars));

    if (instruction === "JMP" || instruction === "JNZ") {
      data -= jmpoffset[data];
    }

    if (instruction === "MV") {
      const registers = ["A", "B", "C", "D"],
        [_, from, to] = parts;
      if (registers.includes(from) && registers.includes(to)) {
        const nums = [from, to].map((r) => 1 << registers.indexOf(r));

        data = (nums[1] << 4) + nums[0];
      }
    }

    if (instruction === "SWP") {
      const registers = ["B", "C", "D"],
        [_, reg] = parts;
      if (registers.includes(reg)) {
        data = registers.indexOf(reg);
      }
    }

    return new Instruction({
      instruction: getInstruction(instruction),
      data,
    });
  } else if (parts[0] === "SET") {
    const [_, variable, value] = parts;
    vars[variable] = value;
    return null;
  } else if (parts[0] === "MACRO") {
    if (parts[1] in macroMap) {
      // Replace arguments with their values
      return new Macro({
        name: parts[1],
        instructions: macroMap[
          parts[1] as keyof typeof macroMap
        ].instructions.map((instruction) => {
          instruction.data = instruction.data?.replace("${0}", parts[2]);
          return new Instruction({
            instruction: instruction.instruction,
            data: safeNumber(parseNumber(instruction.data ?? "0", vars)),
          });
        }),
      });
    } else {
      console.error("Macro", parts[1], "not found");
      throw new Error("Invalid Macro");
    }
  }
}
