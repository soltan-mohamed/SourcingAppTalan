export interface SearchParams {
  searchText?: string;
  statut?: string;
  minExperience?: number;
  maxExperience?: number;
  searchCriteria?: string[]; // New field for specific search criteria
}

export interface ExperienceRange {
  label: string;
  min?: number;
  max?: number;
}

export interface SearchCriteria {
  key: string;
  label: string;
  icon: string;
  placeholder: string;
}

export const SEARCH_CRITERIA: SearchCriteria[] = [
  { key: 'name', label: 'Name', icon: 'person', placeholder: 'Search by name...' },
  { key: 'email', label: 'Email', icon: 'email', placeholder: 'Search by email...' },
  { key: 'phone', label: 'Phone', icon: 'phone', placeholder: 'Search by phone...' },
  { key: 'position', label: 'Position', icon: 'work', placeholder: 'Search by position...' }
];

export const EXPERIENCE_RANGES: ExperienceRange[] = [
  { label: 'All Experience Levels' },
  { label: '0-1 years', min: 0, max: 1 },
  { label: '1-3 years', min: 1, max: 3 },
  { label: '3-5 years', min: 3, max: 5 },
  { label: '5-10 years', min: 5, max: 10 },
  { label: '10+ years', min: 10 }
];
