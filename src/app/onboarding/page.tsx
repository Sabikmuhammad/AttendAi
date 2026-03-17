'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Building2, GraduationCap, Users, UserCog,
  ArrowRight, ArrowLeft, Check, Loader2,
  Globe, MapPin, BookOpen, Layers, Camera,
  Phone, Mail, Lock, Plus, X, Zap,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  // Step 1
  institutionName: string;
  institutionType: string;
  country: string;
  state: string;
  city: string;
  website: string;
  // Step 2
  numDepartments: string;
  numPrograms: string;
  numSections: string;
  departmentNames: string[];
  // Step 3
  totalStudents: string;
  totalFaculty: string;
  numClassrooms: string;
  numCampuses: string;
  // Step 4
  adminName: string;
  adminRole: string;
  adminPhone: string;
  adminEmail: string;
  adminPassword: string;
  confirmPassword: string;
  itAdminContact: string;
}

const INITIAL: FormData = {
  institutionName: '', institutionType: '', country: 'India', state: '', city: '', website: '',
  numDepartments: '', numPrograms: '', numSections: '', departmentNames: [],
  totalStudents: '', totalFaculty: '', numClassrooms: '', numCampuses: '1',
  adminName: '', adminRole: '', adminPhone: '', adminEmail: '',
  adminPassword: '', confirmPassword: '', itAdminContact: '',
};

const STEPS = [
  { id: 1, label: 'Institution', icon: Building2 },
  { id: 2, label: 'Academic', icon: GraduationCap },
  { id: 3, label: 'Size', icon: Users },
  { id: 4, label: 'Admin', icon: UserCog },
];

const INSTITUTION_TYPES = ['University', 'College', 'School', 'Institute', 'Academy'];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry',
];

// ─── Field components ─────────────────────────────────────────────────────────

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-300">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

function TextInput({
  value, onChange, placeholder, type = 'text', icon: Icon, disabled,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  type?: string; icon?: React.ElementType; disabled?: boolean;
}) {
  return (
    <div className="relative">
      {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={[
          'w-full rounded-xl border border-white/10 bg-white/5 py-3 text-base text-white placeholder:text-gray-600',
          'outline-none transition focus:border-purple-500/60 focus:bg-white/8 disabled:opacity-50',
          Icon ? 'pl-10 pr-4' : 'px-4',
        ].join(' ')}
      />
    </div>
  );
}

function SelectInput({
  value, onChange, options, placeholder, disabled,
}: {
  value: string; onChange: (v: string) => void;
  options: string[]; placeholder?: string; disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-base text-white outline-none transition focus:border-purple-500/60 disabled:opacity-50"
    >
      <option value="" disabled>{placeholder || 'Select...'}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

// ─── Step components ──────────────────────────────────────────────────────────

function Step1({ data, set }: { data: FormData; set: (k: keyof FormData, v: string) => void }) {
  return (
    <div className="space-y-5">
      <Field label="Institution Name" required>
        <TextInput value={data.institutionName} onChange={(v) => set('institutionName', v)}
          placeholder="e.g. Greenfield University" icon={Building2} />
      </Field>

      <Field label="Institution Type" required>
        <SelectInput value={data.institutionType} onChange={(v) => set('institutionType', v)}
          options={INSTITUTION_TYPES} placeholder="Select type" />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Country" required>
          <TextInput value={data.country} onChange={(v) => set('country', v)}
            placeholder="India" icon={Globe} disabled />
        </Field>
        <Field label="State">
          <SelectInput value={data.state} onChange={(v) => set('state', v)}
            options={INDIAN_STATES} placeholder="Select state" />
        </Field>
      </div>

      <Field label="City">
        <TextInput value={data.city} onChange={(v) => set('city', v)}
          placeholder="e.g. Bangalore" icon={MapPin} />
      </Field>

      <Field label="Institution Website">
        <TextInput value={data.website} onChange={(v) => set('website', v)}
          placeholder="https://university.edu" icon={Globe} />
      </Field>
    </div>
  );
}

function Step2({ data, set, setDepts }: {
  data: FormData;
  set: (k: keyof FormData, v: string) => void;
  setDepts: (d: string[]) => void;
}) {
  const addDept = () => setDepts([...data.departmentNames, '']);
  const updateDept = (i: number, v: string) => {
    const next = [...data.departmentNames];
    next[i] = v;
    setDepts(next);
  };
  const removeDept = (i: number) => setDepts(data.departmentNames.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Departments">
          <TextInput value={data.numDepartments} onChange={(v) => set('numDepartments', v)}
            placeholder="e.g. 8" icon={BookOpen} type="number" />
        </Field>
        <Field label="Programs">
          <TextInput value={data.numPrograms} onChange={(v) => set('numPrograms', v)}
            placeholder="e.g. 12" icon={Layers} type="number" />
        </Field>
        <Field label="Sections">
          <TextInput value={data.numSections} onChange={(v) => set('numSections', v)}
            placeholder="e.g. 30" icon={Layers} type="number" />
        </Field>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">Department Names <span className="text-gray-600">(optional)</span></label>
          <button type="button" onClick={addDept}
            className="flex min-h-[40px] items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-400 transition hover:bg-white/10 hover:text-white">
            <Plus className="h-3 w-3" /> Add
          </button>
        </div>
        {data.departmentNames.length === 0 && (
          <p className="text-xs text-gray-600">Click Add to list your departments.</p>
        )}
        <div className="space-y-2">
          {data.departmentNames.map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={d}
                onChange={(e) => updateDept(i, e.target.value)}
                placeholder={`Department ${i + 1}`}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder:text-gray-600 outline-none focus:border-purple-500/60"
              />
              <button type="button" onClick={() => removeDept(i)}
                className="min-h-[40px] rounded-lg p-2 text-gray-600 transition hover:bg-white/5 hover:text-red-400">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step3({ data, set }: { data: FormData; set: (k: keyof FormData, v: string) => void }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Total Students">
          <TextInput value={data.totalStudents} onChange={(v) => set('totalStudents', v)}
            placeholder="e.g. 5000" icon={Users} type="number" />
        </Field>
        <Field label="Total Faculty">
          <TextInput value={data.totalFaculty} onChange={(v) => set('totalFaculty', v)}
            placeholder="e.g. 200" icon={Users} type="number" />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Number of Classrooms">
          <TextInput value={data.numClassrooms} onChange={(v) => set('numClassrooms', v)}
            placeholder="e.g. 40" icon={Camera} type="number" />
        </Field>
        <Field label="Number of Campuses">
          <TextInput value={data.numCampuses} onChange={(v) => set('numCampuses', v)}
            placeholder="e.g. 1" icon={Building2} type="number" />
        </Field>
      </div>

      {/* Trial limits callout */}
      <div className="rounded-xl border border-purple-500/20 bg-purple-500/8 p-4">
        <div className="mb-2 flex items-center gap-2">
          <Zap className="h-4 w-4 text-purple-400" />
          <p className="text-sm font-semibold text-purple-300">Free Trial Limits</p>
        </div>
        <p className="text-xs leading-relaxed text-gray-500">
          Your 14-day trial includes up to <span className="text-gray-300">200 students</span>,{' '}
          <span className="text-gray-300">3 classrooms</span>, and{' '}
          <span className="text-gray-300">3 camera streams</span>. Upgrade anytime to unlock your full institution size.
        </p>
      </div>
    </div>
  );
}

function Step4({ data, set }: { data: FormData; set: (k: keyof FormData, v: string) => void }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Admin Name" required>
          <TextInput value={data.adminName} onChange={(v) => set('adminName', v)}
            placeholder="Full name" icon={UserCog} />
        </Field>
        <Field label="Admin Role">
          <TextInput value={data.adminRole} onChange={(v) => set('adminRole', v)}
            placeholder="e.g. IT Director" icon={UserCog} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Admin Email" required>
          <TextInput value={data.adminEmail} onChange={(v) => set('adminEmail', v)}
            placeholder="admin@university.edu" icon={Mail} type="email" />
        </Field>
        <Field label="Admin Phone">
          <TextInput value={data.adminPhone} onChange={(v) => set('adminPhone', v)}
            placeholder="+91 98765 43210" icon={Phone} />
        </Field>
      </div>

      <Field label="Password" required>
        <TextInput value={data.adminPassword} onChange={(v) => set('adminPassword', v)}
          placeholder="Min. 8 characters" icon={Lock} type="password" />
      </Field>

      <Field label="Confirm Password" required>
        <TextInput value={data.confirmPassword} onChange={(v) => set('confirmPassword', v)}
          placeholder="Repeat password" icon={Lock} type="password" />
      </Field>

      <Field label="IT Administrator Contact">
        <TextInput value={data.itAdminContact} onChange={(v) => set('itAdminContact', v)}
          placeholder="it@university.edu (optional)" icon={Mail} />
      </Field>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormData>(INITIAL);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [institutionCode, setInstitutionCode] = useState('');

  const set = (k: keyof FormData, v: string) => setData((prev) => ({ ...prev, [k]: v }));
  const setDepts = (d: string[]) => setData((prev) => ({ ...prev, departmentNames: d }));

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  // ── Per-step validation ──────────────────────────────────────────────────
  const validate = (): string => {
    if (step === 1) {
      if (!data.institutionName.trim()) return 'Institution name is required.';
      if (!data.institutionType) return 'Please select an institution type.';
      if (!data.country.trim()) return 'Country is required.';
    }
    if (step === 4) {
      if (!data.adminName.trim()) return 'Admin name is required.';
      if (!data.adminEmail.trim()) return 'Admin email is required.';
      if (!data.adminPassword) return 'Password is required.';
      if (data.adminPassword.length < 8) return 'Password must be at least 8 characters.';
      if (data.adminPassword !== data.confirmPassword) return 'Passwords do not match.';
    }
    return '';
  };

  const next = () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setStep((s) => s + 1);
  };

  const back = () => { setError(''); setStep((s) => s - 1); };

  const submit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          numDepartments: Number(data.numDepartments) || 0,
          numPrograms: Number(data.numPrograms) || 0,
          numSections: Number(data.numSections) || 0,
          totalStudents: Number(data.totalStudents) || 0,
          totalFaculty: Number(data.totalFaculty) || 0,
          numClassrooms: Number(data.numClassrooms) || 0,
          numCampuses: Number(data.numCampuses) || 1,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Onboarding failed.');

      const code = (json.institution?.code || '').toString();
      setInstitutionCode(code);
      setDone(true);

      const email = String(data.adminEmail || '');
      const verifyUrl = `/verify-otp?email=${encodeURIComponent(email)}&institutionCode=${encodeURIComponent(code)}`;
      setTimeout(() => { window.location.href = verifyUrl; }, 1200);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ───────────────────────────────────────────────────────
  if (done) {
    const verifyUrl = `/verify-otp?email=${encodeURIComponent(data.adminEmail || '')}&institutionCode=${encodeURIComponent(institutionCode)}`;

    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-6">
        <div className="pointer-events-none fixed inset-0 flex items-center justify-center">
          <div className="h-[500px] w-[500px] rounded-full bg-purple-700/10 blur-[120px]" />
        </div>
        <div className="relative text-center max-w-md">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 border border-green-500/30">
            <Check className="h-8 w-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Institution Registered!</h2>
          <p className="mt-3 text-gray-400">
            Check your email for a verification code. You&apos;ll be redirected to verify your email shortly.
          </p>

          {/* Institution code display */}
          <div className="mt-5 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-xs text-gray-500 mb-1">Your institution code</p>
            <p className="text-sm font-mono text-purple-300 break-all">{institutionCode}</p>
          </div>

          <p className="mt-4 text-xs text-gray-600">Redirecting in a moment…</p>
          <div className="mt-3 flex justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
          </div>

          <a
            href={verifyUrl}
            className="mt-5 inline-block text-sm text-purple-400 underline hover:text-purple-300 transition"
          >
            Verify email →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-4 py-8 sm:px-6 sm:py-12">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 flex items-start justify-center pt-0">
        <div className="h-[600px] w-[700px] rounded-full bg-purple-700/8 blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center sm:mb-10">
          <Link href="/" className="mb-6 inline-block text-lg font-semibold text-white">
            AttendAI
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-4xl">
            Set up your institution
          </h1>
          <p className="mt-2 text-gray-500">
            Complete the steps below to activate your 14-day free trial.
          </p>
        </div>

        {/* Step indicators */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => {
              const done = step > s.id;
              const active = step === s.id;
              return (
                <div key={s.id} className="flex flex-1 flex-col items-center">
                  <div className="flex w-full items-center">
                    {/* Left connector */}
                    {i > 0 && (
                      <div className={`h-px flex-1 transition-colors ${done || active ? 'bg-purple-500/60' : 'bg-white/10'}`} />
                    )}
                    {/* Circle */}
                    <div className={[
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-all sm:h-9 sm:w-9',
                      done ? 'border-purple-500 bg-purple-500 text-white'
                        : active ? 'border-purple-500/80 bg-purple-500/20 text-purple-300'
                        : 'border-white/10 bg-white/5 text-gray-600',
                    ].join(' ')}>
                      {done ? <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <s.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                    </div>
                    {/* Right connector */}
                    {i < STEPS.length - 1 && (
                      <div className={`h-px flex-1 transition-colors ${done ? 'bg-purple-500/60' : 'bg-white/10'}`} />
                    )}
                  </div>
                  <span className={`mt-2 text-[10px] sm:text-[11px] font-medium ${active ? 'text-purple-300' : done ? 'text-gray-400' : 'text-gray-600'}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-600 to-violet-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-right text-xs text-gray-600">Step {step} of {STEPS.length}</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 sm:p-8">
          {/* Step title */}
          <div className="mb-6 sm:mb-7">
            <p className="text-xs font-semibold uppercase tracking-widest text-purple-400">
              Step {step} of {STEPS.length}
            </p>
            <h2 className="mt-1 text-lg sm:text-xl font-bold text-white">
              {step === 1 && 'Institution Information'}
              {step === 2 && 'Academic Structure'}
              {step === 3 && 'Institution Size'}
              {step === 4 && 'Admin Contact'}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {step === 1 && 'Tell us about your institution.'}
              {step === 2 && 'Describe your academic organization.'}
              {step === 3 && 'Help us understand your institution\'s scale.'}
              {step === 4 && 'Create your admin account to manage the platform.'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Step content */}
          {step === 1 && <Step1 data={data} set={set} />}
          {step === 2 && <Step2 data={data} set={set} setDepts={setDepts} />}
          {step === 3 && <Step3 data={data} set={set} />}
          {step === 4 && <Step4 data={data} set={set} />}

          {/* Navigation */}
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={back}
                disabled={loading}
                className="flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            ) : (
              <Link
                href="/"
                className="w-full sm:w-auto text-center text-sm text-gray-600 transition hover:text-gray-400"
              >
                ← Back to home
              </Link>
            )}

            {step < STEPS.length ? (
              <button
                type="button"
                onClick={next}
                className="flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-100 active:scale-95"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={loading}
                className="flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-100 active:scale-95 disabled:opacity-60"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Setting up...</>
                ) : (
                  <><Zap className="h-4 w-4" /> Activate Free Trial</>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-center text-xs text-gray-700">
          14-day free trial · No credit card required ·{' '}
          <Link href="/pricing" className="text-gray-500 hover:text-gray-300 transition">View pricing</Link>
        </p>
      </div>
    </div>
  );
}
