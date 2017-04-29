echo "Running test 44"
bash ./startNewTest.bash 44
sleep 10
echo "Waiting for 60 minute"
#sleep 180
sleep 3600
bash ./downloadLogs.bash 44
# sleep 10

# echo "Running test 37"
# bash ./startNewTest.bash 37
# sleep 10
# echo "Waiting for 10m"
# sleep 660
# bash ./downloadLogs.bash 37
# sleep 10



