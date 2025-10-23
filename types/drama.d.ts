// 原始数据结构（来自data.json）
export interface RawMovie {
  id: string;
  title: string;
  focus: string;
  description: string;
  tags: string[];
  directors: string[];
  actors: string[];
  channel_name: string;
  copyright_authorize: string;
  h_poster: string;
  v_poster: string;
  episode_list: RawEpisode[];
}

export interface RawEpisode {
  id: string;
  title: string;
  play_order: number;
  play_setting: string; // JSON字符串
}

export interface PlaySetting {
  super: string;
  high: string;
  normal: string;
}

// 应用内使用的数据结构
export interface Drama {
  id: string;
  originalId: string;
  title: string;
  focus: string;
  description: string;
  channelName: string;
  copyrightAuthorize?: string;
  hPoster: string;
  vPoster: string;
  views: number;
  likes: number;
  rating: number;
  isCompleted: boolean;
  totalEpisodes: number;
  tags: Tag[];
  actors: Actor[];
  directors: Director[];
  episodes?: Episode[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Episode {
  id: string;
  originalId: string;
  dramaId: string;
  title: string;
  playOrder: number;
  playSetting: string;
  createdAt: Date;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Actor {
  id: string;
  name: string;
}

export interface Director {
  id: string;
  name: string;
}

// API响应类型
export interface DramaListResponse {
  dramas: Drama[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface SignedVideoUrls {
  id: string;
  title: string;
  urls: {
    super: string;
    high: string;
    normal: string;
  };
}
