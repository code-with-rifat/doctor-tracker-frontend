import { clsx, type ClassValue } from 'clsx';
import { format, formatDistanceToNowStrict, isValid, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function getInitials(name: string) {
  const parts = name
    .split(' ')
    .filter(Boolean)
    .filter((part) => !/^dr\.?$/i.test(part));
  const source = parts.length ? parts : name.split(' ').filter(Boolean);
  return source
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

const AVATAR_COLORS = [
  'bg-teal-100 text-teal-800',
  'bg-sky-100 text-sky-800',
  'bg-amber-100 text-amber-800',
  'bg-rose-100 text-rose-800',
  'bg-indigo-100 text-indigo-800',
  'bg-emerald-100 text-emerald-800',
];

export function avatarColor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function formatRelativeDate(value: string) {
  const date = parseISO(value);
  if (!isValid(date)) return value;
  return `${formatDistanceToNowStrict(date)} ago`;
}

export function formatFullDate(value: string) {
  const date = parseISO(value);
  if (!isValid(date)) return value;
  return format(date, 'dd MMM yyyy, HH:mm');
}

export function doctorName(doctor: { name: string } | string | undefined) {
  if (!doctor) return 'Unassigned';
  if (typeof doctor === 'string') return doctor;
  return doctor.name;
}
