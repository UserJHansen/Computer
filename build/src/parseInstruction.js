"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helper_1 = require("./helper");
const Instruction_1 = __importDefault(require("./Instruction"));
const Macro_1 = __importDefault(require("./Macro"));
const macroMap_1 = __importDefault(require("./macroMap"));
const types_1 = require("./types");
function parseInstruction(text) {
    const parts = text.split(" ");
    if (parts.length === 0 || parts[0] == ";" || parts[0] == "") {
        return null;
    }
    if (parts[0] in types_1.InstructionMap) {
        var [instruction, _data] = parts, data = (0, helper_1.safeNumber)((0, helper_1.parseNumber)(_data || "0"));
        if (instruction == "JMP" || instruction == "JNZ") {
            data -= 1;
        }
        return new Instruction_1.default({
            instruction: (0, helper_1.getInstruction)(instruction),
            data,
        });
    }
    else if (parts[0] == "MACRO") {
        if (parts[1] in macroMap_1.default) {
            // Replace arguments with their values
            return new Macro_1.default({
                name: parts[1],
                instructions: macroMap_1.default[parts[1]].instructions.map((instruction) => {
                    var _a, _b;
                    (_a = instruction.data) === null || _a === void 0 ? void 0 : _a.replace("${0}", parts[2]);
                    return new Instruction_1.default({
                        instruction: instruction.instruction,
                        data: (0, helper_1.safeNumber)((0, helper_1.parseNumber)((_b = instruction.data) !== null && _b !== void 0 ? _b : "0")),
                    });
                }),
            });
        }
        else {
            console.error("Macro", parts[1], "not found");
            throw new Error("Invalid Macro");
        }
    }
}
exports.default = parseInstruction;
//# sourceMappingURL=parseInstruction.js.map