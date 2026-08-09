/**
 * Tags <html> with the visitor's platform before first paint so the hero can
 * render the right CTA immediately. Anything not clearly a phone or tablet,
 * crawlers included, gets the desktop path.
 */
const DETECT_PLATFORM = `(function(){try{
var n=navigator,ua=n.userAgent||"",p=n.platform||"",t=n.maxTouchPoints||0;
var ios=/iPad|iPhone|iPod/.test(ua)||(p==="MacIntel"&&t>1);
var mobile=ios||/Android|Mobile|Tablet|Silk|Kindle|Opera Mini|IEMobile/i.test(ua);
document.documentElement.setAttribute("data-platform",mobile?"mobile":"desktop");
}catch(e){}})()`

export function VisitorPlatformScript() {
  return <script dangerouslySetInnerHTML={{ __html: DETECT_PLATFORM }} />
}
