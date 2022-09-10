"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const glob_1 = __importDefault(require("glob"));
const types_1 = require("./types");
(0, glob_1.default)("*.bin", { cwd: process.cwd() + "\\out" }, (err, filenames) => {
    if (err)
        console.error(err);
    for (const filename of filenames) {
        try {
            fs_1.default.readFile("out/" + filename, function (err, file) {
                if (err) {
                    return console.log(err);
                }
                const binary = new Uint8Array(file);
                var currdata = new Uint8Array(3), out = "";
                for (var _byte in binary) {
                    const byte = parseInt(_byte, 10), data = binary[byte];
                    if ((byte + 1) % 4 == 0) {
                        const dataout = (currdata[0] << 16) | (currdata[1] << 8) | currdata[2];
                        out += types_1.InstructionMap[data];
                        out += " ";
                        if (dataout > 256) {
                            out += "0x";
                            out += dataout.toString(16);
                        }
                        else {
                            out += dataout;
                        }
                        out += "\n";
                        currdata = new Uint8Array(3);
                    }
                    else {
                        currdata[byte % 4] = data;
                    }
                }
                fs_1.default.writeFile(process.cwd() + "\\debug\\" + filename.replace(".bin", ".asm"), out, () => {
                    console.log(filename + " Decode successful!");
                });
            });
        }
        catch (e) {
            console.error(e);
            console.error("Decoding failed!");
            console.error("File:", filename);
        }
    }
});
//# sourceMappingURL=decodebin.js.map