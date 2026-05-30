export function getCurrentWeekKey() {
  const now = new Date();

  const date = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  );

  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);

  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));

  const weekNo = Math.ceil(
    ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );

  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export function getRecentWeeks(amount = 12) {
  const weeks: string[] = [];
  const now = new Date();

  for (let i = 0; i < amount; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i * 7);

    const date = new Date(
      Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
    );

    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);

    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));

    const weekNo = Math.ceil(
      ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
    );

    weeks.push(`${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`);
  }

  return Array.from(new Set(weeks));
}