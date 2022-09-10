import fs from "fs";
import glob from "glob";
import { InstructionMap } from "./types";

glob("*.bin", { cwd: process.cwd() + "\\out" }, (err, filenames) => {
  if (err) console.error(err);

  for (const filename of filenames) {
    try {
      fs.readFile("out/" + filename, function (err, file) {
        if (err) {
          return console.log(err);
        }
        const binary = new Uint8Array(file);

        var currdata = new Uint8Array(3),
          out = "";
        for (var _byte in binary) {
          const byte = parseInt(_byte, 10),
            data = binary[byte];

          if ((byte + 1) % 4 == 0) {
            const dataout =
              (currdata[0] << 16) | (currdata[1] << 8) | currdata[2];

            out += InstructionMap[data];
            out += " ";
            if (dataout > 256) {
              out += "0x";
              out += dataout.toString(16);
            } else {
              out += dataout;
            }
            out += "\n";
            currdata = new Uint8Array(3);
          } else {
            currdata[byte % 4] = data;
          }
        }

        fs.writeFile(
          process.cwd() + "\\debug\\" + filename.replace(".bin", ".asm"),
          out,
          () => {
            console.log(filename + " Decode successful!");
          }
        );
      });
    } catch (e) {
      console.error(e);
      console.error("Decoding failed!");
      console.error("File:", filename);
    }
  }
});