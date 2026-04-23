const WEBGAZER_SCRIPT_URLS = [
  `${import.meta.env.BASE_URL}vendor/webgazer.js`,
];

let webgazerLoadPromise: Promise<NonNullable<Window["webgazer"]>> | null = null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[data-webgazer-src="${src}"]`
    );

    if (existing) {
      if (window.webgazer) {
        resolve();
        return;
      }

      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error(`Failed to load WebGazer from ${src}`)),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.webgazerSrc = src;

    script.onload = () => resolve();
    script.onerror = () => {
      script.remove();
      reject(new Error(`Failed to load WebGazer from ${src}`));
    };

    document.body.appendChild(script);
  });
}

export function loadWebGazer(): Promise<NonNullable<Window["webgazer"]>> {
  if (window.webgazer) {
    return Promise.resolve(window.webgazer);
  }

  if (webgazerLoadPromise) {
    return webgazerLoadPromise;
  }

  webgazerLoadPromise = (async () => {
    let lastError: unknown = null;

    for (const src of WEBGAZER_SCRIPT_URLS) {
      try {
        await loadScript(src);

        if (window.webgazer) {
          console.log("WebGazer loaded", src);
          return window.webgazer;
        }

        lastError = new Error(`WebGazer loaded from ${src} but window.webgazer is missing`);
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError ?? new Error("Failed to load WebGazer");
  })();

  return webgazerLoadPromise.catch((error) => {
    webgazerLoadPromise = null;
    throw error;
  });
}
