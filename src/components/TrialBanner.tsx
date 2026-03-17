'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, X, Zap, Users, Building2, Camera } from 'lucide-react';

interface TrialData {
  trial: {
    plan: string;
    isTrialActive: boolean;
    isTrialExpired: boolean;
    daysLeft: number;
    limits: { students: number; classrooms: number; cameras: number };
  };
  usage: { students: number; classrooms: number; cameras: number };
}

function ProgressBar({ label, used, max, icon: Icon }: {
  label: string;
  used: number;
  max: number;
  icon: React.ElementType;
}) {
  const pct = Math.min(100, Math.round((used / max) * 100));
  const isNear = pct >= 80;
  const isFull = pct >= 100;

  return (
    <div className="flex-1 min-w-[140px]">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-xs text-gray-400">{label}</span>
        </div>
        <span className={`text-xs font-medium ${isFull ? 'text-red-400' : isNear ? 'text-amber-400' : 'text-gray-300'}`}>
          {used}/{max}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/10">
        <div
          className={`h-1.5 rounded-full transition-all ${
            isFull ? 'bg-red-500' : isNear ? 'bg-amber-500' : 'bg-purple-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function TrialBanner() {
  const [data, setData] = useState<TrialData | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch('/api/trial')
      .then((r) => r.json())
      .then((d) => { if (d.success) setData(d); })
      .catch(() => {});
  }, []);

  if (!data || dismissed) return null;

  const { trial, usage } = data;

  // Only show for trial plan
  if (trial.plan !== 'trial') return null;

  const { daysLeft, isTrialExpired, limits } = trial;

  // Reminder urgency
  const isUrgent = daysLeft <= 3;
  const isWarning = daysLeft <= 7 && daysLeft > 3;

  // Limit hit detection
  const atStudentLimit = usage.students >= limits.students;
  const atClassroomLimit = usage.classrooms >= limits.classrooms;
  const atCameraLimit = usage.cameras >= limits.cameras;
  const atAnyLimit = atStudentLimit || atClassroomLimit || atCameraLimit;

  const bannerBg = isTrialExpired || isUrgent
    ? 'bg-red-950/60 border-red-500/30'
    : isWarning || atAnyLimit
    ? 'bg-amber-950/50 border-amber-500/30'
    : 'bg-zinc-900/80 border-white/10';

  const badgeBg = isTrialExpired || isUrgent
    ? 'bg-red-500/20 text-red-300 border-red-500/30'
    : isWarning || atAnyLimit
    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    : 'bg-purple-500/20 text-purple-300 border-purple-500/30';

  return (
    <div className={`border rounded-xl px-4 py-3 mb-6 ${bannerBg}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: message */}
        <div className="flex items-start gap-3">
          {(isUrgent || isTrialExpired) ? (
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
          ) : (
            <Zap className="h-4 w-4 shrink-0 mt-0.5 text-purple-400" />
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${badgeBg}`}>
                {isTrialExpired ? 'Trial Expired' : `Free Trial`}
              </span>
              {!isTrialExpired && (
                <span className="text-sm font-medium text-white">
                  {atAnyLimit
                    ? `Trial limit reached. Upgrade to add more ${atStudentLimit ? 'students' : atClassroomLimit ? 'classrooms' : 'cameras'}.`
                    : daysLeft === 1
                    ? 'Your trial expires tomorrow!'
                    : daysLeft <= 3
                    ? `Only ${daysLeft} days left on your trial.`
                    : daysLeft <= 7
                    ? `${daysLeft} days remaining on your free trial.`
                    : `Your AttendAI free trial expires in ${daysLeft} days.`}
                </span>
              )}
              {isTrialExpired && (
                <span className="text-sm font-medium text-white">
                  Your free trial has ended. Upgrade to continue using AttendAI.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: CTA + dismiss */}
        <div className="flex items-center gap-2 shrink-0 ml-7 sm:ml-0">
          <Link
            href="/pricing"
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-gray-100"
          >
            Upgrade Plan
          </Link>
          {!isTrialExpired && (
            <button
              onClick={() => setDismissed(true)}
              className="p-1 text-gray-500 hover:text-gray-300 transition"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Usage progress bars */}
      <div className="mt-3 flex flex-wrap gap-4 border-t border-white/8 pt-3">
        <ProgressBar label="Students" used={usage.students} max={limits.students} icon={Users} />
        <ProgressBar label="Classrooms" used={usage.classrooms} max={limits.classrooms} icon={Building2} />
        <ProgressBar label="Cameras" used={usage.cameras} max={limits.cameras} icon={Camera} />
      </div>
    </div>
  );
}
