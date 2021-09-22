import React, { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";

const Chart = () => {
  const ref = useRef();
  const chartProperties = {
    width: 1000,
    height: 600,
    timeScale: {
      timeVisible: true,
      secondsVisible: false,
    },
  };

  const [chartData, setChartData] = useState([]);
  const tokenName = "ethusdt";
  const ws = new WebSocket(
    `wss://stream.binance.com:9443/ws/${tokenName}@kline_1m`
  );

  const prepareChart = (chart, ws) => {
    const candlestickSeries = chart.addCandlestickSeries();

    // binance static chart REST API
    fetch(
      `https://api.binance.com/api/v3/klines?symbol=${tokenName.toUpperCase()}&interval=1m&limit=1000`
    )
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        const cdata = data.map((d) => {
          return {
            time: d[0] / 1000,
            open: parseFloat(d[1]),
            high: parseFloat(d[2]),
            low: parseFloat(d[3]),
            close: parseFloat(d[4]),
          };
        });
        candlestickSeries.setData(cdata);
        console.log("Binance Static Kline REST API called with fetch()");
      })
      .catch((err) => console.log(err));

    ws.onmessage = (event) => {
      const responseObject = JSON.parse(event.data);
      const { t, o, h, l, c } = responseObject.k;
      const kData = {
        time: t,
        open: parseFloat(o),
        high: parseFloat(h),
        low: parseFloat(l),
        close: parseFloat(c),
      };

      setChartData(chartData.push(kData));

      candlestickSeries.update(kData);
    };
  };

  useEffect(() => {
    const chart = createChart(ref.current, chartProperties);
    prepareChart(chart, ws);
  }, []);

  return (
    <>
      <div ref={ref} />
    </>
  );
};

export default Chart;
