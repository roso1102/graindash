export interface User {
  id: string;
  telegram_chat_id: number;
  display_name: string;
  created_at: string;
}

export interface Note {
  id: string;
  title: string | null;
  summary: string | null;
  raw_text: string | null;
  source_url: string | null;
  source_type: string | null;
  topic_id: string | null;
  facets: Record<string, string[]> | null;
  created_at: string;
}

export interface NoteDetail extends Note {
  topic_name: string;
  personal_insight: string | null;
  entities: EntityRef[];
  backlinks: Backlink[];
}

export interface EntityRef {
  id: string;
  name: string;
  type: string;
}

export interface Backlink {
  note_id: string;
  relation_type: string;
  direction: string;
  score: number;
}

export interface Topic {
  id: string;
  name: string;
  parent_id: string | null;
  description: string | null;
  note_count: number;
}

export interface Entity {
  id: string;
  name: string;
  type: string;
  note_count: number;
}

export interface EntityDetail extends Entity {
  notes: Note[];
}

export interface Stats {
  note_count: number;
  topic_count: number;
  entity_count: number;
  last_capture_at: string | null;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface GraphNode {
  id: string;
  title: string;
  topic_name: string;
  topic_id: string | null;
}

export interface GraphLink {
  source: string;
  target: string;
  relation_type: string;
  score: number;
}

export interface SearchResults {
  results: SearchResult[];
  total: number;
}

export interface SearchResult {
  id: string;
  title: string | null;
  summary: string | null;
  topic_id: string | null;
  source_type?: string | null;
  created_at: string;
  score: number;
}

export interface NotesResponse {
  notes: Note[];
  total: number;
  page: number;
  per_page: number;
}

export interface Facets {
  [key: string]: string[];
}

export interface NoteUpdate {
  title?: string;
  summary?: string;
  topic_id?: string;
  personal_insight?: string;
  facets?: Record<string, string[]>;
}

