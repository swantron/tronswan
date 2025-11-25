export interface StudyCard {
  id: string;
  category: 'GCP' | 'Coding';
  subcategory: string;
  front: string;
  back: string;
  tags: string[];
}

export interface StudyDeck {
  name: string;
  subcategory: string;
  category: 'GCP' | 'Coding';
  cards: StudyCard[];
}
