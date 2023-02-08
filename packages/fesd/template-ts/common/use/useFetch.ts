import { ref, Ref } from 'vue';
import { request } from '@fesjs/fes';
import { pickData } from '../utils';

export interface FetchOptions {
    params?: Record<string, any>;
    immediate?: boolean;
    transform?: <T>(input: T) => T;
    defaultValue: () => Record<string, any>;
    pick?: string[];
}

/**
 *
 * @param {*} url
 * @param {*} options
 */
export function useFetch(url: string, options: FetchOptions) {
    options = Object.assign(
        {
            immediate: true,
        },
        options,
    );
    const data: Ref<Record<string, any>> = ref(options.defaultValue?.());
    const pending: Ref<boolean> = ref(false);

    const queryDataSource = async () => {
        try {
            pending.value = true;
            let result = await request(url, options.params || {}, {
                mergeRequest: true,
            });
            if (options.pick) {
                result = pickData(result, options.pick);
            }
            data.value =
                (options.transform ? options.transform(result) : result) ??
                options.defaultValue?.();
        } catch (e) {
            console.log(e);
        } finally {
            pending.value = false;
        }
    };

    if (options.immediate) {
        queryDataSource();
    }

    return {
        data,
        pending,
        refresh: queryDataSource,
    };
}
