import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { getCurrentDateLimaISO } from '@/lib/date-utils';
import { Transaction } from '@/hooks/useFinance';
import { formatCurrency } from '@/lib/utils';

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

interface FinanceChartProps {
  transactions: Transaction[];
}

export function FinanceChart({ transactions }: FinanceChartProps) {
  const currentYear = getCurrentDateLimaISO().split('-')[0];
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const chartData = useMemo(() => {
    // Inicializar el arreglo de datos por mes
    const data = MONTHS.map((month) => ({
      name: month,
      ingresos: 0,
      gastos: 0,
      ingresoNeto: 0,
    }));

    // Llenar los datos con las transacciones correspondientes al año seleccionado
    transactions.forEach(tx => {
      const [year, monthStr] = tx.date.split('-');
      if (year === selectedYear) {
        const monthIdx = parseInt(monthStr, 10) - 1;
        if (monthIdx >= 0 && monthIdx < 12) {
          const amount = Number(tx.amount);
          if (tx.type === 'Ingreso') {
            data[monthIdx].ingresos += amount;
          } else {
            data[monthIdx].gastos += amount;
          }
        }
      }
    });

    // Calcular el ingreso neto al final
    return data.map(item => ({
      ...item,
      ingresoNeto: item.ingresos - item.gastos
    }));
  }, [transactions, selectedYear]);

  const years = useMemo(() => {
    // Obtener años únicos a partir de las transacciones
    const y = new Set(transactions.map(t => t.date.split('-')[0]));
    y.add(currentYear); // Asegurar que el año actual siempre esté
    return Array.from(y).sort((a, b) => b.localeCompare(a));
  }, [transactions, currentYear]);

  return (
    <Card className="glass rounded-[2rem] border-zinc-200/50 shadow-sm overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div>
          <CardTitle className="text-xl font-bold text-zinc-900">Balance Anual</CardTitle>
          <CardDescription>Visualiza los ingresos, gastos y el neto consolidado por mes.</CardDescription>
        </div>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[120px] bg-white border-zinc-200">
            <SelectValue placeholder="Año" />
          </SelectTrigger>
          <SelectContent>
            {years.map(y => (
              <SelectItem key={y} value={y}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} dy={10} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#71717a', fontSize: 12 }} 
                tickFormatter={(value) => `S/ ${value}`}
                width={80}
              />
              <RechartsTooltip 
                cursor={{ fill: '#f4f4f5' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', padding: '12px' }}
                formatter={(value: number, name: string) => [formatCurrency(value), name]}
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              <ReferenceLine y={0} stroke="#a1a1aa" />
              <Bar dataKey="ingresos" name="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="gastos" name="Gastos" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="ingresoNeto" name="Ingreso Neto" fill="#3b82f6" radius={[4, 4, 4, 4]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}