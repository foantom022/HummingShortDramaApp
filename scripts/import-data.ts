import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

// 加载环境变量
config({ path: path.join(__dirname, '..', '.env.local') });

const prisma = new PrismaClient();

interface RawMovie {
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

interface RawEpisode {
  id: string;
  title: string;
  play_order: number;
  play_setting: string;
}

async function main() {
  console.log('开始导入数据...');

  // 读取data.json文件
  const dataPath = path.join(process.cwd(), '..', 'data.json');
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const movies: RawMovie[] = JSON.parse(rawData);

  console.log(`共有 ${movies.length} 部剧集待导入`);

  let importedCount = 0;

  for (const movie of movies) {
    try {
      // 1. 创建剧集
      const drama = await prisma.drama.create({
        data: {
          originalId: movie.id,
          title: movie.title,
          focus: movie.focus,
          description: movie.description,
          channelName: movie.channel_name,
          copyrightAuthorize: movie.copyright_authorize,
          hPoster: movie.h_poster,
          vPoster: movie.v_poster,
          // 生成模拟数据
          views: Math.floor(Math.random() * 1000000) + 10000,
          likes: Math.floor(Math.random() * 50000) + 1000,
          rating: 7 + Math.random() * 2.5,
          totalEpisodes: movie.episode_list.length,
        },
      });

      // 2. 创建剧集
      for (const episode of movie.episode_list) {
        await prisma.episode.create({
          data: {
            originalId: episode.id,
            dramaId: drama.id,
            title: episode.title,
            playOrder: episode.play_order,
            playSetting: episode.play_setting,
          },
        });
      }

      // 3. 创建标签关联
      for (const tagName of movie.tags) {
        // 查找或创建标签
        let tag = await prisma.tag.findUnique({
          where: { name: tagName },
        });

        if (!tag) {
          tag = await prisma.tag.create({
            data: { name: tagName },
          });
        }

        // 创建关联
        await prisma.dramaTag.create({
          data: {
            dramaId: drama.id,
            tagId: tag.id,
          },
        });
      }

      // 4. 创建演员关联
      for (const actorName of movie.actors) {
        let actor = await prisma.actor.findUnique({
          where: { name: actorName },
        });

        if (!actor) {
          actor = await prisma.actor.create({
            data: { name: actorName },
          });
        }

        await prisma.dramaActor.create({
          data: {
            dramaId: drama.id,
            actorId: actor.id,
          },
        });
      }

      // 5. 创建导演关联
      for (const directorName of movie.directors) {
        let director = await prisma.director.findUnique({
          where: { name: directorName },
        });

        if (!director) {
          director = await prisma.director.create({
            data: { name: directorName },
          });
        }

        await prisma.dramaDirector.create({
          data: {
            dramaId: drama.id,
            directorId: director.id,
          },
        });
      }

      importedCount++;
      if (importedCount % 50 === 0) {
        console.log(`已导入 ${importedCount}/${movies.length} 部剧集`);
      }
    } catch (error) {
      console.error(`导入剧集 ${movie.title} 失败:`, error);
    }
  }

  console.log(`\n数据导入完成！共导入 ${importedCount} 部剧集`);
}

main()
  .catch((e) => {
    console.error('导入失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
