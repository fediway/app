import type { Status } from '@repo/types';
import { mockStatuses } from './fixtures';

export interface MockReport {
  id: string;
  category: string;
  comment: string;
  statusIds: string[];
  targetAccount: { id: string };
  ruleIds: string[];
  actionTaken: boolean;
  createdAt: string;
}

export interface MockFilter {
  id: string;
  title: string;
  context: string[];
  filterAction: string;
  expiresAt: string | null;
  keywords: Array<{ id: string; keyword: string; wholeWord: boolean }>;
  statuses: [];
}

export interface MockState {
  timelineStatuses: Status[];
  blockedAccountIds: Set<string>;
  mutedAccountIds: Set<string>;
  mutedStatusIds: Set<string>;
  blockedDomainsSet: Set<string>;
  mockReports: MockReport[];
  mockFiltersList: MockFilter[];
  mockMarkerLastReadId: string;
  nextFilterId: number;
  nextFilterKeywordId: number;
  nextReportId: number;
}

export function createMockState(): MockState {
  return {
    timelineStatuses: [...mockStatuses],
    blockedAccountIds: new Set<string>(),
    mutedAccountIds: new Set<string>(),
    mutedStatusIds: new Set<string>(),
    blockedDomainsSet: new Set<string>(),
    mockReports: [],
    mockFiltersList: [],
    mockMarkerLastReadId: 'notif-3',
    nextFilterId: 1,
    nextFilterKeywordId: 1,
    nextReportId: 1,
  };
}
