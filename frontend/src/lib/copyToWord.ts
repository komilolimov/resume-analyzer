export async function copyHtmlToClipboard(htmlContent: string) {
  try {
    const blobHtml = new Blob([htmlContent], { type: 'text/html' });
    const blobText = new Blob([htmlContent.replace(/<[^>]*>/g, '')], { type: 'text/plain' });

    const data = [
      new ClipboardItem({
        'text/html': blobHtml,
        'text/plain': blobText,
      }),
    ];

    await navigator.clipboard.write(data);
    return true;
  } catch (err) {
    console.error('Failed to copy HTML to clipboard:', err);
    return false;
  }
}
