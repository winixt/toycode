import { Schema } from '@qlin/toycode-core';

export const defaultSchema: Schema = {
    SFCComponent: [],
    dependencies: [
        {
            package: 'vue',
            version: '3.2.37',
        },
        {
            package: 'lodash-es',
            version: '4.17.21',
        },
        {
            package: 'lodash-es',
            version: '4.17.21',
        },
        {
            package: '@fesjs/fes',
            version: '3.0.0-beta.4',
        },
        {
            package: '@fesjs/fes-design',
            version: '0.5.13',
        },
    ],
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
