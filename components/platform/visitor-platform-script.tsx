/**
 * Tags <html> with the visitor's platform before first paint, so download
 * CTAs render the right button immediately (rules in app/globals.css):
 *
 * - `mac`: a desktop Mac. Gets the .dmg (`.mw-when-mac`).
 * - `desktop-other`: Windows, Linux, ChromeOS. Gets "Send to my Mac"
 *   (`.mw-when-not-mac`) and the desktop layout (`.mw-when-desktop`).
 * - `mobile`: phones and tablets, iPads that report a Mac included. Gets
 *   "Send to my Mac" and the phone layout (`.mw-when-mobile`).
 *
 * Desktop crawlers and headless renderers get `mac`, so a rendered snapshot
 * shows the primary "Download for Mac" CTA. `?send=1` (where /download/latest
 * sends phones and Windows) forces the "send the link to your Mac" path.
 * Routing only: there is no Windows build.
 */
const DETECT_PLATFORM = `(function(){try{
var n=navigator,ua=n.userAgent||"",p=n.platform||"",t=n.maxTouchPoints||0;
var d=n.userAgentData,dp=(d&&d.platform)||"";
var ios=/iPad|iPhone|iPod/.test(ua)||(p==="MacIntel"&&t>1);
var mobile=ios||(d&&d.mobile)||/Android|Mobile|Tablet|Silk|Kindle|Opera Mini|IEMobile/i.test(ua);
var mac=/mac/i.test(dp)||(!dp&&(/Mac/.test(p)||/Macintosh|Mac OS X/.test(ua)));
var bot=/bot|crawl|spider|slurp|HeadlessChrome|Lighthouse|Chrome-Lighthouse/i.test(ua);
if(/[?&]send=1(&|$)/.test(location.search))mobile=true;
document.documentElement.setAttribute("data-platform",mobile?"mobile":mac||bot?"mac":"desktop-other");
}catch(e){}})()`

export function VisitorPlatformScript() {
  return <script dangerouslySetInnerHTML={{ __html: DETECT_PLATFORM }} />
}
