"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const glob_1 = __importDefault(require("glob"));
const parseInstruction_1 = __importDefault(require("./parseInstruction"));
(0, glob_1.default)("*.asm", { cwd: process.cwd() + "\\Assembly" }, (err, filenames) => {
    if (err)
        console.error(err);
    for (const filename of filenames) {
        try {
            fs_1.default.readFile("Assembly/" + filename, "utf8", function (err, file) {
                if (err) {
                    return console.log(err);
                }
                const binary = new Uint8Array(file.split("\n").length * 4);
                var pos = 0;
                for (const line of file.split(/(?:\r\n)|\r|\n/)) {
                    const command = (0, parseInstruction_1.default)(line);
                    if (!command)
                        continue;
                    binary.set(command.toArray(), pos);
                    pos += command.length;
                }
                fs_1.default.writeFile(process.cwd() + "\\out\\" + filename.replace(".asm", ".bin"), binary, () => {
                    console.log(filename + " Build successful!");
                });
            });
        }
        catch (e) {
            console.error(e);
            console.error("Build failed!");
            console.error("File:", filename);
        }
    }
});
//# sourceMappingURL=build.js.map