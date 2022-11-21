import { ref } from 'vue';
import { request, RequestOption } from '@fesjs/fes';
import { pickData } from '../utils';

export interface FetchOptions {
    // params?: Record<string, any>;
    immediate?: boolean;
    transform?: <T>(input: T) => T;
    defaultValue: () => Record<string, any>;
    pick?: string[];
}

export function useFetch<R, P>(
    ajax: (params?: P, options?: RequestOption) => Promise<R>,
    options: FetchOptions & {
        params?: P;
    },
) {
    options = Object.assign(
        {
            immediate: true,
        },
        options,
    );
    const data = ref<R>(options.defaultValue?.());
    const pending = ref(false);

    const queryDataSource = async () => {
        try {
            pending.value = true;
            let result: R = await ajax(options.params || ({} as P), {
                mergeRequest: true,
            });
            if (options.pick) {
                result = pickData(result, options.pick) as any as R;
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
