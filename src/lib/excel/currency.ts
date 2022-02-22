import { CURRENCY } from '@lib/excel/type';
import { convert as cashifyConvert } from 'cashify';

const currencyToMinimumFractionDigitsMap: Record<CURRENCY, number> = {
    [CURRENCY.KRW]: 0,
    [CURRENCY.JPY]: 0,
    [CURRENCY.USD]: 2
};

const convertUSDToCurrency = (money: number, currency: CURRENCY, rates: Record<string, number>): number => cashifyConvert(money, {
    base: CURRENCY.USD,
    rates,
    from: CURRENCY.USD,
    to: currency
});

export const currencyMoneyFormatter = (
    value?: number,
    currency: CURRENCY = CURRENCY.USD,
    rates?: Record<string, number>
): string|number => {
    if (typeof value === 'number') {
        const money = (currency && rates) ? convertUSDToCurrency(value, currency, rates) : value;
        const digit = currencyToMinimumFractionDigitsMap[currency];
        return Number(money.toFixed(digit));
    }

    return '--';
};
