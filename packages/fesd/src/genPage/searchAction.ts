import { ListPageConfig } from '../type';
import { isReactiveSearch } from '../utils';
import { SFCComponent, Component, ImportType } from '@qlin/toycode-core';

function findSearchForm(components: Component[]): Component {
    for (const component of components) {
        if (component.componentName === 'FForm') {
            return component;
        }
    }
    return findSearchForm(
        components.reduce((acc, cur) => {
            if (cur.children) {
                acc = acc.concat(cur.children as Component[]);
            }
            return acc;
        }, [] as Component[]),
    );
}

export function handleSearchAction(
    pageConfig: ListPageConfig,
    sfc: SFCComponent,
) {
    const params = pageConfig.query.params;
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
        const actionTemplate = {
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
        const searchForm = findSearchForm(sfc.children);
        const actionFormItem = searchForm.children[
            searchForm.children.length - 1
        ] as Component;
        if (!actionFormItem.props?.label) {
            actionFormItem.children.unshift(actionTemplate);
        } else {
            searchForm.children.push({
                componentName: 'FFormItem',
                children: [actionTemplate],
            });
        }
    }

    return sfc;
}
