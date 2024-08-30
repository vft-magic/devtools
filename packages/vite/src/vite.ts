import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import type { HtmlTagDescriptor, PluginOption, ResolvedConfig, ViteDevServer } from 'vite';
import { normalizePath } from 'vite';
import Inspect from 'vite-plugin-inspect';
import { bold, cyan, dim, green, yellow } from 'kolorist';
import sirv from 'sirv';

import { DIR_CLIENT } from './dir';
import { removeUrlQuery } from './utils';

function getTMagicDevtoolsPath() {
  const pluginPath = normalizePath(path.dirname(url.fileURLToPath(import.meta.url)));
  return pluginPath.replace(/\/dist$/, '/src');
}

const toggleComboKeysMap = {
  option: process.platform === 'darwin' ? 'Option(⌥)' : 'Alt(⌥)',
  meta: 'Command(⌘)',
  shift: 'Shift(⇧)',
};
function normalizeComboKeyPrint(toggleComboKey: string) {
  return toggleComboKey
    .split('-')
    .map((key) => toggleComboKeysMap[key] || key[0].toUpperCase() + key.slice(1))
    .join(dim('+'));
}

const devtoolsNextResourceSymbol = '?__tmagic-devtools-next-resource';

export interface VitePluginTMagicDevToolsOptions {
  /**
   * append an import to the module id ending with `appendTo` instead of adding a script into body
   * useful for projects that do not use html file as an entry
   *
   * WARNING: only set this if you know exactly what it does.
   * @default ''
   */
  appendTo?: string | RegExp;

  /**
   * Enable tmagic component inspector
   *
   * @default true
   */
  componentInspector?: boolean;

  /**
   * DevTools client host
   * useful for projects that use a reverse proxy
   * @default false
   * @deprecated This option is deprecated and removed in 7.1.0. The plugin now automatically detects the correct host.
   */
  clientHost?: string | false;
}

const defaultOptions: VitePluginTMagicDevToolsOptions = {
  appendTo: '',
  componentInspector: true,
};

function mergeOptions(options: VitePluginTMagicDevToolsOptions): VitePluginTMagicDevToolsOptions {
  return Object.assign({}, defaultOptions, options);
}

export default function VitePluginTMagicDevTools(options?: VitePluginTMagicDevToolsOptions): PluginOption {
  const tmagicDevtoolsPath = getTMagicDevtoolsPath();
  const inspect = Inspect({
    silent: true,
  });

  const pluginOptions = mergeOptions(options ?? {});

  let config: ResolvedConfig;

  function configureServer(server: ViteDevServer) {
    const base = server.config.base || '/';
    server.middlewares.use(
      `${base}__devtools__`,
      sirv(DIR_CLIENT, {
        single: true,
        dev: true,
      }),
    );

    const _printUrls = server.printUrls;
    const colorUrl = (url: string) => cyan(url.replace(/:(\d+)\//, (_, port) => `:${bold(port)}/`));

    server.printUrls = () => {
      const urls = server.resolvedUrls!;
      const keys = normalizeComboKeyPrint('option-shift-d');
      _printUrls();
      for (const url of urls.local) {
        const devtoolsUrl = url.endsWith('/') ? `${url}__devtools__/` : `${url}/__devtools__/`;
        console.log(
          `  ${green('➜')}  ${bold('TMagic DevTools')}: ${green(
            `Open ${colorUrl(`${devtoolsUrl}`)} as a separate window`,
          )}`,
        );
      }
      console.log(
        `  ${green('➜')}  ${bold('TMagic DevTools')}: ${green(
          `Press ${yellow(keys)} in App to toggle the TMagic DevTools`,
        )}\n`,
      );
    };
  }

  const devtoolsOptionsImporter = 'virtual:tmagic-devtools-options';
  const resolvedDevtoolsOptions = `\0${devtoolsOptionsImporter}`;

  const plugin: PluginOption = {
    name: 'vite-plugin-tmagic-devtools',
    enforce: 'pre',
    apply: 'serve',
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    configureServer(server) {
      configureServer(server);
    },
    async resolveId(importer: string) {
      if (importer === devtoolsOptionsImporter) {
        return resolvedDevtoolsOptions;
      }
      // Why use query instead of vite virtual module on devtools resource?
      // Devtools resource will import `@tmagic/devtools-core` and other packages, which vite cannot analysis correctly on virtual module.
      // So we should use absolute path + `query` to mark the resource as devtools resource.
      if (importer.startsWith('virtual:tmagic-devtools-path:')) {
        const resolved = importer.replace('virtual:tmagic-devtools-path:', `${tmagicDevtoolsPath}/`);
        return `${resolved}${devtoolsNextResourceSymbol}`;
      }
    },
    async load(id) {
      if (id === resolvedDevtoolsOptions) {
        return `export default ${JSON.stringify({
          base: config.base,
          componentInspector: pluginOptions.componentInspector,
        })}`;
      }
      if (id.endsWith(devtoolsNextResourceSymbol)) {
        const filename = removeUrlQuery(id);
        // read file ourselves to avoid getting shut out by vite's fs.allow check
        return await fs.promises.readFile(filename, 'utf-8');
      }
    },
    transform(code, id, options) {
      if (options?.ssr) return;

      const { appendTo } = pluginOptions;
      const [filename] = id.split('?', 2);

      if (
        appendTo &&
        ((typeof appendTo === 'string' && filename.endsWith(appendTo)) ||
          (appendTo instanceof RegExp && appendTo.test(filename)))
      ) {
        code = `import 'virtual:tmagic-devtools-path:overlay.js';\n${code}`;
      }

      return code;
    },
    transformIndexHtml(html) {
      if (pluginOptions.appendTo) return;

      return {
        html,
        tags: [
          {
            tag: 'script',
            injectTo: 'head-prepend',
            attrs: {
              type: 'module',
              src: `${config.base || '/'}@id/virtual:tmagic-devtools-path:overlay.js`,
            },
          },
        ].filter(Boolean) as HtmlTagDescriptor[],
      };
    },
    async buildEnd() {},
  };

  return [inspect as PluginOption, plugin].filter(Boolean);
}
