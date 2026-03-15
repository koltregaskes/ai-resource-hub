import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  type ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

interface PricePoint {
  date: string;
  price: number;
}

interface Props {
  data: PricePoint[];
  colour: string;
}

export default function MiniPriceChart({ data, colour }: Props) {
  if (data.length < 2) return null;

  const firstPrice = data[0].price;
  const lastPrice = data[data.length - 1].price;
  const decreased = lastPrice < firstPrice;
  const lineColour = decreased ? '#22c55e' : '#ef4444';

  const labels = data.map(d => {
    const dt = new Date(d.date);
    return dt.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
  });

  const chartData = {
    labels,
    datasets: [
      {
        data: data.map(d => d.price),
        borderColor: lineColour,
        backgroundColor: lineColour + '15',
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 3,
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a1a2e',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: '#2a2a4e',
        borderWidth: 1,
        padding: 8,
        displayColors: false,
        callbacks: {
          label: (ctx) => `$${ctx.parsed.y.toFixed(2)}/M tokens`,
        },
      },
    },
    scales: {
      x: { display: false },
      y: { display: false },
    },
  };

  return (
    <div className="flex items-center gap-3">
      <div style={{ width: '200px', height: '60px', position: 'relative' }}>
        <Line data={chartData} options={options} />
      </div>
      <div className="text-xs space-y-0.5">
        <div style={{ color: '#64748b' }}>
          ${firstPrice.toFixed(2)} → ${lastPrice.toFixed(2)}
        </div>
        <div style={{ color: lineColour, fontWeight: 600 }}>
          {decreased ? '↓' : '↑'} {Math.abs(((lastPrice - firstPrice) / firstPrice) * 100).toFixed(0)}%
        </div>
      </div>
    </div>
  );
}
