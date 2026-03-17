import { connectDB } from '@/lib/mongodb';
import Institution from '@/models/Institution';

export const TRIAL_LIMITS = {
  students: 200,
  classrooms: 3,
  cameras: 3,
  durationDays: 14,
};

export type PlanType = 'trial' | 'starter' | 'growth' | 'enterprise';

export interface TrialStatus {
  plan: PlanType;
  isTrialActive: boolean;
  isTrialExpired: boolean;
  daysLeft: number;
  trialStartDate: Date | null;
  trialEndDate: Date | null;
  limits: {
    students: number;
    classrooms: number;
    cameras: number;
  };
}

/** Activate trial on a newly created institution */
export async function activateTrial(institutionId: string): Promise<void> {
  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() + TRIAL_LIMITS.durationDays);

  await Institution.findByIdAndUpdate(institutionId, {
    plan: 'trial',
    'planLimits.students': TRIAL_LIMITS.students,
    'planLimits.cameras': TRIAL_LIMITS.cameras,
    'planLimits.classes': TRIAL_LIMITS.classrooms,
    'trial.startDate': now,
    'trial.endDate': end,
    'trial.isActive': true,
    status: 'trial',
  });
}

/** Get trial/plan status for an institution */
export async function getTrialStatus(institutionId: string): Promise<TrialStatus> {
  await connectDB();

  const institution = await Institution.findById(institutionId)
    .select('plan planLimits trial status')
    .lean<{
      plan: PlanType;
      planLimits: { students: number; cameras: number; classes: number };
      trial: { startDate: Date | null; endDate: Date | null; isActive: boolean };
      status: string;
    }>();

  if (!institution) {
    return {
      plan: 'trial',
      isTrialActive: false,
      isTrialExpired: true,
      daysLeft: 0,
      trialStartDate: null,
      trialEndDate: null,
      limits: { students: TRIAL_LIMITS.students, classrooms: TRIAL_LIMITS.classrooms, cameras: TRIAL_LIMITS.cameras },
    };
  }

  const plan = institution.plan ?? 'trial';
  const trialEnd = institution.trial?.endDate ? new Date(institution.trial.endDate) : null;
  const now = new Date();

  const daysLeft = trialEnd
    ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const isTrialActive = plan === 'trial' && daysLeft > 0;
  const isTrialExpired = plan === 'trial' && daysLeft === 0;

  return {
    plan,
    isTrialActive,
    isTrialExpired,
    daysLeft,
    trialStartDate: institution.trial?.startDate ?? null,
    trialEndDate: trialEnd,
    limits: {
      students: institution.planLimits?.students ?? TRIAL_LIMITS.students,
      classrooms: institution.planLimits?.classes ?? TRIAL_LIMITS.classrooms,
      cameras: institution.planLimits?.cameras ?? TRIAL_LIMITS.cameras,
    },
  };
}

/** Check if a resource creation is within plan limits */
export async function checkLimit(
  institutionId: string,
  resource: 'students' | 'classrooms' | 'cameras',
  currentCount: number
): Promise<{ allowed: boolean; message?: string }> {
  const status = await getTrialStatus(institutionId);

  // Paid plans — no limit enforcement here (handled per-plan elsewhere)
  if (status.plan !== 'trial') return { allowed: true };

  if (status.isTrialExpired) {
    return {
      allowed: false,
      message: 'Your free trial has expired. Upgrade your plan to continue using AttendAI.',
    };
  }

  const limit =
    resource === 'students'
      ? status.limits.students
      : resource === 'classrooms'
      ? status.limits.classrooms
      : status.limits.cameras;

  if (currentCount >= limit) {
    return {
      allowed: false,
      message: `Trial limit reached (${limit} ${resource}). Upgrade your plan to continue.`,
    };
  }

  return { allowed: true };
}
