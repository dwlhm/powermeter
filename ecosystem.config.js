module.exports = {
  apps : [{
    name   : "powermeter_reader",
    script : "python ./read_modbus.py",
    instances: 1,
    autorestart: false,
    time: true,
    env: {
      // Set to true to generate dummy data instead of talking to real powermeters.
      DUMMY_MODE: false,
      MODBUS_READ_INTERVAL: 60,
      MODBUS_MAX_WORKERS: 60,
    }
  },{
    name   : "hourly_avg_cron",
    script : "python ./corn_calc_data_hourly.py",
    instances: 1,
    cron_restart: "0 * * * *",
    autorestart: false,
    time: true
  },{
    name   : "daily_avg_cron",
    script : "python ./corn_calc_data_daily.py",
    instances: 1,
    cron_restart: "0 0 * * *",
    autorestart: false,
    time: true
  },{
    name   : "weekly_avg_cron",
    script : "python ./corn_calc_data_weekly.py",
    instances: 1,
    cron_restart: "0 0 * * 1",
    autorestart: false,
    time: true
  },{
    name   : "monthly_avg_cron",
    script : "python ./corn_calc_data_monthly.py",
    instances: 1,
    cron_restart: "0 0 1 * *",
    autorestart: false,
    time: true
  },{
    name   : "yearly_avg_cron",
    script : "python ./corn_calc_data_yearly.py",
    instances: 1,
    cron_restart: "0 0 1 1 *",
    autorestart: false,
    time: true
  }]
}
