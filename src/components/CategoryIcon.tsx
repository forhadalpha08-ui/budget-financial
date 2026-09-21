import React from 'react';
import {
  Home,
  ShoppingCart,
  Utensils,
  Car,
  Zap,
  Film,
  ShoppingBag,
  HeartPulse,
  Briefcase,
  Sparkles,
  Tag,
  Coffee,
  Plane,
  Book,
  Shield,
  Smartphone,
  Gift,
  HelpCircle,
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-4 h-4', style }) => {
  switch (name?.toLowerCase()) {
    case 'home':
    case 'cat-housing':
      return <Home className={className} style={style} />;
    case 'shoppingcart':
    case 'cat-groceries':
      return <ShoppingCart className={className} style={style} />;
    case 'utensils':
    case 'cat-dining':
      return <Utensils className={className} style={style} />;
    case 'car':
    case 'cat-transport':
      return <Car className={className} style={style} />;
    case 'zap':
    case 'cat-utilities':
      return <Zap className={className} style={style} />;
    case 'film':
    case 'cat-entertainment':
      return <Film className={className} style={style} />;
    case 'shoppingbag':
    case 'cat-shopping':
      return <ShoppingBag className={className} style={style} />;
    case 'heartpulse':
    case 'cat-health':
      return <HeartPulse className={className} style={style} />;
    case 'briefcase':
    case 'cat-salary':
      return <Briefcase className={className} style={style} />;
    case 'sparkles':
    case 'cat-freelance':
      return <Sparkles className={className} style={style} />;
    case 'coffee':
      return <Coffee className={className} style={style} />;
    case 'plane':
      return <Plane className={className} style={style} />;
    case 'book':
      return <Book className={className} style={style} />;
    case 'shield':
      return <Shield className={className} style={style} />;
    case 'smartphone':
      return <Smartphone className={className} style={style} />;
    case 'gift':
      return <Gift className={className} style={style} />;
    default:
      return <Tag className={className} style={style} />;
  }
};
