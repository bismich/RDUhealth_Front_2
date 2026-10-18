"use client";

import { FormEvent, useState } from "react";
import useSWR from "swr";

type EmailSchedule = {
  check_in_cron: string;
  reminder_hours: number[];
  next_check_ins: string[];
  max_reminder_hours: number;
};

type ScheduleDraft = Pick<EmailSchedule, "check_in_cron" | "reminder_hours">;

// "2026-10-31T12:00:00-04:00" -> "Sat, Oct 31, 12:00 PM"
function formatCheckIn(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// 48 -> "2 days after", 30 -> "30 hours after"
function describeReminder(hours: number) {
  if (hours % 24 === 0) {
    const days = hours / 24;
    return `${days} day${days === 1 ? "" : "s"} after`;
  }
  return `${hours} hour${hours === 1 ? "" : "s"} after`;
}

// DRF errors nest by field and list index: {"reminder_hours": {"0": ["..."]}} -> ["..."]
function errorMessages(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(errorMessages);
  if (value && typeof value === "object") return Object.values(value).flatMap(errorMessages);
  return [];
}

export default function AvailabilityEmailSettings({
  baseUrl,
  accessToken,
}: {
  baseUrl: string;
  accessToken: string;
}) {
  const url = `${baseUrl}/api/v1/admin/settings/availability-emails/`;

  const fetcher = async (key: string) => {
    const response = await fetch(key, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!response.ok) {
      throw new Error("Unable to load the email schedule");
    }
    return (await response.json()) as EmailSchedule;
  };

  const { data, error, mutate } = useSWR(url, fetcher);
  const [draft, setDraft] = useState<ScheduleDraft | null>(null); // unsaved edits; null shows the saved schedule
  const [newHour, setNewHour] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const schedule: ScheduleDraft = draft ?? {
    check_in_cron: data?.check_in_cron ?? "",
    reminder_hours: data?.reminder_hours ?? [],
  };
  const notice = message ?? (error ? { text: "Unable to load the email schedule.", ok: false } : null);

  const edit = (changes: Partial<ScheduleDraft>) => {
    setDraft({ ...schedule, ...changes });
    setMessage(null);
  };

  const addReminder = (event: FormEvent) => {
    event.preventDefault(); // the input's min/max/step/required already validated it
    edit({ reminder_hours: Array.from(new Set([...schedule.reminder_hours, Number(newHour)])).sort((a, b) => a - b) });
    setNewHour("");
  };

  const save = async () => {
    setSaving(true);
    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(schedule),
      });
      const body = await response.json();
      if (!response.ok) {
        setMessage({ text: errorMessages(body).join(" ") || "Couldn't save the email schedule.", ok: false });
        return;
      }
      await mutate(body as EmailSchedule, { revalidate: false });
      setDraft(null);
      setMessage({ text: "Email schedule saved.", ok: true });
    } catch {
      setMessage({ text: "Couldn't save the email schedule. Try again.", ok: false });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Availability check-in emails</h3>
      <p className="mt-1 text-sm text-slate-600">
        At each check-in time, every listed practice gets the check-in email and is hidden from search until the
        owner answers. Reminders re-send it to owners who haven&apos;t answered yet. The schedule is checked every
        hour.
      </p>

      <div className="mt-4">
        <label htmlFor="check-in-cron" className="text-sm font-medium text-slate-700">
          Check-in schedule (cron, Eastern time)
        </label>
        <input
          id="check-in-cron"
          value={schedule.check_in_cron}
          onChange={(event) => edit({ check_in_cron: event.target.value })}
          placeholder="0 12 15,L * *"
          spellCheck={false}
          autoComplete="off"
          className="mt-1 block w-full max-w-xs rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm"
        />
        <p className="mt-1 text-xs text-slate-500">
          minute hour day-of-month month day-of-week · L = last day of the month · e.g.{" "}
          <code className="font-mono">0 12 15,L * *</code> = noon on the 15th and the last day of each month
        </p>
        {data &&
          (schedule.check_in_cron === data.check_in_cron ? (
            <p className="mt-2 text-sm text-slate-600">
              Next check-ins: {data.next_check_ins.map(formatCheckIn).join(" · ")} ET
            </p>
          ) : (
            <p className="mt-2 text-sm text-slate-500">Save to see the next check-in times.</p>
          ))}
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium text-slate-700">Reminders (hours after the check-in)</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {schedule.reminder_hours.map((hour) => (
            <li
              key={hour}
              className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700"
            >
              <span>
                <strong>{hour}h</strong> · {describeReminder(hour)}
              </span>
              <button
                type="button"
                onClick={() => edit({ reminder_hours: schedule.reminder_hours.filter((h) => h !== hour) })}
                aria-label={`Remove the ${hour}-hour reminder`}
                className="text-blue-400 hover:text-blue-700"
              >
                ×
              </button>
            </li>
          ))}
          {data && schedule.reminder_hours.length === 0 && (
            <li className="text-sm text-slate-500">No reminders</li>
          )}
        </ul>
        <form onSubmit={addReminder} className="mt-2 flex items-center gap-2">
          <label htmlFor="reminder-hour" className="sr-only">
            Reminder, in hours after the check-in
          </label>
          <input
            id="reminder-hour"
            type="number"
            required
            min={1}
            max={data?.max_reminder_hours}
            step={1}
            placeholder="24"
            value={newHour}
            onChange={(event) => setNewHour(event.target.value)}
            className="w-24 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Add reminder
          </button>
        </form>
      </div>

      <button
        type="button"
        onClick={save}
        disabled={!draft || saving}
        className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save schedule"}
      </button>
      {notice && (
        <p className={`mt-3 text-sm ${notice.ok ? "text-green-600" : "text-red-600"}`}>{notice.text}</p>
      )}
    </section>
  );
}
