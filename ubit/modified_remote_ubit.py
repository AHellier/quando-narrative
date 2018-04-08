# Remote micro:bit 
import radio, math, os
from microbit import *
# Common - easier this way due to simple build process
class COMMS: # character, json
    IR = (Image.HEART, 'ir:true')
    BUTTON_A = ('a', 'button_a:true')
    BUTTON_B = ('b', 'button_b:true')
    FACE_UP = ('^', 'orientation:"up"')
    FACE_DOWN = ('v', 'orientation:"down"')
    LEFT = ('<', 'orientation:"left"')
    RIGHT = ('>', 'orientation:"right"')
    UP = ('B', 'orientation:"backward"')
    DOWN = ('F', 'orientation:"forward"')
    CLOSE = ('', 'proximity:"close"')
    FAR = ('', 'proximity:"far"')
    arr = [IR, BUTTON_A, BUTTON_B, FACE_UP, FACE_DOWN, LEFT, RIGHT, UP, DOWN, CLOSE, FAR]

_channel = 0
EXHIBITS_FILE = 'exhibits.txt'
# The radio won't work unless it's switched on.
def radio_on():
    print('{"channel":' + str(_channel) + '}')
    # set the channel
    radio.config(channel=_channel, power=1, length=128, data_rate=radio.RATE_2MBIT)
    radio.on()

# Obtain micro:bit's unique serial ID
def get_serial_number(type=hex):
    NRF_FICR_BASE = 0x10000000
    DEVICEID_INDEX = 25 # deviceid[1]
    @micropython.asm_thumb
    def reg_read(r0):
        ldr(r0, [r0, 0])
    return type(reg_read(NRF_FICR_BASE + (DEVICEID_INDEX*4)))  
    
serial_num = ("T" + str(get_serial_number()))
serial = ':' + 'serial:' + '"' + serial_num +'"\n'

#Send low signal to indicate close
def lowSignal():
      prox = ""
      radio.config(power = 0) #about 15cm
      comms = COMMS.CLOSE
      prox = comms[0]+':'+comms[1] + serial
      radio.send(prox)
      print(prox)

# Send high signal to indicate far away     
def highSignal():
      prox = ""
      radio.config(power = 1) #about 115cm
      comms = COMMS.FAR
      prox = comms[0]+':'+comms[1] + serial
      radio.send(prox)
      print(prox)
    
def proximity():
    lowSignal()
    highSignal()

def gesture():
    buttonCount = 0
    proxCount = 3
    last_gesture = ""
    finalValue = ""
    ticks = 0
    radio.config(power = 1)
    while True:
      #  incoming = radio.receive()
        if proxCount == 4: 
            proximity()
            proxCount = 0
        else:
            proxCount += 1
        # Append received exhibit names if they don't already exist 
        # in 'exhibits.txt' Send exhibit names back by iterating
        # 'exbibits.txt' file and sending each exhibit name as JSON string.
        #if incoming != None: 
            #print(incoming)
          # if incoming[-2] == "js":
              #  incomingData = str(incoming)
              #  if os.listdir() != []:
              #      with open(EXHIBITS_FILE, 'r') as file:
              #          data = file.read()
              #          if incomingData in str(data): 
              #              print("exhibit already recorded:")
              #              print(data)
              #              radio.send(data)
              #          else: 
              #              finalValue = data + "\n" + incomingData
              #              print("exhibit recorded for the first time")
              #              with open(EXHIBITS_FILE, 'w') as file:
              #                  file.write(str(finalValue))
              #                  radio.send(finalValue)
              #                  print(finalValue)
              #  else: 
              #      with open(EXHIBITS_FILE, 'w') as file:
              #            file.write(incomingData)  
              #            print("exhibit recorded for the first time...")  
              #            print(incomingData)
        msg = ""
        msg_a = COMMS.BUTTON_A[0]+':'+COMMS.BUTTON_A[1] + serial
        msg_b = COMMS.BUTTON_B[0]+':'+COMMS.BUTTON_B[1] + serial
        if button_a.was_pressed():
            msg = msg_a
            buttonCount += 1
            if button_b.is_pressed():
                msg += msg_b
                buttonCount = 0
        if button_b.was_pressed():
            msg = msg_b
            if button_a.is_pressed():
                msg += msg_a
                buttonCount += 1
        elif buttonCount == 3: 
                if os.listdir() != []:
                    with open(EXHIBITS_FILE, 'w') as file:
                       os.remove(EXHIBITS_FILE)
                       print("deleting exhibit records")
                       buttonCount = 0
                else: 
                    buttonCount = 0
        gest = accelerometer.current_gesture()
        if gest == last_gesture:
            ticks += 1
            if ticks == 50:
                ticks=0
            else:
                sleep(20)
        else:
            last_gesture = gest
            ticks = 0
        if ticks == 0:
            comms = False
            if gest == 'face up':
                comms = COMMS.FACE_UP
                buttonCount = 0
            elif gest == 'face down':
                comms = COMMS.FACE_DOWN
                buttonCount = 0
            elif gest == 'up':
                comms = COMMS.UP
                buttonCount = 0
            elif gest == 'down':
                comms = COMMS.DOWN
                buttonCount = 0
            elif gest == 'left':
                comms = COMMS.LEFT
                buttonCount = 0
            elif gest == 'right':
                comms = COMMS.RIGHT
                buttonCount = 0
            if comms != False:
                display.show(comms[0])
                msg += comms[0]+':'+comms[1] + serial
        if msg != "":   
            radio.send(msg)
            print(msg)
    return # never does

#Main program
print('{"started":true}')
radio_on()
gesture()

    

