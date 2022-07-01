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
            type: 'string',
            required: true,
            defaultValue: null,
            maxlength: null,
            minLength: null,
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
            type: 'string',
            required: true,
            defaultValue: null,
            maxlength: null,
            minLength: null,
            checked: true,
            componentName: 'input',
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
    page: {
        pick: ['page'],
        fields: [
            {
                name: 'fieldName',
                title: '产品ID',
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
                type: 'string',
                required: true,
                defaultValue: null,
                maxlength: null,
                minLength: null,
                checked: true,
                mappingId: 'xxx',
            }
        ]
    }
}

```
