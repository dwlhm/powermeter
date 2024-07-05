import datetime
from corn_calc_data_hourly import doAvg
from configuration.config import load_config
from device.db import get_all as get_all_perangkat

if __name__ == "__main__":

    time_generate = datetime.datetime(2024, 6, 11, 10)
    last_time = time_generate
    for i in range(480):
        i_time = last_time + datetime.timedelta(hours=1)
        time_num = i_time.hour
        devices = get_all_perangkat(config=load_config())
        if devices.get("error"):
            print("Error: ", devices.get("error"))

        print("time: ", i_time)

        doAvg(
            devices=devices,
            ptr=time_num
        )

        last_time = i_time
