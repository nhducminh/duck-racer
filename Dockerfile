# Sử dụng Node.js 20 Alpine để đáp ứng yêu cầu của better-sqlite3
FROM node:20-alpine

# Cài đặt công cụ build cần thiết cho native modules (như better-sqlite3)
RUN apk add --no-cache python3 make g++

# Đặt thư mục làm việc
WORKDIR /app

# Copy package.json và package-lock.json (nếu có)
COPY package*.json ./

# Cài đặt tất cả dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Xóa devDependencies sau khi build xong để giảm kích thước
RUN npm prune --production

# Tạo user không có quyền root cho bảo mật
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Tạo thư mục data và phân quyền
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data

# Thay đổi quyền sở hữu cho toàn bộ app
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port 3000
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Khởi động ứng dụng
CMD ["npm", "start"]