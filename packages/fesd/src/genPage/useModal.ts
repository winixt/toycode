import { SFCComponent, ImportType, ExtensionType } from '@qlin/toycode-core';
import { ListPageConfig } from '../type';
import { insertActionInSearchForm } from './shared';

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
        const addModalVisible = ref(false);
        const showAddModal = () => {
            addModalVisible.value = true;
        };
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
            'v-model:visible': 'addModalVisible',
        },
    });

    const actionComponent = {
        componentName: 'FButton',
        props: {
            type: 'primary',
        },
        events: {
            click: 'showAddModal',
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

export function applyModal(pageConfig: ListPageConfig, sfc: SFCComponent) {
    pageConfig.relationModals.forEach((modal) => {
        if (modal.type === 'add') {
            applyAddModal(pageConfig, sfc);
        }
    });

    return sfc;
}
