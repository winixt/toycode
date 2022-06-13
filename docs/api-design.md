# 对接口的要求

请求参数类型 `string` `number` `array`。

响应内容类型 `string` `number` `object` `array`。

```json
{
    "url": "api/query/data",
    "headers": {
        "name": "value"
    },
    "requestBody": {
        "type": "object",
        "properties": {
            "param1": {
                "type": "number",
                "title": "参数1"
            },
            "param2": {
                "type": "string",
                "title": "参数2",
                "options": [
                    {
                        "value": "xxxx",
                        "label": "xxx"
                    }
                ]
            }
        }
    },
    "responseBody": {
        "type": "object",
        "properties": {
            "code": {
                "type": "string",
                "title": "响应码"
            },
            "result": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "faqId": {
                            "type": "string",
                            "title": "faqId"
                        }
                    }
                }
            }
        }
    }
}
```
