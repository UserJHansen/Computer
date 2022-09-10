# 5 bit instructions

Possibility of up to 255 instructions.

0 - 00000 - LDA - Set register A
1 - 00001 - LDB - Set register B
2 - 00010 - LDC - Set register C
3 - 00011 - LDD - Set register D
4 - 00100 - JMP - Jump to addr
5 - 00101 - JNZ - Jump when A != 0
6 - 00110 - ADD - Add the Data to A
7 - 00111 - SUB - Subtract the Data from A
8 - 01000 - MUL - Multiply A by the Data
9 - 01001 - DIV - Divide A by the Data
10 - 01010 - DIVR - Divide A by the Data and store remainder in B
11 - 01011 - SWP - Swap A with a register defined by the data: 0 - B 1 - C 2 - D
12 - 01100 -
13 - 01101 -
14 - 01110 -
15 - 01111 -
16 - 10000 -
17 - 10001 -
18 - 10010 -
19 - 10011 -
20 - 10100 -
21 - 10101 -
22 - 10110 -
23 - 10111 -
24 - 11000 -
25 - 11001 -
26 - 11010 -
27 - 11011 -
28 - 11100 -
29 - 11101 -
30 - 11110 -
31 - 11111 -
[...]
254 - 1111111 - Halt
