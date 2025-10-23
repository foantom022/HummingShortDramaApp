import crypto from 'crypto';

export class VideoService {
  private cdnKey: string;
  private cacheTime: number = 3600; // 1小时

  constructor(cdnKey: string = process.env.CDN_KEY || 'test_key') {
    this.cdnKey = cdnKey;
  }

  /**
   * 生成签名URL - 核心算法
   */
  public generateSignedUrl(videoUrl: string): string {
    // 提取路径（从第7个字符开始找"/"）
    const index = videoUrl.indexOf('/', 7);
    const path = videoUrl.substring(index);

    // 当前时间戳（秒）
    const timestamp = Math.floor(Date.now() / 1000);

    // 构建签名字符串：path|timestamp|cdnKey
    const signUrl = `${path}|${timestamp}|${this.cdnKey}`;

    // MD5签名
    const sign = crypto.createHash('md5').update(signUrl).digest('hex');

    // 返回签名后的URL
    return `${videoUrl}?timestamp=${timestamp}&sign=${sign}`;
  }

  /**
   * 解析play_setting并签名所有URL
   */
  public parseAndSignPlaySetting(playSettingJson: string): {
    super: string;
    high: string;
    normal: string;
  } {
    const parsed = JSON.parse(playSettingJson);
    return {
      super: this.generateSignedUrl(parsed.super),
      high: this.generateSignedUrl(parsed.high),
      normal: this.generateSignedUrl(parsed.normal),
    };
  }

  /**
   * 验证URL是否过期
   */
  public isUrlExpired(signedUrl: string): boolean {
    try {
      const url = new URL(signedUrl);
      const timestamp = parseInt(url.searchParams.get('timestamp') || '0');
      const now = Math.floor(Date.now() / 1000);
      return (now - timestamp) > this.cacheTime;
    } catch {
      return true;
    }
  }
}

// 导出单例
export const videoService = new VideoService();
