import { BlockSchema } from '../type';
import { isReactiveSearch } from '../utils';
import { SFCComponent, ImportType } from '@qlin/toycode-core';
import { insertActionInSearchForm } from './shared';
import { Context } from '../context';

export function applySearchAction(
    ctx: Context,
    pageConfig: BlockSchema,
    sfc: SFCComponent,
) {
    const params = pageConfig.apiSchema.params;
    if (!params?.length) return sfc;

    if (isReactiveSearch(params)) {
        sfc.setupCodes.push({
            importSources: [
                {
                    imported: 'watch',
                    type: ImportType.ImportSpecifier,
                    source: 'vue',
                },
            ],
            content: `
            watch(searchParams, () => {
                refresh(searchParams);
            });
            `,
        });
    } else {
        sfc.setupCodes.push({
            importSources: [
                {
                    imported: 'FButton',
                    type: ImportType.ImportSpecifier,
                    source: '@fesjs/fes-design',
                },
                {
                    imported: 'SearchOutlined',
                    type: ImportType.ImportSpecifier,
                    source: '@fesjs/fes-design/icon',
                },
            ],
            content: '',
        });
        const actionComponent = {
            componentName: 'FButton',
            props: {
                type: 'primary',
            },
            events: {
                click: 'refresh(searchParams)',
            },
            children: ['搜索'],
            slots: [
                {
                    name: 'icon',
                    component: {
                        componentName: 'SearchOutlined',
                    },
                },
            ],
        };
        insertActionInSearchForm(sfc.children, actionComponent);
    }

    return sfc;
}
