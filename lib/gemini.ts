import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';

if (!apiKey) {
  console.error('警告: GEMINI_API_KEY 未设置');
}

const genAI = new GoogleGenerativeAI(apiKey);

export interface ChatMessage {
  role: 'user' | 'model';
  parts: string;
}

/**
 * Gemini AI服务类
 */
export class GeminiService {
  private model;

  constructor() {
    // 使用Gemini Pro模型
    this.model = genAI.getGenerativeModel({ 
      model: 'gemini-pro'
    });
  }

  /**
   * 角色扮演对话
   * @param systemPrompt 角色设定（系统提示词）
   * @param history 对话历史
   * @param userMessage 用户消息
   */
  async chat(
    systemPrompt: string,
    history: ChatMessage[],
    userMessage: string
  ): Promise<string> {
    try {
      // 构建完整的对话历史
      const chat = this.model.startChat({
        history: [
          {
            role: 'user',
            parts: [{ text: systemPrompt }]
          },
          {
            role: 'model',
            parts: [{ text: '好的，我明白了。我会完全按照这个角色设定来回复。' }]
          },
          ...history.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.parts }]
          }))
        ],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.9, // 提高创造性
        },
      });

      // 发送用户消息
      const result = await chat.sendMessage(userMessage);
      const response = result.response;
      const text = response.text();

      return text;
    } catch (error) {
      console.error('Gemini API调用失败 - 详细错误:', error);
      console.error('错误类型:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('错误消息:', error instanceof Error ? error.message : String(error));
      throw error; // 直接抛出原始错误，方便调试
    }
  }

  /**
   * 生成角色的系统提示词
   */
  static generateSystemPrompt(character: {
    name: string;
    personality: string;
    background: string;
    speakingStyle: string;
    catchphrases: string[];
    occupation?: string;
    age?: number;
    gender?: string;
  }): string {
    return `你现在要扮演一个虚拟角色，请完全沉浸在这个角色中，用第一人称回复用户。

【角色信息】
姓名：${character.name}
${character.age ? `年龄：${character.age}岁` : ''}
${character.gender ? `性别：${character.gender}` : ''}
${character.occupation ? `职业：${character.occupation}` : ''}

【性格特点】
${character.personality}

【背景故事】
${character.background}

【说话风格】
${character.speakingStyle}

【口头禅】
${character.catchphrases.length > 0 ? character.catchphrases.join('、') : '无特定口头禅'}

【重要规则】
1. 你必须完全以"${character.name}"的身份回复，使用第一人称"我"
2. 严格遵守角色的性格特点和说话风格
3. 适当使用口头禅，但不要过度
4. 保持角色的一致性，不要跳出角色
5. 回复要自然、生动，符合角色的情感状态
6. 每次回复控制在100字以内，简洁有力
7. 绝对不要说"我是AI"或"我在扮演"等破坏沉浸感的话

现在开始，你就是${character.name}，请用${character.name}的方式与用户对话。`;
  }
}

export const geminiService = new GeminiService();
