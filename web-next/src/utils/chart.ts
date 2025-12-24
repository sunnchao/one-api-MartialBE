export function getLastSevenDays() {
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const month = '' + (d.getMonth() + 1);
    const day = '' + d.getDate();
    const year = d.getFullYear();

    const formattedDate = [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
    dates.push(formattedDate);
  }
  return dates;
}

export function getTodayDay() {
  let today = new Date();
  return today.toISOString().slice(0, 10);
}

export function renderChartNumber(number: number | string, decimal = 2) {
  let num = Number(number);

  if (isNaN(num)) {
    return '0';
  }

  if (Math.abs(num) < Number.EPSILON) {
    return '0';
  }

  if (Math.abs(num) >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }

  return num.toFixed(decimal);
}

export function renderNumber(number: number | string) {
  if (typeof number === 'string' && (number.includes('$') || isNaN(Number(number)))) {
    return number;
  }
  const num = Number(number);
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 10000) {
    return (num / 1000).toFixed(1) + 'k';
  } else {
    return num.toString();
  }
}

export function generateBarChartOptions(xaxis: string[], data: any[], unit = '', decimal = 0) {
  return {
    height: 480,
    type: 'bar',
    options: {
      title: {
        text: '',
        align: 'left',
        style: {
          fontSize: '14px',
          fontWeight: 'bold',
          fontFamily: 'Roboto, sans-serif'
        }
      },
      colors: [
        '#008FFB',
        '#00E396',
        '#FEB019',
        '#FF4560',
        '#775DD0',
        '#55efc4',
        '#81ecec',
        '#74b9ff',
        '#a29bfe',
        '#00b894',
        '#00cec9',
        '#0984e3',
        '#6c5ce7',
        '#ffeaa7',
        '#fab1a0',
        '#ff7675',
        '#fd79a8',
        '#fdcb6e',
        '#e17055',
        '#d63031',
        '#e84393'
      ],
      chart: {
        stacked: true,
        toolbar: {
          show: true
        },
        zoom: {
          enabled: true
        },
        background: 'transparent'
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            legend: {
              position: 'bottom',
              offsetX: -10,
              offsetY: 0
            }
          }
        }
      ],
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '50%',
          // borderRadius: 10,
          dataLabels: {
            total: {
              enabled: true,
              style: {
                fontSize: '13px',
                fontWeight: 900
              },
              formatter: function (val: any) {
                return renderChartNumber(val, decimal);
              }
            }
          }
        }
      },
      xaxis: {
        type: 'category',
        categories: xaxis
      },
      legend: {
        show: true,
        fontSize: '14px',
        fontFamily: `'Roboto', sans-serif`,
        position: 'bottom',
        offsetX: 20,
        labels: {
          useSeriesColors: false
        },
        markers: {
          width: 16,
          height: 16,
          radius: 5
        },
        itemMargin: {
          horizontal: 15,
          vertical: 8
        }
      },
      fill: {
        type: 'solid'
      },
      dataLabels: {
        enabled: false
      },
      grid: {
        show: true
      },
      tooltip: {
        theme: 'dark',
        fixed: {
          enabled: false
        },
        marker: {
          show: false
        },
        y: {
          formatter: function (val: any) {
            return renderChartNumber(val, decimal) + ` ${unit}`;
          }
        }
      }
    },
    series: data
  };
}
