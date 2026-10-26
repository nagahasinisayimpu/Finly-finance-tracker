import { CATEGORY_MAP, Category } from '@/types';
import {
  Briefcase, Wallet, Laptop, GraduationCap, PlusCircle,
  Utensils, Bus, BookOpen, Clapperboard, Home, ShoppingBag,
  HeartPulse, Receipt, LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  Briefcase, Wallet, Laptop, GraduationCap, PlusCircle,
  Utensils, Bus, BookOpen, Clapperboard, Home, ShoppingBag,
  HeartPulse, Receipt,
};

interface CategoryIconProps {
  category: Category;
  size?: number;
  className?: string;
}

export function CategoryIcon({ category, size = 18, className = '' }: CategoryIconProps) {
  const meta = CATEGORY_MAP[category];
  const Icon = ICONS[meta?.icon] ?? Receipt;

  return (
    <span
      className={`inline-flex items-center justify-center rounded-xl shrink-0 ${className}`}
      style={{
        backgroundColor: `${meta?.color ?? '#94a3b8'}22`,
        color: meta?.color ?? '#94a3b8',
        width: size + 16,
        height: size + 16,
      }}
    >
      <Icon size={size} strokeWidth={2} />
    </span>
  );
}
