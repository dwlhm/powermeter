import { CompButton, useTheme } from "@/common";
import { DateTimePicker } from "@mui/x-date-pickers";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import dayjs, { Dayjs } from "dayjs";
import React from "react";

export type CompPerangkatDateRangeFilterProps = {
  from: Dayjs | null;
  setFrom: (d: Dayjs | null) => void;
  to: Dayjs | null;
  setTo: (d: Dayjs | null) => void;
  onFilterChanged: (b: boolean) => void;
};

function createMuiTheme(mode: "light" | "dark") {
  return createTheme({
    palette: {
      mode,
    },
  });
}

export const CompPerangkatDateRangeFilter = (
  props: CompPerangkatDateRangeFilterProps,
) => {
  const { theme } = useTheme();
  const muiTheme = React.useMemo(
    () => createMuiTheme(theme),
    [theme],
  );

  const resetDatetime = () => {
    props.onFilterChanged(true);
    props.setFrom(dayjs().subtract(1, "day"));
    props.setTo(dayjs());
  };

  return (
    <div className="date_time flex items-center gap-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 transition-colors">
      <ThemeProvider theme={muiTheme}>
        <DateTimePicker
          label="Dari"
          value={props.from}
          onChange={(newValue) => {
            props.setFrom(newValue);
            props.onFilterChanged(true);
          }}
          slotProps={{
            textField: {
              size: "small",
              className: "bg-white dark:bg-slate-900 rounded",
            },
          }}
        />
        <DateTimePicker
          label="Hingga"
          value={props.to}
          onChange={(newValue) => {
            props.setTo(newValue);
            props.onFilterChanged(true);
          }}
          slotProps={{
            textField: {
              size: "small",
              className: "bg-white dark:bg-slate-900 rounded",
            },
          }}
        />
      </ThemeProvider>
      {props.from && (
        <CompButton
          className="!bg-slate-100 dark:!bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:!bg-slate-200 dark:hover:!bg-slate-700 rounded-full px-4 py-2 transition-colors"
          onClick={resetDatetime}
        >
          Reset
        </CompButton>
      )}
    </div>
  );
};
