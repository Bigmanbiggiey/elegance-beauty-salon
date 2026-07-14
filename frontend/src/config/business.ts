/**
 * Placeholder business info for this salon instance. Swap every value here
 * before going live — same idea as the brand-name swap documented in the
 * repo README's "Cloning this for a new salon" section.
 */
export const business = {
  name: 'Elegance Beauty',
  phoneDisplay: '+1 (555) 010-0100',
  phoneHref: 'tel:+15550100100',
  whatsappNumber: '15550100100',
  addressLines: ['123 Main Street', 'Suite 2'],
  hours: [
    { label: 'Mon – Fri', value: '9:00 AM – 7:00 PM' },
    { label: 'Saturday', value: '9:00 AM – 5:00 PM' },
    { label: 'Sunday', value: 'Closed' },
  ],
  socials: [
    { label: 'Instagram', href: '#' },
    { label: 'TikTok', href: '#' },
  ],
}

export function whatsappHref(message = "Hi! I'd like to ask about booking an appointment."): string {
  return `https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent(message)}`
}
