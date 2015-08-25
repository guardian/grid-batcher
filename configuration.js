import path from 'path';
import fs   from 'fs';
import yaml from 'js-yaml';

export function loadConfig(application, file) {
    const configFile = getConfigPath(application, file);
    return yaml.safeLoad(fs.readFileSync(configFile, 'utf8'));;
}

function getConfigPath(application, file) {
    const configDir = process.env.XDG_CONFIG_HOME ||
          (process.env.HOME && path.join(process.env.HOME, '.config'));
    return path.join(configDir, application, file);
}
