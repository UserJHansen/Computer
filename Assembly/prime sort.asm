; Prime sort (Hopefully)
; A - Just for math
; B - Loop iteration
; C -
; D - 
SET $number 9973
LDB 2 ; The loop variable
loop:
LDA $number ; Initialise A with the number to check
MOD
JNZ ++2
JMP finished
MACRO ADDB 1 
JMP loop
; 0 is prime, anything else is composite
finished:
LDA $number
JEQ prime
composite:
HLT
prime:
LDA 0xffffffff
LDB 0xfffffff
LDC 0xfffffff
LDD 0xffffffff
HLT