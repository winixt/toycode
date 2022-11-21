import { Config } from '@qlin/toycode-core';
import { defaultDependencies } from './config';
import { Dependence } from './dependence';

export const SOURCE_CODE_PATH = 'src';
export const SOURCE_CODE_PATH_IMPORT = '@';
export const USE_DIR = 'common/use';
export const CONSTANTS_FILE_PATH = 'common/constants.js';
export const UTILS_FILE_PATH = 'common/utils.js';
export const PAGES_DIR = 'pages';
export const COMPONENTS_DIR = 'components';

function handleImpPath(filePath: string) {
    return filePath.replace(/\.[jt]s/, '');
}

export class Context {
    config: Config = {};
    dependence: Dependence;
    constructor(config: Config) {
        this.config = config;
        this.dependence = new Dependence(defaultDependencies);
    }
    getConstantsFilePath() {
        return this.config.path?.constants || CONSTANTS_FILE_PATH;
    }
    getConstantsFilePathImp() {
        return handleImpPath(
            `${SOURCE_CODE_PATH_IMPORT}/${this.getConstantsFilePath()}`,
        );
    }

    getUtilsFilePath() {
        return this.config.path?.utils || UTILS_FILE_PATH;
    }
    getUtilsFilePathImp() {
        return handleImpPath(
            `${SOURCE_CODE_PATH_IMPORT}/${this.getUtilsFilePath()}`,
        );
    }

    getUseDir() {
        return this.config.path?.useDir || USE_DIR;
    }
    getUseDirImp() {
        return `${SOURCE_CODE_PATH_IMPORT}/${this.getUseDir()}`;
    }

    getPagesDir() {
        return this.config.path?.pagesDir || PAGES_DIR;
    }
    getPagesDirImp() {
        return `${SOURCE_CODE_PATH_IMPORT}/${this.getPagesDir()}`;
    }

    getComponentsDir() {
        return this.config.path?.componentsDir || COMPONENTS_DIR;
    }
    getComponentsDirImp() {
        return `${SOURCE_CODE_PATH_IMPORT}/${this.getComponentsDir()}`;
    }
}
