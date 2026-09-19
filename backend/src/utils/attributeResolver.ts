export function resolveProductAttribute(product: any, attribute: string): any {
  if (!product) return undefined;
  if (product[attribute] !== undefined && product[attribute] !== null) {
    return product[attribute];
  }

  const attrLower = attribute.toLowerCase();

  // Price & Budget
  if (attrLower === 'priceinr' || attrLower === 'price' || attrLower === 'budget' || attrLower === 'maxprice') {
    return product.priceInr;
  }

  // Soundbars
  if (attrLower === 'dolbyatmos' || attrLower === 'dolby_atmos') {
    if (product.dolbyAtmos !== undefined) return product.dolbyAtmos;
    const format = (product.audioFormat || '').toLowerCase();
    if (format.includes('atmos')) return true;
    if (format.includes('dolby')) return true; // match Dolby Audio/Digital as valid Dolby
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

  // Laptops
  if (attrLower === 'ramgb' || attrLower === 'ram') {
    return product.ramGb;
  }

  if (attrLower === 'storagegb' || attrLower === 'storage' || attrLower === 'ssd') {
    return product.storageGb;
  }

  if (attrLower === 'batteryhours' || attrLower === 'battery') {
    return product.batteryHours;
  }

  if (attrLower === 'screensizeinches' || attrLower === 'screensize' || attrLower === 'display' || attrLower === 'size') {
    return product.screenSizeInches;
  }

  if (attrLower === 'gamingcapable' || attrLower === 'gaming' || attrLower === 'gpu') {
    const proc = (product.processor || '').toLowerCase();
    const model = (product.modelName || '').toLowerCase();
    return proc.includes('rtx') || proc.includes('gtx') || model.includes('gaming') || (product.ramGb >= 16);
  }

  // Smart TVs
  if (attrLower === 'refreshratehz' || attrLower === 'refreshrate' || attrLower === 'hz') {
    return product.refreshRateHz;
  }

  if (attrLower === 'paneltype' || attrLower === 'panel') {
    return product.panelType;
  }

  if (attrLower === 'hashdmi21' || attrLower === 'hdmi21') {
    return product.hasHdmi21;
  }

  // Brand
  if (attrLower === 'brand') {
    return product.brand;
  }

  return undefined;
}
