import { Config } from '@qlin/toycode-core';
import { basename, dirname } from 'path';
import { defaultDependencies } from './config';
import { Dependence } from './dependence';

export const SCRIPT_LANGUAGE = 'js'; // 枚举值: js、ts
export const SOURCE_CODE_PATH = 'src';
export const SOURCE_CODE_PATH_IMPORT = '@';
export const USE_DIR = 'common/use';
export const CONSTANTS_FILE_PATH = 'common/constants';
export const UTILS_FILE_PATH = 'common/utils';
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

    getScriptLanguage() {
        return this.config?.scriptLanguage || SCRIPT_LANGUAGE;
    }

    getConstantsFilePath() {
        return (
            this.config.path?.constants ||
            `${CONSTANTS_FILE_PATH}.${this.getScriptLanguage()}`
        );
    }
    getConstantsFilePathImp() {
        return handleImpPath(
            `${SOURCE_CODE_PATH_IMPORT}/${this.getConstantsFilePath()}`,
        );
    }

    getUtilsFilePath() {
        return (
            this.config.path?.utils ||
            `${UTILS_FILE_PATH}.${this.getScriptLanguage()}`
        );
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
    getUseDirAndFileName(fileName: string) {
        const useFile = fileName.split('.')[0];
        const userPathConfig = (this.config.path || {}) as any;
        if (userPathConfig[useFile]) {
            return {
                dir: dirname(userPathConfig[useFile]),
                fileName: basename(userPathConfig[useFile]),
            };
        }
        return {
            dir: this.getUseDir(),
            fileName,
        };
    }
    getUseTableImp() {
        if (this.config.path?.useTable) {
            return `${SOURCE_CODE_PATH_IMPORT}/${this.config.path?.useTable}`;
        }
        return `${this.getUseDirImp()}/useTable`;
    }
    getUseFetchImp() {
        if (this.config.path?.useFetch) {
            return `${SOURCE_CODE_PATH_IMPORT}/${this.config.path?.useFetch}`;
        }
        return `${this.getUseDirImp()}/useFetch`;
    }
    getUseModelImp() {
        if (this.config.path?.useModel) {
            return `${SOURCE_CODE_PATH_IMPORT}/${this.config.path?.useModel}`;
        }
        return `${this.getUseDirImp()}/useModel`;
    }
    getUseModalImp() {
        if (this.config.path?.useModal) {
            return `${SOURCE_CODE_PATH_IMPORT}/${this.config.path?.useModal}`;
        }
        return `${this.getUseDirImp()}/useModal`;
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
