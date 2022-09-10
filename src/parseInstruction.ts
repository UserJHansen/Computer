import { getInstruction, parseNumber, safeNumber } from "./helper";
import Instruction from "./Instruction";
import Macro from "./Macro";
import macroMap from "./macroMap";
import { InstructionMap } from "./types";

export default function parseInstruction(text: string) {
  const parts = text.split(" ");
  if (parts.length === 0 || parts[0] == ";" || parts[0] == "") {
    return null;
  }
  if (parts[0] in InstructionMap) {
    var [instruction, _data] = parts,
      data = safeNumber(parseNumber(_data || "0"));

    if (instruction == "JMP" || instruction == "JNZ") {
      data -= 1;
    }
    return new Instruction({
      instruction: getInstruction(instruction),
      data,
    });
  } else if (parts[0] == "MACRO") {
    if (parts[1] in macroMap) {
      // Replace arguments with their values
      return new Macro({
        name: parts[1],
        instructions: macroMap[
          parts[1] as keyof typeof macroMap
        ].instructions.map((instruction) => {
          instruction.data?.replace("${0}", parts[2]);
          return new Instruction({
            instruction: instruction.instruction,
            data: safeNumber(parseNumber(instruction.data ?? "0")),
          });
        }),
      });
    } else {
      console.error("Macro", parts[1], "not found");
      throw new Error("Invalid Macro");
    }
  }
}
