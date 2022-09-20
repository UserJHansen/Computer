; Prime sort (Hopefully)
; A - Just for math
; B - Loop iteration
; C - 
; D - 
SET $number 7
LDB 2 ; The loop variable
LDA $number ; Initialise A with the number to check
MOD
JNZ 12
JMP 15
MACRO ADDB 1
JMP 8
; 0 is prime, anything else is composite
LDA $number
JEQ 18
HLT
LDA 0xffffff
LDB 0xffffff
LDC 0xffffff
LDD 0xffffff