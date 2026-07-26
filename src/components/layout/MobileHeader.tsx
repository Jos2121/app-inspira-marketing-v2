import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserMenu } from '../UserMenu';

interface MobileHeaderProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (val: boolean) => void;
}

export function MobileHeader({ mobileMenuOpen, setMobileMenuOpen }: MobileHeaderProps) {
  return (
    <div className="md:hidden flex items-center justify-between p-4 glass sticky top-0 z-50">
      <div className="flex items-center gap-2 font-bold text-lg text-zinc-900">
        <img
          src="/logo.jpg"
          alt="Logo"
          className="w-8 h-8 object-contain"
          onError={(e) => {
            e.currentTarget.src = 'https://placehold.co/100x100/2563eb/ffffff?text=L';
          }}
        />
        <span>Inspira Mkt</span>
      </div>
      <div className="flex items-center gap-2">
        <UserMenu />
        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>
    </div>
  );
}