import {
    SFCComponent,
    Component,
    ComponentProps,
    ExtensionType,
    ComponentEvents,
    ComponentDirectives,
    ComponentSlots,
    ComponentSlot,
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
            ${compilerTemplate(item.component)}
        </template>`;
        }
        return `<template #${item.name}>
            ${compilerTemplate(item.component)}
        </template>`;
    });
}

export function compilerTemplate(component: Component): string {
    return `<${component.componentName} ${compilerDirectives(
        component.directives,
    )} ${compilerProps(component.props)} ${compilerEvents(component.events)} ${
        component.children || component.slots
            ? `>
                ${
                    component.children
                        ? component.children.map(compilerTemplate)
                        : ''
                }
                ${component.slots ? compilerSlots(component.slots) : ''}
                </${component.componentName}>`
            : ' />'
    }`;
}

export function compilerComponent(component: Component) {
    return {};
}

export function compilerSFC(sfc: SFCComponent) {
    return {};
}
