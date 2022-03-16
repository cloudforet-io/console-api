
export interface Menu {
    name: string;
    label: string;
    sub_menu: Menu[];
    is_new?: boolean;
    is_beta?: boolean;
}
