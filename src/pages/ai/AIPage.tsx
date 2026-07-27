import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Link as LinkIcon, Phone, MessageCircle, Copy, Loader2 } from 'lucide-react';

export default function AIPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ driveUrl: '', whatsappLink: '', phoneNumber: '' });
  const [generatedCopy, setGeneratedCopy] = useState('');

  const handleGenerate = async () => {
    if (!formData.driveUrl) return toast({ title: 'Error', description: 'El link de Drive es obligatorio', variant: 'destructive' });
    try {
      setLoading(true);
      const response = await fetch('/api/ai/generate-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.statusMessage || 'Error al generar el copy');
      }
      const data = await response.json();
      setGeneratedCopy(data.copy);
      toast({ title: '¡Éxito!', description: 'Copy generado correctamente.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCopy);
    toast({ title: 'Copiado', description: 'El texto se ha copiado al portapapeles.' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-blue-600" />
          IA Generativa
        </h1>
        <p className="text-zinc-500 mt-2 font-medium">Genera copys persuasivos automáticamente analizando imágenes de Google Drive.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass rounded-[2rem] border-zinc-200/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Configuración del Copy</CardTitle>
            <CardDescription>Pega el enlace de la imagen y tus datos de contacto.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Enlace de Google Drive (Debe ser Público)</Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
                <Input placeholder="https://drive.google.com/file/d/..." className="pl-9 h-11 bg-white focus-visible:ring-blue-600/20" value={formData.driveUrl} onChange={(e) => setFormData({...formData, driveUrl: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Enlace de WhatsApp (Opcional)</Label>
              <div className="relative">
                <MessageCircle className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
                <Input placeholder="wa.me/..." className="pl-9 h-11 bg-white focus-visible:ring-blue-600/20" value={formData.whatsappLink} onChange={(e) => setFormData({...formData, whatsappLink: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Número de Teléfono (Opcional)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
                <Input placeholder="+51 999 999 999" className="pl-9 h-11 bg-white focus-visible:ring-blue-600/20" value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} />
              </div>
            </div>
            <Button onClick={handleGenerate} disabled={loading} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-md rounded-xl mt-4">
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
              {loading ? 'Analizando imagen y generando...' : 'Generar Copy con IA'}
            </Button>
          </CardContent>
        </Card>
        
        <Card className="glass rounded-[2rem] border-zinc-200/60 shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-xl">Resultado</CardTitle>
            <CardDescription>Aquí aparecerá tu copy listo para usar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col">
            <Textarea 
              className="flex-1 min-h-[300px] resize-none bg-white focus-visible:ring-blue-600/20" 
              readOnly 
              value={generatedCopy} 
              placeholder="El copy generado aparecerá aquí..." 
            />
            <Button variant="outline" onClick={copyToClipboard} disabled={!generatedCopy} className="w-full h-11 rounded-xl border-zinc-200 hover:bg-zinc-50 hover:text-blue-600">
              <Copy className="mr-2 h-4 w-4" /> Copiar al Portapapeles
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}