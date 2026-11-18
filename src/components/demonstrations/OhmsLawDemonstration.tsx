import DemonstrationPlayer from './DemonstrationPlayer';
import { ohmsLawDemo } from '../../services/demonstrations/ohmsLaw';
export default function OhmsLawDemonstration(props: { segmentId?: string; onReturnToLab: () => void; onReturnToViva?: () => void }) {
  return <DemonstrationPlayer script={ohmsLawDemo} {...props} />;
}
