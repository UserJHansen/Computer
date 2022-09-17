import fs from "fs";
import glob from "glob";
import generateDecoded from "./decodebin";
import parseInstruction from "./parseInstruction";

glob("*.asm", { cwd: process.cwd() + "\\Assembly" }, (err, filenames) => {
  if (err) console.error(err);

  for (const filename of filenames) {
    try {
      fs.readFile("Assembly/" + filename, "utf8", function (err, file) {
        if (err) {
          return console.log(err);
        }

        var acc = 1;
        const accmap = [
            -1,
            ...file.split(/(?:\r\n)|\r|\n/).map((instruction) => {
              const parsed = parseInstruction(instruction);
              if (parsed === undefined || parsed === null) {
                acc++;
              } else if (parsed.length || 0 > 4) {
                acc -= parsed.length / 4 - 1;
              }
              return acc;
            }),
          ],
          instructions = [],
          vars: { [variable: string]: string } = {};
        for (const line of file.split(/(?:\r\n)|\r|\n/)) {
          const command = parseInstruction(line, vars, accmap);

          if (!command) continue;
          instructions.push(command);
        }

        const binary = new Uint8Array(
          instructions.reduce((acc, curr) => curr.length + acc, 0)
        );

        var pos = 0;
        for (const instruction of instructions) {
          binary.set(instruction.toArray(), pos);
          pos += instruction.length;
        }

        fs.writeFile(
          process.cwd() + "\\out\\" + filename.replace(".asm", ".bin"),
          binary,
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