import fs from "fs";
import { InstructionMap } from "./types";

export default function generateDecoded(filename: string) {
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
          } else if (InstructionMap[data] === "MV") {
            const registers = ["A", "B", "C", "D"],
              from = registers[Math.log2( dataout & 0xf)],
              to = registers[Math.log2((dataout & 0xf0) >> 4)];

            out += from + " " + to;
          } else if (InstructionMap[data][0]==="J") {
            out += dataout+1;
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
        process.cwd() + "\\debug\\" + filename.replace(".bin", ".reverse.asm"),
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
