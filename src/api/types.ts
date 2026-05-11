export interface Bill {
    id: number;
    data_group: number;
    filename: string;
    amount: number | null;
    date: string | null;
    is_cash: boolean | null;
}

export interface Expense {
    id: number;
    data_group: number;
    date: string | null;
    partner: string;
    amount: number | string;
    expense_type: number;
    bill: number | null;
    application: number | null;
    is_cash: boolean | null;
}

export interface Summary {
    application: number;
    application_name: string;
    total: string;
    details: Array<[string, string]>;
    target_amount: number | null;
    is_target_met: boolean | null;
}

export interface EarTotals {
    bank_total: string;
    cash_total: string;
}

export interface EarResponse {
    expenses: Expense[];
    totals: EarTotals;
}

export interface ReportItem {
    expense_id: number;
    partner: string;
    amount: string;
    date: string | null;
    expense_type: number;
    filename: string;
    is_cash: boolean | null;
}

export interface BelegaufstellungItem {
    expense_id: number;
    partner: string;
    amount: string;
    date: string | null;
    expense_type_name: string;
    is_cash: boolean | null;
    bill_date: string | null;
}

export interface DataGroup {
    id: number;
    name: string;
    type: 'project' | 'organization';
    created_at: string;
    bills_storage_path: string;
}

export interface ApplicationReport {
    id: number;
    data_group: number;
    name: string;
    amount: number;
    created_at: string;
    submission_deadline: string | null;
}

export const EXPENSE_TYPES: Record<number, string> = {
    0: 'None',
    1: 'Honorare Kurator:innen',
    2: 'Honorare Texte',
    3: 'Honorare Grafik/Layout/Fotos',
    4: 'Honorare Künstler:innen – Gruppenausstellung',
    5: 'Honorar Künstler:in – Einzelausstellung',
    6: 'Materialkosten',
    7: 'Reisekosten, Aufenthaltskosten',
    8: 'Transporte',
    9: 'Öffentlichkeitsarbeit, Marketing, PR, Social-Media',
    10: 'Abgaben, Versicherungen',
    11: 'Miete Veranstaltungsort',
    12: 'Technische Ausstattung',
    13: 'Druckkosten Publikation',
    14: 'Discotec künstlerische Leitung, Geschäftsführung',
    15: 'Bewirtung, Eröffnung',
    16: 'Homepage/Internet/EDV',
    17: 'Sonstige Bürokosten',
    18: 'Büromaterial, Sachgüter',
    19: 'Bankkonto/Website-Domäne',
    50: 'Getränkespende',
    51: 'Förderung MA 7',
    52: 'Förderung Bezirk',
    53: 'Förderung Bund',
    54: 'Habenzinsen',
    55: 'Bargeldabhebung',
    56: 'Other Income',
};

export const APPLICATIONS: Record<number, string> = {
    0: '-',
    1: 'BMKOS',
    2: 'MA7',
    3: 'Bezirk',
};
