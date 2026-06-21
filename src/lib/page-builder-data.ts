import lz from 'lzutf8';
import { baseResolver } from '@/app/BuilderRenderer';

// System pages + any custom tenant page slug
export type PageSlug = string;

// Build RESOLVER_NAMES from the actual resolver so it's always in sync
const RESOLVER_NAMES = new Set([
  ...Object.keys(baseResolver),
  'div', 'p', 'span', 'img', 'Unknown',
]);

/**
 * Sanitizes CraftJS node tree — removes unknown components, fixes ROOT, cleans orphans.
 * Same logic as page.tsx's sanitizeCraftData.
 */
function sanitizeCraftData(state: any): any {
  if (!state || typeof state !== 'object') return state;

  const isWrapped = state.nodes && typeof state.nodes === 'object';
  const nodes: Record<string, any> = isWrapped ? { ...state.nodes } : { ...state };

  for (const [id, node] of Object.entries(nodes)) {
    if (!node || typeof node !== 'object') { delete nodes[id]; continue; }
    const rn = (node as any).type?.resolvedName;
    if (!rn || typeof rn !== 'string' || !RESOLVER_NAMES.has(rn)) {
      if (id === 'ROOT') {
        (node as any).type = { resolvedName: 'div' };
      } else {
        delete nodes[id];
        continue;
      }
    }
    if (!Array.isArray((node as any).nodes)) (node as any).nodes = [];
    if (!(node as any).linkedNodes || typeof (node as any).linkedNodes !== 'object') (node as any).linkedNodes = {};
  }

  if (!nodes.ROOT) {
    const childIds = Object.keys(nodes);
    nodes.ROOT = {
      type: { resolvedName: 'div' }, isCanvas: true, props: {},
      displayName: 'App Canvas', custom: {}, parent: null,
      nodes: childIds, linkedNodes: {},
    };
  }
  nodes.ROOT.isCanvas = true;
  nodes.ROOT.parent = null;

  const validIds = new Set(Object.keys(nodes));
  for (const node of Object.values(nodes)) {
    if (Array.isArray((node as any).nodes)) {
      (node as any).nodes = (node as any).nodes.filter((c: string) => validIds.has(c));
    }
  }

  return isWrapped ? { ...state, nodes } : nodes;
}

function decompressState(compressed: string): any | null {
  try {
    let parsed: any = lz.decompress(lz.decodeBase64(compressed));
    while (typeof parsed === 'string') {
      try { parsed = JSON.parse(parsed); } catch { break; }
    }
    return typeof parsed === 'object' && parsed ? sanitizeCraftData(parsed) : null;
  } catch {
    return null;
  }
}

/**
 * Applies AI-generated translations to decompressed builder node data.
 * Returns a NEW object — never mutates the original (important for caching).
 * Translations are stored as { "pageSlug::nodeId::propName": "translated text" }
 */
function applyTranslations(state: any, pageSlug: string, translations: Record<string, string>): any {
  if (!state || !translations || Object.keys(translations).length === 0) return state;

  // Deep clone to avoid mutating cached data
  const cloned = JSON.parse(JSON.stringify(state));

  const isWrapped = cloned.nodes && typeof cloned.nodes === 'object';
  const nodes = isWrapped ? cloned.nodes : cloned;

  for (const [nodeId, node] of Object.entries(nodes) as [string, any]) {
    if (!node?.props || nodeId === 'ROOT') continue;

    // Direct text props
    for (const prop of Object.keys(node.props)) {
      const key = `${pageSlug}::${nodeId}::${prop}`;
      if (key in translations && typeof node.props[prop] === 'string') {
        node.props[prop] = translations[key];
      }
    }

    // Array props (links, items, features, etc.)
    for (const arrProp of ['links']) {
      if (Array.isArray(node.props[arrProp])) {
        node.props[arrProp].forEach((item: any, i: number) => {
          const key = `${pageSlug}::${nodeId}::link_${i}`;
          if (key in translations && item?.text) item.text = translations[key];
        });
      }
    }
    for (const arrProp of ['items', 'features', 'testimonials', 'faqs']) {
      if (Array.isArray(node.props[arrProp])) {
        node.props[arrProp].forEach((item: any, i: number) => {
          for (const field of ['title', 'description', 'text', 'question', 'answer', 'name', 'role']) {
            const key = `${pageSlug}::${nodeId}::${arrProp}_${i}_${field}`;
            if (key in translations && item?.[field]) item[field] = translations[key];
          }
        });
      }
    }

    // About: values and members
    if (Array.isArray(node.props.values)) {
      node.props.values.forEach((val: any, i: number) => {
        const tKey = `${pageSlug}::${nodeId}::values_${i}_title`;
        const dKey = `${pageSlug}::${nodeId}::values_${i}_description`;
        if (tKey in translations && val?.title) val.title = translations[tKey];
        if (dKey in translations && val?.description) val.description = translations[dKey];
      });
    }
    if (Array.isArray(node.props.members)) {
      node.props.members.forEach((m: any, i: number) => {
        const nKey = `${pageSlug}::${nodeId}::members_${i}_name`;
        const rKey = `${pageSlug}::${nodeId}::members_${i}_role`;
        if (nKey in translations && m?.name) m.name = translations[nKey];
        if (rKey in translations && m?.role) m.role = translations[rKey];
      });
    }
    // Footer columns
    if (Array.isArray(node.props.columns)) {
      node.props.columns.forEach((col: any, ci: number) => {
        const titleKey = `${pageSlug}::${nodeId}::col_${ci}_title`;
        if (titleKey in translations && col?.title) col.title = translations[titleKey];
        if (Array.isArray(col?.links)) {
          col.links.forEach((link: any, li: number) => {
            const linkKey = `${pageSlug}::${nodeId}::col_${ci}_link_${li}`;
            if (linkKey in translations && link?.text) link.text = translations[linkKey];
          });
        }
      });
    }
  }

  return cloned;
}

/**
 * Extracts and decompresses builder data for a specific page from the website config.
 * Supports v3 (multi-page), v2 (home-only dual-theme), and legacy formats.
 */
export function getPageBuilderData(
  config: any,
  pageSlug: PageSlug,
  theme: 'light' | 'dark',
  translations?: Record<string, string> | null
): any | null {
  if (!config?.is_enabled || !config?.elements_structure) return null;

  const decompress = (compressed: string) => {
    const state = decompressState(compressed);
    return translations ? applyTranslations(state, pageSlug, translations) : state;
  };

  // elements_structure may be a string (text column) or already-parsed object (jsonb column)
  const structure = config.elements_structure;
  let envelope: any = null;

  if (typeof structure === 'object' && structure !== null) {
    // Already parsed by Supabase (jsonb column)
    envelope = structure;
  } else {
    const raw = String(structure);
    try {
      envelope = JSON.parse(raw);
    } catch {
      // Not JSON — legacy single-theme format
      if (pageSlug === 'home') return decompress(raw);
      return null;
    }
  }

  if (envelope?.v === 3) {
    const availablePages = Object.keys(envelope.pages || {});
    const pageData = envelope.pages?.[pageSlug];
    if (!pageData) {
      console.warn(`[PageBuilder] Page "${pageSlug}" not found in v3 envelope. Available: ${availablePages.join(', ')}`);
      return null;
    }
    const compressed = theme === 'dark' ? (pageData.dark || pageData.light) : (pageData.light || pageData.dark);
    if (!compressed) return null;
    return decompress(compressed);
  }

  if (envelope?.v === 2) {
    if (pageSlug !== 'home') return null;
    const compressed = theme === 'dark' ? (envelope.dark || envelope.light) : (envelope.light || envelope.dark);
    if (!compressed) return null;
    return decompress(compressed);
  }

  // Legacy unversioned envelope
  if (pageSlug === 'home') {
    const raw = typeof structure === 'string' ? structure : JSON.stringify(structure);
    return decompress(raw);
  }

  return null;
}

/**
 * Lista de páginas de SISTEMA que el cliente eligió eliminar/ocultar desde el builder.
 * Se persiste en el envelope v3 (`hiddenSystemPages`). 'home' nunca se incluye.
 */
export function getHiddenSystemPages(config: any): string[] {
  if (!config?.elements_structure) return [];
  const structure = config.elements_structure;
  let envelope: any = null;
  if (typeof structure === 'object' && structure !== null) {
    envelope = structure;
  } else {
    try {
      envelope = JSON.parse(String(structure));
    } catch {
      return [];
    }
  }
  const hidden = envelope?.hiddenSystemPages;
  return Array.isArray(hidden)
    ? hidden.filter((s: any) => typeof s === 'string' && s !== 'home')
    : [];
}
