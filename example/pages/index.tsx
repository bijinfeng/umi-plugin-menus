import React from 'react';
import styles from './index.css';
// @ts-ignore
import { useModel } from 'umi';

export default ({ children }: any) => {
  const menus = useModel('@@menus');
  console.log(menus);

  const d = useModel('useDemo');
  console.log(d);
  return (
    <div className={styles.normal}>
      Hello Umi!
      { children }
    </div>
  )
};
