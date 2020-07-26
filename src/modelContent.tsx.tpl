import { useState, useEffect, useCallback } from 'react';
import { IRoute } from 'umi';

export interface RouteProps extends IRoute {
  flatMenu?: boolean;
  menu: {
    name: string;
    icon: string;
    hideChildMenu?: boolean;
  }
}

const menus: IRoute[] = {{{ menus }}};
const eventName = '{{{ eventName }}}';

export default (): {
  menus: RouteProps[],
  matchRoute: RouteProps,
} => {
  const [matchRoute, setMatchRoute] = useState(null);

  useEffect(() => {
    document.addEventListener(eventName, handleChange);
    return () => document.removeEventListener(eventName, handleChange);
  }, []);

  const handleChange = useCallback((e) => {
    setMatchRoute(e.detail);
  }, []);

  return {
    menus,
    matchRoute,
  };
}
