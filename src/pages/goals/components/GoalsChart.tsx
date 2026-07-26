import { useState, useMemo } from 'react';
import { useGoals } from '@/hooks/useGoals';
import { useClients } from '@/hooks/useClients';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { getCurrentDateLimaISO } from '@/lib/date-utils';

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export function GoalsChart() {
  const { data: goals = [], isLoading: loadingGoals } = useGoals();
  const { data: clients = [], isLoading: loadingClients } = useClients();
  
  const currentYear = getCurrentDateLimaISO().split('-')[0];
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedClient, setSelectedClient] = useState<string>('all');

  const chartData = useMemo(() => {
    const data = MONTHS.map((month, index) => ({
      name: month,
      meta: 0,
      logrado: 0,
      monthIndex: index + 1
    }));

    const filteredGoals = goals.filter(g => {
      const [gYear] = g.monthYear.split('-');
      if (gYear !== selectedYear) return false;
      if (selectedClient !== 'all' && g.clientId !== selectedClient) return false;
      return true;
    });

    filteredGoals.forEach(goal => {
      const [_, gMonth] = goal.monthYear.split('-');
      const monthIdx = parseInt(gMonth, 10) - 1;
      if (monthIdx >= 0 && monthIdx < 12) {
        const achievedPatients = goal.dailyLogs?.reduce((acc: any, log: any) => acc + log.count, 0) || 0;
        
        data[monthIdx].meta += goal.targetPatients;
        data[monthIdx].logrado += achievedPatients;
      }
    });

    return data;
  }, [goals, selectedYear, selectedClient]);

  const years = useMemo(() => {
    const y = new Set(goals.map(g => g.monthYear.split('-')[0]));
    y.add(currentYear);
    return Array.from(y).sort((a, b) => b.localeCompare(a));
  }, [goals, currentYear]);

  if (loadingGoals || loadingClients) return null;

  return (
    <Card className="glass rounded-[2rem] border-zinc-200/50 shadow-sm overflow-hidden mb-8">
      <CardHeader className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-2">
        <div>
          <CardTitle className="text-xl font-bold text-zinc-900">Balance de Pacientes Anual</CardTitle>
          <CardDescription>Visualiza la meta proyectada de pacientes vs la cantidad lograda por mes.</CardDescription>
        </div>
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger className="w-[180px] bg-white border-zinc-200 flex-1 sm:flex-none">
              <SelectValue placeholder="Todos los clientes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los clientes</SelectItem>
              {clients.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[100px] bg-white border-zinc-200">
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent>
              {years.map(y => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} dy={10} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#71717a', fontSize: 12 }} 
              />
              <RechartsTooltip 
                cursor={{ fill: '#f4f4f5' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', padding: '12px' }}
                formatter={(value: number, name: string) => [value, name]}
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="meta" name="Meta (Pacientes)" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="logrado" name="Logrado (Pacientes)" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}