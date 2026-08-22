export const cultureCategories = ["festival", "tradition", "food", "story"] as const;

export type CultureCategory = (typeof cultureCategories)[number];

export const cultureStatuses = ["draft", "pending_review", "approved", "changes_requested", "rejected", "archived"] as const;

export type CultureStatus = (typeof cultureStatuses)[number];

export const sourceConfidences = ["primary", "official", "secondary", "community"] as const;

export type SourceConfidence = (typeof sourceConfidences)[number];

export type CultureSource = {
  title: string;
  publisher: string;
  url: string;
  confidence: SourceConfidence;
};

export type CultureLocation = {
  state: string;
  region: string;
  coordinates: [longitude: number, latitude: number];
};

export type CultureRecord = {
  id: string;
  slug: string;
  title: string;
  category: CultureCategory;
  summary: string;
  history: string;
  culturalImportance: string;
  impact: string;
  location: CultureLocation;
  seasonMonths: number[];
  bestVisitingTime: string;
  source: CultureSource;
  imageReference?: {
    key: string;
    url: string;
    attribution: string;
  };
  status: CultureStatus;
  createdAt: Date;
  updatedAt: Date;
};
