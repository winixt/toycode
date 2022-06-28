import { isEmpty } from 'lodash-es';
import { join } from 'path';
import { genImportCode } from '../utils';
import {
    SFCComponent,
    Component,
    ComponentProps,
    ExtensionType,
    ComponentEvents,
    ComponentDirectives,
    ComponentSlots,
    ComponentSlot,
    PreChangeFile,
    ImportSource,
} from '../type';

export function compilerProps(props?: ComponentProps) {
    if (!props) {
        return '';
    }
    return Object.keys(props)
        .map((key) => {
            const prop = props[key];
            if (prop.type === ExtensionType.JSExpression) {
                return `:${key}="${prop.value}"`;
            }
            if (prop.type === 'boolean' && prop.value) {
                return `${key}`;
            }
            if (prop.type === 'boolean' && !prop.value) {
                return `:${key}="false"`;
            }
            if (prop.type === 'number') {
                return `:${key}="${prop.value}"`;
            }
            if (prop.value) {
                return `${key}="${prop.value}"`;
            }
            return '';
        })
        .join(' ');
}

export function compilerEvents(events?: ComponentEvents) {
    if (!events) {
        return '';
    }
    return Object.keys(events)
        .map((key) => {
            const value = events[key];
            if (value) {
                return `@${key}="${value}"`;
            }
            return '';
        })
        .join(' ');
}

export function compilerDirectives(directives?: ComponentDirectives) {
    if (!directives) {
        return '';
    }
    return Object.keys(directives)
        .map((key) => {
            const value = directives[key];
            if (value) {
                return `${key}="${value}"`;
            }
            return '';
        })
        .join(' ');
}

export function compilerSlots(slots: ComponentSlots): string[] {
    return slots.slots.map((item: ComponentSlot) => {
        if (item.scoped) {
            return `<template #${item.name}="${item.scoped}">
            ${compilerComponent(item.component)}
        </template>`;
        }
        return `<template #${item.name}>
            ${compilerComponent(item.component)}
        </template>`;
    });
}

export function compilerComponent(component: Component): string {
    return `<${component.componentName} ${compilerDirectives(
        component.directives,
    )} ${compilerProps(component.props)} ${compilerEvents(component.events)} ${
        !isEmpty(component.children) || !isEmpty(component.slots)
            ? `>
                ${
                    component.children
                        ? component.children.map(compilerComponent)
                        : ''
                }
                ${component.slots ? compilerSlots(component.slots) : ''}
                </${component.componentName}>`
            : ' />'
    }`;
}

export function genPropsDefinition(sfc: SFCComponent) {
    if (!isEmpty(sfc.propsDefinition)) {
        const props = sfc.propsDefinition.map((item) => {
            return `${item.name}: ${item.propType}`;
        });
        const propsDefaultValue = sfc.propsDefinition
            .filter((item) => item.defaultValue != null)
            .map((item) => {
                return `${item.name}: ${item.defaultValue}`;
            });
        return `
        const props = withDefaults(defineProps({
            ${props.join(',')}
        }), {
            ${propsDefaultValue.join(',')}
        })
        `;
    }
    return '';
}

export function genEmitsDefinition(sfc: SFCComponent) {
    if (!isEmpty(sfc.emitsDefinition)) {
        if (Array.isArray(sfc.emitsDefinition)) {
            return `
            const emit = defineEmits([${sfc.emitsDefinition.join(', ')}])
            `;
        }
        return `
        const emit = defineEmits({
            ${Object.keys(sfc.emitsDefinition)
                .map((key: string) => {
                    return `${key}: ${sfc.emitsDefinition[key as any]}`;
                })
                .join(', ')}
        })
        `;
    }
    return '';
}

export function genSetupCode(sfc: SFCComponent) {
    const importSources = genImportCode(
        sfc.setupCodes.reduce((acc, cur) => {
            return acc.concat(cur.importSources);
        }, [] as ImportSource[]),
    );

    return `
    <script setup>
    ${importSources}

    ${genEmitsDefinition(sfc)}

    ${sfc.setupCodes.map((item) => item.content).join('\n')}
    </script>
    `;
}

// TODO 支持独立 css 文件
export function genStyle(sfc: SFCComponent) {
    const css = sfc.css;
    if (!css) return '';
    return `<style lang="${css.lang}" ${css.scoped ? 'scoped' : ''}>
    ${css.content}
    </style>`;
}

export function compilerSFC(sfc: SFCComponent): PreChangeFile {
    return {
        file: join(sfc.dir || '', sfc.fileName),
        content: `
        <template>
            ${sfc.children.map(compilerComponent).join('\n')}
        </template>

        ${genSetupCode(sfc)}

        ${genStyle(sfc)}
        `,
    };
}
