export interface UpdateAlertBackEndParams {
    alert_id: string;
    state?: string;
    assignee?: string;
    note?: string;
    domain_id?: string;
}

/* */
export type UpdateAlertParams = UpdateAlertBackEndParams

export interface ChangeAlertStateParams {
    alerts: string[];
    state: string;
    assignee?: string;
    note?: string;
    domain_id?: string;
}
