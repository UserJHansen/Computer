import { getInstruction, parseNumber, safeNumber } from "./helper";
import Instruction from "./Instruction";
import Macro from "./Macro";
import macroMap from "./macroMap";
import { InstructionMap } from "./types";

export default function parseInstruction(
  text: string,
  bitness: number,
  line: number,
  labels: { [label: string]: number } = {},
  vars: { [variable: string]: string } = {},
  jmpmap: number[] = []
) {
  const parts = text.split(" ");
  if (parts.length === 0 || parts[0] === ";" || parts[0] === "") {
    return null;
  }
  if (parts[0] in InstructionMap) {
    var [instruction, _data] = parts,
      data: number | string = isNaN(parseNumber(_data || "0", vars))
        ? _data
        : safeNumber(parseNumber(_data || "0", vars), bitness);

    if (instruction[0] === "J") {
      if (typeof data === "string" && data[0] === "+") {
        data = jmpmap[line + 1 + parseInt(data.slice(1))];
      } else if (typeof data === "string" && data in labels) {
        data = labels[data];
      } else if (typeof data === "number") {
        data = jmpmap[data];
      }
    }

    if (instruction === "MV") {
      const registers = ["A", "B", "C", "D"],
        [_, from, to] = parts;
      if (registers.includes(from) && registers.includes(to)) {
        const nums = [from, to].map((r) => 0b1 << registers.indexOf(r));

        data = (nums[1] << registers.length) + nums[0];
      } else {
        throw new Error("Invalid register for MV: " + from + " " + to);
      }
    }

    if (instruction === "SWP") {
      const registers = ["B", "C", "D"],
        [_, reg] = parts;
      if (registers.includes(reg)) {
        data = registers.indexOf(reg);
      } else {
        throw new Error("Invalid register for SWP: " + reg);
      }
    }

    return new Instruction({
      instruction: getInstruction(instruction),
      data,
      bitness,
    });
  } else if (parts[0] === "SET") {
    const [_, variable, value] = parts;
    vars[variable.replace("$", "")] = value;
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
            data: safeNumber(
              parseNumber(instruction.data ?? "0", vars),
              bitness
            ),
            bitness,
          });
        }),
        bitness,
      });
    } else {
      console.error("Macro", parts[1], "not found");
      throw new Error("Invalid Macro");
    }
  }
}
