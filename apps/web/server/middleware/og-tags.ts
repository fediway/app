const CRAWLER_RE = /bot|crawl|spider|slurp|facebookexternalhit|Twitterbot|LinkedInBot|Discordbot|Mastodon|WhatsApp|Telegram|Slack/i;

const HTML_TAG_RE = /<[^>]*>/g;

function stripHtml(html: string): string {
  return html.replace(HTML_TAG_RE, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, '\'').trim();
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength)
    return text;
  return `${text.slice(0, maxLength - 1)}…`;
}

function escapeAttr(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function ogHtml(meta: { title: string; description: string; image?: string; url: string; type?: string; twitterCard?: string }): string {
  const lines = [
    '<!DOCTYPE html>',
    '<html lang="en"><head>',
    `<meta charset="utf-8">`,
    `<title>${escapeAttr(meta.title)}</title>`,
    `<meta property="og:title" content="${escapeAttr(meta.title)}">`,
    `<meta property="og:description" content="${escapeAttr(meta.description)}">`,
    `<meta property="og:url" content="${escapeAttr(meta.url)}">`,
    `<meta property="og:type" content="${meta.type || 'website'}">`,
    `<meta property="og:site_name" content="Fediway">`,
  ];
  if (meta.image) {
    lines.push(`<meta property="og:image" content="${escapeAttr(meta.image)}">`);
  }
  lines.push(`<meta name="twitter:card" content="${meta.twitterCard || 'summary'}">`);
  lines.push(`<meta name="twitter:title" content="${escapeAttr(meta.title)}">`);
  lines.push(`<meta name="twitter:description" content="${escapeAttr(meta.description)}">`);
  if (meta.image) {
    lines.push(`<meta name="twitter:image" content="${escapeAttr(meta.image)}">`);
  }
  lines.push('</head><body></body></html>');
  return lines.join('\n');
}

export default defineEventHandler(async (event) => {
  const ua = getRequestHeader(event, 'user-agent') || '';
  if (!CRAWLER_RE.test(ua))
    return;

  const path = getRequestURL(event).pathname;
  const config = useRuntimeConfig();
  const apiBase = config.mastodonApiUrl;
  const domain = config.public.defaultInstance || 'fediway.com';

  if (!apiBase)
    return;

  // Profile page: /@username
  const profileMatch = path.match(/^\/@([^/]+)$/);
  if (profileMatch) {
    const acct = profileMatch[1];
    try {
      const user = await $fetch<any>(`${apiBase}/api/v1/accounts/lookup`, {
        query: { acct },
        timeout: 3000,
      });
      const description = stripHtml(user.note || '');
      return ogHtml({
        title: `${user.display_name} (@${user.acct})`,
        description: truncate(description, 200) || `@${user.acct} on Fediway`,
        image: user.avatar,
        url: `https://${domain}/@${user.acct}`,
        type: 'profile',
      });
    }
    catch {
      return;
    }
  }

  // Status page: /@username/123
  const statusMatch = path.match(/^\/@([^/]+)\/(\d+)$/);
  if (statusMatch) {
    const statusId = statusMatch[2];
    try {
      const status = await $fetch<any>(`${apiBase}/api/v1/statuses/${statusId}`, {
        timeout: 3000,
      });
      const content = truncate(stripHtml(status.content || ''), 200);
      const image = status.media_attachments?.[0]?.preview_url || status.account?.avatar;
      const hasMedia = status.media_attachments?.length > 0;
      return ogHtml({
        title: `${status.account.display_name}: "${truncate(stripHtml(status.content || ''), 80)}"`,
        description: content || 'Post on Fediway',
        image,
        url: `https://${domain}/@${status.account.acct}/${status.id}`,
        type: 'article',
        twitterCard: hasMedia ? 'summary_large_image' : 'summary',
      });
    }
    catch {

    }
  }
});
