# @hebcal/hdate
converts between Hebrew and Gregorian dates using Rata Die (R.D.) algorithm by Dershowitz and Reingold

[![Build Status](https://github.com/hebcal/hdate-js/actions/workflows/node.js.yml/badge.svg)](https://github.com/hebcal/hdate-js/actions/workflows/node.js.yml)

## Installation
```bash
$ npm install @hebcal/hdate
```

## Synopsis
```javascript
import {greg, abs2hebrew} from '@hebcal/hdate';

const date = new Date(2008, 10, 13); // 13 November 2008
const abs = greg.greg2abs(date);
const hdate = abs2hebrew(abs); // {yy: 5769, mm: CHESHVAN, dd: 15}
```

## [API Documentation](https://hebcal.github.io/api/hdate/index.html)
