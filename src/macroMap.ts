import { InstructionMap } from "./types";

const macroMap = {
  ADDB: {
    name: "ADDB",
    description: "Add Data to B",
    instructions: [
      {
        instruction: InstructionMap.SWP,
        data: "0b00000001",
      },
      {
        instruction: InstructionMap.ADDD,
        data: "${0}",
      },
      {
        instruction: InstructionMap.SWP,
        data: "0b00000001",
      },
    ],
  },
};

export default macroMap;
