export type Mode = 'browse' | 'review';

export type ReviewItem = {
  id: string;
  uri: string;
  width: number;
  height: number;
  creationTime: number;
};
