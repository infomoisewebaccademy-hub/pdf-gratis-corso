
// Dichiarazione globale per la funzione fbq di Facebook
declare global {
  interface Window {
    fbq: any;
    _fbq: any;
    _mwaPixelInitialized: boolean;
  }
}

const injectMetaPixelScript = () => {
    if (window.fbq) return;
    /* eslint-disable */
    (function(f:any, b:any, e:any, v:any, n?:any, t?:any, s?:any){
      if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)
    })(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
};

export const initMetaPixel = (pixelId: string) => {
  if (!pixelId) {
      console.warn("⚠️ Meta Pixel ID non fornito.");
      return;
  }
  
  injectMetaPixelScript();

  console.log(`🚀 Avvio Meta Pixel con ID: ${pixelId}`);

  window.fbq('init', pixelId);
  window.fbq('track', 'PageView');
  console.log(`✅ Evento 'PageView' inviato per Pixel ${pixelId}.`);
};

export const trackPageView = () => {
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'PageView');
    console.log("📡 Meta Pixel: PageView (Navigazione)");
  }
};

export const trackEvent = (eventName: string, data: object = {}, pixelId?: string) => {
  if (typeof window.fbq === 'function') {
    console.log(`📡 Meta Pixel Event: ${eventName}`, data);
    if (pixelId) {
        window.fbq('trackSingle', pixelId, eventName, data);
    } else {
        window.fbq('track', eventName, data);
    }
  } else {
      // Retry queueing if pixel script is not fully loaded yet
      if (window._fbq) {
          if (pixelId) {
              window._fbq.push(['trackSingle', pixelId, eventName, data]);
          } else {
              window._fbq.push(['track', eventName, data]);
          }
          console.log(`📡 Meta Pixel Event (Queued): ${eventName}`, data);
      } else {
          console.warn(`⚠️ Impossibile tracciare ${eventName}: Pixel non inizializzato.`);
      }
  }
};

// Eventi Standard

export const trackAddToCart = (contentIds: string[], value: number, currency = 'EUR', pixelId?: string) => {
  trackEvent('AddToCart', {
    content_ids: contentIds,
    content_type: 'product',
    value: value,
    currency: currency
  }, pixelId);
};

export const trackInitiateCheckout = (contentIds: string[], value: number, currency = 'EUR') => {
  trackEvent('InitiateCheckout', {
    content_ids: contentIds,
    content_type: 'product',
    value: value,
    currency: currency,
    num_items: contentIds.length
  });
};

// NUOVO: Tracciamento Lead (Contatto generico)
export const trackLead = () => {
    trackEvent('Lead', {
        content_name: 'Lead User'
    });
};

// NUOVO: Tracciamento Contatto
export const trackContact = () => {
    trackEvent('Contact', {
        content_name: 'Contact User'
    });
};

// NUOVO: Tracciamento acquisto con valore
export const trackPurchase = (value: number, transactionId: string, currency = 'EUR') => {
  trackEvent('Purchase', {
    value: value,
    currency: currency,
    transaction_id: transactionId,
    content_type: 'product'
  });
};

export const trackCompleteRegistration = () => {
  trackEvent('CompleteRegistration', {
    status: 'success'
  });
};
