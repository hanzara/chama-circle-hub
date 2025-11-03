
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SubNavItem {
  title: string;
  path: string;
  badge?: string;
  description?: string;
}

interface HorizontalSubNavProps {
  items: SubNavItem[];
  title?: string;
}

const HorizontalSubNav: React.FC<HorizontalSubNavProps> = ({ items, title }) => {
  const location = useLocation();

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="bg-background border-b border-border px-6 py-5 shadow-sm">
      {title && (
        <h2 className="text-xl font-bold text-foreground mb-5 tracking-tight">{title}</h2>
      )}
      <ScrollArea className="w-full">
        <div className="flex space-x-3 min-w-max">
          {items.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={`inline-flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap hover:scale-105 group ${
                isActivePath(item.path)
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/10'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'
              } focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2`}
            >
              <span className="relative">
                {item.title}
                <span className={`absolute bottom-0 left-0 w-full h-0.5 transition-all duration-300 ${
                  isActivePath(item.path) ? 'bg-primary scale-x-100' : 'bg-primary scale-x-0 group-hover:scale-x-100'
                }`} />
              </span>
              {item.badge && (
                <Badge 
                  variant="secondary" 
                  className="text-xs font-medium px-2 py-1 bg-muted/80 hover:bg-muted transition-colors"
                >
                  {item.badge}
                </Badge>
              )}
            </NavLink>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default HorizontalSubNav;
