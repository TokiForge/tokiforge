# TokiForge Playground - Deployment Guide

## Hosted Playground Deployment

The TokiForge Playground can be deployed as a standalone web application. Choose from the following platforms:

### Netlify Deployment

1. **Connect Repository**

   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli

   # Deploy
   cd packages/playground
   netlify deploy --prod
   ```

2. **Configuration**

   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18+

3. **Environment Variables** (none required)

### Vercel Deployment

1. **Connect Repository**

   ```bash
   # Install Vercel CLI
   npm install -g vercel

   # Deploy
   cd packages/playground
   vercel --prod
   ```

2. **Configuration**
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`

### GitHub Pages Deployment

1. **Setup GitHub Actions**

   Create `.github/workflows/deploy-playground.yml`:

   ```yaml
   name: Deploy Playground

   on:
     push:
       branches: [main]
       paths:
         - "packages/playground/**"

   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3

         - name: Setup Node
           uses: actions/setup-node@v3
           with:
             node-version: "18"

         - name: Install dependencies
           run: |
             cd packages/playground
             npm install

         - name: Build
           run: |
             cd packages/playground
             npm run build

         - name: Deploy to GitHub Pages
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./packages/playground/dist
   ```

2. **Enable GitHub Pages**
   - Go to repository Settings > Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages`

### Docker Deployment

1. **Create Dockerfile**

   ```dockerfile
   FROM node:18-alpine as builder

   WORKDIR /app
   COPY package*.json ./
   RUN npm ci

   COPY . .
   RUN npm run build

   FROM nginx:alpine
   COPY --from=builder /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/conf.d/default.conf

   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Build and Run**

   ```bash
   docker build -t tokiforge-playground .
   docker run -p 8080:80 tokiforge-playground
   ```

### Custom Domain Setup

#### Netlify

```toml
# netlify.toml
[[redirects]]
  from = "https://playground.yourdomain.com/*"
  to = "https://your-site.netlify.app/:splat"
  status = 200
  force = true
```

#### Vercel

Add custom domain in Vercel dashboard:

1. Go to project settings
2. Add domain: `playground.yourdomain.com`
3. Configure DNS as instructed

### Environment-Specific Configuration

For different environments, update `vite.config.ts`:

```typescript
import { defineConfig } from "vite";

export default defineConfig({
  base: process.env.BASE_URL || "/",
  // Production optimizations
  build: {
    minify: "terser",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          tokiforge: ["@tokiforge/core"],
        },
      },
    },
  },
});
```

### Performance Optimization

1. **Enable Compression**

   - Netlify: Automatic
   - Vercel: Automatic
   - Custom: Configure nginx/apache

2. **CDN Configuration**

   - Cache static assets (CSS, JS, images)
   - Set appropriate cache headers
   - Enable HTTP/2

3. **Analytics Integration**

   Add to `index.html`:

   ```html
   <!-- Google Analytics -->
   <script
     async
     src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"
   ></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag() {
       dataLayer.push(arguments);
     }
     gtag("js", new Date());
     gtag("config", "GA_TRACKING_ID");
   </script>
   ```

### Monitoring & Maintenance

1. **Uptime Monitoring**

   - Use services like UptimeRobot, Pingdom, or StatusCake
   - Monitor: https://your-playground-url.com

2. **Error Tracking**

   - Integrate Sentry or similar service
   - Track client-side errors

3. **Regular Updates**

   ```bash
   # Update dependencies
   npm update

   # Rebuild and redeploy
   npm run build
   netlify deploy --prod
   ```

### Security Considerations

1. **HTTPS**: Always use HTTPS (automatic on Netlify/Vercel)
2. **CSP Headers**: Configure Content Security Policy
3. **Rate Limiting**: Implement if needed for API calls
4. **CORS**: Configure appropriately for shared links

### Troubleshooting

**Build Fails**

- Check Node version (18+)
- Clear node_modules and reinstall
- Verify all dependencies are installed

**App Not Loading**

- Check base URL configuration
- Verify routing configuration
- Check browser console for errors

**Share Links Not Working**

- Verify URL encoding
- Check URL length limits (2048 chars)
- Test with smaller token sets

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Support

For issues or questions:

- GitHub Issues: https://github.com/your-org/tokiforge/issues
- Documentation: https://www.sachindilshan.com/
- Discord: https://discord.gg/tokiforge
