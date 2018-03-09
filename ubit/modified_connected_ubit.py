import radio, math
from microbit import *

uart.init(baudrate=115200, bits=8, parity=None, stop=1, tx=None, rx=None)
_channel = 0

def get_serial_number(type=hex):
    NRF_FICR_BASE = 0x10000000
    DEVICEID_INDEX = 25 # deviceid[1]

    @micropython.asm_thumb
    def reg_read(r0):
        ldr(r0, [r0, 0])
    return type(reg_read(NRF_FICR_BASE + (DEVICEID_INDEX*4))) 
     
# The radio won't work unless it's switched on.
def radio_on():
    # set the channel
    radio.config(channel=_channel, power=1, length=128, data_rate=radio.RATE_2MBIT)
    radio.on()
 
# Event loop.
def proxy():
    sleeps = 0
    closeCount = 0
    farCount = 0
    incomingCount = 0
    
    while True:
        try:
            incoming = radio.receive()
            value = uart.readline()
            if value != None:    
               # print(value)
                newValue = list(str(value))
                newValue[0] = ""
                joinValue = "".join(newValue)
               # print(joinValue)
                finalValue = joinValue.replace("'", '"')# removes "'" from serial input   
                sendValue = ':exhibit' + ":" + str(finalValue)   
               # print(sendValue)
                radio.send(sendValue)
            elif incoming == None:
                incomingCount += 1
                if incomingCount == 25000: #Emit no device every 10 seconds (30000) if no incoming data
                    print('{"visitor":"false"}')
                    incomingCount = 0
                elif sleeps == 500:
                    display.clear()
                sleeps += 1   
            else:
                    incomingCount = 0
                    messages = incoming.split('\n')
                    messages.pop() # drop the empty last one
                 #   print(incoming)
                    result = '{'
                    for msg in messages:
                        parts = msg.split(':')
                        result += '"' + parts[1] + '":' + parts[2] + ','
                        display.show(parts[0])
                 #   result = result[:-1] + '}' # replace the last , with 
                    resultCount = result.count(",")
                 #   print(result)
                    if result == '{"proximity":"close",':
                           closeCount += 1
                           if closeCount == 3:
                               remoteSerial = '"' + parts[3] + '":' + parts[4] + '}'
                               result += remoteSerial
                               print(result)
                             #  print(remoteSerial)
                               closeCount = 0
                               farCount = 0
                       #    incoming = radio.receive()
                    elif result == '{"proximity":"far",':
                           farCount += 1
                           if farCount == 6:
                            remoteSerial = '"' + parts[3] + '":' + parts[4] + '}'
                            result += remoteSerial
                            print(result)
                          #  print(remoteSerial)
                            farCount = 0
                            closeCount = 0
                    elif parts[1] == "exhibit":
                        exhibits = result.split(',')
                        num = resultCount + 1
                        if resultCount != 0:
                            for x in range(0, num):
                              if x == 0:
                                   print(exhibits[x] + '}')
                              elif x != 0 and x != resultCount:
                                   print('{' + exhibits[x] + '}')
                              else: 
                                   print('{' + exhibits[x]) 
                        else: 
                            print(result) 
                        sleeps(0)
                    else:
                        remoteSerial = '"' + parts[3] + '":' + parts[4] + '}'
                        result += remoteSerial
                        print(result)
                  #      print(remoteSerial)
                        sleeps = 0
        except:
            print('{"error":"packet"}')
            radio.off()
    #       sleep(1000)
            radio_on()
    return # never

#main
radio_on()
print('{"started":true}')
print('{"visitor":"false"}')
serial_num = ("C" + str(get_serial_number()))
serial = '{' + '"' + 'serial":' + '"' + serial_num +'"}'
# print (serial)
proxy()
    