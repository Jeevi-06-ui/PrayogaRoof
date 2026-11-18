import React, { useState } from 'react';
import {
  Microscope,
  FlaskConical,
  Sparkles,
} from 'lucide-react';
import { VirtualMicroscopeStudio } from './VirtualMicroscopeStudio';
import { BiologicalWorkbench } from './BiologicalWorkbench';
import { OsmosisLab } from './OsmosisLab';
import { StomataLab } from './StomataLab';
import { SalivaryAmylaseLab } from './SalivaryAmylaseLab';
import { FoodTestingLab } from './FoodTestingLab';
import { SeedRespirationLab } from './SeedRespirationLab';
import { PhotosynthesisLab } from './PhotosynthesisLab';
import { MitosisLab } from './MitosisLab';
import { MeiosisLab } from './MeiosisLab';
import { MendelianGeneticsLab } from './MendelianGeneticsLab';
import { DNAReplicationLab } from './DNAReplicationLab';
import { GeneExpressionLab } from './GeneExpressionLab';
import { HeartCirculationLab } from './HeartCirculationLab';
import { NephronLab } from './NephronLab';
import { ReflexArcLab } from './ReflexArcLab';
import { EcosystemEnergyFlowLab } from './EcosystemEnergyFlowLab';

interface BiologyLabWorkspaceProps {
  experimentId: string;
  onLogObservation?: (note: string) => void;
  className?: string;
}

export const BiologyLabWorkspace: React.FC<BiologyLabWorkspaceProps> = ({
  experimentId,
  onLogObservation,
  className = '',
}) => {
  // Mode switcher inside biology workspace:
  // 'primary' (the experiment's dedicated visualizer)
  // 'microscope' (Virtual Microscope Studio)
  // 'workbench' (Biological Experiment Workbench)
  const [activeView, setActiveView] = useState<'primary' | 'microscope' | 'workbench'>('primary');

  // Map experiment to appropriate initial slide for the microscope
  const getInitialSlideId = (id: string): string => {
    switch (id) {
      case 'bio-stomata':
        return 'leaf-epidermis-stomata';
      case 'bio-mitosis':
        return 'root-tip-mitosis';
      case 'bio-heart-circulation':
        return 'blood-smear';
      default:
        return 'onion-peel';
    }
  };

  // Render the primary interactive experiment component
  const renderPrimaryComponent = () => {
    switch (experimentId) {
      case 'bio-osmosis':
        return <OsmosisLab />;
      case 'bio-stomata':
        return <StomataLab />;
      case 'bio-salivary-amylase':
        return <SalivaryAmylaseLab />;
      case 'bio-food-testing':
        return <FoodTestingLab />;
      case 'bio-seed-respiration':
        return <SeedRespirationLab />;
      case 'bio-photosynthesis':
        return <PhotosynthesisLab />;
      case 'bio-mitosis':
        return <MitosisLab />;
      case 'bio-meiosis':
        return <MeiosisLab />;
      case 'bio-mendelian-genetics':
        return <MendelianGeneticsLab />;
      case 'bio-dna-replication':
        return <DNAReplicationLab />;
      case 'bio-gene-expression':
        return <GeneExpressionLab />;
      case 'bio-heart-circulation':
        return <HeartCirculationLab />;
      case 'bio-nephron':
        return <NephronLab />;
      case 'bio-reflex-arc':
        return <ReflexArcLab />;
      case 'bio-ecosystem-energy':
        return <EcosystemEnergyFlowLab />;
      default:
        return <OsmosisLab />;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Workbench Sub-Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveView('primary')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              activeView === 'primary'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dedicated Lab Model</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('microscope')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              activeView === 'microscope'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Microscope className="w-3.5 h-3.5" />
            <span>Virtual Microscope Studio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('workbench')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              activeView === 'workbench'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Apparatus Workbench</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          <span>Active Lab: </span>
          <span className="font-bold text-slate-800 dark:text-slate-200">{experimentId}</span>
        </div>
      </div>

      {/* Dynamic Content View */}
      <div>
        {activeView === 'primary' && renderPrimaryComponent()}
        {activeView === 'microscope' && (
          <VirtualMicroscopeStudio
            initialSlideId={getInitialSlideId(experimentId)}
            onTakeSnapshot={(_url, notes) => {
              if (onLogObservation) onLogObservation(notes);
            }}
          />
        )}
        {activeView === 'workbench' && (
          <BiologicalWorkbench
            onLogObservation={(obs) => {
              if (onLogObservation) onLogObservation(obs);
            }}
          />
        )}
      </div>
    </div>
  );
};
