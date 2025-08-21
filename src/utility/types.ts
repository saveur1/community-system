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
    link: string;
    // Optional nested submenu items
    children?: NavItemType[];
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

  export type AssignedImmunization = {
    id: number;
    childName: string;
    vaccine: string;
    dueDate: string;
    status: 'Pending' | 'Received' | 'Missed';
    quantity?: number;
    assignedBy?: string;
  };

  export type ImmunizationAction = 'confirm' | 'view' | 'deny';

export interface ImmunizationReport {
  id: number;
  vaccine: string;
  completionDate: string;
  administeredBy: string;
  reportedAt?: string;
  tag?: string;
}

export type ReportAction = 'view' | 'download';