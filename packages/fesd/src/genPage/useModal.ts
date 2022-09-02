import { SFCComponent, ImportType, ExtensionType } from '@qlin/toycode-core';
import { ModalConfig, RelationModal } from '../type';
import { insertActionInSearchForm, insertActionInTable } from './shared';

export function applyAddModal(sfc: SFCComponent) {
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

export function applyUpdateModal(sfc: SFCComponent) {
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

export function applyDeleteModal(modal: RelationModal, sfc: SFCComponent) {
    sfc.setupCodes.push({
        importSources: [
            {
                imported: 'request',
                type: ImportType.ImportSpecifier,
                source: '@fesjs/fes',
            },
            {
                imported: 'FTooltip',
                type: ImportType.ImportSpecifier,
                source: '@fesjs/fes-design',
            },
            {
                imported: 'FButton',
                type: ImportType.ImportSpecifier,
                source: '@fesjs/fes-design',
            },
            {
                imported: 'FMessage',
                type: ImportType.ImportSpecifier,
                source: '@fesjs/fes-design',
            },
        ],
        content: `
        const confirmDelete = async (row) => {
            await request('${modal.apiSchema.url}', row);
            FMessage.success('删除成功');
            refresh();
        };
        `,
    });

    const actionComponent = {
        componentName: 'FTooltip',
        props: {
            mode: 'confirm',
        },
        events: {
            ok: 'confirmDelete(row)',
        },
        children: [
            {
                componentName: 'FButton',
                props: {
                    type: 'link',
                },
                children: ['删除'],
            },
        ],
        slots: [
            {
                name: 'title',
                component: {
                    componentName: 'div',
                    children: [modal.title || '确认删除当前内容？'],
                },
            },
        ],
    };

    insertActionInTable(sfc.children, actionComponent);

    return sfc;
}

export function applySimpleUpdateModal(
    modal: RelationModal,
    sfc: SFCComponent,
) {
    const targetField = modal.apiSchema.params[0];
    const functionName = `change${
        targetField.name[0].toUpperCase() + targetField.name.slice(1)
    }`;
    sfc.setupCodes.push({
        importSources: [
            {
                imported: 'request',
                type: ImportType.ImportSpecifier,
                source: '@fesjs/fes',
            },
            {
                imported: 'FTooltip',
                type: ImportType.ImportSpecifier,
                source: '@fesjs/fes-design',
            },
            {
                imported: 'FButton',
                type: ImportType.ImportSpecifier,
                source: '@fesjs/fes-design',
            },
            {
                imported: 'FMessage',
                type: ImportType.ImportSpecifier,
                source: '@fesjs/fes-design',
            },
            {
                imported: 'findAnotherValue',
                type: ImportType.ImportSpecifier,
                source: '@/common/utils',
            },
            {
                imported: 'findAnotherLabel',
                type: ImportType.ImportSpecifier,
                source: '@/common/utils',
            },
            {
                imported: targetField.mappingId,
                type: ImportType.ImportSpecifier,
                source: '@/common/constants',
            },
        ],
        content: `
        const ${functionName} = async (row) => {
            await request('${modal.apiSchema.url}', {
                ${targetField.name}: findAnotherValue(${targetField.mappingId}, row.${targetField.name})
            });
            FMessage.success('修改成功');
            refresh();
        };
        `,
    });

    const actionComponent = {
        componentName: 'FTooltip',
        props: {
            mode: 'confirm',
        },
        events: {
            ok: `${functionName}(row)`,
        },
        children: [
            {
                componentName: 'FButton',
                props: {
                    type: 'link',
                },
                children: [
                    `设置为 {{ findAnotherLabel(row.${targetField.name}) }}`,
                ],
            },
        ],
        slots: [
            {
                name: 'title',
                component: {
                    componentName: 'div',
                    children: [
                        modal.title ||
                            `确认设置为 {{ findAnotherLabel(row.${targetField.name}) }}？`,
                    ],
                },
            },
        ],
    };

    insertActionInTable(sfc.children, actionComponent);

    return sfc;
}

export function applyModal(pageConfig: ModalConfig, sfc: SFCComponent) {
    pageConfig.relationModals.forEach((modal) => {
        if (modal.type === 'add') {
            applyAddModal(sfc);
        } else if (modal.type === 'update') {
            applyUpdateModal(sfc);
        } else if (modal.type === 'delete') {
            applyDeleteModal(modal, sfc);
        } else if (modal.type === 'simpleUpdate') {
            applySimpleUpdateModal(modal, sfc);
        }
    });

    return sfc;
}
