# API 文档

## 基础信息

- **Base URL**: `http://localhost:3000/api` (开发环境)
- **认证方式**: JWT Bearer Token
- **响应格式**: JSON

### 统一响应格式

```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
}
```

错误响应：
```json
{
  "success": false,
  "error": "错误信息"
}
```

---

## 认证相关 API

### 1. 用户注册

**POST** `/api/auth/register`

**请求体:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "用户昵称" // 可选
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "用户昵称",
      "avatar": null,
      "createdAt": "2024-10-19T..."
    }
  },
  "message": "注册成功"
}
```

---

### 2. 用户登录

**POST** `/api/auth/login`

**请求体:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "用户昵称",
      "avatar": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "登录成功"
}
```

**使用Token:**
后续请求需要在Header中添加：
```
Authorization: Bearer {token}
```

---

### 3. 获取用户信息

**GET** `/api/user/profile`

**需要认证:** ✅

**响应:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "用户昵称",
      "avatar": "https://...",
      "createdAt": "2024-10-19T...",
      "stats": {
        "favoriteCount": 10,
        "historyCount": 25,
        "commentCount": 5,
        "likeCount": 15
      }
    }
  }
}
```

---

### 4. 更新用户信息

**PUT** `/api/user/profile`

**需要认证:** ✅

**请求体:**
```json
{
  "name": "新昵称",
  "avatar": "https://新头像URL"
}
```

---

## 剧集相关 API

### 5. 获取剧集列表

**GET** `/api/dramas`

**查询参数:**
- `page`: 页码（默认1）
- `pageSize`: 每页数量（默认20）
- `channel`: 频道筛选（男频/女频）
- `tag`: 标签筛选
- `sort`: 排序方式（views/likes/rating/createdAt，默认views）

**示例:**
```
GET /api/dramas?page=1&pageSize=20&channel=男频&tag=修仙&sort=views
```

**响应:**
```json
{
  "success": true,
  "data": {
    "dramas": [
      {
        "id": "drama_id",
        "title": "绝世神尊",
        "focus": "武者重生诛恶扬善破世间不公",
        "description": "详细介绍...",
        "channelName": "男频",
        "hPoster": "https://...",
        "vPoster": "https://...",
        "views": 552551,
        "likes": 17969,
        "rating": 8.3,
        "isVip": false,
        "totalEpisodes": 10,
        "tags": [
          { "id": "tag_id", "name": "修仙" }
        ],
        "actors": [
          { "id": "actor_id", "name": "小明太极" }
        ],
        "directors": [...],
        "episodeCount": 10,
        "commentCount": 100,
        "favoriteCount": 50
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 1024,
      "totalPages": 52,
      "hasMore": true
    }
  }
}
```

---

### 6. 获取剧集详情

**GET** `/api/dramas/{id}`

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "drama_id",
    "title": "绝世神尊",
    "focus": "...",
    "description": "...",
    "channelName": "男频",
    "copyrightAuthorize": "盛仓影业",
    "hPoster": "https://...",
    "vPoster": "https://...",
    "views": 552551,
    "likes": 17969,
    "rating": 8.3,
    "isVip": false,
    "totalEpisodes": 10,
    "tags": [...],
    "actors": [...],
    "directors": [...],
    "episodes": [
      {
        "id": "episode_id",
        "title": "第一集",
        "playOrder": 1
      }
    ],
    "commentCount": 100,
    "favoriteCount": 50
  }
}
```

---

### 7. 获取视频签名URL

**GET** `/api/episodes/{id}/sign`

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "episode_id",
    "title": "第一集",
    "playOrder": 1,
    "dramaId": "drama_id",
    "dramaTitle": "绝世神尊",
    "urls": {
      "super": "https://...?timestamp=...&sign=...",
      "high": "https://...?timestamp=...&sign=...",
      "normal": "https://...?timestamp=...&sign=..."
    }
  }
}
```

---

## 搜索相关 API

### 8. 搜索剧集

**GET** `/api/search`

**查询参数:**
- `q`: 搜索关键词（必填）
- `page`: 页码（默认1）
- `pageSize`: 每页数量（默认20）

**示例:**
```
GET /api/search?q=修仙&page=1
```

**响应:** 同剧集列表格式

---

### 9. 搜索建议

**GET** `/api/search/suggestions`

**查询参数:**
- `q`: 搜索关键词

**响应:**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "id": "drama_id",
        "text": "绝世神尊",
        "type": "drama",
        "meta": "552551 次播放"
      },
      {
        "id": "actor_id",
        "text": "小明太极",
        "type": "actor",
        "meta": "5 部作品"
      },
      {
        "id": "tag_id",
        "text": "修仙",
        "type": "tag",
        "meta": "200 部剧集"
      }
    ],
    "query": "修仙"
  }
}
```

---

### 10. 获取所有标签

**GET** `/api/tags`

**响应:**
```json
{
  "success": true,
  "data": {
    "tags": [
      {
        "id": "tag_id",
        "name": "修仙",
        "dramaCount": 200
      }
    ]
  }
}
```

---

## 互动功能 API

### 11. 点赞剧集

**POST** `/api/dramas/{id}/like`

**需要认证:** ✅

**响应:**
```json
{
  "success": true,
  "message": "点赞成功"
}
```

---

### 12. 取消点赞

**DELETE** `/api/dramas/{id}/like`

**需要认证:** ✅

---

### 13. 收藏剧集

**POST** `/api/dramas/{id}/favorite`

**需要认证:** ✅

---

### 14. 取消收藏

**DELETE** `/api/dramas/{id}/favorite`

**需要认证:** ✅

---

### 15. 获取评论列表

**GET** `/api/comments`

**查询参数:**
- `dramaId`: 剧集ID（必填）
- `page`: 页码（默认1）
- `pageSize`: 每页数量（默认20）

**响应:**
```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": "comment_id",
        "content": "太好看了！",
        "user": {
          "id": "user_id",
          "name": "用户昵称",
          "avatar": "https://..."
        },
        "likeCount": 10,
        "replyCount": 3,
        "replies": [
          {
            "id": "reply_id",
            "content": "同感！",
            "user": {...}
          }
        ],
        "createdAt": "2024-10-19T..."
      }
    ],
    "pagination": {...}
  }
}
```

---

### 16. 发表评论

**POST** `/api/comments`

**需要认证:** ✅

**请求体:**
```json
{
  "dramaId": "drama_id",
  "content": "评论内容",
  "parentId": "parent_comment_id" // 可选，回复评论时使用
}
```

---

## 个人中心 API

### 17. 获取收藏列表

**GET** `/api/user/favorites`

**需要认证:** ✅

**查询参数:**
- `page`: 页码
- `pageSize`: 每页数量

---

### 18. 获取观看历史

**GET** `/api/user/history`

**需要认证:** ✅

**查询参数:**
- `page`: 页码
- `pageSize`: 每页数量

**响应:**
```json
{
  "success": true,
  "data": {
    "histories": [
      {
        "id": "history_id",
        "drama": {
          "id": "drama_id",
          "title": "绝世神尊",
          "focus": "...",
          "vPoster": "https://...",
          "totalEpisodes": 10,
          "isVip": false
        },
        "episodeId": "episode_id",
        "progress": 120, // 播放进度（秒）
        "updatedAt": "2024-10-19T..."
      }
    ],
    "pagination": {...}
  }
}
```

---

### 19. 记录观看历史

**POST** `/api/user/history`

**需要认证:** ✅

**请求体:**
```json
{
  "dramaId": "drama_id",
  "episodeId": "episode_id",
  "progress": 120 // 播放进度（秒）
}
```

---

## 信息流 API

### 20. 获取信息流（类抖音）

**GET** `/api/feed`

**查询参数:**
- `cursor`: 游标（可选，用于分页）
- `limit`: 每次加载数量（默认10）

**响应:**
```json
{
  "success": true,
  "data": {
    "dramas": [
      {
        "id": "drama_id",
        "title": "绝世神尊",
        "focus": "...",
        "description": "...",
        "vPoster": "https://...",
        "hPoster": "https://...",
        "channelName": "男频",
        "views": 552551,
        "likes": 17969,
        "rating": 8.3,
        "isVip": false,
        "totalEpisodes": 10,
        "tags": ["修仙", "动漫"],
        "actors": ["小明太极"],
        "firstEpisode": {
          "id": "episode_id",
          "title": "第一集",
          "playOrder": 1
        },
        "stats": {
          "commentCount": 100,
          "favoriteCount": 50,
          "likeCount": 17969
        },
        "userStatus": { // 仅登录用户返回
          "isLiked": true,
          "isFavorited": false
        }
      }
    ],
    "nextCursor": "next_drama_id",
    "hasMore": true
  }
}
```

---

## AI Chatbot API

### 21. 获取AI角色列表

**GET** `/api/ai/characters`

**响应:**
```json
{
  "success": true,
  "data": {
    "characters": [
      {
        "id": "character_id",
        "name": "陆景琛",
        "avatar": "https://...",
        "personality": "冷酷、霸道、占有欲强...",
        "background": "陆氏集团总裁，28岁...",
        "occupation": "陆氏集团总裁",
        "age": 28,
        "gender": "男",
        "catchphrases": [
          "我说过的话，从不重复第二遍",
          "你只需要听我的"
        ],
        "drama": null // 如果关联了剧集
      }
    ]
  }
}
```

---

### 22. 与AI角色对话

**POST** `/api/ai/chat`

**需要认证:** ✅

**请求体:**
```json
{
  "characterId": "character_id",
  "message": "你好，陆总",
  "conversationId": "conversation_id" // 可选，继续之前的对话
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "conversationId": "conversation_id",
    "message": {
      "id": "message_id",
      "role": "assistant",
      "content": "嗯，你来了。有什么事直接说。",
      "createdAt": "2024-10-19T..."
    },
    "character": {
      "id": "character_id",
      "name": "陆景琛",
      "avatar": "https://..."
    }
  }
}
```

---

### 23. 获取对话历史

**GET** `/api/ai/chat`

**需要认证:** ✅

**查询参数:**
- `conversationId`: 对话ID（可选）

**不带conversationId - 获取所有对话列表:**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "conversation_id",
        "character": {
          "id": "character_id",
          "name": "陆景琛",
          "avatar": "https://..."
        },
        "lastMessage": {
          "role": "assistant",
          "content": "别让我等太久。",
          "createdAt": "2024-10-19T..."
        },
        "updatedAt": "2024-10-19T..."
      }
    ]
  }
}
```

**带conversationId - 获取完整对话历史:**
```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "conversation_id",
      "character": {
        "id": "character_id",
        "name": "陆景琛",
        "avatar": "https://...",
        "personality": "...",
        "occupation": "陆氏集团总裁"
      },
      "messages": [
        {
          "id": "msg1",
          "role": "user",
          "content": "你好，陆总",
          "createdAt": "2024-10-19T..."
        },
        {
          "id": "msg2",
          "role": "assistant",
          "content": "嗯，你来了。有什么事直接说。",
          "createdAt": "2024-10-19T..."
        }
      ],
      "createdAt": "2024-10-19T...",
      "updatedAt": "2024-10-19T..."
    }
  }
}
```

---

## 错误码说明

- `400`: 请求参数错误
- `401`: 未登录或登录已过期
- `404`: 资源不存在
- `500`: 服务器内部错误

---

## 使用示例（JavaScript）

```javascript
// 登录
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const { data } = await loginResponse.json();
const token = data.token;

// 使用token获取用户信息
const profileResponse = await fetch('/api/user/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// 点赞剧集
await fetch('/api/dramas/drama_id/like', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```
