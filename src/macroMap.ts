/* eslint-disable @typescript-eslint/naming-convention */
import { InstructionMap } from "./types";

const macroMap = {
  ADDB: {
    name: "ADDB",
    description: "Add Data to B",
    instructions: [
      {
        instruction: InstructionMap.SWP,
        data: "0",
      },
      {
        instruction: InstructionMap.ADDD,
        data: "${0}",
      },
      {
        instruction: InstructionMap.SWP,
        data: "0",
      },
    ],
  },
  ADDC: {
    name: "ADDC",
    description: "Add Data to C",
    instructions: [
      {
        instruction: InstructionMap.SWP,
        data: "1",
      },
      {
        instruction: InstructionMap.ADDD,
        data: "${0}",
      },
      {
        instruction: InstructionMap.SWP,
        data: "1",
      },
    ],
  },
  ADDD: {
    name: "ADDD",
    description: "Add Data to D",
    instructions: [
      {
        instruction: InstructionMap.SWP,
        data: "2",
      },
      {
        instruction: InstructionMap.ADDD,
        data: "${0}",
      },
      {
        instruction: InstructionMap.SWP,
        data: "2",
      },
    ],
  },
};

export default macroMap;
