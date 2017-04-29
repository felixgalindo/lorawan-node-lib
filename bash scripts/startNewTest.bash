
#Clear logs
bash ./clearLogs.bash
sleep 5

#Updates all files in lora-mdot on all PIs
bash ./syncAllPis.bash
sleep 5


#Restart new app
for x in {1,3,5,7} ; 

do 
#For Microchip
# echo "Rebooting pi@192.168.2.15${x}"
# ssh  -f pi@192.168.2.15${x} "sudo reboot"

echo "Restarting lora app for pi@192.168.2.15${x}"
#ssh pi@192.168.2.15${x} "pm2 restart 1 -- 'Hello World Hello World Hello World Hello World Hello World Hello World Hello World Hello WorldTEST$1'"
#ssh pi@192.168.2.15${x} "pm2 restart 1 -- 'small payload TEST$1'"
ssh pi@192.168.2.15${x} "pm2 restart 1 -- 'Hello World Hello World Hello World Hello World$1'"

sleep 5 
#ssh pi@192.168.2.15${x} "pm2 restart 0 -- 'small payload TEST$1'"
#ssh pi@192.168.2.15${x} "pm2 restart 0 -- 'Hello World Hello World Hello World Hello World Hello World Hello World Hello World Hello WorldTEST$1'" 
ssh pi@192.168.2.15${x} "pm2 restart 0 -- 'Hello World Hello World Hello World Hello World$1'"
sleep 5
done
exit
