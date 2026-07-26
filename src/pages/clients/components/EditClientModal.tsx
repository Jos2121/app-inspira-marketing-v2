import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React, { useState, useEffect } from 'react';
import { Client } from '@/hooks/useClients';

interface EditClientModalProps {
  client: Client;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; phone: string }) => void;
  isPending: boolean;
}

export function EditClientModal({ client, isOpen, onClose, onSubmit, isPending }: EditClientModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (client) {
      setName(client.name);
      setPhone(client.phone || '');
    }
  }, [client]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({ name, phone });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nombre Completo o Empresa *</Label>
            <Input 
              id="edit-name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
              className="focus-visible:ring-blue-600/20 focus-visible:border-blue-600" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-phone">WhatsApp / Teléfono *</Label>
            <Input 
              id="edit-phone" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="font-mono focus-visible:ring-blue-600/20 focus-visible:border-blue-600" 
            />
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isPending}>
            {isPending ? 'Guardando...' : 'Actualizar Cliente'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}