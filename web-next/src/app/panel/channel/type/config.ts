// See original content in read operation, adapting to TS
export const defaultConfig = {
  input: {
    name: '',
    type: 1,
    key: '',
    base_url: '',
    other: '',
    proxy: '',
    test_model: '',
    model_mapping: [],
    model_headers: [],
    custom_parameter: '',
    models: [],
    groups: ['default'],
    plugin: {},
    tag: '',
    only_chat: false,
    pre_cost: 1,
    disabled_stream: [],
    compatible_response: false,
    auto_ban: 1
  },
  inputLabel: {
    name: '渠道名称',
    type: '渠道类型',
    base_url: '渠道API地址',
    key: '密钥',
    other: '其他参数',
    proxy: '代理地址',
    test_model: '测速模型',
    models: '模型',
    model_mapping: '模型映射关系',
    model_headers: '自定义模型请求头',
    custom_parameter: '额外参数',
    groups: '用户组',
    only_chat: '仅支持聊天',
    tag: '标签',
    provider_models_list: '',
    pre_cost: '预计费选项',
    disabled_stream: '禁用流式的模型',
    compatible_response: '兼容Response API',
    auto_ban: '自动禁用'
  },
  prompt: {
    type: '请选择渠道类型',
    name: '请为渠道命名',
    base_url: '可空，请输入中转API地址，例如通过cloudflare中转',
    key: '请输入渠道对应的鉴权密钥',
    other: '',
    proxy:
      '单独设置代理地址，支持http和socks5，例如：http://127.0.0.1:1080,代理地址中可以通过 `%s` 作为会话标识占位符，程序中检测到有占位符会根据Key生成唯一会话标识符进行替换',
    test_model: '用于测试使用的模型，为空时无法测速,如：gpt-3.5-turbo，仅支持chat模型',
    models:
      '请选择该渠道所支持的模型,你也可以输入通配符*来匹配模型，例如：gpt-3.5*，表示支持所有gpt-3.5开头的模型，*号只能在最后一位使用，前面必须有字符，例如：gpt-3.5*是正确的，*gpt-3.5是错误的',
    model_mapping: '模型映射关系：例如用户请求A模型，实际转发给渠道的模型为B。在B模型加前缀+，表示使用传入模型计费，例如：+gpt-3.5-turbo',
    model_headers: '自定义模型请求头，例如：{"key": "value"}',
    custom_parameter:
      '支持通过 JSON 注入额外参数（可嵌套）。可用控制项：overwrite：设为 true 覆盖同名字段，未设置或 false 时仅补充缺失字段；per_model：设为 true 后按模型名进行参数覆盖，如 {"per_model":true,"gpt-3.5-turbo":{"temperature": 0.7},"gpt-4":{"temperature": 0.5}}；pre_add：设为 true 时在请求入口即完成参数覆盖，否则会在发送请求前再进行参数覆盖，适用于所有渠道（含 Claude、Gemini），如 {"pre_add":true,"overwrite":true,"stream":false}。',
    groups: '请选择该渠道所支持的用户组',
    only_chat: '如果选择了仅支持聊天，那么遇到有函数调用的请求会跳过该渠道',
    provider_models_list: '必须填写所有数据后才能获取模型列表',
    tag: '你可以为你的渠道打一个标签，打完标签后，可以通过标签进行批量管理渠道，注意：设置标签后某些设置只能通过渠道标签修改，无法在渠道列表中修改。',
    pre_cost:
      '这里选择预计费选项，用于预估费用，如果你觉得计算图片占用太多资源，可以选择关闭图片计费。但是请注意：有些渠道在stream下是不会返回tokens的，这会导致输入tokens计算错误。',
    disabled_stream: '这里填写禁用流式的模型，注意：如果填写了禁用流式的模型，那么这些模型在流式请求时会跳过该渠道',
    compatible_response: '兼容Response API',
    auto_ban: '启用后，当渠道出现符合禁用规则的错误时，会自动禁用该渠道。禁用时还需要全局自动禁用设置也处于启用状态'
  },
  modelGroup: 'OpenAI'
};

export const typeConfig: Record<number, any> = {
  1: {
    inputLabel: {
      provider_models_list: '从OpenAI获取模型列表'
    }
  },
  8: {
    inputLabel: {
      provider_models_list: '从渠道获取模型列表'
    },
    prompt: {
      other: ''
    }
  },
  3: {
    inputLabel: {
      base_url: 'AZURE_OPENAI_ENDPOINT',
      other: '默认 API 版本',
      provider_models_list: '从Azure获取已部署模型列表'
    },
    prompt: {
      base_url: '请填写AZURE_OPENAI_ENDPOINT',
      other: '请输入默认API版本，例如：2024-05-01-preview'
    }
  },
  55: {
    inputLabel: {
      base_url: 'AZURE_OPENAI_ENDPOINT',
      other: '默认 API 版本',
      provider_models_list: '从Azure获取已部署模型列表'
    },
    prompt: {
      base_url: '请填写AZURE_OPENAI_ENDPOINT',
      other: '请输入默认API版本，例如：preview OR latest'
    }
  },
  // ... other types mapped directly
};
