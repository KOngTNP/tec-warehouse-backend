import BigNumber from 'bignumber.js';
declare global {
  interface Number {
    toBigNumber(): BigNumber;
    toCommaString(): string;
  }

  interface Date {
    toFormattedString(): string;
  }
}

Number.prototype.toBigNumber = function (): BigNumber {
  return new BigNumber(this);
};

Number.prototype.toCommaString = function (): string {
  return this.toLocaleString('en-US', { minimumFractionDigits: 2 });
};

Date.prototype.toFormattedString = function (): string {
  return this.toLocaleString('th-TH', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Bangkok',
  });
};
