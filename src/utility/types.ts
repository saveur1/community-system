// Component Props Interfaces


export interface MetricType {
    title: string;
    value: string;
    change: string;
    isPositive: boolean;
    subtitle: string;
    description: string;
    arrow: 'up' | 'down';
}

export interface NavItemType {
    name: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    active: boolean;
    link: string
}

export interface DocumentItemType {
    name: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export type FeedbackItem = {
    id: number;
    programme: string;
    feedbackType: 'Positive' | 'Negative' | 'Suggestion' | 'Concern';
    response: string;
    followUpNeeded: boolean;
    email: string;
    responses: number;
    questions: number;
    time: string;
    status: 'Active' | 'Draft' | 'Completed' | 'Pending';
  };
  
  export type FeedbackAction = {
    key: string;
    label: string;
    icon: React.ReactNode;
    destructive: boolean;
  };