import React, { useState } from 'react';
import {
  Search,
  Plus,
  Zap,
  FlaskConical,
  SunMedium,
  Clock,
  Compass,
  Laptop,
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { EquipmentDefinition } from '../../types';

interface ToolCataloguePanelProps {
  equipmentCatalogue: EquipmentDefinition[];
  onAddEquipment: (equipmentId: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export const ToolCataloguePanel: React.FC<ToolCataloguePanelProps> = ({
  equipmentCatalogue,
  onAddEquipment,
  isCollapsed = false,
  onToggleCollapse,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    'All',
    'instrument',
    'component',
    'container',
    'optics',
    'sensor',
  ];

  const filteredEquipment = equipmentCatalogue.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getEquipmentIcon = (name: string) => {
    switch (name) {
      case 'Zap':
        return <Zap className="w-4 h-4 text-blue-500" />;
      case 'FlaskConical':
        return <FlaskConical className="w-4 h-4 text-emerald-500" />;
      case 'SunMedium':
        return <SunMedium className="w-4 h-4 text-amber-500" />;
      case 'Clock':
        return <Clock className="w-4 h-4 text-purple-500" />;
      case 'Compass':
        return <Compass className="w-4 h-4 text-red-500" />;
      case 'Laptop':
        return <Laptop className="w-4 h-4 text-cyan-500" />;
      default:
        return <Layers className="w-4 h-4 text-slate-500" />;
    }
  };

  if (isCollapsed) {
    return (
      <div className="w-12 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col items-center py-4">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          title="Expand Equipment Catalogue"
          aria-label="Expand Equipment Catalogue"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <aside
      className={
        className ||
        'w-64 sm:w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full flex-shrink-0 select-none'
      }
    >
      {/* Panel Header */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Equipment Catalogue
          </h3>
          <p className="text-[10px] text-slate-400">
            Drag or tap to place onto canvas
          </p>
        </div>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Collapse Catalogue"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="p-3 pb-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search apparatus..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border-transparent rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="px-3 pb-2 flex gap-1 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold capitalize whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Equipment List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredEquipment.length > 0 ? (
          filteredEquipment.map((eq) => (
            <div
              key={eq.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', eq.id);
                e.dataTransfer.effectAllowed = 'copy';
              }}
              onClick={() => onAddEquipment(eq.id)}
              className="group p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-sm cursor-pointer transition-all active:scale-[0.98]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0 shadow-2xs">
                    {getEquipmentIcon(eq.iconName)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {eq.name}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400 capitalize">
                      {eq.category}
                    </span>
                  </div>
                </div>

                <button
                  className="w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity"
                  title="Add to canvas"
                  aria-label={`Add ${eq.name} to canvas`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {eq.description}
              </p>

              <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>{eq.ports.length} port{eq.ports.length === 1 ? '' : 's'}</span>
                <span>{eq.rotatable ? 'Rotatable' : 'Fixed Axis'}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            No equipment found matching &quot;{searchQuery}&quot;
          </div>
        )}
      </div>

      {/* Footer Mobile Tap Hint */}
      <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[10px] text-slate-400 text-center">
        Tip: Tap any card to place it instantly at center
      </div>
    </aside>
  );
};
