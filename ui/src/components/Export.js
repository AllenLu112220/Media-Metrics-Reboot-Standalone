import React from 'react';
import he from 'he';

function safeDecodeHTML(text) {
  if (!text) return "";
  const doc = new DOMParser().parseFromString(text, "text/html");
  const parsedText = doc.body.textContent || "";
  return he.decode(parsedText);
}

const handleExportToCSV = (news) => {
  const newsData = news || [];
  if (newsData.length === 0) {
    console.warn("No news available to export.");
    return;
  }

  // Debugging: Log the first few articles
  console.log('Exporting the following articles:', newsData.slice(0, 5));

  const csvData = [
    ["Date", "Headline", "Article Text", "Publisher", "URL"],
    ...newsData.map(article => {
      const date = article.published_at ? new Date(article.published_at).toLocaleDateString() : '';
      const title = safeDecodeHTML(article.title || '').replace(/"/g, '""');
      const description = safeDecodeHTML(article.description || '')
        .replace(/"/g, '""')
        .replace(/[\n\r\u2028\u2029]/g, ' ');
      const publisher = (article.source || '').replace(/"/g, '""');
      const url = article.url || '';

      // Debugging: Log the individual fields for this article
      console.log({ date, title, description, publisher, url });

      return [date, title, description, publisher, url];
    })
  ]
  .map(row => row.map(field => `"${field}"`).join(',')) // Wrap every field in quotes
  .join('\n');

  const csvDataWithBOM = '\uFEFF' + csvData;
  const blob = new Blob([csvDataWithBOM], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  link.href = URL.createObjectURL(blob);
  link.download = `DASHhound-articles-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};

export default handleExportToCSV;
