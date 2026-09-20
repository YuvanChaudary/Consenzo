export function resolveProductAttribute(product: any, attribute: string): any {
  if (!product) return undefined;

  // 1. Direct object property
  if (product[attribute] !== undefined && product[attribute] !== null) {
    return product[attribute];
  }

  const attrLower = (attribute || '').toLowerCase().trim();

  // 2. Generic product.specs array lookup
  if (Array.isArray(product.specs)) {
    const spec = product.specs.find(
      (s: any) =>
        (s.key && s.key.toLowerCase() === attrLower) ||
        (s.label && s.label.toLowerCase() === attrLower)
    );
    if (spec && spec.value !== undefined && spec.value !== null) {
      return spec.value;
    }
  }

  // 3. Price & Budget aliases
  if (attrLower === 'priceinr' || attrLower === 'price' || attrLower === 'budget' || attrLower === 'maxprice') {
    return product.priceInr;
  }

  // 4. Headphones & Audio
  if (attrLower === 'hasanc' || attrLower === 'anc' || attrLower === 'noisecancelling' || attrLower === 'noise_cancelling') {
    if (product.hasAnc !== undefined) return product.hasAnc;
    const name = (product.name || product.modelName || '').toLowerCase();
    return name.includes('noise cancel') || name.includes('anc');
  }

  if (attrLower === 'formfactor' || attrLower === 'form_factor') {
    return product.formFactor || 'Over-Ear';
  }

  if (attrLower === 'hasspatialaudio' || attrLower === 'spatialaudio' || attrLower === 'spatial_audio') {
    if (product.hasSpatialAudio !== undefined) return product.hasSpatialAudio;
    const name = (product.name || product.modelName || '').toLowerCase();
    return name.includes('spatial') || name.includes('atmos');
  }

  // 5. Soundbars
  if (attrLower === 'dolbyatmos' || attrLower === 'dolby_atmos') {
    if (product.dolbyAtmos !== undefined) return product.dolbyAtmos;
    const format = (product.audioFormat || '').toLowerCase();
    if (format.includes('atmos')) return true;
    if (format.includes('dolby')) return true;
    return false;
  }

  if (attrLower === 'wirelesssubwoofer' || attrLower === 'wireless_subwoofer' || attrLower === 'subwoofer') {
    if (product.wirelessSubwoofer !== undefined) return product.wirelessSubwoofer;
    const sub = (product.subwoofer || '').toLowerCase();
    if (sub.includes('wireless')) return true;
    if (sub.includes('subwoofer') || sub.includes('wired')) return true;
    return false;
  }

  if (attrLower === 'channels' || attrLower === 'audiochannels' || attrLower === 'audio_channels') {
    if (product.channels) {
      const match = String(product.channels).match(/([0-9.]+)/);
      if (match) return parseFloat(match[1]);
    }
    return product.audioChannels;
  }

  if (attrLower === 'totalpowerwatts' || attrLower === 'powerwatts' || attrLower === 'watts' || attrLower === 'power') {
    return product.totalPowerWatts;
  }

  if (attrLower === 'hashdmiearc' || attrLower === 'hdmi_earc' || attrLower === 'earc' || attrLower === 'hdmi') {
    const conn = (product.connectivity || '').toLowerCase();
    return conn.includes('earc') || conn.includes('arc') || conn.includes('hdmi') || product.hasHdmiEarc === true;
  }

  // 6. Laptops
  if (attrLower === 'ramgb' || attrLower === 'ram') {
    return product.ramGb;
  }

  if (attrLower === 'storagegb' || attrLower === 'storage' || attrLower === 'ssd') {
    return product.storageGb;
  }

  if (attrLower === 'batteryhours' || attrLower === 'batterylifehours' || attrLower === 'battery' || attrLower === 'batterylife') {
    return product.batteryHours;
  }

  if (attrLower === 'screensizeinches' || attrLower === 'screensize' || attrLower === 'display' || attrLower === 'size') {
    return product.screenSizeInches;
  }

  if (attrLower === 'gamingcapable' || attrLower === 'gaming' || attrLower === 'gpu') {
    // Dedicated graphics only — large RAM alone does not make a machine
    // gaming-capable, so it is deliberately not used as a proxy here.
    const proc = (product.processor || '').toLowerCase();
    const model = (product.modelName || product.name || '').toLowerCase();
    return proc.includes('rtx') || proc.includes('gtx') || model.includes('gaming');
  }

  // 7. Smart TVs
  if (attrLower === 'refreshratehz' || attrLower === 'refreshrate' || attrLower === 'hz') {
    return product.refreshRateHz;
  }

  if (attrLower === 'paneltype' || attrLower === 'panel') {
    return product.panelType;
  }

  if (attrLower === 'hashdmi21' || attrLower === 'hdmi21') {
    return product.hasHdmi21;
  }

  // 8. Chairs & Ergonomics
  if (attrLower === 'haslumbarsupport' || attrLower === 'lumbar' || attrLower === 'lumbarsupport') {
    return product.hasLumbarSupport !== false;
  }

  if (attrLower === 'material') {
    return product.material;
  }

  // 9. Brand & Rating
  if (attrLower === 'brand') {
    return product.brand;
  }

  if (attrLower === 'rating') {
    return product.rating;
  }

  return undefined;
}
