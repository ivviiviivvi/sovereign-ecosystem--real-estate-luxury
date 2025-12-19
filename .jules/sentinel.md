## 2024-05-23 - Prevent Reverse Tabnabbing
**Vulnerability:** Usage of `window.open(url, '_blank')` without `noopener,noreferrer`.
**Learning:** Even in modern browsers, explicit `noopener` is safer and demonstrates security awareness. `noreferrer` also helps privacy.
**Prevention:** Always use `window.open(url, '_blank', 'noopener,noreferrer')` when opening external links in a new tab.
