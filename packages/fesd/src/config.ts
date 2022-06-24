import { Schema } from '@qlin/toycode-core';

export const defaultSchema: Schema = {
    config: {
        common: {
            useDir: 'common/use',
            serviceDir: 'common/service',
            constantsPath: 'common/constants.js',
            utilsDir: 'common/utils',
        },
        pageDir: 'pages',
        componentsDir: 'components',
    },
    SFCComponent: [],
    css: {
        lang: 'less',
        content: `.common-page {
            padding: 20px;
            margin: 20px;
            border-radius: 4px;
            background-color: #fff;
            &-form { 
                padding-bottom: 20px;
                margin-bottom: 20px;
                border-bottom: 1px solid #f1f1f2;
                .fes-btn {
                    + .fes-btn {
                        margin-left: 8px;
                    }
                }
            }
            &-pagination {
                margin-top: 20px;
                justify-content: flex-end;
            }
        }`,
        fileName: 'global.less',
    },
};
