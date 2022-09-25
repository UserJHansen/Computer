; An application of the sieve of eratosthenes
; A - Just for math
; B - Loop iteration
; C - Curr number
; D - 
SET $number 100
LDC 3
start_num:
LDB 2 ; The loop variable
loop:
MV C A ; Initialise A with the number to check
MOD
JNZ ++2
JMP finished
MACRO ADDB 1 
JMP loop
; 0 is prime, anything else is composite
finished:
MV C A
JNEQ composite
prime:
MV C A
PUSH
MACRO ADDD 1
composite:
MV C A
LDB $number
JEQ finish
MACRO ADDC 1
JMP start_num
finish:
HLT
