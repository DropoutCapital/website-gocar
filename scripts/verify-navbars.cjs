/* Validación final: prototipo de la NUEVA extractBuilderNav (home -> fallback
 * cross-page -> default) y prueba contra los 49 tenants reales que ninguna página
 * pierde un destino de navegación que muestre HOY (DESPUÉS ⊇ ANTES). */
const fs = require('fs');
const lz = require('lzutf8');

const env = Object.fromEntries(
  fs.readFileSync(__dirname + '/../.env', 'utf8')
    .split('\n').filter((l) => l.includes('='))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.NEXT_PUBLIC_SUPABASE_KEY;
const headers = { apikey: KEY, Authorization: `Bearer ${KEY}` };

const DEFAULT = ['Inicio|/', 'Financiamiento|/financing', 'Consignaciones|/consignments', 'Compra Directa|/buy-direct', 'Buscamos por ti|/we-search-for-you'];
const NAVISH = new Set(['BuilderNavbar', 'NavbarSimple', 'HeroMega']);

function decompress(c) {
  try { let p = lz.decompress(lz.decodeBase64(c)); while (typeof p === 'string') { try { p = JSON.parse(p); } catch { break; } } return p && typeof p === 'object' ? p : null; } catch { return null; }
}
const getNodes = (s) => (!s ? null : (s.nodes && typeof s.nodes === 'object' ? s.nodes : s));
function getBlob(e, slug, theme) {
  if (e && e.v === 3) { const p = e.pages?.[slug]; return p ? (theme === 'dark' ? (p.dark || p.light) : (p.light || p.dark)) : null; }
  if (e && e.v === 2) { if (slug !== 'home') return null; return theme === 'dark' ? (e.dark || e.light) : (e.light || e.dark); }
  if (slug === 'home' && typeof e === 'string') return e;
  return null;
}
function findNav(nodes) {
  let hero = null;
  for (const [id, n] of Object.entries(nodes || {})) {
    const rn = n?.type?.resolvedName;
    if (rn === 'BuilderNavbar' || rn === 'NavbarSimple') return { rn, id, node: n };
    if (rn === 'HeroMega' && !hero) hero = { rn, id, node: n };
  }
  return hero;
}
const linkSig = (node) => (Array.isArray(node?.props?.links) ? node.props.links : [])
  .filter((l) => l && l.url && typeof l.text === 'string').map((l) => `${l.text}|${l.url}`);

// Lista de páginas posibles (v3)
function pageSlugs(e) {
  if (e && e.v === 3) return Object.keys(e.pages || {});
  return ['home'];
}

// NUEVA extractBuilderNav (prototipo, lógica EXACTA a portar): home con links ->
// primer navbar con links en otra página -> default. Exige links no vacíos.
function newExtract(envelope) {
  const homeNodes = getNodes(decompress(getBlob(envelope, 'home', 'light')));
  const homeNav = homeNodes ? findNav(homeNodes) : null;
  if (homeNav) { const l = linkSig(homeNav.node); if (l.length) return { source: 'home', links: l, type: homeNav.rn }; }
  for (const s of pageSlugs(envelope)) {
    if (s === 'home') continue;
    const n = getNodes(decompress(getBlob(envelope, s, 'light')));
    const nav = n ? findNav(n) : null;
    if (nav) { const l = linkSig(nav.node); if (l.length) return { source: `page:${s}`, links: l, type: nav.rn }; }
  }
  return { source: 'default', links: DEFAULT, type: 'default' };
}

(async () => {
  const list = await (await fetch(`${URL}/rest/v1/client_website_config?select=client_id&is_enabled=eq.true`, { headers })).json();
  console.log('Tenants:', list.length);
  const violations = [];
  const sources = {};

  for (const { client_id } of list) {
    const rows = await (await fetch(`${URL}/rest/v1/client_website_config?client_id=eq.${client_id}&select=elements_structure`, { headers })).json();
    const structure = rows?.[0]?.elements_structure;
    let envelope = typeof structure === 'object' ? structure : (() => { try { return JSON.parse(structure); } catch { return structure; } })();

    const after = newExtract(envelope);                 // lo que mostrará DESPUÉS en todas las páginas
    sources[after.source.split(':')[0]] = (sources[after.source.split(':')[0]] || 0) + 1;
    const afterSet = new Set(after.links);

    // ANTES: en cada página secundaria, el navbar que renderiza HOY (su propio nodo).
    for (const s of pageSlugs(envelope)) {
      if (s === 'home') continue;
      const n = getNodes(decompress(getBlob(envelope, s, 'light')));
      const nav = n ? findNav(n) : null;
      if (!nav) continue;                                // hoy no muestra navbar propio -> no hay nada que perder
      const before = linkSig(nav.node);
      const lost = before.filter((l) => !afterSet.has(l));
      if (lost.length) violations.push({ client_id, page: s, afterSource: after.source, afterLinks: after.links, beforeLinks: before, lost });
    }
  }

  console.log('\nFuente del navbar DESPUÉS (por tenant):', sources);
  console.log('\n=== VIOLACIONES (links que un tenant pierde) ===');
  console.log('Total:', violations.length);
  console.log(JSON.stringify(violations, null, 2));
})();
