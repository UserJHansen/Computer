"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseNumber = exports.getInstruction = exports.safeNumber = void 0;
const types_1 = require("./types");
function safeNumber(i) {
    if (i >= 0 && i < 2 ** 24) {
        return i;
    }
    console.error("Bad data, it should be above 0 and below", 2 ** 24, "Number: ", i);
    throw new Error("Bad data, failed to parse: " + i);
}
exports.safeNumber = safeNumber;
function getInstruction(instruction) {
    if (instruction in types_1.InstructionMap)
        return types_1.InstructionMap[instruction];
    return types_1.InstructionMap.NOP;
}
exports.getInstruction = getInstruction;
function parseNumber(int) {
    var radix = 10;
    if (int.startsWith("0b")) {
        int = int.slice(2);
        radix = 2;
    }
    else if (int.startsWith("0x")) {
        int = int.slice(2);
        radix = 16;
    }
    return parseInt(int, radix);
}
exports.parseNumber = parseNumber;
//# sourceMappingURL=helper.js.map