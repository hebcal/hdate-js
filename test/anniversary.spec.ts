/* eslint-disable max-len */
import {months} from '../src/hdate-base';
import {
  getYahrzeit, getBirthdayOrAnniversary,
  getYahrzeitHD, getBirthdayHD
} from '../src/anniversary';

test('yahrzeit', () => {
  // Gregorian YYYY, MM, DD
  const items: [number, number, number, string, string][] = [
    [2017, 1, 13, 'General',
      '1/2/2018 12/23/2018 1/12/2020 12/30/2020 12/19/2021 1/8/2023 12/27/2023 1/15/2025 1/4/2026 12/25/2026 1/14/2028 1/2/2029 12/21/2029 1/10/2031 12/30/2031 12/17/2032 1/6/2034 12/27/2034 1/15/2036 1/2/2037 12/23/2037 1/11/2039 1/1/2040 12/19/2040 1/7/2042 12/28/2042',
    ],
    [2014, 3, 2, 'Adar1-30',
      '2/15/2018 3/7/2019 2/25/2020 2/12/2021 3/3/2022 2/21/2023 3/10/2024 2/28/2025 2/17/2026 3/9/2027 2/27/2028 2/15/2029 3/5/2030 2/23/2031 2/12/2032 3/1/2033 2/19/2034 3/11/2035 2/28/2036 2/15/2037 3/7/2038 2/24/2039 2/14/2040 3/3/2041 2/20/2042',
    ],
    [2014, 3, 22, 'Adar2',
      '3/7/2018 3/27/2019 3/16/2020 3/4/2021 3/23/2022 3/13/2023 3/30/2024 3/20/2025 3/9/2026 3/29/2027 3/18/2028 3/7/2029 3/25/2030 3/15/2031 3/3/2032 3/21/2033 3/11/2034 3/31/2035 3/19/2036 3/7/2037 3/27/2038 3/16/2039 3/5/2040 3/23/2041 3/12/2042',
    ],
    [2013, 12, 3, 'Kislev-30-Ex1',
      '12/18/2017 12/8/2018 12/28/2019 12/16/2020 12/4/2021 12/24/2022 12/13/2023 12/31/2024 12/20/2025 12/10/2026 12/30/2027 12/18/2028 12/7/2029 12/26/2030 12/15/2031 12/3/2032 12/22/2033 12/12/2034 12/31/2035 12/19/2036 12/8/2037 12/27/2038 12/17/2039 12/5/2040 12/23/2041',
    ],
    [2011, 12, 26, 'Kislev-30-Ex2',
      '12/18/2017 12/8/2018 12/28/2019 12/15/2020 12/4/2021 12/24/2022 12/12/2023 12/31/2024 12/20/2025 12/10/2026 12/30/2027 12/18/2028 12/6/2029 12/26/2030 12/15/2031 12/2/2032 12/22/2033 12/12/2034 12/31/2035 12/18/2036 12/8/2037 12/27/2038 12/17/2039 12/4/2040 12/23/2041',
    ],
    [2010, 11, 7, 'Cheshvan-30-Ex1',
      '11/18/2017 11/8/2018 11/28/2019 11/16/2020 11/4/2021 11/24/2022 11/13/2023 12/1/2024 11/20/2025 11/10/2026 11/30/2027 11/18/2028 11/7/2029 11/26/2030 11/15/2031 11/3/2032 11/22/2033 11/12/2034 12/1/2035 11/19/2036 11/8/2037 11/27/2038 11/17/2039 11/5/2040 11/23/2041',
    ],
    [2009, 11, 17, 'Cheshvan-30-Ex2',
      '11/19/2017 11/8/2018 11/28/2019 11/17/2020 11/5/2021 11/24/2022 11/14/2023 12/1/2024 11/21/2025 11/10/2026 11/30/2027 11/19/2028 11/8/2029 11/26/2030 11/16/2031 11/4/2032 11/22/2033 11/12/2034 12/2/2035 11/20/2036 11/8/2037 11/28/2038 11/17/2039 11/6/2040 11/24/2041',
    ],
  ];
  for (const item of items) {
    const gd = new Date(item[0], item[1] - 1, item[2]);
    const name = item[3];
    const expected = item[4].split(' ');
    for (let i = 0; i < 25; i++) {
      const hyear = i + 5778;
      const yahrzeit = getYahrzeit(hyear, gd);
      expect(yahrzeit).toBeDefined();
      const dateStr = (yahrzeit as Date).toLocaleDateString('en-US');
      expect(dateStr).toBe(expected[i]);
    }
  }
});

test('birthday', () => {
  const items: [number, number, number, string, string][] = [
    [1948, 3, 11, 'Adar1-30',
      '3/23/1993 3/13/1994 3/2/1995 3/21/1996 3/9/1997 3/28/1998 3/18/1999 3/7/2000 3/25/2001 3/14/2002 3/4/2003 3/23/2004 3/11/2005 3/30/2006 3/20/2007 3/7/2008 3/26/2009 3/16/2010 3/6/2011 3/24/2012 3/12/2013',
    ],
    [1951, 2, 28, 'Adar1-22',
      '3/15/1993 3/5/1994 2/22/1995 3/13/1996 3/1/1997 3/20/1998 3/10/1999 2/28/2000 3/17/2001 3/6/2002 2/24/2003 3/15/2004 3/3/2005 3/22/2006 3/12/2007 2/28/2008 3/18/2009 3/8/2010 2/26/2011 3/16/2012 3/4/2013',
    ],
    [1951, 3, 30, 'Adar2-22',
      '3/15/1993 3/5/1994 3/24/1995 3/13/1996 3/31/1997 3/20/1998 3/10/1999 3/29/2000 3/17/2001 3/6/2002 3/26/2003 3/15/2004 4/2/2005 3/22/2006 3/12/2007 3/29/2008 3/18/2009 3/8/2010 3/28/2011 3/16/2012 3/4/2013',
    ],
    [1947, 3, 1, 'Adar9',
      '3/2/1993 2/20/1994 3/11/1995 2/29/1996 3/18/1997 3/7/1998 2/25/1999 3/16/2000 3/4/2001 2/21/2002 3/13/2003 3/2/2004 3/20/2005 3/9/2006 2/27/2007 3/16/2008 3/5/2009 2/23/2010 3/15/2011 3/3/2012 2/19/2013',
    ],
    [1939, 12, 12, 'Kislev-30',
      '12/25/1992 12/14/1993 12/3/1994 12/23/1995 12/11/1996 12/29/1997 12/19/1998 12/9/1999 12/27/2000 12/15/2001 12/5/2002 12/25/2003 12/13/2004 12/31/2005 12/21/2006 12/10/2007 12/27/2008 12/17/2009 12/7/2010 12/26/2011 12/14/2012',
    ],
    [1944, 11, 16, 'Cheshvan-30',
      '11/26/1992 11/14/1993 11/4/1994 11/23/1995 11/12/1996 11/30/1997 11/19/1998 11/9/1999 11/28/2000 11/16/2001 11/5/2002 11/25/2003 11/14/2004 12/2/2005 11/21/2006 11/11/2007 11/28/2008 11/17/2009 11/7/2010 11/27/2011 11/15/2012',
    ],
  ];
  for (const item of items) {
    const gd = new Date(item[0], item[1] - 1, item[2]);
    const name = item[3];
    const expected = item[4].split(' ');
    for (let i = 0; i < 21; i++) {
      const hyear = i + 5753;
      const birthday = getBirthdayOrAnniversary(hyear, gd);
      expect(birthday).toBeDefined();
      const dateStr = (birthday as Date).toLocaleDateString('en-US');
      expect(dateStr).toBe(expected[i]);
    }
  }
});

test('before-original', () => {
  let dt = getYahrzeit(5769, new Date(2008, 10, 13));
  expect(dt).toBe(undefined); // 'Hebrew year 5769 occurs on or before original date in 5769');

  dt = getYahrzeit(5770, new Date(2008, 10, 13));
  expect(dt).toBeDefined();
  expect((dt as Date).getFullYear()).toBe(2009);

  dt = getBirthdayOrAnniversary(5778, new Date(2018, 11, 13));
  expect(dt).toBe(undefined); // 'Hebrew year 5778 occurs before original date in 5779');

  dt = getBirthdayOrAnniversary(5780, new Date(2018, 11, 13));
  expect(dt).toBeDefined();
  expect((dt as Date).getFullYear()).toBe(2020);
});

test('ctor-hdate', () => {
  const niftar = {dd: 15, mm: months.CHESHVAN, yy: 5769};
  const yahrzeit = getYahrzeitHD(5782, niftar);
  expect(yahrzeit).toBeDefined();
  expect(yahrzeit).toEqual({dd: 15, mm: 8, yy: 5782});

  const birth = {dd: 23, mm: months.SIVAN, yy: 5735};
  const anniversary = getBirthdayHD(5782, birth);
  expect(anniversary).toBeDefined();
  expect(anniversary).toEqual({dd: 23, mm: 3, yy: 5782});
});

test('getYahrzeitHD-num', () => {
  const yahrzeit = getYahrzeitHD(5782, 733373);
  expect(yahrzeit).toBeDefined();
  expect(yahrzeit).toEqual({dd: 29, mm: 8, yy: 5782});
});

test('getBirthdayHD-same', () => {
  const birth = {dd: 23, mm: months.SIVAN, yy: 5735};
  const anniversary = getBirthdayHD(5735, birth);
  expect(anniversary).toBeDefined();
  expect(anniversary).toEqual({dd: 23, mm: 3, yy: 5735});
});
