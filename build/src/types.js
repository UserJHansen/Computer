"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Type = exports.InstructionMap = void 0;
var InstructionMap;
(function (InstructionMap) {
    InstructionMap[InstructionMap["LDA"] = 0] = "LDA";
    InstructionMap[InstructionMap["LDB"] = 1] = "LDB";
    InstructionMap[InstructionMap["LDC"] = 2] = "LDC";
    InstructionMap[InstructionMap["LDD"] = 3] = "LDD";
    InstructionMap[InstructionMap["JMP"] = 4] = "JMP";
    InstructionMap[InstructionMap["JNZ"] = 5] = "JNZ";
    InstructionMap[InstructionMap["ADD"] = 6] = "ADD";
    InstructionMap[InstructionMap["SUB"] = 7] = "SUB";
    InstructionMap[InstructionMap["MUL"] = 8] = "MUL";
    InstructionMap[InstructionMap["DIV"] = 9] = "DIV";
    InstructionMap[InstructionMap["DIVR"] = 10] = "DIVR";
    InstructionMap[InstructionMap["SWP"] = 11] = "SWP";
    InstructionMap[InstructionMap["NOP"] = 254] = "NOP";
    InstructionMap[InstructionMap["HLT"] = 255] = "HLT";
})(InstructionMap = exports.InstructionMap || (exports.InstructionMap = {}));
var Type;
(function (Type) {
    Type[Type["Command"] = 0] = "Command";
    Type[Type["Macro"] = 1] = "Macro";
})(Type = exports.Type || (exports.Type = {}));
//# sourceMappingURL=types.js.map