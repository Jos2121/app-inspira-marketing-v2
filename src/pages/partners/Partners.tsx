import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { usePartners, useCreatePartner, useUpdatePartner, useDeletePartner, Partner } from '@/hooks/usePartners';
import { PartnerList } from './components/PartnerList';
import { PartnerFormModal } from './components/PartnerFormModal';

export default function Partners() {
  const [search, setSearch] = useState('');
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);

  const { data: partners = [], isLoading } = usePartners();
  const createMutation = useCreatePartner();
  const updateMutation = useUpdatePartner();
  const deleteMutation = useDeletePartner();

  const filtered = partners.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.role.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Staff / Administradores</h2>
          <p className="text-zinc-500 mt-1 font-medium">Gestiona tu equipo, roles y permisos de acceso (RBAC).</p>
        </div>
        <PartnerFormModal 
          onSubmit={(data) => createMutation.mutate(data)} 
          isPending={createMutation.isPending} 
        />
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
        <Input 
          placeholder="Buscar por nombre o rol..." 
          className="pl-9 bg-white shadow-sm focus-visible:ring-blue-600/20"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <PartnerList 
        partners={filtered} 
        isLoading={isLoading} 
        onEdit={setEditingPartner} 
        onDelete={(id) => deleteMutation.mutate(id)} 
      />

      {editingPartner && (
        <PartnerFormModal
          partner={editingPartner}
          isOpen={!!editingPartner}
          onClose={() => setEditingPartner(null)}
          onSubmit={(data) => updateMutation.mutate({ id: editingPartner.id, data }, { onSuccess: () => setEditingPartner(null) })}
          isPending={updateMutation.isPending}
        />
      )}
    </div>
  );
}