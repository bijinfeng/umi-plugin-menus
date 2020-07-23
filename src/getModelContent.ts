import { IRoute } from 'umi';

export default (routes: IRoute[]) => `
import { useState, useEffect, useCallback } from 'react';
import { IRoute } from 'umi';

const menus: IRoute[] = ${JSON.stringify(routes)}

export default () => {
  const [state, setState] = useState(false);

  return menus;
}
`
