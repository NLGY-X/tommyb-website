export type GigStatus = "tickets" | "sold-out" | "locked";

export interface Gig {
  id: string;
  date: string;
  displayDate: string;
  name: string;
  venue: string;
  city: string;
  status: GigStatus;
  /** 24h "HH:MM". After-midnight starts are fine ("01:00"). */
  setStart: string;
  /** Set length in hours, half-hour steps. */
  setHours: number;
  note?: string;
}
