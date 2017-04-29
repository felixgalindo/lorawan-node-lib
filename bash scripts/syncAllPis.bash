#Updates all files in lora-mdot on all PIs
for x in {1,3,5,7} ; do echo "Updating rn2903 example for pi@192.168.2.15${x}"; scp /Users/thisearly/Code/QuantumIOT/lora/examples/rn2903EndDeviceExample/* pi@192.168.2.15${x}:/home/pi/lora/examples/rn2903EndDeviceExample/ ; done
for x in {1,3,5,7} ; do echo "Updating mDot example for pi@192.168.2.15${x}"; scp /Users/thisearly/Code/QuantumIOT/lora/examples/mDotEndDeviceExample/* pi@192.168.2.15${x}:/home/pi/lora/examples/mDotEndDeviceExample/ ; done
for x in {1,3,5,7} ; do echo "Updating lib for pi@192.168.2.15${x}";      scp /Users/thisearly/Code/QuantumIOT/lora/lib/* pi@192.168.2.15${x}://home/pi/lora/lib/ ; done
#for x in {1,3,5,7} ; 
#do echo "Updating config for pi@192.168.2.15${x}"; 
#scp /Users/thisearly/Code/QuantumIOT/lora/config/* pi@192.168.2.15${x}:/home/pi/lora/config/ ; 
#scp /Users/thisearly/Code/QuantumIOT/lora/examples/rn2903EndDeviceExample/config/* pi@192.168.2.15${x}:/home/pi/lora/examples/rn2903EndDeviceExample/config/ ;
#scp /Users/thisearly/Code/QuantumIOT/lora/examples/mDotEndDeviceExample/config/* pi@192.168.2.15${x}:/home/pi/lora/examples/mDotEndDeviceExample/config/ ; 
#done
#for x in {1,3,5,7} ; do echo "Updating index.js for pi@192.168.2.15${x}"; scp /Users/thisearly/Code/QuantumIOT/lora/index.js pi@192.168.2.15${x}:/home/pi/lora ; done
#for x in {1,2,4,6} ; do echo "Updating package.json for pi@192.168.2.15${x}"; scp /Users/thisearly/Code/QuantumIOT/lora/package.json pi@192.168.2.15${x}:/home/pi/lora ; done