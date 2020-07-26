import React from 'react';
import styles from './index.css';
// @ts-ignore
import { useModel } from 'umi';

export default ({ children }: any) => {
  const { menus, matchRoute } = useModel('@@menus');
  console.log(menus, matchRoute);

  return (
    <div className={styles.normal}>
      Hello Umi!
      {children}
    </div>
  );
};
