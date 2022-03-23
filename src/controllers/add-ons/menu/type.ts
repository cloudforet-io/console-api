
export interface Menu {
    id: string;
    label: string;
    sub_menu?: Menu[];
    is_new?: boolean;
    is_beta?: boolean;
}
