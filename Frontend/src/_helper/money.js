import axios from "axios";
var _ = require('lodash');
var numeral = require('numeral');

export const SETTLEUP_TXN = "SETTLEUP";

export const CURRENCY = [
  { 'name': "USD" },
  { 'name': "KWD" },
  { 'name': "BHD" },
  { 'name': "GBP" },
  { 'name': "EUR" },
  { 'name': "CAD" },
];

export const COUNTRY = Object.freeze(
  {
    US: "United States",
    KW: "Kuwait",
    BH: "Bahrain",
    GB: "United Kingdom",
    CA: "Canada",
  }
);

export const CURRENCYFORMAT = Object.freeze(
  {
    USD: '$',
    KWD: 'KD',
    BHD: 'BD',
    GBP: '£',
    EUR: '€',
    CAD: 'C$',
  }
);

export const formatMoney = (amount, currencyCode) => {
  return `${CURRENCYFORMAT[currencyCode]}${numeral(getRoundedAmount(Math.abs(amount))).format('0,0[.]00')}`;
}

// 996f6a1ca5b62e3880e60c32e1f21a1c
// http://data.fixer.io/api/latest?access_key=996f6a1ca5b62e3880e60c32e1f21a1c&symbols=USD,KWD,GBP,EUR,BHD,CAD
var rates = { "USD": 1.189902, "KWD": 0.359339, "GBP": 0.857081, "EUR": 1, "BHD": 0.448643, "CAD": 1.481833 };

export const convertAmount = (amount, sourceCurrencyCode = 'USD', trargetCurrencyCode = 'USD') => {
  const sourceRate = rates[sourceCurrencyCode];
  const destinationRate = rates[trargetCurrencyCode];
  const amountProcessed = (destinationRate * amount) / sourceRate;
  return amountProcessed;
}

export const getRoundedAmount = (amount) => {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
};

