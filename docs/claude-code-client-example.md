# Claude Code 客户端使用示例

## 客户端验证机制说明

Claude Code API 具有严格的客户端验证机制，确保只有合法的 Claude Code 客户端才能访问 API，防止通过其他工具进行二次转发。

### 验证要求

1. **User-Agent**: 必须包含 `Claude-Code-Client`
2. **X-Client-Info**: 包含客户端指纹信息
3. **X-Client-Secret**: 基于客户端信息生成的验证密钥
4. **API Key**: 以 `cc-sk-` 开头的专用密钥
5. **进程验证**: 检查进程名称是否为合法的 Claude Code 客户端

## Python 客户端示例

```python
import requests
import json
import hashlib
import platform
import os
import getpass
import psutil

class ClaudeCodeClient:
    def __init__(self, api_key, base_url="http://localhost:3000"):
        self.api_key = api_key
        self.base_url = base_url
        self.client_info = self._get_client_info()
        
    def _get_client_info(self):
        """获取客户端信息"""
        return {
            "machine_id": self._get_machine_id(),
            "platform": platform.system(),
            "hostname": platform.node(),
            "user_id": getpass.getuser(),
            "process_name": "claude-code-client",  # 必须是允许的进程名
            "version": "1.0.0"
        }
    
    def _get_machine_id(self):
        """获取机器ID"""
        try:
            # 在实际实现中，应该使用更可靠的机器ID生成方法
            import uuid
            return str(uuid.getnode())
        except:
            return "default-machine-id"
    
    def _generate_fingerprint(self):
        """生成客户端指纹"""
        data = f"{self.client_info['machine_id']}-{self.client_info['platform']}-{self.client_info['hostname']}-{self.client_info['user_id']}-{self.client_info['process_name']}-{self.client_info['version']}"
        return hashlib.md5(data.encode()).hexdigest()
    
    def _generate_client_secret(self, user_id):
        """生成客户端验证密钥"""
        data = f"{self.client_info['machine_id']}-{self.client_info['process_name']}-{user_id}-claude-code-secret"
        return hashlib.md5(data.encode()).hexdigest()[:16]
    
    def _get_headers(self):
        """获取请求头"""
        return {
            "Authorization": f"Bearer {self.api_key}",
            "User-Agent": "Claude-Code-Client/1.0.0",
            "X-Client-Info": json.dumps(self.client_info),
            "X-Client-Secret": self._generate_client_secret(1),  # 用户ID，实际应用中需要获取
            "Content-Type": "application/json"
        }
    
    def chat_completion(self, messages, model="claude-3-sonnet-20240229", stream=False):
        """发送聊天完成请求"""
        url = f"{self.base_url}/claude-code-api/v1/messages"
        
        payload = {
            "model": model,
            "messages": messages,
            "stream": stream
        }
        
        headers = self._get_headers()
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"请求失败: {e}")
            return None

# 使用示例
if __name__ == "__main__":
    # 替换为您的实际 API Key
    API_KEY = "cc-sk-your-api-key-here"
    
    client = ClaudeCodeClient(API_KEY)
    
    messages = [
        {"role": "user", "content": "请帮我写一个Python函数来计算斐波那契数列"}
    ]
    
    response = client.chat_completion(messages)
    
    if response:
        print("Claude 回复:")
        print(response["choices"][0]["message"]["content"])
    else:
        print("请求失败")
```

## Node.js 客户端示例

```javascript
const crypto = require('crypto');
const os = require('os');
const axios = require('axios');

class ClaudeCodeClient {
    constructor(apiKey, baseUrl = 'http://localhost:3000') {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.clientInfo = this.getClientInfo();
    }

    getClientInfo() {
        return {
            machine_id: this.getMachineId(),
            platform: os.platform(),
            hostname: os.hostname(),
            user_id: os.userInfo().username,
            process_name: 'claude-code-client',
            version: '1.0.0'
        };
    }

    getMachineId() {
        // 简化的机器ID生成，实际应用中应使用更可靠的方法
        const networkInterfaces = os.networkInterfaces();
        const mac = Object.values(networkInterfaces)
            .flat()
            .find(iface => iface && iface.mac && iface.mac !== '00:00:00:00:00:00')?.mac;
        return mac || 'default-machine-id';
    }

    generateFingerprint() {
        const data = `${this.clientInfo.machine_id}-${this.clientInfo.platform}-${this.clientInfo.hostname}-${this.clientInfo.user_id}-${this.clientInfo.process_name}-${this.clientInfo.version}`;
        return crypto.createHash('md5').update(data).digest('hex');
    }

    generateClientSecret(userId) {
        const data = `${this.clientInfo.machine_id}-${this.clientInfo.process_name}-${userId}-claude-code-secret`;
        return crypto.createHash('md5').update(data).digest('hex').substring(0, 16);
    }

    getHeaders() {
        return {
            'Authorization': `Bearer ${this.apiKey}`,
            'User-Agent': 'Claude-Code-Client/1.0.0',
            'X-Client-Info': JSON.stringify(this.clientInfo),
            'X-Client-Secret': this.generateClientSecret(1), // 用户ID，实际应用中需要获取
            'Content-Type': 'application/json'
        };
    }

    async chatCompletion(messages, model = 'claude-3-sonnet-20240229', stream = false) {
        const url = `${this.baseUrl}/claude-code-api/v1/messages`;
        
        const payload = {
            model,
            messages,
            stream
        };

        try {
            const response = await axios.post(url, payload, {
                headers: this.getHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('请求失败:', error.response?.data || error.message);
            return null;
        }
    }
}

// 使用示例
async function main() {
    const apiKey = 'cc-sk-your-api-key-here';
    const client = new ClaudeCodeClient(apiKey);

    const messages = [
        { role: 'user', content: '请帮我写一个JavaScript函数来实现快速排序算法' }
    ];

    const response = await client.chatCompletion(messages);

    if (response) {
        console.log('Claude 回复:');
        console.log(response.choices[0].message.content);
    } else {
        console.log('请求失败');
    }
}

main();
```

## Go 客户端示例

```go
package main

import (
    "bytes"
    "crypto/md5"
    "encoding/hex"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "os"
    "os/user"
    "runtime"
)

type ClaudeCodeClient struct {
    APIKey     string
    BaseURL    string
    ClientInfo ClientInfo
}

type ClientInfo struct {
    MachineID   string `json:"machine_id"`
    Platform    string `json:"platform"`
    Hostname    string `json:"hostname"`
    UserID      string `json:"user_id"`
    ProcessName string `json:"process_name"`
    Version     string `json:"version"`
}

type ChatMessage struct {
    Role    string `json:"role"`
    Content string `json:"content"`
}

type ChatRequest struct {
    Model    string        `json:"model"`
    Messages []ChatMessage `json:"messages"`
    Stream   bool          `json:"stream"`
}

type ChatResponse struct {
    Object  string `json:"object"`
    Model   string `json:"model"`
    Choices []struct {
        Index   int `json:"index"`
        Message struct {
            Role    string `json:"role"`
            Content string `json:"content"`
        } `json:"message"`
        FinishReason string `json:"finish_reason"`
    } `json:"choices"`
}

func NewClaudeCodeClient(apiKey, baseURL string) *ClaudeCodeClient {
    if baseURL == "" {
        baseURL = "http://localhost:3000"
    }

    client := &ClaudeCodeClient{
        APIKey:  apiKey,
        BaseURL: baseURL,
    }
    client.ClientInfo = client.getClientInfo()
    return client
}

func (c *ClaudeCodeClient) getClientInfo() ClientInfo {
    hostname, _ := os.Hostname()
    currentUser, _ := user.Current()

    return ClientInfo{
        MachineID:   c.getMachineID(),
        Platform:    runtime.GOOS,
        Hostname:    hostname,
        UserID:      currentUser.Username,
        ProcessName: "claude-code-client",
        Version:     "1.0.0",
    }
}

func (c *ClaudeCodeClient) getMachineID() string {
    // 简化的机器ID生成
    hostname, _ := os.Hostname()
    return fmt.Sprintf("%x", md5.Sum([]byte(hostname)))
}

func (c *ClaudeCodeClient) generateClientSecret(userID int) string {
    data := fmt.Sprintf("%s-%s-%d-claude-code-secret", 
        c.ClientInfo.MachineID, 
        c.ClientInfo.ProcessName, 
        userID)
    hash := md5.Sum([]byte(data))
    return hex.EncodeToString(hash[:])[:16]
}

func (c *ClaudeCodeClient) getHeaders() map[string]string {
    clientInfoJSON, _ := json.Marshal(c.ClientInfo)
    
    return map[string]string{
        "Authorization":  fmt.Sprintf("Bearer %s", c.APIKey),
        "User-Agent":     "Claude-Code-Client/1.0.0",
        "X-Client-Info":  string(clientInfoJSON),
        "X-Client-Secret": c.generateClientSecret(1), // 用户ID，实际应用中需要获取
        "Content-Type":   "application/json",
    }
}

func (c *ClaudeCodeClient) ChatCompletion(messages []ChatMessage) (*ChatResponse, error) {
    url := fmt.Sprintf("%s/claude-code-api/v1/messages", c.BaseURL)
    
    request := ChatRequest{
        Model:    "claude-3-sonnet-20240229",
        Messages: messages,
        Stream:   false,
    }
    
    requestBody, err := json.Marshal(request)
    if err != nil {
        return nil, err
    }
    
    req, err := http.NewRequest("POST", url, bytes.NewBuffer(requestBody))
    if err != nil {
        return nil, err
    }
    
    headers := c.getHeaders()
    for key, value := range headers {
        req.Header.Set(key, value)
    }
    
    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()
    
    body, err := io.ReadAll(resp.Body)
    if err != nil {
        return nil, err
    }
    
    if resp.StatusCode != http.StatusOK {
        return nil, fmt.Errorf("API 请求失败: %s", string(body))
    }
    
    var response ChatResponse
    err = json.Unmarshal(body, &response)
    if err != nil {
        return nil, err
    }
    
    return &response, nil
}

func main() {
    apiKey := "cc-sk-your-api-key-here"
    client := NewClaudeCodeClient(apiKey, "")
    
    messages := []ChatMessage{
        {Role: "user", Content: "请帮我写一个Go函数来实现二分查找算法"},
    }
    
    response, err := client.ChatCompletion(messages)
    if err != nil {
        fmt.Printf("请求失败: %v\n", err)
        return
    }
    
    fmt.Println("Claude 回复:")
    fmt.Println(response.Choices[0].Message.Content)
}
```

## 安全说明

1. **API Key 保护**: 永远不要在代码中硬编码 API Key，使用环境变量或配置文件
2. **客户端验证**: 系统会验证客户端的合法性，确保只有真正的 Claude Code 客户端才能访问
3. **设备限制**: 每个订阅有设备数量限制，超出限制需要管理员审批
4. **使用量监控**: 系统会监控 API 使用量，防止滥用

## 错误处理

常见错误码：
- `MISSING_API_KEY`: 缺少 API Key
- `INVALID_API_KEY_FORMAT`: API Key 格式错误
- `INVALID_API_KEY`: API Key 无效
- `SUBSCRIPTION_LIMIT_EXCEEDED`: 订阅使用量已达上限
- `CLIENT_VALIDATION_FAILED`: 客户端验证失败
- `MONTHLY_LIMIT_EXCEEDED`: 月度使用量已达上限

## 注意事项

1. 确保进程名称包含 `claude-code` 关键词
2. 不要试图修改 User-Agent 或其他验证头部
3. 客户端指纹生成后会被系统记录，更换设备需要重新授权
4. API 使用量会被实时监控和记录
