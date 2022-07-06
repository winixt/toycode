# api design

```js
{
    url: '/query/data',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    reqBody: [
        {
            name: 'fieldName',
            title: '产品ID',
            desc: '备注',
            type: 'string',
            required: true,
            defaultValue: null,
        }
    ],
    resBody: [

    ]
}

```

## 列表接口

```js
{
    url: '/query/data',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    params: [
        {
            name: 'fieldName',
            title: '产品ID',
            desc: '备注',
            type: 'string',
            required: true,
            defaultValue: null,
            checked: true,
            componentName: 'input',
            appendAll: false,
            props: {

            },
            mappingId: 'xxx',
            options: [
                {
                    label: 'xxx',
                    value: 'xxx'
                }
            ],
        }
    ],
    pagination: {
        pick: ['pagination'],
        fields: [
            {
                name: 'fieldName',
                title: '产品ID',
                desc: '备注',
                type: 'string',
                required: true,
                defaultValue: null,
            }
        ]
    }
    resData: {
        pick: ['cycle'],
        fields: [
            {
                name: 'fieldName',
                title: '产品ID',
                desc: '备注',
                type: 'string',
                required: true,
                defaultValue: null,
                checked: true,
                mappingId: 'xxx',
            }
        ]
    }
}

```
