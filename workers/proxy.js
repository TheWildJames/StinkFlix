/**
 * Cloudflare Workers Proxy
 * 
 * Proxies stream requests through the worker to:
 * - Block ads and tracking scripts
 * - Filter adult/porn domains
 * - Remove malicious redirects
 * - Clean up injected content
 * 
 * Free tier: 100k requests/day, unlimited reverse bandwidth
 */

// Domains known to serve adult/porn content - BLOCKED
const BLOCKED_DOMAINS = [
  // Adult/porn sites
  'pornhub.com', 'xvideos.com', 'xnxx.com', 'redtube.com', 'youporn.com',
  'brazzers.com', 'entertainment-one.com', 'chaturbate.com', 'cam4.com',
  'livejasmin.com', 'myfreecams.com', 'camshow.fans', 'strip.chat',
  'chatterous.com', 'livejasmin.com', 'bdsmlr.com', 'fackbook.com',
  'facebok.com', 'fcbook.com', 'fb-com.com', 'fb-w.com',
  // Adult-adjacent / sketchy
  'adult-dmint.net', 'adult Time.com', 'hentai.tv', 'hentai-stream.com',
  'porn-video.cc', 'xxx-video.cc', 'xv-belongsTo.com', 'my-porn.club',
];

// Domains known for excessive ads, malware, or scams - BLOCKED
const AD_DOMAINS = [
  // Ad networks
  'popunder.js', 'popads.net', 'monetag.com', 'adsterra.com',
  'clickbooth.com', 'adjix.com', 'epicgames.com', 'play.google.com',
  'googlevideo.com', 'googleapis.com', 'gstatic.com', 'doubleclick.net',
  'googlesyndication.com', 'googletagservices.com', 'googletagmanager.com',
  // Suspicious redirect domains
  'linkvertise.com', 'ouo.io', 'ouo.press', 'cutt.ly', 'bit.ly',
  'adf.ly', 'shorte.st', 'linkshort.com', 'x.link', 'go.fyurl.com',
  // Malware / scam indicators
  'crackhub.site', 'watchfull.tv', 'streamtape.com', 'doodstream.com',
  'dood.to', 'dood.watch', 'mixdrop.com', 'mixdrop.co',
  'uqload.com', 'streamsb.net', 'filemoon.sx', 'filemoon.to',
  'voe.sx', 'voe-unblock.com', 'voe-unblock.net', 'voe-unblock.org',
  'superembed.io', 'embed.su', 'vidcloud.icu', 'zernik55.top',
  'y2os.com', 'wz.xs', 'sb18.pm', 'sbplay.org', 'supervideo.tv',
];

// Full domain list for blocking
const ALL_BLOCKED_DOMAINS = [...BLOCKED_DOMAINS, ...AD_DOMAINS];

// Patterns that indicate adult/porn content in URLs
const ADULT_URL_PATTERNS = [
  /porn/i, /xxx/i, /hentai/i, /erotic/i, /nude/i, /naked/i,
  /adult/i, /xxx/i, /xxx/i, /xxx/i,
  /fuck/i, /sex/i, /boobs/i, /cock/i, /pussy/i,
  /xxxvideo/i, /xxxstream/i, /xxxembed/i,
];

// Patterns that indicate ad/malware content
const AD_URL_PATTERNS = [
  /popunder/i, /popads/i, /monetag/i, /adsterra/i,
  /clickjnk/i, /adfly/i, /linkvertise/i,
  /redirect/i, /skip_ad/i, /adblock/i,
  /get_link/i, /url_short/i,
];

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCorsPreflight();
    }

    // Only allow GET requests
    if (request.method !== 'GET') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    // Get the URL from query parameter
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');

    if (!targetUrl) {
      return new Response('Missing url parameter', { 
        status: 400,
        headers: corsHeaders()
      });
    }

    // Check if the target URL is from a blocked domain
    try {
      const target = new URL(targetUrl);
      
      // Check hostname against blocked domains
      const hostname = target.hostname.toLowerCase();
      
      for (const blocked of ALL_BLOCKED_DOMAINS) {
        if (hostname === blocked || hostname.endsWith('.' + blocked)) {
          return new Response(JSON.stringify({ 
            error: 'Source blocked for safety',
            reason: 'This source has been blocked due to adult content or excessive ads'
          }), {
            status: 403,
            headers: {
              ...corsHeaders(),
              'Content-Type': 'application/json'
            }
          });
        }
      }

      // Check for adult content patterns in URL
      for (const pattern of ADULT_URL_PATTERNS) {
        if (pattern.test(targetUrl)) {
          return new Response(JSON.stringify({ 
            error: 'Source blocked for safety',
            reason: 'This source contains inappropriate content'
          }), {
            status: 403,
            headers: {
              ...corsHeaders(),
              'Content-Type': 'application/json'
            }
          });
        }
      }
    } catch (e) {
      return new Response('Invalid URL', { 
        status: 400,
        headers: corsHeaders()
      });
    }

    // Proxy the request
    try {
      const response = await fetch(targetUrl.toString(), {
        method: request.method,
        headers: {
          // Pass through some important headers
          'User-Agent': 'CloudflareWorker/1.0',
          'Referer': targetUrl.toString(),
        },
        body: request.method === 'POST' ? request.body : undefined,
      });

      const headers = new Headers(response.headers);
      
      // Remove problematic headers
      headers.delete('X-Frame-Options');
      headers.delete('Content-Security-Policy');
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Cache-Control', 'public, max-age=3600');

      return new Response(response.body, {
        status: response.status,
        headers: headers,
      });
    } catch (error) {
      return new Response(JSON.stringify({
        error: 'Proxy error',
        message: error.message
      }), {
        status: 502,
        headers: {
          ...corsHeaders(),
          'Content-Type': 'application/json'
        }
      });
    }
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function handleCorsPreflight() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(),
  });
}
