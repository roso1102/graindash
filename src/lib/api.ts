import type {
  User, NoteDetail, NoteUpdate, Topic, Entity, EntityDetail,
  Stats, GraphData, SearchResults, NotesResponse, Facets,
  EntityRef
} from "@/types";
import supabase from "./supabaseClient";

export interface TelegramLinkTokenResponse {
  token: string;
  telegram_url: string;
  expires_in_minutes: number;
}


const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || null;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (res.status === 401) {
    await supabase.auth.signOut();
    if (typeof window !== "undefined") { window.location.href = "/login"; }
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${text}`);
  }

  return res.json();
}


export function getMe(): Promise<User> {
  return request<User>("/auth/me");
}


export function createTelegramLinkToken(): Promise<TelegramLinkTokenResponse> {
  return request<TelegramLinkTokenResponse>("/auth/telegram-link-token", {
    method: "POST",
  });
}


// Dashboard
export function getStats(): Promise<Stats> {
  return request<Stats>("/dashboard/stats");
}


// Notes
export function listNotes(params?: {
  topic_id?: string;
  entity_id?: string;
  facet_key?: string;
  facet_value?: string;
  search?: string;
  sort?: string;
  order?: string;
  page?: number;
  per_page?: number;
}): Promise<NotesResponse> {
  const qs = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
    });
  }
  const q = qs.toString();
  return request<NotesResponse>(`/dashboard/notes${q ? `?${q}` : ""}`);
}


export function getNote(id: string): Promise<NoteDetail> {
  return request<NoteDetail>(`/dashboard/notes/${id}`);
}


export function updateNote(id: string, data: NoteUpdate): Promise<{ status: string }> {
  return request(`/dashboard/notes/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}


export function deleteNote(id: string): Promise<{ status: string }> {
  return request(`/dashboard/notes/${id}`, { method: "DELETE" });
}


export function getNoteEntities(id: string): Promise<{ note_id: string; entities: EntityRef[] }> {
  return request(`/dashboard/notes/${id}/entities`);
}


// Topics
export function listTopics(): Promise<Topic[]> {
  return request<Topic[]>("/dashboard/topics");
}


export function getTopicNotes(id: string, page?: number, per_page?: number): Promise<NotesResponse> {
  const qs = new URLSearchParams();
  if (page) qs.set("page", String(page));
  if (per_page) qs.set("per_page", String(per_page));
  const q = qs.toString();
  return request<NotesResponse>(`/dashboard/topics/${id}/notes${q ? `?${q}` : ""}`);
}


// Entities
export function listEntities(): Promise<Entity[]> {
  return request<Entity[]>("/dashboard/entities");
}


// Topics - update
export function updateTopic(id: string, data: { name?: string; description?: string }): Promise<{ status: string }> {
  return request(`/dashboard/topics/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}


export function getEntity(id: string): Promise<EntityDetail> {
  return request<EntityDetail>(`/dashboard/entities/${id}`);
}


// Graph
export function getGraphData(): Promise<GraphData> {
  return request<GraphData>("/dashboard/graph-data");
}


// Search
export function searchNotes(query: string, limit?: number): Promise<SearchResults> {
  return request<SearchResults>("/search", {
    method: "POST",
    body: JSON.stringify({ query, limit: limit || 20 }),
  });
}


// Facets
export function getFacets(): Promise<Facets> {
  return request<Facets>("/facets");
}


// Ingest
export function ingestNote(text: string, source_type: string, source_url?: string): Promise<{ note_id: string }> {
  return request("/ingest-note", {
    method: "POST",
    body: JSON.stringify({ text, source_type, source_url }),
  });
}


// Related
export function getRelatedNotes(noteId: string): Promise<{ relations: Array<{ source_note_id: string; target_note_id: string; relation_type: string; score: number }> }> {
  return request(`/related-notes/${noteId}`);
}