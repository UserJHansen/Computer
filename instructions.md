# 8 bit instructions

Possibility of up to 255 instructions.

Divided into 16 groups of 16 instructions:
Group 0: Load and store
Group 1: Arithmetic
Group 2: Jumps
Group 3: Bitwise
Group 4: Stack
Group 5: I/O
Group 6: 

Group 15: Special

To be implemented: 
- Bitwise
- Stack
- I/O

0 - 0 - 00000000 - LDA - Set register A
0 - 1 - 00000001 - LDB - Set register B
0 - 2 - 00000010 - LDC - Set register C
0 - 3 - 00000011 - LDD - Set register D
0 - 4 - 00000100 - MV - Move register - First 4 bits is source, last 4 bits is destination
0 - 5 - 00000101 - SWP - Swap registers - First 3 bits is the register, B, C, D 
0 - 6 - 00000110 - 
0 - 7 - 00000111 - 
0 - 8 - 00001000 - 
0 - 9 - 00001001 - 
0 - 10 - 00001010 - 
0 - 11 - 00001011 - 
0 - 12 - 00001100 - 
0 - 13 - 00001101 - 
0 - 14 - 00001110 - 
0 - 15 - 00001111 - 

1 - 16 - 00010000 - SQR - Square A
1 - 17 - 00010001 - ADD - Add B to A
1 - 18 - 00010010 - SUB - Subtract B from A
1 - 19 - 00010011 - MUL - Multiply A by B
1 - 20 - 00010100 - DIV - Divide A by B
1 - 21 - 00010101 - MOD - Modulo A by B
1 - 22 - 00010110 - DIVR - Divide A by B, remainder in B
1 - 23 - 00010111 - MULBIG - Multiply A by B, result in A,B
1 - 24 - 00011000 - SQRBIG - Square A, result in A,B
1 - 25 - 00011001 - ADDD - Add Data to A
1 - 26 - 00011010 - SUBD - Subtract Data from A
1 - 27 - 00011011 - MULD - Multiply A by Data
1 - 28 - 00011100 - DIVD - Divide A by Data
1 - 29 - 00011101 - MODD - Modulo A by Data
1 - 30 - 00011110 - DIVRD - Divide A by Data, remainder in B
1 - 31 - 00011111 - MULBIGD - Multiply A by Data, result in A,B

2 - 32 - 00100000 - JMP - Jump to addr
2 - 33 - 00100001 - JZ - Jump when A == 0
2 - 34 - 00100010 - JNZ - Jump when A != 0
2 - 35 - 00100011 - JG - Jump when A > B
2 - 36 - 00100100 - JGE - Jump when A >= B
2 - 37 - 00100101 - JL - Jump when A < B
2 - 38 - 00100110 - JLE - Jump when A <= B
2 - 39 - 00100111 - JEQ - Jump when A == B
2 - 40 - 00101000 - JNEQ - Jump when A != B
2 - 41 - 00101001 - JC - Jump when Carry
2 - 42 - 00101010 - JNC - Jump when No Carry
2 - 43 - 00101011 - 
2 - 44 - 00101100 -
2 - 45 - 00101101 -
2 - 46 - 00101110 -
2 - 47 - 00101111 -

3 - 48 - 00110000 - AND - A = A & B
3 - 49 - 00110001 - OR - A = A | B
3 - 50 - 00110010 - XOR - A = A ^ B
3 - 51 - 00110011 - NOT - A = ~A
3 - 52 - 00110100 - SHL - A = A << B
3 - 53 - 00110101 - SHR - A = A >> B
3 - 54 - 00110110 - ROL - A = A << B | A >> (32-B)
3 - 55 - 00110111 - ROR - A = A >> B | A << (32-B)
3 - 56 - 00111000 - ANDD - A = A & Data
3 - 57 - 00111001 - ORD - A = A | Data
3 - 58 - 00111010 - XORD - A = A ^ Data
3 - 59 - 00111011 - NOTD - A = ~A
3 - 60 - 00111100 - SHLD - A = A << Data
3 - 61 - 00111101 - SHRD - A = A >> Data
3 - 62 - 00111110 - ROLD - A = A << Data | A >> (32-Data)
3 - 63 - 00111111 - RORD - A = A >> Data | A << (32-Data)

4 - 64 - 01000000 - PUSH - Push A to stack
4 - 65 - 01000001 - POP - Pop from stack to A
4 - 66 - 01000010 - PUT - Push Data to stack
4 - 67 - 01000011 - MOVSP - Move stack pointer
4 - 68 - 01000100 - 
4 - 69 - 01000101 -
4 - 70 - 01000110 -
4 - 71 - 01000111 -
4 - 72 - 01001000 -
4 - 73 - 01001001 -
4 - 74 - 01001010 -
4 - 75 - 01001011 -
4 - 76 - 01001100 -
4 - 77 - 01001101 -
4 - 78 - 01001110 -
4 - 79 - 01001111 -

5 - 80 - 01010000 -
5 - 81 - 01010001 -
5 - 82 - 01010010 -
5 - 83 - 01010011 -
5 - 84 - 01010100 -
5 - 85 - 01010101 -
5 - 86 - 01010110 -
5 - 87 - 01010111 -
5 - 88 - 01011000 -
5 - 89 - 01011001 -
5 - 90 - 01011010 -
5 - 91 - 01011011 -
5 - 92 - 01011100 -
5 - 93 - 01011101 -
5 - 94 - 01011110 -
5 - 95 - 01011111 -
[...]
15 - 252 - 11111100 - BRK - Call interrupt
15 - 253 - 11111101 - NOP - No operation
15 - 254 - 1111111 - HLT - Halt
