import type { BloodGroup } from '@/types';

const GROUP_STYLES: Record<BloodGroup, string> = {
  'A+': 'bg-primary-100 text-primary-700 border-primary-200',
  'A-': 'bg-blue-100 text-blue-700 border-blue-200',
  'B+': 'bg-success-100 text-success-700 border-success-200',
  'B-': 'bg-teal-100 text-teal-700 border-teal-200',
  'AB+': 'bg-accent-100 text-accent-600 border-accent-100',
  'AB-': 'bg-purple-100 text-purple-700 border-purple-200',
  'O+': 'bg-warning-100 text-warning-600 border-warning-100',
  'O-': 'bg-slate-200 text-slate-700 border-slate-300',
};

export function BloodGroupBadge({ group, size = 'md' }: { group: BloodGroup; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass =
    size === 'sm' ? 'text-xs px-2 py-0.5' : size === 'lg' ? 'text-lg px-4 py-1.5' : 'text-sm px-2.5 py-1';
  return (
    <span
      className={`inline-flex items-center font-bold rounded-full border ${sizeClass} ${GROUP_STYLES[group]}`}
    >
      {group}
    </span>
  );
}
