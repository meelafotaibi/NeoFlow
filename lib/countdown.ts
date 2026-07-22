export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
  isExpired: boolean;
}

export function calculateCountdown(deadline: string): CountdownTime {
  const now = new Date().getTime();
  const target = new Date(deadline).getTime();
  const total = target - now;

  if (total <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      total: 0,
      isExpired: true,
    };
  }

  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((total % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, total, isExpired: false };
}

export function formatCountdown(countdown: CountdownTime): string {
  if (countdown.isExpired) return "Expired";
  
  const parts = [];
  if (countdown.days > 0) parts.push(`${countdown.days}d`);
  if (countdown.hours > 0 || countdown.days > 0) parts.push(`${countdown.hours}h`);
  if (countdown.minutes > 0 || countdown.hours > 0 || countdown.days > 0) parts.push(`${countdown.minutes}m`);
  parts.push(`${countdown.seconds}s`);
  
  return parts.join(" ");
}

export function getUrgencyLevel(countdown: CountdownTime): "critical" | "warning" | "normal" {
  if (countdown.isExpired) return "critical";
  if (countdown.days === 0 && countdown.hours < 24) return "critical";
  if (countdown.days <= 3) return "warning";
  return "normal";
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}
