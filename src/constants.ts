import { join } from 'path';

export const DIR_NAME = 'plugin-menus';
export const RELATIVE_MENUS = join(DIR_NAME, 'menus');
export const RELATIVE_MODEL_PATH = `${RELATIVE_MENUS}.ts`;
export const ReLATIVE_RUNTIOME = join(DIR_NAME, 'runtime');
export const RELATIVE_RUNTIOME_PATH = `${ReLATIVE_RUNTIOME}.ts`;
export const CUSTOM_EVENT_NAME = 'umi-plugin-menus_route-change';
