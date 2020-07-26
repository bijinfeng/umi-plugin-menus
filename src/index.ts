// ref:
// - https://umijs.org/plugins/api
import { utils, IApi, IRoute, IConfig } from 'umi';
import fs, { readFileSync } from 'fs';
import path from 'path';
import { cloneDeep, compact, isEmpty, isArray, set, omit, unset } from 'lodash';
import {
  RELATIVE_MODEL_PATH,
  RELATIVE_RUNTIOME_PATH,
  CUSTOM_EVENT_NAME,
} from './constants';
const { winPath, signale, Mustache } = utils;
const { join } = path;

interface defaultConfigOptions {
  build: string;
  isGenerate: boolean;
  excludes: string[];
}

const recursiveAnalysis = (
  routes: IRoute[],
  parent: IRoute,
  opts: defaultConfigOptions,
) => {
  const { excludes } = opts;

  const arr: IRoute[] = [];

  routes.forEach(route => {
    const { path, routes: localRoutes, menu, flatMenu } = route;
    if (!!menu && (!isEmpty(path) || !isEmpty(localRoutes))) {
      if (flatMenu) {
        if (isArray(localRoutes)) {
          const childrenRoutes = recursiveAnalysis(localRoutes, route, opts);
          arr.push(...childrenRoutes);
        }
      } else {
        if (isArray(localRoutes)) {
          if (menu.hideChildMenu) {
            unset(route, ['routes']);
          } else {
            set(route, ['routes'], recursiveAnalysis(localRoutes, route, opts));
          }
        }
        arr.push(omit(route, excludes));
      }
    }
  });
  return compact(arr);
};

const defaultOptions: defaultConfigOptions = {
  build: path.resolve('.', './menus.json'),
  isGenerate: false,
  excludes: ['exact', 'component', 'Routes'],
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

      interactive.await('[%d/3] - build menus model...', 2);
      if (opts.isGenerate) {
        fs.writeFileSync(opts.build, JSON.stringify(tree, null, 2));
      }

      if (useModel) {
        const modalTpl = readFileSync(
          join(__dirname, 'modelContent.tsx.tpl'),
          'utf-8',
        );
        api.writeTmpFile({
          path: RELATIVE_MODEL_PATH,
          content: Mustache.render(modalTpl, {
            menus: JSON.stringify(tree),
            eventName: CUSTOM_EVENT_NAME,
          }),
        });
      }

      interactive.success('[%d/3] - build menus model done!', 3);
    }
    return routes;
  });

  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: RELATIVE_RUNTIOME_PATH,
      content: Mustache.render(
        readFileSync(join(__dirname, 'runtime.tsx.tpl'), 'utf-8'),
        {
          eventName: CUSTOM_EVENT_NAME,
        },
      ),
    });
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

  api.addRuntimePlugin(() => [`@@/${RELATIVE_RUNTIOME_PATH}`]);
}
