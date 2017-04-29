#Updates all files in lora-mdot on all PIs
for x in {1,3,5,7} ; do echo "ssh pi@192.168.2.15${x}"; ttab ssh pi@192.168.2.15${x}; done
