import React from 'react';
import '../styles/GuideModal.css'; // For modal-specific styling

const GuideModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="Guide-modal-overlay" onClick={onClose}>
      <div className="Guide-modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Close Button in the Top-Right */}
        <button className="close-button" onClick={onClose}>×</button>

        <h2 class="Guide-modal-heading"> Using Search Operators </h2>
        <ul>
          <li><strong>AND:</strong> Finds articles containing both keywords.<br />
            <em>Example:</em> “Denver Nuggets” AND “Los Angeles Lakers”<br />
            (Articles will include both terms)
          </li>
          <li><strong>NOT:</strong> Excludes articles containing a specific keyword.<br />
            <em>Example:</em> “electric car” NOT “Tesla”<br />
            (Articles will exclude “Tesla”)
          </li>
          <li><strong>OR:</strong> Finds articles containing either keyword.<br />
            <em>Example:</em> “Denver Nuggets” OR “Colorado Rockies”<br />
            (Articles may contain one or both terms)
          </li>
          <li><strong>(Parentheses):</strong> Groups keywords and operators.<br />
            <em>Example:</em> ("Denver Nuggets" OR "Los Angeles Lakers") AND "playoffs"<br />
            (Articles must include "playoffs" and either "Denver Nuggets" or "Los Angeles Lakers.")
          </li>
          <li><strong>“Quotes”:</strong>  Use quotes to search for an exact phrase. When you press the Quotes button, it will automatically wrap the current word or selection.<br />
            <em>Example:</em> "Denver Nuggets championship"<br />
            <em>Example:</em> Using quotes around 'Denver Nuggets Championship' will wrap only "Championship".<br />
            (Ensures the words appear together in the specified order)
          </li>
           <p><strong>Example Search Query:</strong><br />
          "Real Water" AND (((recall OR salmonella) OR (Titration)) OR ("Las Vegas" OR Nevada OR LA OR "Los Angeles")) NOT ("New York" OR "NY")
        </p>
        </ul>
        <h2 class="Guide-modal-heading">Example of a Properly Formatted CSV File</h2>
        <p>This is what an exported CSV file will look like, structured identically for uploads.</p>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Headline</th>
              <th>Article Text</th>
              <th>Publisher</th>
              <th>URL</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>"2025-03-01"</td>
              <td>"Example Title"</td>
              <td>"This is an example description for an article"</td>
              <td>FakePub</td>
              <td>http://examplenews.com/Example-Title</td>
            </tr>
            <tr>
              <td>"2025-03-01"</td>
              <td>"Dogs Live Forever"</td>
              <td>"Dogs are now able to live forever"</td>
              <td>FakePub</td>
              <td>http://examplenews.com/Dogs-Live-Forever</td>
            </tr>
          </tbody>
        </table>

        {/* Download Button */}
        <a href="/Template-CSV.csv" download="Template-CSV.csv" className="download-link">
          Download CSV Template
        </a>
      </div>
    </div>
  );
};

export default GuideModal;