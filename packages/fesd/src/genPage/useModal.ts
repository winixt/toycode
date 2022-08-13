import { SFCComponent, ImportType, ExtensionType } from '@qlin/toycode-core';
import { ListPageConfig } from '../type';
import { insertActionInSearchForm, insertActionInTable } from './shared';

export function applyAddModal(pageConfig: ListPageConfig, sfc: SFCComponent) {
    sfc.setupCodes.push({
        importSources: [
            {
                imported: 'AddModal',
                type: ImportType.ImportDefaultSpecifier,
                source: './components/addModal.vue',
            },
            {
                imported: 'ref',
                type: ImportType.ImportSpecifier,
                source: 'vue',
            },
            {
                imported: 'useAddModal',
                type: ImportType.ImportSpecifier,
                source: '@/common/use/useModal',
            },

            {
                imported: 'FButton',
                type: ImportType.ImportSpecifier,
                source: '@fesjs/fes-design',
            },
            {
                imported: 'PlusOutlined',
                type: ImportType.ImportSpecifier,
                source: '@fesjs/fes-design/icon',
            },
        ],
        content: `
        const addModal = useAddModal();
        `,
    });
    sfc.children.push({
        componentName: 'AddModal',
        props: {
            onSuccess: {
                value: 'refresh',
                type: ExtensionType.JSExpression,
            },
        },
        directives: {
            'v-model:visible': 'addModal.visible',
        },
    });

    const actionComponent = {
        componentName: 'FButton',
        props: {
            type: 'primary',
        },
        events: {
            click: 'addModal.show',
        },
        children: ['新增'],
        slots: [
            {
                name: 'icon',
                component: {
                    componentName: 'PlusOutlined',
                },
            },
        ],
    };
    insertActionInSearchForm(sfc.children, actionComponent);

    return sfc;
}

export function applyUpdateModal(
    pageConfig: ListPageConfig,
    sfc: SFCComponent,
) {
    sfc.setupCodes.push({
        importSources: [
            {
                imported: 'UpdateModal',
                type: ImportType.ImportDefaultSpecifier,
                source: './components/updateModal.vue',
            },
            {
                imported: 'ref',
                type: ImportType.ImportSpecifier,
                source: 'vue',
            },
            {
                imported: 'useUpdateModal',
                type: ImportType.ImportSpecifier,
                source: '@/common/use/useModal',
            },
            {
                imported: 'FButton',
                type: ImportType.ImportSpecifier,
                source: '@fesjs/fes-design',
            },
        ],
        content: `
        const updateModal = useUpdateModal();
        `,
    });
    sfc.children.push({
        componentName: 'UpdateModal',
        props: {
            onSuccess: {
                value: 'refresh',
                type: ExtensionType.JSExpression,
            },
        },
        directives: {
            'v-model:visible': 'updateModal.visible',
        },
    });

    const actionComponent = {
        componentName: 'FButton',
        props: {
            type: 'link',
        },
        events: {
            click: 'updateModal.show(row)',
        },
        children: ['编辑'],
    };

    insertActionInTable(sfc.children, actionComponent);

    return sfc;
}

export function applyModal(pageConfig: ListPageConfig, sfc: SFCComponent) {
    pageConfig.relationModals.forEach((modal) => {
        if (modal.type === 'add') {
            applyAddModal(pageConfig, sfc);
        } else if (modal.type === 'update') {
            applyUpdateModal(pageConfig, sfc);
        }
    });

    return sfc;
}
