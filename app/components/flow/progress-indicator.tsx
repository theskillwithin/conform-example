import type { StepNavigation } from "~/services/form/config.server";

import { Progress } from "~/ui/progress";

export function ProgressIndicator({
  navigation,
}: {
  navigation: StepNavigation;
}) {
  const { currentStepIndex, totalSteps } = navigation;

  return (
    <div className="mb-6">
      <Progress
        value={currentStepIndex + 1}
        max={totalSteps}
        label={`Step ${currentStepIndex + 1} of ${totalSteps}`}
        showValue
      />
    </div>
  );
}
