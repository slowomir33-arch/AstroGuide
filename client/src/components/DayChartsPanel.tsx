import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { getDayTransitSeries } from '../lib/dayCharts'

type Props = {
  dateStr: string
  profileId: string | null
}

export function DayChartsPanel({ dateStr, profileId }: Props) {
  const pid = profileId ?? 'anon'
  const data = getDayTransitSeries(dateStr, pid)

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0c0a12]/80 p-4">
      <h2 className="font-serif text-lg font-medium text-white">Wykresy dla dnia</h2>
      <p className="mt-1 text-xs leading-relaxed text-zinc-500">
        Podgląd pola dnia (symulacja deterministyczna dla daty). W produkcji: tranzyty względem
        karty natalnej z silnika efemerydy.
      </p>
      <div className="mt-4 h-[240px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2240" />
            <XAxis dataKey="t" tick={{ fill: '#7a7394', fontSize: 10 }} />
            <YAxis tick={{ fill: '#5c6370', fontSize: 10 }} domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                background: '#100c18',
                border: '1px solid #2a2240',
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="napięcie" stroke="#f472b6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="harmonia" stroke="#34d399" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="pole" stroke="#d4a853" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
