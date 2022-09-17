; Prime sort (Hopefully)
; A - Just for math
; B - Remainder
; C - Loop iteration
; D - 
SET number 7
LDA $number Initialise A with the number to check
LDC 2 The loop variable
JMP 13 make sure we don't move it on the first iteration
ADD 255
MV A C Move the loop var back to c
LDA $number
MV C B
DIVRB
MV B A
JNZ 18
JMP 25
MV C A
ADD 1
SUB 255
JNZ 10
; 0 is prime, anything else is composite
HLT

HLT