# Email Deliverability Comparison

The bulk campaign flow already sends through `sendEmail` with the configured sender, HTML content, a plain text alternative, and newsletter unsubscribe headers. That path is unchanged.

The single contact form notification previously set `from` to the visitor email address, while campaigns used the configured domain sender. Single transactional emails also depended on each caller to provide `text`, so several order, password, and inbox reply emails were HTML-only. The shared email helper now always uses `process.env.MAIL_FROM` for `from`, keeps customer addresses in `replyTo` only where applicable, sends both `html` and `text`, and logs only safe delivery metadata.
