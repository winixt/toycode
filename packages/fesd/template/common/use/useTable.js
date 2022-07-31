import { request } from '@fesjs/fes';
import { ref, unref, reactive } from 'vue';
/**
 *
 * @param {
 *  url: string;
 *  params: object | reactiveObject,
 *  transform: function 格式化响应内容,
 *  dataField: string;
 * } options
 *
 */
export function useSimpleTable(options) {
    options = {
        isInit: true,
        ...options,
    };
    const dataSource = ref([]);

    const queryDataSource = (params) => {
        request(options.url, {
            ...options.params,
            ...unref(params),
        }).then((res) => {
            const result = options.dataField ? res[options.dataField] : res;
            dataSource.value = options.transform
                ? options.transform(result)
                : result;
        });
    };

    if (options.isInit) {
        queryDataSource();
    }

    return {
        dataSource,
        refresh: queryDataSource,
    };
}

/**
 *
 * @param {
 *  url: string;
 *  params: object | reactiveObject,
 *  transform: function 格式化响应内容,
 *  dataField: string | 'cycle'
 *  pageField: string | 'page'
 *  isInit: boolean | 'true'
 * } options
 *
 */
export function useTable(options) {
    options = {
        isInit: true,
        dataField: 'cycle',
        pageField: 'page',
        ...options,
    };
    const dataSource = ref([]);

    const pagination = reactive({
        currentPage: 1,
        pageSize: 10,
        totalCount: 1000,
    });

    let preParams = {
        ...options.params,
    };
    const getParams = (params) => {
        if (params) {
            preParams = {
                ...preParams,
                ...unref(params),
            };
        }
        return {
            ...preParams,
            page: {
                current: pagination.currentPage,
                pageSize: pagination.pageSize,
            },
        };
    };

    const queryDataSource = (params) => {
        request('/tablePage', getParams(params)).then((res) => {
            const result = res[options.dataField];
            dataSource.value = options.transform
                ? options.transform(result)
                : result;
            pagination.totalCount = res[options.pageField].totalCount;
        });
    };

    const changePage = (current) => {
        pagination.currentPage = current;
        queryDataSource();
    };
    const changePageSize = (pageSize) => {
        pagination.currentPage = 1;
        pagination.pageSize = pageSize;
        queryDataSource();
    };

    const refresh = (params) => {
        pagination.currentPage = 1;
        queryDataSource(params);
    };

    if (options.isInit) {
        refresh();
    }

    return {
        dataSource,
        pagination,
        changePage,
        changePageSize,
        refresh,
    };
}
