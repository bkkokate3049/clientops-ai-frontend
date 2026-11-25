export interface DocItem {
  sourceName: string;
  chunkCount: number;
  lastUpdated: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}
