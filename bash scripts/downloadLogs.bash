

b=$HOME/Google\ Drive/LoRa/Lora\ Range\ Test\ Data/Test\ $1
echo "Making directory $b to store log files"
mkdir "$b"

echo "Stopping current tests"
ssh  -f pi@192.168.2.151 "pm2 stop all && exit"
ssh  -f pi@192.168.2.153 "pm2 stop all && exit"
ssh  -f pi@192.168.2.155 "pm2 stop all && exit"
ssh  -f pi@192.168.2.157 "pm2 stop all && exit"
sleep 15

for x in {1,3,5,7,8} ; 

do 
if [ $x -eq 1 ]; then
	a=46ef
	c=46ef_Rx
	d=aea2
	e=aea2_Rx
fi
if [ $x -eq 3 ]; then
	#a=aea4.txt
	a=7923
	c=7923_Rx
	d=aea4
	e=aea4_Rx
fi
if [ $x -eq 5 ]; then
	#a=a2a3.txt
	a=81a3
	c=81a3_Rx
	d=a2a3
	e=a2a3_Rx
fi
if [ $x -eq 7 ]; then
	#a=a2a2.txt
	a=2af5
	c=2af5_Rx
	d=a2a2
	e=a2a2_Rx
fi
if [ $x -eq 1 ] || [ $x -eq 3 ] || [ $x -eq 5 ] || [ $x -eq 7 ]; then
	echo "Downloading log files for 192.168.2.15${x} to $b/$a.txt"    
	scp  pi@192.168.2.15${x}:~/.pm2/logs/index-out-0.log  "$b/$a.txt" 
	scp  pi@192.168.2.15${x}:~/lora/examples/rn2903EndDeviceExample/logs/rxLog.log  "$b/$c.txt" 
	scp  pi@192.168.2.15${x}:~/.pm2/logs/index-out-1.log  "$b/$d.txt" 
	scp  pi@192.168.2.15${x}:~/lora/examples/mDotEndDeviceExample/logs/rxLog.log  "$b/$e.txt" 

fi

if [ $x -eq 8 ]; then
	sleep 5
	echo "Downloading log files for 192.168.2.15${x} to $b/GatewayLog.txt"
	scp  root@192.168.2.15${x}:~/./lora-conduit/plugpower.log "$b/GatewayLog.txt"
	ssh  -f root@192.168.2.15${x} '/etc/init.d/node-app restart' 
	sleep 5
fi

	#Set column names for csv logs
	if [ $x -eq 1 ] || [ $x -eq 3 ] || [ $x -eq 5 ] || [ $x -eq 7 ]; then

	#Remove junk from txt log and create a csv version for microchip rx logs 
	cp "$b/$c.txt" "$b/$c.csv"
	perl -p -e's/^/prefix' "$b/$c.csv"
	perl -pi -e 's/\"//g' "$b/$c.csv"
	perl -pi -e 's/{level:info,message://g' "$b/$c.csv"
	perl -pi -e 's/timestamp://g' "$b/$c.csv"
	perl -pi -e 's/}//g' "$b/$c.csv"

	#Append csv file log to a csv file log combining all end device logs
	cat "$b/$c.csv" >> "$b/allEndDevicesRxLog.csv"


	#Remove junk from txt log and create a csv version for mDot rx logs
	cp "$b/$e.txt" "$b/$e.csv"
	perl -p -e's/^/prefix' "$b/$e.csv"
	perl -pi -e 's/\"//g' "$b/$e.csv"
	perl -pi -e 's/{level:info,message://g' "$b/$e.csv"
	perl -pi -e 's/timestamp://g' "$b/$e.csv"
	perl -pi -e 's/}//g' "$b/$e.csv"

	#Append csv file log to a csv file log combining all end device logs
	cat "$b/$e.csv" >> "$b/allEndDevicesRxLog.csv"

	#Add column names to rx logs
	cat "$b/$c.csv" | pbcopy && echo "Device Id,Data,SNR Last Packet,RxCount,Timestamp" > "$b/$c.csv" && pbpaste >> "$b/$c.csv"
	cat "$b/$e.csv" | pbcopy && echo "Device Id,Data,SNR Last Packet,RxCount,Timestamp" > "$b/$e.csv" && pbpaste >> "$b/$e.csv"
	fi

	if [ $x -eq 8 ]; then
	#Remove junk from txt log and create a csv version for gateway logs
	c=GatewayLog
	cp "$b/$c.txt" "$b/$c.csv"
	perl -p -e's/^/prefix' "$b/$c.csv"
	perl -pi -e 's/\"//g' "$b/$c.csv"
	perl -pi -e 's/{level:info,message://g' "$b/$c.csv"
	perl -pi -e 's/timestamp://g' "$b/$c.csv"
	perl -pi -e 's/}//g' "$b/$c.csv"	
	cat "$b/GatewayLog.csv" | pbcopy && echo "Device Id,RSSI,SNR,Channel,Freq,SF / BW,Message Id,Payload,Timestamp" > "$b/GatewayLog.csv" && pbpaste >> "$b/GatewayLog.csv"
	fi

done

#Add column names to rx combined log
cat "$b/allEndDevicesRxLog.csv" | pbcopy && echo "Device Id,Data,SNR Last Packet,RxCount,Timestamp" > "$b/allEndDevicesRxLog.csv" && pbpaste >> "$b/allEndDevicesRxLog.csv"

