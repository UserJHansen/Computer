import * as fs from "fs";
import { bitness } from "./build";
import { InstructionMap } from "./types";

export default function generateDecoded(filename: string) {
  try {
    fs.readFile("bin/" + filename, function (err, file) {
      if (err) {
        return console.log(err);
      }
      const binary = new Uint8Array(file);

      var currdata = new Uint8Array(bitness / 8 + 1),
        out = "";

      for (var i = 0; i < binary.length; i += bitness / 8 + 1) {
        currdata.set(binary.subarray(i, i + bitness / 8 + 1));
        var num = 0;
        const instruction = InstructionMap[currdata[0]];
        if (instruction) {
          out += instruction + " ";
        } else {
          out += "??? ";
        }
        for (var j = 1; j < currdata.length; j++) {
          num += currdata[j] << ((j - 1) * 8);
        }
        if (num > 256) {
          out += "0x";
          out += num.toString(16);
        } else if (instruction === "MV") {
          const registers = ["A", "B", "C", "D"],
            from = registers[Math.log2(num & 0xf)],
            to = registers[Math.log2((num & 0xf0) >> 4)];

          out += from + " " + to;
        } else if (instruction[0] === "J") {
          out += num + 1;
        } else {
          out += num;
        }
        out += "\n";
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
