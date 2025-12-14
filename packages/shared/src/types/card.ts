export interface CardBase {
  id: string;
  title: string;
  summary: string;
  content: string;
  mediaUrl: string;
  sourceLink: string;
  sourceAttribution?: string | null;
  sourceType?: string | null;
  sourceId?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export type CreateCardInput = Omit<CardBase, 'id' | 'createdAt' | 'updatedAt'>;
