# Publish as `wayaairon.github.io`

This folder is a complete, customized PRISM site for Wenyu Zhou.

1. Create a new **public** GitHub repository named `wayaairon.github.io` under the `wayaairon` account.
2. Upload all files from this folder to that repository, keeping the directory structure unchanged.
3. In the repository, open **Settings → Pages** and choose **GitHub Actions** as the source.
4. Open the **Actions** tab and run the deployment workflow if it does not start automatically.
5. The homepage will appear at `https://wayaairon.github.io`.

## Local preview

Use Node.js 22 or later:

```bash
npm install
npm run dev
```

## Replace the temporary portrait

The profile portrait is stored at `public/profile-photo.jpg` and displayed with the normal square image treatment in `src/components/home/Profile.tsx`.

## Content updates

- English content: `content/`
- Chinese content: `content_zh/`
- Publications: `content/publications.bib`
- PDFs and images: `public/`
