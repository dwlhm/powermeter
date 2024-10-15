from pymodbus.client import ModbusTcpClient
from time import sleep
from device_registers.registers_repo import repo as registers

ip_addr = "10.225.0.204"
port = 502
pm_seri = "AW9L"

def read(client, register, data, ip_addr, index):
	rr = client.read_holding_registers(register[0], 2, slave=1)
	if rr.isError():
		print(f"{register[0]} - exception in pymodbus {rr}")
	else:
		data.append(rr.registers[0]*register[1])
		print(f"reading register {register[0]} from {ip_addr}, value: {rr.registers[0]*register[1]} {register[3]}")
		

client = ModbusTcpClient(
		host= ip_addr, 
		retries = 5, 
		no_resend_on_retry = False
	)  
conn = client.connect()

if conn:
	print(f"connected to {ip_addr}:{port} with device_id: {id} [{pm_seri}]")
	data = []
	for index, register in enumerate(registers[pm_seri]):
		read(client, register, data, ip_addr, index)	  
		sleep(2)              
	client.close()  
		
