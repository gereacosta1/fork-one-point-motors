// src/lib/affirm.ts
declare global {
  interface Window {
    _affirm_config?: {
      public_api_key: string;
      script: string;
      locale: string;
      country_code: string;
    };
    affirm?: {
      ui?: {
        ready?: (callback: () => void) => void;
      };
      checkout?: unknown;
    };
  }
}

let affirmLoadPromise: Promise<void> | null = null;

/**
 * Carga el SDK de Affirm usando el CDN de producción.
 * Reutiliza la misma promesa si ya hay una carga en progreso.
 */
export function loadAffirm(publicKey: string): Promise<void> {
  if (!publicKey || !publicKey.trim()) {
    return Promise.reject(new Error("[Affirm] Missing VITE_AFFIRM_PUBLIC_KEY"));
  }

  const normalizedKey = publicKey.trim();
  const scriptUrl = "https://cdn1.affirm.com/js/v2/affirm.js";

  const isAffirmReady = () =>
    Boolean(
      window.affirm &&
        window._affirm_config &&
        window._affirm_config.script === scriptUrl &&
        typeof window.affirm.ui?.ready === "function"
    );

  if (isAffirmReady()) {
    return new Promise<void>((resolve) => {
      try {
        window.affirm!.ui!.ready!(() => resolve());
      } catch {
        resolve();
      }
    });
  }

  if (affirmLoadPromise) {
    return affirmLoadPromise;
  }

  affirmLoadPromise = new Promise<void>((resolve, reject) => {
    try {
      const existingScripts = document.querySelectorAll<HTMLScriptElement>(
        'script[src*="affirm.com/js/v2/affirm.js"]'
      );

      existingScripts.forEach((script) => {
        if (script.src !== scriptUrl) {
          script.remove();
        }
      });

      if (
        window.affirm &&
        window._affirm_config &&
        window._affirm_config.script !== scriptUrl
      ) {
        window.affirm = undefined;
      }

      window._affirm_config = {
        public_api_key: normalizedKey,
        script: scriptUrl,
        locale: "en_US",
        country_code: "US",
      };

      const existingCorrectScript = Array.from(
        document.querySelectorAll<HTMLScriptElement>('script[src*="affirm.com/js/v2/affirm.js"]')
      ).find((script) => script.src === scriptUrl);

      const finishReady = () => {
        if (window.affirm?.ui?.ready) {
          try {
            window.affirm.ui.ready(() => resolve());
          } catch {
            resolve();
          }
        } else {
          resolve();
        }
      };

      if (existingCorrectScript) {
        if (
          existingCorrectScript.getAttribute("data-affirm-loaded") === "true" ||
          isAffirmReady()
        ) {
          finishReady();
          return;
        }

        existingCorrectScript.addEventListener(
          "load",
          () => {
            existingCorrectScript.setAttribute("data-affirm-loaded", "true");
            finishReady();
          },
          { once: true }
        );

        existingCorrectScript.addEventListener(
          "error",
          () => {
            affirmLoadPromise = null;
            reject(new Error("[Affirm] Failed to load SDK"));
          },
          { once: true }
        );

        return;
      }

      const script = document.createElement("script");
      script.async = true;
      script.src = scriptUrl;
      script.setAttribute("data-affirm-script", "true");

      script.onload = () => {
        script.setAttribute("data-affirm-loaded", "true");
        finishReady();
      };

      script.onerror = () => {
        affirmLoadPromise = null;
        reject(new Error("[Affirm] Failed to load SDK"));
      };

      document.head.appendChild(script);
    } catch (error) {
      affirmLoadPromise = null;
      reject(error instanceof Error ? error : new Error("[Affirm] Unknown load error"));
    }
  });

  return affirmLoadPromise;
}