"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Macro {
    constructor({ name, instructions, }) {
        this.name = name;
        this.instructions = instructions;
    }
    toArray() {
        throw new Error("Method not implemented.");
    }
    get length() {
        return this.instructions.length * 4;
    }
}
exports.default = Macro;
//# sourceMappingURL=Macro.js.map