import { CURRENCY } from '@lib/excel/type';
import { convert as cashifyConvert } from 'cashify';

const currencyToLocaleMap: Record<CURRENCY, string> = {
    [CURRENCY.KRW]: 'ko',
    [CURRENCY.JPY]: 'ja',
    [CURRENCY.USD]: 'en'
};
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
    rates?: Record<string, number>,
    disableSymbol = false,
    transitionValue = 10000
): string|number => {
    if (typeof value === 'number') {
        const money = (currency && rates) ? convertUSDToCurrency(value, currency, rates) : value;

        const shorten: boolean = Math.abs(money) >= transitionValue;
        const digit = currencyToMinimumFractionDigitsMap[currency];
        const options = {
            notation: shorten ? 'compact' : 'standard',
            maximumFractionDigits: shorten ? 2 : digit,
            minimumFractionDigits: shorten ? 0 : digit,
            style: disableSymbol ? 'decimal' : 'currency',
            currency,
            currencyDisplay: 'narrowSymbol'
        };

        return Intl.NumberFormat(currencyToLocaleMap[currency], options).format(money);
    }

    return '--';
};
