import { Navigate } from 'react-router-dom';
import { getAllDays, getDay } from '../content';
import { useAppStore } from '../store/appStore';
import { StageHeader } from '../components/StageHeader';
import { WarmupStage } from './stages/WarmupStage';
import { PatternStage } from './stages/PatternStage';
import { WordsStage } from './stages/WordsStage';
import { ShadowStage } from './stages/ShadowStage';
import { ScenarioStage } from './stages/ScenarioStage';
import { WrapStage } from './stages/WrapStage';

export function SessionScreen() {
  const session = useAppStore((state) => state.activeSession);
  if (!session) {
    return <Navigate to="/" replace />;
  }

  const day = getDay(session.dayId);
  const days = getAllDays();
  const index = days.findIndex((item) => item.id === day.id);
  const previousDay = index > 0 ? days[index - 1] : null;

  return (
    <section className="rounded-3xl border border-line bg-surface p-5 shadow-sm sm:p-6">
      <StageHeader day={day} session={session} />
      {session.stage === 'warmup' && <WarmupStage day={day} previousDay={previousDay} />}
      {session.stage === 'pattern' && <PatternStage day={day} />}
      {session.stage === 'words' && <WordsStage day={day} />}
      {session.stage === 'shadow' && <ShadowStage day={day} />}
      {session.stage === 'scenario' && <ScenarioStage day={day} />}
      {session.stage === 'wrap' && <WrapStage day={day} />}
    </section>
  );
}
