import { Line } from "react-chartjs-2";
// import { Line, LineChart } from "recharts"

export const CompPerangkatLineChart = (props: {
  timestamp: string[];
  value: number[];
}) => {
  return (
    <Line
      options={{
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
        },
      }}
      data={{
        labels: props.timestamp,
        datasets: [
          {
            label: "data",
            data: props.value,
            borderColor: "rgb(255, 99, 132)",
            backgroundColor: "rgba(255, 99, 132, 0.5)",
          },
        ],
      }}
    />
  );
};
