import { useCallback, useMemo, useState, type MouseEvent } from "react";
import { Box, Typography, alpha } from "@mui/material";
import { IconMoon } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { submissionsService } from "@/services/submissions.service";
import { queryKeys } from "@/hooks/queryKeys";
import { getUtcDateKey, utcDaysBeforeToday } from "@/utils/date";
import { miui, monoStatSx } from "@/theme/theme";

const MOON_BY_WEEK = ["🌑", "🌓", "🌕", "🌗"] as const;
const DAY_HEADERS = ["S", "M", "T", "W", "T", "F", "S"] as const;
const CYCLE_WEEKS = 4;
const CYCLE_DAYS = CYCLE_WEEKS * 7;

const surface = miui.paper;
const secondary = miui.elevated;
const info = miui.primary;
const infoTint = alpha(miui.primary, 0.22);

/** UTC Sunday 00:00 for the week that contains `dateKey`. */
function startOfUtcWeek(dateKey: string): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const start = new Date(date);
  start.setUTCDate(date.getUTCDate() - date.getUTCDay());
  return start;
}

/** Last 4 calendar weeks (Sun–Sat), aligned so column headers match real weekdays. */
function buildCycleDateKeys(reference = new Date()): string[] {
  const todayKey = getUtcDateKey(reference);
  const thisWeekSunday = startOfUtcWeek(todayKey);
  const cycleStart = new Date(thisWeekSunday);
  cycleStart.setUTCDate(thisWeekSunday.getUTCDate() - 21);

  return Array.from({ length: CYCLE_DAYS }, (_, i) => {
    const d = new Date(cycleStart);
    d.setUTCDate(cycleStart.getUTCDate() + i);
    return getUtcDateKey(d);
  });
}

/** First Sun-start week that has any day in the given UTC month. */
function firstWeekStartInUtcMonth(year: number, monthIndex0: number): Date {
  const monthFirstKey = getUtcDateKey(new Date(Date.UTC(year, monthIndex0, 1)));
  let start = startOfUtcWeek(monthFirstKey);
  if (start.getUTCMonth() < monthIndex0) {
    start = new Date(start);
    start.setUTCDate(start.getUTCDate() + 7);
  }
  return start;
}

/** Calendar week-of-month (Sun–Sat), 1-based — matches how people count weeks in a month. */
function utcWeekOfMonth(dateKey: string): number {
  const [y, m] = dateKey.split("-").map(Number);
  const weekStart = startOfUtcWeek(dateKey);
  const first = firstWeekStartInUtcMonth(y, m - 1);
  const diffDays = Math.round((weekStart.getTime() - first.getTime()) / 86_400_000);
  return Math.floor(diffDays / 7) + 1;
}

function weekCardLabel(weekStartKey: string, isActive: boolean): string {
  if (isActive) {
    const wom = utcWeekOfMonth(weekStartKey);
    return `Wk ${wom}`;
  }
  return dayjs(weekStartKey).format("MMM D");
}

function cellOpacity(count: number): number {
  if (count <= 0) return 0;
  return 0.35 + Math.min(count / 10, 0.65);
}

type TooltipState = {
  x: number;
  y: number;
  label: string;
} | null;

export function WeekBelt() {
  const todayKey = getUtcDateKey();
  const cycleDateKeys = useMemo(() => buildCycleDateKeys(), []);
  const cycleStartKey = cycleDateKeys[0] ?? todayKey;

  const [tooltip, setTooltip] = useState<TooltipState>(null);

  const activityQuery = useQuery({
    queryKey: queryKeys.submissionActivity("rolling"),
    queryFn: () => submissionsService.getActivity({ rolling: true }),
    staleTime: 60_000,
  });

  const countByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const day of activityQuery.data?.days ?? []) {
      map.set(day.date, day.count);
    }
    return map;
  }, [activityQuery.data?.days]);

  const todayIndex = Math.min(
    CYCLE_DAYS - 1,
    Math.max(0, utcDaysBeforeToday(cycleStartKey, todayKey)),
  );
  const activeWeekIndex = Math.floor(todayIndex / 7);

  const todayWeekOfMonth = utcWeekOfMonth(todayKey);
  const todayMonthLabel = dayjs(todayKey).format("MMMM");

  const cycleEndKey = cycleDateKeys[CYCLE_DAYS - 1] ?? todayKey;
  const rangeLabel =
    cycleStartKey.slice(0, 7) === cycleEndKey.slice(0, 7)
      ? dayjs(cycleStartKey).format("MMMM YYYY")
      : `${dayjs(cycleStartKey).format("MMM D")} – ${dayjs(cycleEndKey).format("MMM D")}`;

  const cycleTotalSolved = useMemo(() => {
    let total = 0;
    for (let i = 0; i <= todayIndex; i++) {
      const key = cycleDateKeys[i];
      if (key) total += countByDate.get(key) ?? 0;
    }
    return total;
  }, [cycleDateKeys, countByDate, todayIndex]);

  const cycleProgressPct = Math.min(100, Math.round(((todayIndex + 1) / CYCLE_DAYS) * 100));

  const hideTooltip = useCallback(() => setTooltip(null), []);

  const showTooltip = useCallback(
    (e: MouseEvent, dateKey: string, count: number) => {
      if (count <= 0) return;
      setTooltip({
        x: e.clientX + 10,
        y: e.clientY + 10,
        label: `${dayjs(dateKey).format("MMM D")} · ${count} solved`,
      });
    },
    [],
  );

  return (
    <Box
      sx={{
        bgcolor: surface,
        border: `0.5px solid ${miui.border}`,
        borderRadius: "10px",
        p: "10px 12px",
        mb: 2,
        maxHeight: 220,
        overflow: "hidden",
        boxShadow: "none",
        position: "relative",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          mb: 0.75,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0 }}>
          <IconMoon size={13} stroke={1.75} color={miui.textMuted} />
          <Box>
            <Typography sx={{ fontSize: "13px", fontWeight: 500, color: miui.text, lineHeight: 1.2 }}>
              Weekly Belt
            </Typography>
            <Typography sx={{ fontSize: "11px", color: miui.textDim, lineHeight: 1.2 }}>
              Week {todayWeekOfMonth} of {todayMonthLabel} · 4-week belt
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            fontSize: "10px",
            color: miui.textDim,
            bgcolor: secondary,
            border: `0.5px solid ${miui.border}`,
            borderRadius: "20px",
            px: 1,
            py: 0.25,
            flexShrink: 0,
          }}
        >
          {rangeLabel}
        </Box>
      </Box>

      {/* 4 week cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "6px",
          mb: 0.75,
        }}
      >
        {Array.from({ length: CYCLE_WEEKS }, (_, weekIdx) => {
          const weekDays = cycleDateKeys.slice(weekIdx * 7, weekIdx * 7 + 7);
          const weekStartKey = weekDays[0] ?? todayKey;
          const isActive = weekIdx === activeWeekIndex;
          const weekLabel = weekCardLabel(weekStartKey, isActive);

          let weekTotal = 0;
          let maxDayCount = 0;
          for (const dateKey of weekDays) {
            const c = countByDate.get(dateKey) ?? 0;
            if (dateKey <= todayKey) weekTotal += c;
            if (c > maxDayCount) maxDayCount = c;
          }

          const barPct =
            maxDayCount > 0
              ? Math.min(100, Math.round((weekTotal / (maxDayCount * 7)) * 100))
              : 0;

          return (
            <Box
              key={weekLabel}
              sx={{
                bgcolor: surface,
                border: isActive ? `0.5px solid ${info}` : `0.5px solid ${miui.border}`,
                borderRadius: "10px",
                px: "7px",
                py: "8px",
                minWidth: 0,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <Typography sx={{ fontSize: "9px", color: miui.textDim }}>
                  {weekLabel}
                </Typography>
                <Typography component="span" sx={{ fontSize: "11px", lineHeight: 1 }}>
                  {MOON_BY_WEEK[weekIdx]}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: "2px",
                  mb: 0.35,
                }}
              >
                {DAY_HEADERS.map((d, i) => (
                  <Typography
                    key={`${weekLabel}-dow-${i}`}
                    sx={{
                      fontSize: "7px",
                      color: miui.textDim,
                      textAlign: "center",
                      lineHeight: 1,
                    }}
                  >
                    {d}
                  </Typography>
                ))}
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: "2px",
                  mb: 0.5,
                }}
              >
                {weekDays.map((dateKey) => {
                  const count = countByDate.get(dateKey) ?? 0;
                  const isToday = dateKey === todayKey;
                  const isFuture = dateKey > todayKey;
                  const isPast = !isFuture && !isToday;
                  const hasSolved = count > 0 && !isFuture;

                  return (
                    <Box
                      key={dateKey}
                      onMouseEnter={(e) => showTooltip(e, dateKey, count)}
                      onMouseMove={(e) => showTooltip(e, dateKey, count)}
                      onMouseLeave={hideTooltip}
                      sx={{
                        aspectRatio: "1",
                        borderRadius: "3px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "7px",
                        fontWeight: 500,
                        fontFamily: "var(--font-number)",
                        lineHeight: 1,
                        ...(isFuture
                          ? {
                              bgcolor: secondary,
                              opacity: 0.35,
                            }
                          : isToday
                            ? {
                                bgcolor: info,
                                color: miui.ctaText,
                              }
                            : hasSolved
                              ? {
                                  bgcolor: infoTint,
                                  color: info,
                                  opacity: cellOpacity(count),
                                }
                              : {
                                  bgcolor: secondary,
                                }),
                        "@media (prefers-reduced-motion: no-preference)": {
                          ...(hasSolved
                            ? {
                                transition: "opacity 120ms ease",
                                "&:hover": { opacity: 1 },
                              }
                            : {}),
                        },
                      }}
                    >
                      {(isToday || (isPast && count > 0)) && count > 0 ? count : null}
                    </Box>
                  );
                })}
              </Box>

              <Typography sx={{ fontSize: "14px", fontWeight: 500, color: miui.text, lineHeight: 1.1 }}>
                {weekTotal}
                <Box component="span" sx={{ fontSize: "9px", color: miui.textDim, ml: 0.35 }}>
                  solved
                </Box>
              </Typography>

              <Box
                sx={{
                  mt: 0.4,
                  height: 2,
                  borderRadius: "2px",
                  bgcolor: secondary,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    height: "100%",
                    width: `${barPct}%`,
                    borderRadius: "2px",
                    bgcolor: info,
                    transition: "width 200ms ease",
                  }}
                />
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Bottom bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderRadius: "10px",
          bgcolor: secondary,
          border: `0.5px solid ${miui.border}`,
          px: "12px",
          py: "10px",
        }}
      >
        <Box sx={{ flexShrink: 0 }}>
          <Typography sx={{ ...monoStatSx, fontSize: "22px", fontWeight: 500, lineHeight: 1, color: miui.text }}>
            {cycleTotalSolved}
          </Typography>
          <Typography sx={{ fontSize: "10px", color: miui.textDim }}>this cycle</Typography>
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.35 }}>
            <Typography sx={{ fontSize: "10px", color: miui.textDim }}>cycle progress</Typography>
            <Typography sx={{ fontSize: "10px", color: miui.textDim }}>{cycleProgressPct}%</Typography>
          </Box>
          <Box
            sx={{
              position: "relative",
              height: 4,
              borderRadius: "2px",
              bgcolor: surface,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: `${Math.min(100, ((todayIndex + 1) / CYCLE_DAYS) * 100)}%`,
                bgcolor: info,
                borderRadius: "2px",
                transition: "width 200ms ease",
              }}
            />
            {[25, 50, 75].map((pct) => (
              <Box
                key={pct}
                sx={{
                  position: "absolute",
                  left: `${pct}%`,
                  top: 0,
                  bottom: 0,
                  width: "0.5px",
                  bgcolor: miui.border,
                  pointerEvents: "none",
                }}
              />
            ))}
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: 0.35,
            }}
          >
            {Array.from({ length: CYCLE_WEEKS }, (_, i) => {
              const weekStart = cycleDateKeys[i * 7] ?? todayKey;
              const label = i === activeWeekIndex ? `Wk ${utcWeekOfMonth(weekStart)}` : dayjs(weekStart).format("MMM D");
              return (
                <Typography
                  key={weekStart}
                  sx={{ fontSize: "9px", color: miui.textDim, whiteSpace: "nowrap" }}
                >
                  {MOON_BY_WEEK[i]} {label}
                </Typography>
              );
            })}
          </Box>
        </Box>
      </Box>

      {tooltip ? (
        <Box
          sx={{
            position: "fixed",
            left: tooltip.x,
            top: tooltip.y,
            zIndex: 1400,
            pointerEvents: "none",
            bgcolor: surface,
            border: `0.5px solid ${miui.border}`,
            borderRadius: "7px",
            px: 0.75,
            py: 0.4,
            fontSize: "11px",
            color: miui.text,
            boxShadow: "none",
          }}
        >
          {tooltip.label}
        </Box>
      ) : null}
    </Box>
  );
}
