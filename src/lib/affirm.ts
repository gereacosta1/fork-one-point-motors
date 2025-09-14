// src/lib/affirm.ts
declare global {
  interface Window {
    _affirm_config?: any;
    affirm?: any;
  }
}

/**
 * Carga Affirm **siempre en producción**.
 * (Usamos el CDN de prod para evitar errores de clave pública inválida).
 */
export function loadAffirm(publicKey: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (!publicKey) {
      console.error('[Affirm] Falta VITE_AFFIRM_PUBLIC_KEY');
      resolve();
      return;
    }

    // CDN de producción (forzado)
    const scriptUrl = 'https://cdn1.affirm.com/js/v2/affirm.js';

    // Elimina scripts previos de Affirm que no coincidan
    const existing = document.querySelectorAll<HTMLScriptElement>(
      'script[src*="affirm.com/js/v2/affirm.js"]'
    );
    existing.forEach(s => {
      if (s.src !== scriptUrl) s.remove();
    });

    // Si existe un affirm viejo (por sandbox, etc.), reseteamos
    if ((window as any).affirm && (window as any)._affirm_config?.script !== scriptUrl) {
      (window as any).affirm = undefined;
    }

    // Si ya está cargado el correcto, resolvemos
    if (window.affirm?.ui && window._affirm_config?.script === scriptUrl) {
      try {
        window.affirm.ui.ready(() => resolve());
      } catch {
        resolve();
      }
      return;
    }

    // Configuración + inyección del script
    window._affirm_config = {
      public_api_key: publicKey,
      script: scriptUrl,
      locale: 'en_US',
      country_code: 'US',
    };

    console.log('[Affirm] env: prod cdn:', scriptUrl, 'pk:', publicKey.slice(0, 6) + '…');

    const s = document.createElement('script');
    s.async = true;
    s.src = scriptUrl;
    s.onload = () => {
      if (window.affirm?.ui) {
        window.affirm.ui.ready(() => resolve());
      } else {
        resolve();
      }
    };
    s.onerror = reject;
    document.head.appendChild(s);
  });
}
