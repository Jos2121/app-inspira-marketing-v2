import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Calendar, Clock, Star, Link as LinkIcon, ExternalLink, Briefcase } from 'lucide-react';
import { Client } from '@/hooks/useClients';
import { intervalToDuration } from 'date-fns';
import { formatLocalDateString } from '@/lib/date-utils';

interface ClientDetailModalProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ClientDetailModal({ client, isOpen, onClose }: ClientDetailModalProps) {
  if (!client) return null;

  const calculateElapsedTime = (startDate: string | null | undefined) => {
    if (!startDate) return '-';
    try {
      const start = new Date(`${startDate}T12:00:00Z`);
      const now = new Date();
      
      if (start > now) return 'Comienza en el futuro';

      const duration = intervalToDuration({ start, end: now });
      const parts = [];

      if (duration.years) parts.push(`${duration.years} ${duration.years === 1 ? 'año' : 'años'}`);
      if (duration.months) parts.push(`${duration.months} ${duration.months === 1 ? 'mes' : 'meses'}`);
      if (duration.days) parts.push(`${duration.days} ${duration.days === 1 ? 'día' : 'días'}`);
      
      if (parts.length === 0) return 'Inició hoy';
      
      return parts.join(', ').replace(/, ([^,]*)$/, ' y $1');
    } catch (e) {
      return '-';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] rounded-[2rem] max-h-[85vh] overflow-y-auto no-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-zinc-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="truncate">{client.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Tarjeta de Información General */}
          <div className="bg-zinc-50/80 rounded-2xl p-5 border border-zinc-200/60 shadow-sm space-y-4">
            <h4 className="font-bold text-zinc-800 text-sm uppercase tracking-wider mb-2">Información General</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-zinc-100 shrink-0">
                  <Phone className="w-4 h-4 text-zinc-500" />
                </div>
                <div>
                  <p className="text-zinc-500 text-xs font-semibold">Teléfono / WhatsApp</p>
                  <p className="font-medium text-zinc-900 font-mono">{client.phone || '-'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-zinc-100 shrink-0">
                  <Calendar className="w-4 h-4 text-zinc-500" />
                </div>
                <div>
                  <p className="text-zinc-500 text-xs font-semibold">Fecha de Inicio</p>
                  <p className="font-medium text-zinc-900 capitalize">
                    {client.startDate ? formatLocalDateString(client.startDate, 'dd MMM yyyy') : '-'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm sm:col-span-2 bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-blue-100 shrink-0">
                  <Clock className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-blue-600/80 text-xs font-bold uppercase tracking-wider">Tiempo Activo</p>
                  <p className="font-bold text-blue-900">{calculateElapsedTime(client.startDate)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta del Plan */}
          <div className="bg-white rounded-2xl p-5 border border-zinc-200/60 shadow-sm relative overflow-hidden">
            <h4 className="font-bold text-zinc-800 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              Plan Asignado
            </h4>
            
            {client.plan ? (
              <div className="space-y-4">
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-sm px-3 py-1">
                  {client.plan.name}
                </Badge>
                
                {client.plan.benefits && client.plan.benefits.length > 0 ? (
                  <ul className="space-y-2 mt-2">
                    {client.plan.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-zinc-600 font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-zinc-500 italic mt-2">Este plan no tiene beneficios detallados.</p>
                )}
              </div>
            ) : (
              <div className="bg-zinc-50 p-4 rounded-xl text-center border border-dashed border-zinc-200">
                <p className="text-sm text-zinc-500 font-medium">Sin plan asignado</p>
              </div>
            )}
          </div>

          {/* Botones / Accesos Directos */}
          <div className="bg-zinc-900 rounded-2xl p-5 shadow-sm text-zinc-100">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-blue-400" />
              Accesos y Enlaces Rápidos
            </h4>

            {!client.customButtons || client.customButtons.length === 0 ? (
              <p className="text-sm text-zinc-400 italic">No se han configurado accesos rápidos para este cliente.</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {client.customButtons.map((btn, idx) => (
                  <Button 
                    key={idx} 
                    asChild 
                    variant="secondary" 
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/10 h-10 px-4 rounded-xl transition-all hover:scale-105"
                  >
                    <a href={btn.url} target="_blank" rel="noopener noreferrer">
                      {btn.label} <ExternalLink className="w-3.5 h-3.5 ml-2 opacity-70" />
                    </a>
                  </Button>
                ))}
              </div>
            )}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}