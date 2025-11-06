# GitHub Pages Deployment

> **TokiForge v0.2.1** - Documentation deployment guide

## Step 1: Enable GitHub Pages

1. Go to your repository on GitHub: `https://github.com/TokiForge/tokiforge`
2. Click **Settings** tab
3. Scroll to **Pages** section (left sidebar)
4. Under **Source**, select: **GitHub Actions**
5. Click **Save**

## Step 2: Update Base Path (if needed)

If your repository name is NOT `tokiforge`, update the base path in `documentation/.vitepress/config.ts`:

```typescript
base: '/your-repo-name/',
```

For example:
- Repo: `tokiforge/tokiforge` → base: `'/tokiforge/'`
- Repo: `myorg/myrepo` → base: `'/myrepo/'`
- Custom domain → base: `'/'`

## Step 3: Push to GitHub

```bash
git add .
git commit -m "Add GitHub Pages deployment"
git push
```

## Step 4: Wait for Deployment

1. Go to **Actions** tab in GitHub
2. Watch the "Deploy Documentation" workflow run
3. Wait 1-2 minutes for completion
4. Your site will be live at: `https://tokiforge.github.io/tokiforge/`

## Your Documentation URL

After deployment, your docs will be available at:
- `https://[username].github.io/[repo-name]/`

For example:
- `https://tokiforge.github.io/tokiforge/`

## Automatic Updates

The workflow automatically deploys when you:
- Push to `main` or `master` branch
- Make changes to `documentation/` folder
- Manually trigger via **Actions** → **Deploy Documentation** → **Run workflow**

## Custom Domain (Optional)

To use a custom domain like `tokiforge.dev`:

1. Create `documentation/public/CNAME` file:
   ```
   tokiforge.dev
   ```

2. Update base path in config:
   ```typescript
   base: '/',
   ```

3. Configure DNS:
   - Add CNAME record: `tokiforge.dev` → `tokiforge.github.io`

4. Enable in GitHub Pages settings

## Troubleshooting

### Build Fails
- Check **Actions** tab for error logs
- Ensure `@tokiforge/core` is published to npm
- Verify all dependencies are in `package.json`

### 404 Errors
- Verify base path matches repository name
- Check URL format: `https://[username].github.io/[repo-name]/`

### Pages Not Updating
- Wait 1-2 minutes after push
- Check Actions tab - workflow should show "green checkmark"
- Clear browser cache

## That's It! 🎉

Your documentation will automatically deploy on every push. No manual steps needed!

