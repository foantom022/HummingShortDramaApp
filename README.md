# 🎬 Short Drama APP  
ผลงานประกวด **Xiaomi AI Programming Contest**

เว็บแอปสำหรับรับชมละครสั้นแบบสมจริง (Immersive Experience) พัฒนาด้วย **Next.js 14** รองรับการเล่นวิดีโอแบบเต็มหน้าจอ การปัดเพื่อเปลี่ยนเรื่อง การค้นหาอัจฉริยะ และระบบโต้ตอบกับผู้ใช้

---

## 🚀 เทคโนโลยีที่ใช้ (Tech Stack)

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js
- **Video Player**: Video.js
- **State Management**: Zustand + SWR
- **Deployment**: Vercel

---

## 📁 โครงสร้างโปรเจกต์

```bash
short-drama-app/
├── app/
│   ├── api/
│   └── (pages)/
├── components/
│   ├── ui/
│   ├── video/
│   ├── drama/
│   └── search/
├── lib/
├── hooks/
├── store/
├── types/
├── prisma/
├── scripts/
└── code-gen-record/
```

---

## 🛠️ การพัฒนาในเครื่อง (Local Development)

### ความต้องการของระบบ
- Node.js 18+
- PostgreSQL 15+
- npm หรือ yarn

### การติดตั้ง
```bash
git clone <your-repo-url>
cd short-drama-app
npm install
cp .env.example .env.local
npm run db:generate
npm run db:push
npm run dev
```

---

## 📦 Deployment

รองรับการ Deploy ด้วย **Vercel** และ **Docker**

---

## 📄 License
MIT License

---

## 👥 ทีมผู้พัฒนา
ผลงานส่งเข้าประกวด **Xiaomi AI Programming Contest**
