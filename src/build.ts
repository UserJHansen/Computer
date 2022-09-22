import * as fs from "fs";
import { glob } from "glob";
import generateDecoded from "./decodebin";
import Instruction from "./Instruction";
import Macro from "./Macro";
import parseInstruction from "./parseInstruction";

export const bitness = 32;

export function createLineMap(lines: string[]) {
  var acc = -1;
  var leftovers = 0;
  return [
    -1,
    ...lines.map((instruction, i) => {
      acc += leftovers;
      leftovers = 0;
      const parsed = parseInstruction(instruction, bitness, i);
      if (parsed !== undefined && parsed !== null) {
        acc += 1;
        leftovers = parsed.length / (bitness / 8 + 1) - 1;
      }
      return acc;
    }),
  ];
}

export function findLabels(lines: string[], jmpmap: number[]) {
  var labels: { [label: string]: number } = {};
  lines.forEach((instruction, i) => {
    if (instruction.trim().endsWith(":")) {
      labels[instruction.trim().slice(0, -1)] = jmpmap[i + 2];
    }
  });
  return labels;
}

export function getInstructions(lines: string[]): (Instruction | Macro)[] {
  var instructions: (Instruction | Macro)[] = [];
  const vars: { [variable: string]: string } = {};
  const jmpmap = createLineMap(lines);
  const labels = findLabels(lines, jmpmap);

  for (const line in lines) {
    const parsed = parseInstruction(
      lines[line],
      bitness,
      parseInt(line),
      labels,
      vars,
      jmpmap
    );
    if (parsed !== undefined && parsed !== null) {
      instructions.push(parsed);
    }
  }

  return instructions;
}

export function build(program: string): Uint8Array {
  program += "\nHLT";

  const lines = program.split(/(?:\r\n)|\r|\n/),
    instructions = getInstructions(lines);

  const binary = new Uint8Array(
    instructions.reduce((acc, curr) => curr.length + acc, 0)
  );

  var pos = 0;
  for (const instruction of instructions) {
    binary.set(instruction.toArray(), pos);
    pos += instruction.length;
  }
  return binary;
}

if (require.main === module) {
  glob("*.asm", { cwd: process.cwd() + "\\Assembly" }, (err, filenames) => {
    if (err) {
      console.error(err);
    }

    for (const filename of filenames) {
      try {
        fs.readFile("Assembly/" + filename, "utf8", function (err, file) {
          if (err) {
            return console.log(err);
          }
          const bin = build(file);
          fs.writeFile(
            process.cwd() + "\\bin\\" + filename.replace(".asm", ".bin"),
            bin,
            () => {
              console.log(filename + " Build successful!");
              generateDecoded(filename.replace(".asm", ".bin"));
            }
          );
        });
      } catch (e) {
        console.error(e);
        console.error("Build failed!");
        console.error("File:", filename);
      }
    }
  });
}
