import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, ShieldCheck } from 'lucide-react';
import { Partner } from '@/hooks/usePartners';

interface PartnerFormModalProps {
  partner?: Partner | null;
  isOpen?: boolean;
  onClose?: () => void;
  onSubmit: (data: any) => void;
  isPending: boolean;
}

const APP_MODULES = [
  { id: '/', label: 'Dashboard General' },
  { id: '/calendar', label: 'Calendario y Tareas' },
  { id: '/goals', label: 'Metas y Rendimiento' },
  { id: '/compliance', label: 'Gestión de Cumplimiento' },
  { id: '/finance', label: 'Finanzas y Transacciones' },
  { id: '/workflows', label: 'Flujos de Trabajo' },
  { id: '/clients', label: 'Directorio de Clientes' },
  { id: '/diagnostic', label: 'Auditorías y Diagnósticos' },
];

export function PartnerFormModal({ partner, isOpen, onClose, onSubmit, isPending }: PartnerFormModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isOpen !== undefined ? isOpen : internalOpen;
  
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    phone: '',
    email: '',
    password: '',
    status: 'Activo',
    systemRole: 'ADMIN',
    accessibleTabs: [] as string[]
  });

  useEffect(() => {
    if (partner) {
      setFormData({
        name: partner.name,
        role: partner.role,
        phone: partner.phone || '',
        email: partner.email || '',
        password: '',
        status: partner.status || 'Activo',
        systemRole: partner.systemRole || 'ADMIN',
        accessibleTabs: partner.accessibleTabs || []
      });
    } else {
      setFormData({ name: '', role: '', phone: '', email: '', password: '', status: 'Activo', systemRole: 'ADMIN', accessibleTabs: [] });
    }
  }, [partner, open]);

  const handleOpenChange = (val: boolean) => {
    if (onClose && !val) onClose();
    if (isOpen === undefined) setInternalOpen(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    if (isOpen === undefined) setInternalOpen(false);
  };

  const toggleTab = (id: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, accessibleTabs: [...formData.accessibleTabs, id] });
    } else {
      setFormData({ ...formData, accessibleTabs: formData.accessibleTabs.filter(tab => tab !== id) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {isOpen === undefined && (
        <DialogTrigger asChild>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 rounded-xl h-10 px-5">
            <Plus className="w-4 h-4 mr-2" /> Agregar Personal
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[550px] rounded-[2rem] max-h-[85vh] overflow-y-auto no-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{partner ? 'Editar Permisos y Datos' : 'Registrar Nuevo Miembro'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label>Nombre Completo *</Label>
              <Input 
                required 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="bg-zinc-50 focus-visible:ring-blue-600/20" 
              />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label>Rol / Puesto *</Label>
              <Input 
                required 
                placeholder="Ej. Asistente Mkt"
                value={formData.role} 
                onChange={e => setFormData({...formData, role: e.target.value})}
                className="bg-zinc-50 focus-visible:ring-blue-600/20" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label>Correo de Acceso *</Label>
              <Input 
                type="email"
                required
                placeholder="correo@ejemplo.com"
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})}
                disabled={!!partner}
                className="bg-zinc-50 font-mono text-sm focus-visible:ring-blue-600/20 disabled:opacity-50" 
              />
              <p className="text-[10px] text-zinc-500 leading-tight">Este correo definirá su nivel de acceso.</p>
            </div>
            
            {!partner ? (
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label>Contraseña de Acceso *</Label>
                <Input 
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="bg-zinc-50 font-mono focus-visible:ring-blue-600/20" 
                />
                <p className="text-[10px] text-amber-600 font-medium leading-tight">Debe contener mínimo 8 caracteres.</p>
              </div>
            ) : (
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label>Teléfono</Label>
                <Input 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="bg-zinc-50 focus-visible:ring-blue-600/20" 
                />
              </div>
            )}
          </div>

          {!partner && (
            <div className="space-y-2">
              <Label>Teléfono (Opcional)</Label>
              <Input 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="bg-zinc-50 focus-visible:ring-blue-600/20" 
              />
            </div>
          )}

          <div className="space-y-4 pt-4 border-t border-zinc-100">
            <h4 className="font-bold text-zinc-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" /> Control de Acceso (RBAC)
            </h4>
            
            <div className="space-y-3">
              <Label className="text-zinc-600">Nivel de Privilegios</Label>
              <Select value={formData.systemRole} onValueChange={v => setFormData({...formData, systemRole: v})}>
                <SelectTrigger className="bg-white"><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrador (Acceso Limitado a Pestañas)</SelectItem>
                  <SelectItem value="SUPERADMIN">Superadministrador (Acceso Total Global)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.systemRole === 'ADMIN' && (
              <div className="bg-zinc-50/70 p-5 rounded-2xl border border-zinc-200/50 shadow-inner mt-4 animate-in fade-in duration-300">
                <Label className="text-zinc-700 font-bold mb-4 block">Módulos Permitidos para este usuario</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {APP_MODULES.map(mod => (
                    <div key={mod.id} className="flex items-center space-x-3 bg-white p-2.5 rounded-xl border border-zinc-100 shadow-sm hover:border-blue-200 transition-colors">
                      <Switch 
                        id={`switch-${mod.id}`}
                        checked={formData.accessibleTabs.includes(mod.id)}
                        onCheckedChange={(checked) => toggleTab(mod.id, checked)}
                        className="data-[state=checked]:bg-emerald-500"
                      />
                      <Label htmlFor={`switch-${mod.id}`} className="font-medium text-sm cursor-pointer leading-tight w-full">
                        {mod.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-12 mt-2 rounded-xl text-md shadow-lg shadow-blue-600/20" disabled={isPending}>
            {isPending ? 'Guardando...' : 'Guardar y Asignar Permisos'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}