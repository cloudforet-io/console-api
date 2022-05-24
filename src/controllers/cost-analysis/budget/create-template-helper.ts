import { Buffer } from 'exceljs';

import { BudgetBulkCreateSource, BudgetTemplateData } from '@controllers/cost-analysis/budget/type';
import { createExcel } from '@lib/excel';

const costTypeSelectOptions = {
    provider: 'Provider',
    region_code: 'Region',
    service_account_id: 'Account',
    product: 'Product'
};
const costTypeKeys = Object.keys(costTypeSelectOptions);
const costTypeKeyEnumItems = {
    all: 'All',
    ...costTypeSelectOptions
};
const timeUnitEnumItems = {
    TOTAL: 'Total Amount',
    MONTHLY: 'Monthly Budget Planning'
};

const getCostTypeKeyAndSelect = (cost_types?: Record<string, string[]>) => {
    const costTypes = cost_types ?? {};
    const costTypeKey = Object.keys(costTypes)[0];

    if (costTypeKey && !costTypeKeys.includes(costTypeKey)) {
        throw new Error(`Invalid Parameter. (source.cost_types = keys must be one of ${costTypeKeys.join(' | ')})`);
    }

    const costTypeSelect = cost_types ? cost_types[costTypeKey] : undefined;

    if (costTypeKey) {
        if (!Array.isArray(costTypeSelect) || !costTypeSelect.length) {
            throw new Error('Invalid Parameter. (source.cost_types = values are required in string array format)');
        }
    }

    return {
        cost_type_key: costTypeKey ?? 'all',
        cost_type_select: costTypeKey ? costTypeSelect?.join(',') : undefined
    };
};

const getBudgetTemplateData = (number: number, { start, end, time_unit, cost_types }: BudgetBulkCreateSource, project?: string): Partial<BudgetTemplateData> => {
    const budgetNum = number.toString().padStart(2, '0');
    const { cost_type_key, cost_type_select } = getCostTypeKeyAndSelect(cost_types);
    return {
        name: `Budget ex${budgetNum}`,
        start,
        end,
        time_unit,
        project_or_group_id: project,
        cost_type_key,
        cost_type_select
    };
};
export const getBudgetTemplateDataRows = (source: BudgetBulkCreateSource): Partial<BudgetTemplateData>[] => {
    const { projects } = source;
    if (projects) {
        if (!Array.isArray(projects)) {
            throw new Error('Invalid Parameter. (source.projects = must be string array)');
        }
        if (projects.length) {
            return projects.map((proj, idx) => getBudgetTemplateData(idx + 1, source, proj));
        }
    }
    return [getBudgetTemplateData(1, source)];
};
export const createBudgetTemplateExcel = (response, source?: BudgetBulkCreateSource): Promise<Buffer> => {
    const data = source ? getBudgetTemplateDataRows(source) : [];
    return createExcel(response, {
        source: {
            data
        },
        template: {
            fields: [
                {
                    key: 'name',
                    name: 'Budget Name'
            /*
            <Validation Rule>
            1. required.
            */
                },
                {
                    key: 'project_or_group_id',
                    name: 'Project Group or Project ID'
            /*
            <Validation Rule>
            1. required.
            2. must be exist.
            */
                },
                {
                    key: 'cost_type_key',
                    name: 'Cost Type',
                    type: 'enum',
                    enum_items: costTypeKeyEnumItems
            /*
            <Validation Rule>
            1. required.
            2. must be one of enum_items.
            */
                },
                {
                    key: 'cost_type_select',
                    name: 'Cost Type Select'
            /*
            <Validation Rule>
            1. required when cost_type_key is not 'all'.
            2. all items must be exist in selected cost_type_key's resources.
            */
                },
                {
                    key: 'start',
                    name: 'Start Month'
            /*
            <Validation Rule>
            1. required.
            2. format must be 'YYYY-MM'. => NEED DISCUSSION
            3. must be less than end.
            */
                },
                {
                    key: 'end',
                    name: 'End Month'
                },
        /*
        <Validation Rule>
        1. required.
        2. format must be 'YYYY-MM'. => NEED DISCUSSION
        3. must be greater than start.
        */
                {
                    key: 'time_unit',
                    name: 'Amount Planning',
                    type: 'enum',
                    enum_items: timeUnitEnumItems
            /*
            <Validation Rule>
            1. required.
            2. must be one of enum_items.
            */
                },
                {
                    key: 'limit',
                    name: 'Total Budgeted Amount'
            /*
            <Validation Rule>
            1. required when time_unit is TOTAL.
            2. item should be converted into number.
            */
                },
                {
                    key: 'planned_limits',
                    name: 'Monthly Budget Planning'
            /*
            <Validation Rule>
            1. required when time_unit is MONTHLY.
            2. all items should be converted into numbers.
            3. item count must be the same with the value of end month - start month
            */
                }
            ],
            options: {
                timezone: 'Asia/Seoul',
                file_name_prefix: 'budget',
                sheet_name: 'SpaceONE_budget_create_template'
            }
        }
    });

};
