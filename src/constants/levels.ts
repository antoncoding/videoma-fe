export interface Level {
  value: string;
  label: string;
  description: string;
}

export const LEVELS: Level[] = [
  { 
    value: "beginner", 
    label: "Beginner", 
    description: "Just starting out" 
  },
  { 
    value: "intermediate", 
    label: "Intermediate", 
    description: "Can handle basic conversations" 
  },
  { 
    value: "advanced", 
    label: "Advanced", 
    description: "Comfortable with complex topics" 
  },
] as const;

export type LevelValue = typeof LEVELS[number]['value']; 