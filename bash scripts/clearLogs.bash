#Stop & clear logs

echo "Stopping current tests and clearing logs"
for x in {1,3,5,7} ; do 
ssh  pi@192.168.2.15${x} "pm2 stop all && pm2 flush && exit"
ssh  pi@192.168.2.15${x} "rm -r ~/lora/examples/rn2903EndDeviceExample/logs/rxLog.log"
ssh  pi@192.168.2.15${x} "rm -r ~/lora/examples/mDotEndDeviceExample/logs/rxLog.log"
done

sleep 5
ssh  root@192.168.2.158 "rm -r ./lora-conduit/log/"
ssh  root@192.168.2.158 "rm -r ./lora-conduit/plugpower.log"
ssh  -f root@192.168.2.158 '/etc/init.d/node-app restart' 
sleep 10