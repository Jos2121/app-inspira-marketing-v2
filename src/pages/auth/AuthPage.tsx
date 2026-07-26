import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authClient } from '@/lib/auth-client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, Lock } from 'lucide-react';

export function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authClient.signIn.email({ email, password }, {
        onSuccess: () => { navigate('/'); },
        onError: (ctx) => { toast.error(ctx.error.message); }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-zinc-50 relative p-6">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      <div className="w-full max-w-[440px] animate-in fade-in zoom-in-95 duration-700 fill-both relative z-10">
        
        <div className="flex flex-col items-center gap-2 mb-8 justify-center group">
          <div className="w-24 h-24 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <img src="/logo.jpg" alt="Inspira Logo" className="w-full h-full object-contain rounded-2xl shadow-sm" />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-zinc-200/60 p-8 sm:p-10 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)]">
          <div className="mb-8 text-center space-y-2">
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
              Acceso al Sistema
            </h1>
            <p className="text-zinc-500 text-sm font-medium">
              Ingresa tu correo electrónico y contraseña para continuar
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Correo Electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
                <Input 
                  type="email"
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                  className="pl-10 h-12 rounded-xl" 
                  placeholder="correo@ejemplo.com" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
                <Input 
                  type="password"
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  className="pl-10 h-12 rounded-xl" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 mt-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-md font-bold shadow-lg shadow-blue-600/20">
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}