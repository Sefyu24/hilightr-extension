export interface HighlightPosition {
  startOffset: number;
  endOffset: number;
  startContainer: string;
  endContainer: string;
}

export interface HighlightData {
  id: string;
  url: string;
  domain: string;
  title: string;
  highlightedText: string;
  color: 'yellow' | 'pink' | 'lime';
  note: string;
  position: HighlightPosition;
  createdAt: Date;
  updatedAt: Date;
  // Optional fields for future database integration
  userId?: string;
  folderId?: string;
  tags?: string[];
}

export type HighlightColor = 'yellow' | 'pink' | 'lime';

export const HIGHLIGHT_COLORS: Record<HighlightColor, string> = {
  yellow: '#fef08a',
  pink: '#fbcfe8',
  lime: '#bef264'
};