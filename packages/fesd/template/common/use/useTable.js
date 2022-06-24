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
    const dataSource = ref([]);

    const queryDataSource = () => {
        request(options.url, options.params ? unref(options.params) : {}).then((res) => {
            const result = options.dataField ? res[options.dataField] : res;
            dataSource.value = options.transform ? options.transform(result) : result;
        });
    };

    queryDataSource();

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
        ...options,
        isInit: true,
        dataField: 'cycle',
        pageField: 'page',
    };
    const dataSource = ref([]);

    const pagination = reactive({
        currentPage: 1,
        pageSize: 10,
        totalCount: 1000,
    });

    const queryDataSource = () => {
        request('/tablePage', {
            ...(options.params ? unref(options.params) : {}),
            page: {
                current: pagination.currentPage,
                pageSize: pagination.pageSize,
            },
        }).then((res) => {
            const result = res[options.dataField];
            dataSource.value = options.transform ? options.transform(result) : result;
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

    const refresh = () => {
        pagination.currentPage = 1;
        queryDataSource();
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
