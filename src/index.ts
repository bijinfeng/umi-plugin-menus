// ref:
// - https://umijs.org/plugins/api
import { utils, IApi, IRoute, IConfig } from 'umi';
import fs from 'fs';
import path from 'path';
import {
  cloneDeep,
  orderBy,
  compact,
  map,
  isEmpty,
  isArray,
  set,
  omit,
  unset,
} from 'lodash';
import { RELATIVE_MODEL_PATH } from './constants';
import getModelContent from './getModelContent';
const { winPath, signale } = utils;
const { join } = path;

type orderOptions = 'asc' | 'desc';

interface defaultConfigOptions {
  build: string;
  excludes: string[];
  order: [string[], orderOptions[]];
}

const recursiveAnalysis = (
  routes: IRoute[],
  parent: IRoute,
  opts: defaultConfigOptions,
) => {
  const { excludes, order } = opts;

  return orderBy(
    compact(
      map(routes, route => {
        const { path, routes } = route;
        if (!!route.menu && (!isEmpty(path) || !isEmpty(routes))) {
          if (isArray(routes)) {
            if (route.menu.hideChildMenu) {
              unset(route, ['routes']);
            } else {
              set(route, ['routes'], recursiveAnalysis(routes, route, opts));
            }
          }

          return omit(route, excludes);
        }
        return void 0;
      }),
    ),
    ...order,
  );
};

const defaultOptions: defaultConfigOptions = {
  build: path.resolve('.', './menus.json'),
  excludes: ['exact', 'component', 'Routes'],
  order: [['order'], ['asc']],
};

let routesCache: IRoute[];

export default function(api: IApi, options: IConfig) {
  const opts = { ...defaultOptions, ...options };
  // 有使用 plugin-model 时，将路由等数据保存到useModel中
  const useModel = api.hasPlugins(['@umijs/plugin-model']);

  api.modifyRoutes((routes: IRoute[]) => {
    if (
      !routesCache ||
      JSON.stringify(routesCache) !== JSON.stringify(routes)
    ) {
      routesCache = routes;
      const _routes = cloneDeep(routes);
      const interactive = new signale.Signale({
        interactive: true,
        scope: 'umi-plugin-menus',
      });

      interactive.await('[%d/3] - analysis routes...', 1);
      const tree = recursiveAnalysis(_routes, {}, opts);

      interactive.await('[%d/3] - build menus file...', 2);
      fs.writeFileSync(opts.build, JSON.stringify(tree, null, 2));

      if (useModel) {
        api.writeTmpFile({
          path: RELATIVE_MODEL_PATH,
          content: getModelContent(tree),
        });
      }

      interactive.success('[%d/3] - build menus file done!', 3);
    }
    return routes;
  });

  if (useModel) {
    api.register({
      key: 'addExtraModels',
      fn: () => [
        {
          absPath: winPath(join(api.paths.absTmpPath!, RELATIVE_MODEL_PATH)),
          namespace: '@@menus',
        },
      ],
    });
  }
}
