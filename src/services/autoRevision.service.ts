import type {
  AutoRevisionActivityResponse,
  AutoRevisionFeedResponse,
  AutoRevisionHistoryResponse,
  AutoRevisionMonthResponse,
  AutoRevisionSummary,
  AutoRevisionTodayGrouped,
  AutoRevisionWeekResponse,
  RevisionFeedParams,
} from "@/types/autoRevision.types";
import { api, unwrap } from "./api";
import { getClientTimezone } from "@/utils/timezone";

function tzParams(timezone?: string) {
  return { timezone: timezone ?? getClientTimezone() };
}

export const autoRevisionService = {
  today(timezone?: string) {
    return unwrap<AutoRevisionTodayGrouped>(
      api.get("/api/v1/auto-revisions/today", { params: tzParams(timezone) }),
    );
  },

  week(weekOffset = 0, timezone?: string) {
    return unwrap<AutoRevisionWeekResponse>(
      api.get("/api/v1/auto-revisions/week", {
        params: { weekOffset, ...tzParams(timezone) },
      }),
    );
  },

  month(monthOffset = 0, timezone?: string) {
    return unwrap<AutoRevisionMonthResponse>(
      api.get("/api/v1/auto-revisions/month", {
        params: { monthOffset, ...tzParams(timezone) },
      }),
    );
  },

  summary(timezone?: string) {
    return unwrap<AutoRevisionSummary>(
      api.get("/api/v1/auto-revisions/summary", { params: tzParams(timezone) }),
    );
  },

  feed(params: RevisionFeedParams = {}, timezone?: string) {
    return unwrap<AutoRevisionFeedResponse>(
      api.get("/api/v1/auto-revisions/feed", {
        params: { ...params, ...tzParams(timezone) },
      }),
    );
  },

  history(
    params: { page?: number; limit?: number; from?: string; to?: string; date?: string } = {},
    timezone?: string,
  ) {
    return unwrap<AutoRevisionHistoryResponse>(
      api.get("/api/v1/auto-revisions/history", {
        params: { ...params, ...tzParams(timezone) },
      }),
    );
  },

  activity(months = 6, timezone?: string) {
    return unwrap<AutoRevisionActivityResponse>(
      api.get("/api/v1/auto-revisions/activity", {
        params: { months, ...tzParams(timezone) },
      }),
    );
  },

  markRevised(id: string) {
    return unwrap<{ revision: unknown }>(api.patch(`/api/v1/auto-revisions/${id}/mark-revised`));
  },
};
