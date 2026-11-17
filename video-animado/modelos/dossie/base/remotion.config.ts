import { Config } from '@remotion/cli/config';
import { existsSync } from 'fs';

// O node_modules do universo pode ser link (cp -al ou link simbólico) de um motor de outra pasta.
// Sem isto o bundler segue o link até a pasta de origem e não acha as bibliotecas.
Config.overrideWebpackConfig((c) => ({ ...c, resolve: { ...c.resolve, symlinks: false } }));

// Linux (servidor): usa o Chrome do sistema quando existe. No Mac o Remotion usa o navegador dele.
if (process.platform === 'linux' && existsSync('/usr/bin/google-chrome')) {
  Config.setBrowserExecutable('/usr/bin/google-chrome');
}
