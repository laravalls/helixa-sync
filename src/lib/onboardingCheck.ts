// Check if user has completed onboarding
export const hasCompletedOnboarding = (): boolean => {
  const localData = localStorage.getItem("helixa_device_id");
  const cycleData = localStorage.getItem("helixa_cycle_data");
  return !!(localData && cycleData);
};

export const getCycleData = () => {
  const data = localStorage.getItem("helixa_cycle_data");
  return data ? JSON.parse(data) : null;
};

export const saveCycleData = (
  lastPeriodDate: string,
  cycleLength: number,
  mode: string,
) => {
  const data = {
    lastPeriodDate,
    cycleLength,
    mode,
    completedAt: new Date().toISOString(),
  };
  localStorage.setItem("helixa_cycle_data", JSON.stringify(data));

  if (!localStorage.getItem("helixa_device_id")) {
    const deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("helixa_device_id", deviceId);
  }
};

export const resetOnboarding = () => {
  localStorage.removeItem("helixa_cycle_data");
  localStorage.removeItem("helixa_device_id");
};
