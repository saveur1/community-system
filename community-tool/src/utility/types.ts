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